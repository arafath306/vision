'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { CheckCircle, AlertCircle, Clock, Users } from 'lucide-react'

export default function AdminActivationsPage() {
    const supabase = createClient()
    const [activations, setActivations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [approving, setApproving] = useState<string | null>(null)
    const [message, setMessage] = useState({ type: '', text: '' })

    const load = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase
            .from('activation_payments')
            .select('*, users:user_id(id, full_name, whatsapp, email, referred_by, trainer_id, leader_id, status, referral_code)')
            .order('created_at', { ascending: false })
        setActivations(data || [])
        setLoading(false)
    }, [])

    useEffect(() => { load() }, [load])

    const approve = async (activation: any) => {
        setApproving(activation.id)
        setMessage({ type: '', text: '' })
        const { data: { user: adminUser } } = await supabase.auth.getUser()

        // Get settings
        const { data: settings } = await supabase.from('system_settings').select('*').single()
        const s = settings as any

        // Mark activation as approved
        await supabase.from('activation_payments').update({ status: 'APPROVED', approved_by: adminUser?.id }).eq('id', activation.id)

        // Activate user
        const targetUser = activation.users
        await supabase.from('users').update({ status: 'ACTIVE' }).eq('id', targetUser.id)

        // Distribute commissions
        if (targetUser.referred_by && s) {
            await supabase.from('commissions').insert({
                user_id: targetUser.referred_by,
                source_user_id: targetUser.id,
                amount: s.activation_fee * (s.referral_percentage / 100),
                type: 'REFERRAL',
            })
        }
        if (targetUser.trainer_id && s) {
            await supabase.from('commissions').insert({
                user_id: targetUser.trainer_id,
                source_user_id: targetUser.id,
                amount: s.activation_fee * (s.trainer_percentage / 100),
                type: 'TRAINER',
            })
        }
        if (targetUser.leader_id && s) {
            await supabase.from('commissions').insert({
                user_id: targetUser.leader_id,
                source_user_id: targetUser.id,
                amount: s.activation_fee * (s.leader_percentage / 100),
                type: 'LEADER',
            })
        }

        setMessage({ type: 'success', text: `${targetUser.full_name} activated! Commissions distributed.` })
        setApproving(null)
        load()
    }

    const pending = activations.filter(a => a.status === 'PENDING')
    const approved = activations.filter(a => a.status === 'APPROVED')

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="page-header">
                <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>Activation Payments</h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>Review and approve member activation payments</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Requests', value: activations.length, color: '#0ea5e9' },
                    { label: 'Pending', value: pending.length, color: '#f59e0b' },
                    { label: 'Approved', value: approved.length, color: '#10b981' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="text-xs font-semibold mb-2 uppercase" style={{ color: '#64748b' }}>{s.label}</div>
                        <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {message.text && (
                <div className={message.type === 'success' ? 'alert-success' : 'alert-error'}>
                    {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </div>
            )}

            {/* Pending */}
            {pending.length > 0 && (
                <div className="glass-card overflow-hidden" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
                    <div className="p-5 border-b flex items-center gap-2" style={{ borderColor: '#1e3a5f', background: 'rgba(245,158,11,0.05)' }}>
                        <Clock size={18} style={{ color: '#f59e0b' }} />
                        <h2 className="font-bold" style={{ color: '#f59e0b' }}>Pending Approvals ({pending.length})</h2>
                    </div>
                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table>
                            <thead><tr><th>Member</th><th>WhatsApp</th><th>Amount</th><th>Submitted</th><th>Action</th></tr></thead>
                            <tbody>
                                {pending.map(a => (
                                    <tr key={a.id}>
                                        <td>
                                            <div className="font-medium" style={{ color: '#e2e8f0' }}>{a.users?.full_name}</div>
                                            <div className="text-xs" style={{ color: '#64748b' }}>{a.users?.email}</div>
                                        </td>
                                        <td style={{ color: '#94a3b8' }}>{a.users?.whatsapp}</td>
                                        <td className="font-semibold" style={{ color: '#10b981' }}>{formatCurrency(a.amount)}</td>
                                        <td style={{ color: '#64748b', fontSize: '0.75rem' }}>{formatDateTime(a.created_at)}</td>
                                        <td>
                                            <button
                                                id={`approve-${a.id}`}
                                                className="btn-accent"
                                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                                                onClick={() => approve(a)}
                                                disabled={approving === a.id}>
                                                {approving === a.id ? (
                                                    <span className="flex items-center gap-1">
                                                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Processing...
                                                    </span>
                                                ) : <><CheckCircle size={12} /> Approve & Activate</>}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* All History */}
            <div className="glass-card overflow-hidden">
                <div className="p-5 border-b" style={{ borderColor: '#1e3a5f' }}>
                    <h2 className="section-title" style={{ fontSize: '1rem' }}>
                        <Users size={18} style={{ color: '#0ea5e9' }} />
                        All Activation Records
                    </h2>
                </div>
                {loading ? (
                    <div className="p-8 text-center" style={{ color: '#64748b' }}>Loading...</div>
                ) : (
                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table>
                            <thead><tr><th>Member</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                            <tbody>
                                {activations.length === 0 ? (
                                    <tr><td colSpan={4} className="py-8 text-center" style={{ color: '#64748b' }}>No activation records yet.</td></tr>
                                ) : activations.map(a => (
                                    <tr key={a.id}>
                                        <td>
                                            <div className="font-medium" style={{ color: '#e2e8f0' }}>{a.users?.full_name}</div>
                                            <div className="text-xs" style={{ color: '#64748b' }}>{a.users?.whatsapp}</div>
                                        </td>
                                        <td className="font-semibold" style={{ color: '#10b981' }}>{formatCurrency(a.amount)}</td>
                                        <td>
                                            <span className="badge"
                                                style={a.status === 'APPROVED'
                                                    ? { background: 'rgba(16,185,129,0.1)', color: '#10b981' }
                                                    : { background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                                                {a.status}
                                            </span>
                                        </td>
                                        <td style={{ color: '#64748b', fontSize: '0.75rem' }}>{formatDateTime(a.created_at)}</td>
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
