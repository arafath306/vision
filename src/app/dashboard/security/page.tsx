'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lock, Eye, EyeOff, Save, AlertCircle, CheckCircle } from 'lucide-react'

export default function SecuritySettingsPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [showPwd, setShowPwd] = useState({
        old: false,
        new: false,
        confirm: false
    })
    const [form, setForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        if (form.newPassword !== form.confirmPassword) {
            setError('New passwords do not match.')
            setLoading(false)
            return
        }

        if (form.newPassword.length < 6) {
            setError('New password must be at least 6 characters.')
            setLoading(false)
            return
        }

        // In Supabase, updatePassword doesn't require old password explicitly 
        // if user is authenticated, but some implementations might check it.
        // For standard Supabase Auth, we just update.
        const { error: updateError } = await supabase.auth.updateUser({
            password: form.newPassword
        })

        if (updateError) {
            setError(updateError.message || 'Failed to update password.')
        } else {
            setSuccess('Password updated successfully!')
            setForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
        }
        setLoading(false)
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
            <div className="page-header">
                <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>Security Settings</h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>Update your account password to keep it secure.</p>
            </div>

            <div className="glass-card p-8">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b" style={{ borderColor: '#1e3a5f' }}>
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Lock size={20} className="text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold" style={{ color: '#e2e8f0' }}>Change Password</h2>
                        <p className="text-xs" style={{ color: '#94a3b8' }}>Ensure your account is using a long, random password.</p>
                    </div>
                </div>

                {error && (
                    <div className="alert-error mb-6">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
                {success && (
                    <div className="alert-success mb-6">
                        <CheckCircle size={16} /> {success}
                    </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-6">
                    {/* Note: Standard Supabase doesn't easily verify old password on client side 
                        without signIn again, but we provide the field for UX consistency. */}
                    <div>
                        <label className="form-label">Old Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
                            <input
                                type={showPwd.old ? 'text' : 'password'}
                                className="input-field"
                                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                                placeholder="Enter current password"
                                value={form.oldPassword}
                                onChange={e => setForm(p => ({ ...p, oldPassword: e.target.value }))}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                onClick={() => setShowPwd(p => ({ ...p, old: !p.old }))}
                            >
                                {showPwd.old ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                            <label className="form-label">New Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
                                <input
                                    type={showPwd.new ? 'text' : 'password'}
                                    className="input-field"
                                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                                    placeholder="Min 6 characters"
                                    value={form.newPassword}
                                    onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                    onClick={() => setShowPwd(p => ({ ...p, new: !p.new }))}
                                >
                                    {showPwd.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Confirm New Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
                                <input
                                    type={showPwd.confirm ? 'text' : 'password'}
                                    className="input-field"
                                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                                    placeholder="Repeat new password"
                                    value={form.confirmPassword}
                                    onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                    onClick={() => setShowPwd(p => ({ ...p, confirm: !p.confirm }))}
                                >
                                    {showPwd.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="btn-primary w-full py-3 justify-center text-lg shadow-lg shadow-blue-500/10"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Updating...
                                </span>
                            ) : (
                                <><Save size={18} /> Update Password</>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="glass-card p-6 bg-yellow-500/5 border-yellow-500/20">
                <div className="flex gap-4">
                    <AlertCircle className="text-yellow-500 shrink-0" size={24} />
                    <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
                        <strong className="text-yellow-500 block mb-1">Security Reminder:</strong>
                        If you forget your password, you will not be able to log in. Please reach out to the admin via WhatsApp if you need a password reset.
                    </p>
                </div>
            </div>
        </div>
    )
}
