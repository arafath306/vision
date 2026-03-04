'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils'
import { DollarSign, CheckCircle, AlertCircle, Clock, CreditCard } from 'lucide-react'

const STATUS_FLOW = ['PENDING', 'APPROVED', 'PAID'] as const

export default function AdminWithdrawalsPage() {
    const supabase = createClient()
    const [withdrawals, setWithdrawals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('')
    const [updating, setUpdating] = useState<string | null>(null)
    const [message, setMessage] = useState({ type: '', text: '' })

    const load = useCallback(async () => {
        setLoading(true)
        let q = supabase
            .from('withdraw_requests')
            .select('*, users:user_id(full_name, whatsapp, email)')
            .order('created_at', { ascending: false })
        if (filterStatus) q = q.eq('status', filterStatus)
        const { data } = await q
        setWithdrawals(data || [])
        setLoading(false)
    }, [filterStatus])

    useEffect(() => { load() }, [load])

    const updateStatus = async (id: string, newStatus: string) => {
        setUpdating(id)
        setMessage({ type: '', text: '' })
        const { error } = await supabase
            .from('withdraw_requests')
            .update({ status: newStatus })
            .eq('id', id)

        if (error) {
            setMessage({ type: 'error', text: 'Failed to update status.' })
        } else {
            setMessage({ type: 'success', text: `Withdrawal marked as ${newStatus}.` })
            load()
        }
        setUpdating(null)
    }

    const pending = withdrawals.filter(w => w.status === 'PENDING')
    const approved = withdrawals.filter(w => w.status === 'APPROVED')
    const paid = withdrawals.filter(w => w.status === 'PAID')
    const totalPending = pending.reduce((s, w) => s + w.amount, 0)
    const totalPaid = paid.reduce((s, w) => s + w.amount, 0)

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="page-header">
                <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>Withdrawal Requests</h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>Review and process member withdrawal requests</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Pending', value: pending.length, sub: formatCurrency(totalPending), color: '#f59e0b' },
                    { label: 'Approved', value: approved.length, sub: '', color: '#0ea5e9' },
                    { label: 'Paid', value: paid.length, sub: formatCurrency(totalPaid), color: '#10b981' },
                    { label: 'Total Requests', value: withdrawals.length, sub: '', color: '#8b5cf6' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="text-xs font-semibold mb-2 uppercase" style={{ color: '#64748b' }}>{s.label}</div>
                        <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                        {s.sub && <div className="text-xs mt-1" style={{ color: '#64748b' }}>{s.sub}</div>}
                    </div>
                ))}
            </div>

            {message.text && (
                <div className={message.type === 'success' ? 'alert-success' : 'alert-error'}>
                    {message.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                    {message.text}
                </div>
            )}

            {/* Pending Requests — highlighted */}
            {pending.length > 0 && (
                <div className="glass-card overflow-hidden" style={{ borderColor: 'rgba(245,158,11,0.4)' }}>
                    <div className="p-5 border-b flex items-center gap-2"
                        style={{ borderColor: '#1e3a5f', background: 'rgba(245,158,11,0.05)' }}>
                        <Clock size={18} style={{ color: '#f59e0b' }} />
                        <h2 className="font-bold" style={{ color: '#f59e0b' }}>Pending Requests ({pending.length})</h2>
                    </div>
                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Member</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Account No.</th>
                                    <th>Submitted</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pending.map(w => (
                                    <tr key={w.id}>
                                        <td>
                                            <div className="font-medium" style={{ color: '#e2e8f0' }}>{w.users?.full_name}</div>
                                            <div className="text-xs" style={{ color: '#64748b' }}>{w.users?.whatsapp}</div>
                                        </td>
                                        <td className="font-bold" style={{ color: '#10b981' }}>{formatCurrency(w.amount)}</td>
                                        <td>
                                            <span className="badge text-cyan-400 bg-cyan-400/10">{w.method}</span>
                                        </td>
                                        <td className="font-mono text-xs" style={{ color: '#94a3b8' }}>{w.account_number}</td>
                                        <td style={{ color: '#64748b', fontSize: '0.75rem' }}>{formatDateTime(w.created_at)}</td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button
                                                    id={`approve-wd-${w.id}`}
                                                    className="btn-outline"
                                                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}
                                                    onClick={() => updateStatus(w.id, 'APPROVED')}
                                                    disabled={updating === w.id}>
                                                    <CheckCircle size={12} /> Approve
                                                </button>
                                                <button
                                                    id={`pay-wd-${w.id}`}
                                                    className="btn-accent"
                                                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}
                                                    onClick={() => updateStatus(w.id, 'PAID')}
                                                    disabled={updating === w.id}>
                                                    <DollarSign size={12} /> Mark Paid
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Filter + Full History */}
            <div className="glass-card overflow-hidden">
                <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: '#1e3a5f' }}>
                    <h2 className="section-title" style={{ fontSize: '1rem' }}>
                        <CreditCard size={18} style={{ color: '#0ea5e9' }} />
                        All Withdrawal Records
                    </h2>
                    <select id="wd-filter-status" className="select-field" style={{ width: 'auto', minWidth: '140px' }}
                        value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="">All Statuses</option>
                        {STATUS_FLOW.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                {loading ? (
                    <div className="p-8 text-center" style={{ color: '#64748b' }}>Loading...</div>
                ) : (
                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Member</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Account</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {withdrawals.length === 0 ? (
                                    <tr><td colSpan={7} className="py-8 text-center" style={{ color: '#64748b' }}>No withdrawal requests yet.</td></tr>
                                ) : withdrawals.map(w => (
                                    <tr key={w.id}>
                                        <td>
                                            <div className="font-medium" style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>{w.users?.full_name}</div>
                                            <div className="text-xs" style={{ color: '#64748b' }}>{w.users?.whatsapp}</div>
                                        </td>
                                        <td className="font-semibold" style={{ color: '#10b981' }}>{formatCurrency(w.amount)}</td>
                                        <td style={{ color: '#94a3b8' }}>{w.method}</td>
                                        <td className="font-mono text-xs" style={{ color: '#94a3b8' }}>{w.account_number}</td>
                                        <td><span className={`badge ${getStatusColor(w.status)}`}>{w.status}</span></td>
                                        <td style={{ color: '#64748b', fontSize: '0.72rem' }}>{formatDateTime(w.created_at)}</td>
                                        <td>
                                            {w.status === 'PENDING' && (
                                                <button className="btn-accent" style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                                                    onClick={() => updateStatus(w.id, 'APPROVED')} disabled={updating === w.id}>
                                                    Approve
                                                </button>
                                            )}
                                            {w.status === 'APPROVED' && (
                                                <button className="btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                                                    onClick={() => updateStatus(w.id, 'PAID')} disabled={updating === w.id}>
                                                    Mark Paid
                                                </button>
                                            )}
                                            {w.status === 'PAID' && (
                                                <span className="text-xs" style={{ color: '#10b981' }}>✓ Completed</span>
                                            )}
                                        </td>
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
