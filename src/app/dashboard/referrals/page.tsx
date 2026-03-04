import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Users, UserCheck, UserX, Copy } from 'lucide-react'

export default async function ReferralsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase.from('users').select('referral_code, status').eq('id', user.id).single()
    if (profile?.status !== 'ACTIVE') redirect('/dashboard')

    const { data: referrals } = await supabase
        .from('users')
        .select('id, full_name, whatsapp, status, created_at')
        .eq('referred_by', user.id)
        .order('created_at', { ascending: false })

    const { data: commissions } = await supabase
        .from('commissions')
        .select('amount, type, created_at, source_user:source_user_id(full_name)')
        .eq('user_id', user.id)
        .eq('type', 'REFERRAL')
        .order('created_at', { ascending: false })

    const totalEarned = (commissions || []).reduce((s, c) => s + c.amount, 0)
    const activeCount = (referrals || []).filter(r => r.status === 'ACTIVE').length

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="page-header">
                <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>My Referrals</h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>Track your referred members and commissions</p>
            </div>

            {/* Referral Code */}
            <div className="glass-card p-5" style={{ borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)' }}>
                <p className="text-xs font-semibold mb-2" style={{ color: '#10b981' }}>YOUR REFERRAL CODE</p>
                <div className="flex items-center gap-4">
                    <span className="text-3xl font-mono font-bold" style={{ color: '#e2e8f0' }}>{profile?.referral_code}</span>
                    <button className="btn-outline text-xs copy-btn" data-code={profile?.referral_code || ''} style={{ padding: '0.4rem 0.875rem' }}>
                        <Copy size={13} /> Copy
                    </button>
                </div>
                <p className="text-xs mt-2" style={{ color: '#64748b' }}>Share this code with new members to earn referral commissions</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="stat-card">
                    <div className="flex items-center gap-2 mb-2">
                        <Users size={16} style={{ color: '#0ea5e9' }} />
                        <span className="text-xs font-semibold" style={{ color: '#64748b' }}>TOTAL REFERRED</span>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: '#0ea5e9' }}>{(referrals || []).length}</div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-2 mb-2">
                        <UserCheck size={16} style={{ color: '#10b981' }} />
                        <span className="text-xs font-semibold" style={{ color: '#64748b' }}>ACTIVE REFERRALS</span>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: '#10b981' }}>{activeCount}</div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-2 mb-2">
                        <UserX size={16} style={{ color: '#f59e0b' }} />
                        <span className="text-xs font-semibold" style={{ color: '#64748b' }}>REFERRAL EARNINGS</span>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{formatCurrency(totalEarned)}</div>
                </div>
            </div>

            {/* Referral Table */}
            <div className="glass-card overflow-hidden">
                <div className="p-5 border-b" style={{ borderColor: '#1e3a5f' }}>
                    <h2 className="section-title" style={{ fontSize: '1rem' }}>
                        <Users size={18} style={{ color: '#0ea5e9' }} />
                        Referred Members ({(referrals || []).length})
                    </h2>
                </div>
                {(referrals || []).length === 0 ? (
                    <div className="p-10 text-center">
                        <Users size={40} className="mx-auto mb-3 opacity-30" style={{ color: '#64748b' }} />
                        <p style={{ color: '#64748b' }}>No referrals yet. Share your code to get started!</p>
                    </div>
                ) : (
                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>WhatsApp</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(referrals || []).map(r => (
                                    <tr key={r.id}>
                                        <td className="font-medium">{r.full_name}</td>
                                        <td style={{ color: '#94a3b8' }}>{r.whatsapp}</td>
                                        <td>
                                            <span className={`badge ${r.status === 'ACTIVE'
                                                ? 'text-green-400 bg-green-400/10'
                                                : 'text-yellow-400 bg-yellow-400/10'}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td style={{ color: '#64748b' }}>{formatDate(r.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
