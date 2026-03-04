import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { DollarSign, TrendingUp } from 'lucide-react'

export default async function AdminCommissionsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: commissions } = await supabase
        .from('commissions')
        .select(`
      *,
      recipient:user_id(full_name, whatsapp, role),
      source_user:source_user_id(full_name)
    `)
        .order('created_at', { ascending: false })

    const all = commissions || []
    const totalReferral = all.filter(c => c.type === 'REFERRAL').reduce((s, c) => s + c.amount, 0)
    const totalTrainer = all.filter(c => c.type === 'TRAINER').reduce((s, c) => s + c.amount, 0)
    const totalLeader = all.filter(c => c.type === 'LEADER').reduce((s, c) => s + c.amount, 0)
    const grandTotal = all.reduce((s, c) => s + c.amount, 0)

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="page-header">
                <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>Commission Records</h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>All commissions distributed across the platform</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Distributed', value: formatCurrency(grandTotal), color: '#0ea5e9' },
                    { label: 'Referral Commissions', value: formatCurrency(totalReferral), color: '#10b981' },
                    { label: 'Trainer Commissions', value: formatCurrency(totalTrainer), color: '#8b5cf6' },
                    { label: 'Leader Commissions', value: formatCurrency(totalLeader), color: '#f59e0b' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="text-xs font-semibold mb-2 uppercase" style={{ color: '#64748b' }}>{s.label}</div>
                        <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Type Breakdown */}
            <div className="grid sm:grid-cols-3 gap-4">
                {[
                    { type: 'REFERRAL', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' },
                    { type: 'TRAINER', color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.25)' },
                    { type: 'LEADER', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
                ].map(({ type, color, bg, border }) => (
                    <div key={type} className="glass-card p-4 text-center"
                        style={{ background: bg, borderColor: border }}>
                        <div className="text-xs font-semibold mb-1" style={{ color }}>
                            {type} COMMISSIONS
                        </div>
                        <div className="text-2xl font-bold mb-1" style={{ color }}>
                            {all.filter(c => c.type === type).length}
                        </div>
                        <div className="text-sm" style={{ color: '#94a3b8' }}>transactions</div>
                    </div>
                ))}
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-5 border-b" style={{ borderColor: '#1e3a5f' }}>
                    <h2 className="section-title" style={{ fontSize: '1rem' }}>
                        <TrendingUp size={18} style={{ color: '#0ea5e9' }} />
                        All Commission Transactions ({all.length})
                    </h2>
                </div>
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Recipient</th>
                                <th>Role</th>
                                <th>From Member</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {all.length === 0 ? (
                                <tr><td colSpan={6} className="py-8 text-center" style={{ color: '#64748b' }}>No commissions yet.</td></tr>
                            ) : all.map((c: any) => (
                                <tr key={c.id}>
                                    <td>
                                        <div className="font-medium" style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>
                                            {c.recipient?.full_name}
                                        </div>
                                        <div className="text-xs" style={{ color: '#64748b' }}>{c.recipient?.whatsapp}</div>
                                    </td>
                                    <td>
                                        <span className="badge text-cyan-400 bg-cyan-400/10 capitalize text-xs">
                                            {(c.recipient?.role || '').replace('TEAM_', '')}
                                        </span>
                                    </td>
                                    <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                        {c.source_user?.full_name || '—'}
                                    </td>
                                    <td>
                                        <span className="badge text-xs capitalize"
                                            style={
                                                c.type === 'REFERRAL' ? { background: 'rgba(16,185,129,0.12)', color: '#10b981' }
                                                    : c.type === 'TRAINER' ? { background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }
                                                        : { background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }
                                            }>
                                            {c.type.toLowerCase()}
                                        </span>
                                    </td>
                                    <td className="font-bold" style={{ color: '#10b981' }}>
                                        +{formatCurrency(c.amount)}
                                    </td>
                                    <td style={{ color: '#64748b', fontSize: '0.72rem' }}>{formatDateTime(c.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
