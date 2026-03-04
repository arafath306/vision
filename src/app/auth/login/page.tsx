'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Network, Phone, Lock, Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [whatsapp, setWhatsapp] = useState('')
    const [password, setPassword] = useState('')
    const [showPwd, setShowPwd] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const supabase = createClient()

        const whatsappClean = whatsapp.trim().replace(/\s+/g, '')
        const newEmail = `u${whatsappClean}@skyxvisionit.com`
        const oldEmail = `u${whatsappClean}@expandianetwork.com`

        // Try login with new domain first
        let { error: authError } = await supabase.auth.signInWithPassword({
            email: newEmail,
            password,
        })

        // If failed, try with old domain (legacy users/admins)
        if (authError) {
            const legacyAuth = await supabase.auth.signInWithPassword({
                email: oldEmail,
                password,
            })
            authError = legacyAuth.error
        }

        if (authError) {
            setError('Invalid WhatsApp number or password. Please try again.')
            setLoading(false)
            return
        }

        // Get user profile to determine redirect
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role === 'ADMIN') window.location.href = '/admin'
            else if (profile?.role === 'TEAM_LEADER') window.location.href = '/leader'
            else if (profile?.role === 'TEAM_TRAINER') window.location.href = '/trainer'
            else window.location.href = '/dashboard'
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md animate-fade-in-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex flex-col items-center gap-3">
                        <img src="/logo.png" alt="SkyX Vision It Logo" className="w-14 h-14 object-contain rounded-2xl" />
                        <div>
                            <span className="text-xl font-bold" style={{ color: '#e2e8f0' }}>
                                SkyX <span style={{ color: '#0ea5e9' }}>Vision It</span>
                            </span>
                            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>Task-Based Referral Platform</p>
                        </div>
                    </Link>
                </div>

                <div className="glass-card p-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>Welcome back</h1>
                        <p className="text-sm mt-1" style={{ color: '#64748b' }}>Sign in to your SkyX account</p>
                    </div>

                    {error && (
                        <div className="alert-error mb-5">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label htmlFor="whatsapp" className="form-label">WhatsApp Number</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
                                <input
                                    id="whatsapp"
                                    type="tel"
                                    className="input-field"
                                    style={{ paddingLeft: '2.25rem' }}
                                    placeholder="e.g. 01812345678"
                                    value={whatsapp}
                                    onChange={e => setWhatsapp(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="form-label">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
                                <input
                                    id="password"
                                    type={showPwd ? 'text' : 'password'}
                                    className="input-field"
                                    style={{ paddingLeft: '2.25rem', paddingRight: '2.25rem' }}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2"
                                    style={{ color: '#64748b' }} onClick={() => setShowPwd(!showPwd)}>
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full" style={{ justifyContent: 'center', padding: '0.75rem' }}
                            disabled={loading}>
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : (
                                <><LogIn size={16} /> Sign In</>
                            )}
                        </button>
                    </form>

                    <div className="divider" />

                    <p className="text-center text-sm" style={{ color: '#64748b' }}>
                        Don&apos;t have an account?{' '}
                        <Link href="/auth/register" className="font-semibold" style={{ color: '#0ea5e9' }}>
                            Register here
                        </Link>
                    </p>
                </div>

                <p className="text-center text-xs mt-4" style={{ color: '#475569' }}>
                    Need help?{' '}
                    <a href="https://wa.me/8801313961899" target="_blank" rel="noopener noreferrer"
                        className="font-medium" style={{ color: '#10b981' }}>
                        Contact Support
                    </a>
                </p>
            </div>
        </div>
    )
}
