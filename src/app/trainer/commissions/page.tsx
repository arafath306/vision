import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { DollarSign } from 'lucide-react'

export default async function TrainerCommissionsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: commissions } = await supabase
        .from('commissions')
        .select('*, source_user:source_user_id(full_name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const total = (commissions || []).reduce((s, c) => s + c.amount, 0)
    const trainerTotal = (commissions || []).filter(c => c.type === 'TRAINER').reduce((s, c) => s + c.amount, 0)
    const referralTotal = (commissions || []).filter(c => c.type === 'REFERRAL').reduce((s, c) => s + c.amount, 0)

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="page-header">
                <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>Commission History</h1>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Earned', value: formatCurrency(total), color: '#0ea5e9' },
                    { label: 'Trainer Commission', value: formatCurrency(trainerTotal), color: '#10b981' },
                    { label: 'Referral Commission', value: formatCurrency(referralTotal), color: '#8b5cf6' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="text-xs font-semibold mb-2 uppercase" style={{ color: '#64748b' }}>{s.label}</div>
                        <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>
            <div className="glass-card overflow-hidden">
                <div className="p-5 border-b" style={{ borderColor: '#1e3a5f' }}>
                    <h2 className="section-title" style={{ fontSize: '1rem' }}>
                        <DollarSign size={18} style={{ color: '#0ea5e9' }} />
                        All Commissions
                    </h2>
                </div>
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table>
                        <thead><tr><th>From Member</th><th>Type</th><th>Amount</th><th>Date</th></tr></thead>
                        <tbody>
                            {(commissions || []).map((c: any) => (
                                <tr key={c.id}>
                                    <td style={{ color: '#cbd5e1' }}>{c.source_user?.full_name || '—'}</td>
                                    <td><span className="badge text-cyan-400 bg-cyan-400/10 capitalize">{c.type.toLowerCase()}</span></td>
                                    <td className="font-semibold" style={{ color: '#10b981' }}>+{formatCurrency(c.amount)}</td>
                                    <td style={{ color: '#64748b', fontSize: '0.75rem' }}>{formatDateTime(c.created_at)}</td>
                                </tr>
                            ))}
                            {(commissions || []).length === 0 && (
                                <tr><td colSpan={4} className="text-center py-8" style={{ color: '#64748b' }}>No commissions yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
