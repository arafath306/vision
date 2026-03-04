'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    Network, User, Mail, Phone, Key, Lock, Eye, EyeOff,
    AlertCircle, CheckCircle, UserPlus
} from 'lucide-react'
import { generateReferralCode } from '@/lib/utils'

export default function RegisterPage() {
    const router = useRouter()
    const [form, setForm] = useState({
        full_name: '',
        email: '',
        whatsapp: '',
        referral_code: '',
        password: '',
        confirm_password: '',
    })
    const [showPwd, setShowPwd] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const update = (field: string, value: string) =>
        setForm(p => ({ ...p, [field]: value }))

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (form.password !== form.confirm_password) {
            setError('Passwords do not match.')
            setLoading(false)
            return
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.')
            setLoading(false)
            return
        }

        const supabase = createClient()

        const whatsappClean = form.whatsapp.trim().replace(/\s+/g, '')
        if (!whatsappClean) {
            setError('Please enter a valid WhatsApp number.')
            setLoading(false)
            return
        }

        // Check duplicate WhatsApp
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('whatsapp', whatsappClean)
            .maybeSingle()

        if (existing) {
            setError('This WhatsApp number is already registered.')
            setLoading(false)
            return
        }

        // Validate referral code if provided
        let referrerId: string | null = null
        const refCodeRaw = form.referral_code.trim().toUpperCase()

        if (refCodeRaw) {
            console.log('Validating referral code:', refCodeRaw)
            const { data: referrer, error: refError } = await supabase
                .from('users')
                .select('id, status, full_name')
                .eq('referral_code', refCodeRaw)
                .maybeSingle()

            if (refError) {
                console.error('Referral lookup error:', refError)
                setError('Unable to verify referral code. Please try again or leave it blank.')
                setLoading(false)
                return
            }

            if (!referrer) {
                setError('Invalid referral code. Please check and try again.')
                setLoading(false)
                return
            }
            if (referrer.status !== 'ACTIVE') {
                setError(`Referral code belongs to ${referrer.full_name}, but their account is INACTIVE.`)
                setLoading(false)
                return
            }
            referrerId = referrer.id
        }

        // Create Supabase Auth user (using deterministic email based on whatsapp)
        const emailForAuth = `u${whatsappClean}@skyxvisionit.com`
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: emailForAuth,
            password: form.password,
            options: {
                data: {
                    full_name: form.full_name,
                    whatsapp: whatsappClean,
                },
            },
        })

        if (authError || !authData.user) {
            setError(authError?.message || 'Registration failed. Please try again.')
            setLoading(false)
            return
        }

        // Create/Update user profile
        const newReferralCode = generateReferralCode(form.full_name, whatsappClean)
        const { error: profileError } = await supabase.from('users').upsert({
            id: authData.user.id,
            full_name: form.full_name,
            email: form.email.trim(),
            whatsapp: whatsappClean,
            referral_code: newReferralCode,
            referred_by: referrerId,
            status: 'INACTIVE',
            role: 'MEMBER',
        }, { onConflict: 'id' })

        if (profileError) {
            console.error('Profile creation error:', profileError)
            setError('Account security setup failed. Please contact support.')
            setLoading(false)
            return
        }

        setSuccess(true)
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-16">
                <div className="glass-card p-8 text-center max-w-lg w-full animate-fade-in-up border-green-500/30">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                        style={{ background: 'rgba(16,185,129,0.1)' }}>
                        <CheckCircle size={32} style={{ color: '#10b981' }} />
                    </div>

                    <h2 className="text-3xl font-bold mb-2 gradient-text">Registration Successful!</h2>
                    <p className="mb-8 text-gray-400">Welcome to {process.env.NEXT_PUBLIC_SITE_NAME || 'SkyX Vision It'}.</p>

                    <div className="bg-[#0d1530] border border-[#1e3a5f] rounded-xl p-6 mb-8 text-left space-y-4">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Login ID (WhatsApp)</p>
                            <p className="text-xl font-mono font-bold text-blue-400">{form.whatsapp}</p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Password</p>
                            <div className="flex items-center justify-between">
                                <p className="text-xl font-mono font-bold text-white">
                                    {showPwd ? form.password : '••••••••'}
                                </p>
                                <button onClick={() => setShowPwd(!showPwd)} className="text-gray-500 hover:text-white transition-colors">
                                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Link href="/auth/login" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-lg hover:shadow-blue-500/20">
                            Log In Now
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-lg animate-fade-in-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex flex-col items-center gap-3">
                        <img src="/logo.png" alt="SkyX Vision It Logo" className="w-14 h-14 object-contain rounded-2xl" />
                        <div>
                            <span className="text-xl font-bold" style={{ color: '#e2e8f0' }}>
                                SkyX <span style={{ color: '#0ea5e9' }}>Vision It</span>
                            </span>
                            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>Create your account</p>
                        </div>
                    </Link>
                </div>

                <div className="glass-card p-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>Join SkyX Vision It</h1>
                        <p className="text-sm mt-1" style={{ color: '#64748b' }}>Fill in your details to get started</p>
                    </div>

                    {error && (
                        <div className="alert-error mb-5">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label htmlFor="reg-name" className="form-label">Full Name *</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
                                <input id="reg-name" type="text" className="input-field" style={{ paddingLeft: '2.25rem' }}
                                    placeholder="Your full name"
                                    value={form.full_name} onChange={e => update('full_name', e.target.value)} required />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="reg-email" className="form-label">Email Address *</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
                                <input id="reg-email" type="email" className="input-field" style={{ paddingLeft: '2.25rem' }}
                                    placeholder="your@email.com"
                                    value={form.email} onChange={e => update('email', e.target.value)} required />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="reg-whatsapp" className="form-label">WhatsApp Number * (used for login)</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
                                <input id="reg-whatsapp" type="tel" className="input-field" style={{ paddingLeft: '2.25rem' }}
                                    placeholder="e.g. 01812345678"
                                    value={form.whatsapp} onChange={e => update('whatsapp', e.target.value)} required />
                            </div>
                            <p className="text-xs mt-1" style={{ color: '#475569' }}>This will be your unique login ID</p>
                        </div>

                        <div>
                            <label htmlFor="reg-referral" className="form-label">Referral Code (Optional)</label>
                            <div className="relative">
                                <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
                                <input id="reg-referral" type="text" className="input-field" style={{ paddingLeft: '2.25rem' }}
                                    placeholder="Enter referral code if you have one"
                                    value={form.referral_code} onChange={e => update('referral_code', e.target.value.toUpperCase())} />
                            </div>
                        </div>

                        <div className="divider" />

                        <div>
                            <label htmlFor="reg-password" className="form-label">Password *</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
                                <input id="reg-password" type={showPwd ? 'text' : 'password'} className="input-field"
                                    style={{ paddingLeft: '2.25rem', paddingRight: '2.25rem' }}
                                    placeholder="Min 6 characters"
                                    value={form.password} onChange={e => update('password', e.target.value)} required />
                                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2"
                                    style={{ color: '#64748b' }} onClick={() => setShowPwd(!showPwd)}>
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="reg-confirm" className="form-label">Confirm Password *</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
                                <input id="reg-confirm" type={showPwd ? 'text' : 'password'} className="input-field"
                                    style={{ paddingLeft: '2.25rem' }}
                                    placeholder="Re-enter password"
                                    value={form.confirm_password} onChange={e => update('confirm_password', e.target.value)} required />
                            </div>
                        </div>

                        <div className="glass-card p-4" style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}>
                            <p className="text-xs" style={{ color: '#94a3b8' }}>
                                🔒 After registration, your account will be <strong style={{ color: '#f59e0b' }}>INACTIVE</strong>.
                                Contact admin via WhatsApp <strong style={{ color: '#10b981' }}>01313961899</strong> to pay the
                                activation fee and unlock your account.
                            </p>
                        </div>

                        <button type="submit" className="btn-accent w-full" style={{ justifyContent: 'center', padding: '0.75rem' }}
                            disabled={loading}>
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating account...
                                </span>
                            ) : (
                                <><UserPlus size={16} /> Create Account</>
                            )}
                        </button>
                    </form>

                    <div className="divider" />

                    <p className="text-center text-sm" style={{ color: '#64748b' }}>
                        Already have an account?{' '}
                        <Link href="/auth/login" className="font-semibold" style={{ color: '#0ea5e9' }}>
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
