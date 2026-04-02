import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { BookText, CheckCircle2, Clock, XCircle, Wallet } from 'lucide-react'

export default async function PassbookPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: withdrawals } = await supabase
        .from('withdraw_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const allWithdrawals = withdrawals || []
    const totalPaid = allWithdrawals.filter(w => w.status === 'PAID').reduce((s, w) => s + w.amount, 0)
    const totalPending = allWithdrawals.filter(w => w.status === 'PENDING').reduce((s, w) => s + w.amount, 0)

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up pb-10">
            {/* Header */}
            <div className="page-header">
                <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: '#e2e8f0' }}>
                    <BookText size={24} className="text-emerald-400" /> My Passbook
                </h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>Complete withdrawal history and payment records</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-5 border-l-4 border-l-emerald-500">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Total Received</div>
                    <div className="text-2xl font-black text-emerald-400">{formatCurrency(totalPaid)}</div>
                    <div className="text-xs text-slate-600 mt-1">{allWithdrawals.filter(w => w.status === 'PAID').length} successful payments</div>
                </div>
                <div className="glass-card p-5 border-l-4 border-l-amber-500">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Pending</div>
                    <div className="text-2xl font-black text-amber-400">{formatCurrency(totalPending)}</div>
                    <div className="text-xs text-slate-600 mt-1">{allWithdrawals.filter(w => w.status === 'PENDING').length} requests pending</div>
                </div>
            </div>

            {/* Passbook Entries */}
            <div className="glass-card overflow-hidden">
                <div className="p-5 border-b flex items-center gap-3" style={{ borderColor: '#1e3a5f' }}>
                    <Wallet size={18} className="text-emerald-400" />
                    <h2 className="font-bold text-white">Transaction History</h2>
                    <span className="ml-auto text-xs text-slate-500 font-semibold">{allWithdrawals.length} entries</span>
                </div>

                {allWithdrawals.length === 0 ? (
                    <div className="p-16 text-center">
                        <BookText size={48} className="mx-auto mb-4 opacity-20 text-slate-400" />
                        <p className="text-slate-500 font-medium">No withdrawal records yet.</p>
                        <p className="text-slate-600 text-sm mt-1">Your payment history will appear here after your first withdrawal request.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {allWithdrawals.map((w: any, i: number) => {
                            const isPaid = w.status === 'PAID'
                            const isPending = w.status === 'PENDING'
                            const date = new Date(w.created_at)
                            const paidDate = w.paid_at ? new Date(w.paid_at) : null

                            return (
                                <div key={w.id} className="p-4 sm:p-5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                                    {/* Status Icon */}
                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                                        isPaid ? 'bg-emerald-500/15' : isPending ? 'bg-amber-500/15' : 'bg-red-500/15'
                                    }`}>
                                        {isPaid ? (
                                            <CheckCircle2 size={22} className="text-emerald-400" />
                                        ) : isPending ? (
                                            <Clock size={22} className="text-amber-400" />
                                        ) : (
                                            <XCircle size={22} className="text-red-400" />
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-white text-sm">
                                                {formatCurrency(w.amount)}
                                            </span>
                                            {isPaid && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                                    <CheckCircle2 size={10} /> PAID
                                                </span>
                                            )}
                                            {isPending && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                                                    <Clock size={10} /> PENDING
                                                </span>
                                            )}
                                            {!isPaid && !isPending && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
                                                    <XCircle size={10} /> {w.status}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-3">
                                            <span>via <span className="font-semibold text-sky-400">{w.method || 'N/A'}</span></span>
                                            <span className="text-slate-600">•</span>
                                            <span>Requested: <span className="text-slate-300">{date.toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })}</span></span>
                                        </div>
                                        {paidDate && (
                                            <div className="text-[10px] text-emerald-600 mt-0.5">
                                                Paid on: {paidDate.toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        )}
                                        {w.account_number && (
                                            <div className="text-[10px] text-slate-600 mt-0.5 font-mono">
                                                To: {w.account_number}
                                            </div>
                                        )}
                                    </div>

                                    {/* Serial */}
                                    <div className="text-xs font-mono text-slate-700 hidden sm:block">
                                        #{String(allWithdrawals.length - i).padStart(3, '0')}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
