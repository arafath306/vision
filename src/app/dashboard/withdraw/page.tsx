'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils'
import type { WithdrawRequest } from '@/lib/types'
import { DollarSign, Send, AlertCircle, CheckCircle, Clock } from 'lucide-react'

const METHODS = ['BKASH', 'NAGAD', 'ROCKET', 'BANK'] as const

export default function WithdrawPage() {
    const supabase = createClient()
    const [balance, setBalance] = useState(0)
    const [history, setHistory] = useState<WithdrawRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [form, setForm] = useState({ amount: '', method: 'BKASH' as typeof METHODS[number], account_number: '' })

    useEffect(() => {
        load()
    }, [])

    const load = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: commissions } = await supabase
            .from('commissions').select('amount').eq('user_id', user.id)
        const totalEarned = (commissions || []).reduce((s, c) => s + c.amount, 0)

        const { data: wds } = await supabase
            .from('withdraw_requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        const paid = (wds || []).filter(w => w.status === 'PAID').reduce((s, w) => s + w.amount, 0)
        setBalance(totalEarned - paid)
        setHistory((wds || []) as WithdrawRequest[])
        setLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setSubmitting(true)

        const amount = parseFloat(form.amount)
        if (isNaN(amount) || amount <= 0) {
            setError('Please enter a valid amount.')
            setSubmitting(false)
            return
        }
        if (amount > balance) {
            setError(`Insufficient balance. Available: ${formatCurrency(balance)}`)
            setSubmitting(false)
            return
        }
        if (amount < 100) {
            setError('Minimum withdrawal amount is ৳100.')
            setSubmitting(false)
            return
        }
        if (!form.account_number.trim()) {
            setError('Please enter your account number.')
            setSubmitting(false)
            return
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setError('Please login again.'); setSubmitting(false); return }

        // Check pending request
        const { data: pending } = await supabase
            .from('withdraw_requests')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'PENDING')
            .maybeSingle()

        if (pending) {
            setError('You already have a pending withdrawal request. Please wait for it to be processed.')
            setSubmitting(false)
            return
        }

        const { error: insertError } = await supabase.from('withdraw_requests').insert({
            user_id: user.id,
            amount,
            method: form.method,
            account_number: form.account_number.trim(),
            status: 'PENDING',
        })

        if (insertError) {
            setError('Failed to submit request. Please try again.')
        } else {
            setSuccess('Withdrawal request submitted! Admin will process within 24-48 hours.')
            setForm({ amount: '', method: 'BKASH', account_number: '' })
            load()
        }
        setSubmitting(false)
    }

    const pendingAmount = history.filter(w => w.status === 'PENDING').reduce((s, w) => s + w.amount, 0)

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="page-header">
                <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>Withdraw Funds</h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>Minimum withdrawal: ৳100</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                <div className="stat-card">
                    <div className="text-xs font-semibold mb-2" style={{ color: '#64748b' }}>AVAILABLE BALANCE</div>
                    <div className="text-2xl font-bold" style={{ color: '#10b981' }}>{loading ? '...' : formatCurrency(balance)}</div>
                </div>
                <div className="stat-card">
                    <div className="text-xs font-semibold mb-2" style={{ color: '#64748b' }}>PENDING WITHDRAWALS</div>
                    <div className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{loading ? '...' : formatCurrency(pendingAmount)}</div>
                </div>
                <div className="stat-card">
                    <div className="text-xs font-semibold mb-2" style={{ color: '#64748b' }}>TOTAL REQUESTS</div>
                    <div className="text-2xl font-bold" style={{ color: '#0ea5e9' }}>{history.length}</div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Form */}
                <div className="glass-card p-6">
                    <h2 className="section-title mb-5" style={{ fontSize: '1rem' }}>
                        <Send size={18} style={{ color: '#0ea5e9' }} />
                        New Withdrawal Request
                    </h2>
                    {error && <div className="alert-error mb-4"><AlertCircle size={16} />{error}</div>}
                    {success && <div className="alert-success mb-4"><CheckCircle size={16} />{success}</div>}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="form-label">Amount (BDT) *</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
                                <input id="wd-amount" type="number" className="input-field" style={{ paddingLeft: '2.25rem' }}
                                    placeholder="Amount to withdraw" min="100"
                                    value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
                            </div>
                            <p className="text-xs mt-1" style={{ color: '#475569' }}>
                                Balance: <strong style={{ color: '#10b981' }}>{formatCurrency(balance)}</strong>
                            </p>
                        </div>
                        <div>
                            <label className="form-label">Payment Method *</label>
                            <select id="wd-method" className="select-field"
                                value={form.method} onChange={e => setForm(p => ({ ...p, method: e.target.value as typeof METHODS[number] }))}>
                                {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Account Number *</label>
                            <input id="wd-account" type="text" className="input-field"
                                placeholder={form.method === 'BANK' ? 'Bank account number' : `${form.method} number`}
                                value={form.account_number} onChange={e => setForm(p => ({ ...p, account_number: e.target.value }))} required />
                        </div>
                        <button type="submit" className="btn-primary w-full" style={{ justifyContent: 'center' }} disabled={submitting}>
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Submitting...
                                </span>
                            ) : <><Send size={16} /> Submit Request</>}
                        </button>
                    </form>
                </div>

                {/* History */}
                <div className="glass-card overflow-hidden">
                    <div className="p-5 border-b" style={{ borderColor: '#1e3a5f' }}>
                        <h2 className="section-title" style={{ fontSize: '1rem' }}>
                            <Clock size={18} style={{ color: '#0ea5e9' }} />
                            Withdrawal History
                        </h2>
                    </div>
                    {history.length === 0 ? (
                        <div className="p-8 text-center">
                            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No withdrawal requests yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Amount</th>
                                        <th>Method</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map(w => (
                                        <tr key={w.id}>
                                            <td className="font-semibold" style={{ color: '#e2e8f0' }}>{formatCurrency(w.amount)}</td>
                                            <td style={{ color: '#94a3b8' }}>{w.method}</td>
                                            <td><span className={`badge ${getStatusColor(w.status)}`}>{w.status}</span></td>
                                            <td style={{ color: '#64748b', fontSize: '0.75rem' }}>{formatDateTime(w.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
