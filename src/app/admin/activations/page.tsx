'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import {
    CheckCircle, AlertCircle, Clock, Users, UserCheck,
    RefreshCw, Search, X, Phone, Mail, Calendar,
    FileText, Zap, Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivationPayment {
    id: string
    user_id: string
    amount: number
    status: string
    approved_by: string | null
    created_at: string
    users: {
        id: string
        full_name: string
        whatsapp: string
        email: string | null
        referred_by: string | null
        trainer_id: string | null
        leader_id: string | null
        status: string
        referral_code: string | null
    } | null
}

interface InactiveUser {
    id: string
    full_name: string
    whatsapp: string
    email: string | null
    referred_by: string | null
    trainer_id: string | null
    leader_id: string | null
    status: string
    referral_code: string | null
    created_at: string
}

function formatDateTime(dt: string) {
    return new Date(dt).toLocaleString('en-BD', {
        timeZone: 'Asia/Dhaka',
        dateStyle: 'medium',
        timeStyle: 'short',
    })
}

type ActiveTab = 'payments' | 'inactive'

export default function AdminActivationsPage() {
    const supabase = createClient()
    const [activeTab, setActiveTab] = useState<ActiveTab>('payments')
    const [activations, setActivations] = useState<ActivationPayment[]>([])
    const [inactiveUsers, setInactiveUsers] = useState<InactiveUser[]>([])
    const [loading, setLoading] = useState(true)
    const [approving, setApproving] = useState<string | null>(null)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [search, setSearch] = useState('')

    const load = useCallback(async () => {
        setLoading(true)
        setMessage({ type: '', text: '' })

        // Load activation payments with user details
        const { data: paymentsData, error: payErr } = await supabase
            .from('activation_payments')
            .select(`
                id, user_id, amount, status, approved_by, created_at,
                users:user_id (
                    id, full_name, whatsapp, email,
                    referred_by, trainer_id, leader_id,
                    status, referral_code
                )
            `)
            .order('created_at', { ascending: false })

        if (payErr) {
            console.error('Payments fetch error:', payErr)
            setMessage({ type: 'error', text: `Error loading payments: ${payErr.message}` })
        }

        // Load all INACTIVE users (regardless of payment submission)
        const { data: inactiveData, error: inactiveErr } = await supabase
            .from('users')
            .select('id, full_name, whatsapp, email, referred_by, trainer_id, leader_id, status, referral_code, created_at')
            .eq('status', 'INACTIVE')
            .order('created_at', { ascending: false })

        if (inactiveErr) {
            console.error('Inactive users fetch error:', inactiveErr)
        }

        setActivations((paymentsData as unknown as ActivationPayment[]) || [])
        setInactiveUsers(inactiveData || [])
        setLoading(false)
    }, [supabase])

    useEffect(() => { load() }, [load])

    const showMsg = (type: string, text: string) => {
        setMessage({ type, text })
        setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    }

    // ── Approve via payment ──────────────────────────────────────
    const approvePayment = async (activation: ActivationPayment) => {
        if (!activation.users) return
        setApproving(activation.id)

        const { data: { user: adminUser } } = await supabase.auth.getUser()

        // Get settings
        const { data: settings } = await supabase.from('system_settings').select('*').single()
        const s = settings as Record<string, number> | null

        // Mark activation as approved
        const { error: apErr } = await supabase
            .from('activation_payments')
            .update({ status: 'APPROVED', approved_by: adminUser?.id })
            .eq('id', activation.id)

        if (apErr) {
            showMsg('error', `Failed to approve: ${apErr.message}`)
            setApproving(null)
            return
        }

        // Activate user
        const { error: userErr } = await supabase
            .from('users')
            .update({ status: 'ACTIVE' })
            .eq('id', activation.users.id)

        if (userErr) {
            showMsg('error', `Payment approved but user activation failed: ${userErr.message}`)
            setApproving(null)
            load()
            return
        }

        // Distribute commissions
        const targetUser = activation.users
        if (s) {
            const commissions = []
            if (targetUser.referred_by) {
                commissions.push({
                    user_id: targetUser.referred_by,
                    source_user_id: targetUser.id,
                    amount: (activation.amount || s.activation_fee) * (s.referral_percentage / 100),
                    type: 'REFERRAL',
                })
            }
            if (targetUser.trainer_id) {
                commissions.push({
                    user_id: targetUser.trainer_id,
                    source_user_id: targetUser.id,
                    amount: (activation.amount || s.activation_fee) * (s.trainer_percentage / 100),
                    type: 'TRAINER',
                })
            }
            if (targetUser.leader_id) {
                commissions.push({
                    user_id: targetUser.leader_id,
                    source_user_id: targetUser.id,
                    amount: (activation.amount || s.activation_fee) * (s.leader_percentage / 100),
                    type: 'LEADER',
                })
            }
            if (commissions.length > 0) {
                const { error: commErr } = await supabase.from('commissions').insert(commissions)
                if (commErr) console.error('Commission error:', commErr)
            }
        }

        showMsg('success', `✅ ${targetUser.full_name} activated! Commissions distributed.`)
        setApproving(null)
        load()
    }

    // ── Direct activate (no payment record) ─────────────────────
    const directActivate = async (user: InactiveUser) => {
        if (!confirm(`Activate "${user.full_name}" without payment record?`)) return
        setApproving(user.id)

        const { data: { user: adminUser } } = await supabase.auth.getUser()
        const { data: settings } = await supabase.from('system_settings').select('*').single()
        const s = settings as Record<string, number> | null

        // Activate user
        const { error: userErr } = await supabase
            .from('users')
            .update({ status: 'ACTIVE' })
            .eq('id', user.id)

        if (userErr) {
            showMsg('error', `Failed to activate: ${userErr.message}`)
            setApproving(null)
            return
        }

        // Create an activation payment record for tracking
        await supabase.from('activation_payments').insert({
            user_id: user.id,
            amount: s?.activation_fee || 500,
            status: 'APPROVED',
            approved_by: adminUser?.id,
        })

        // Distribute commissions
        if (s) {
            const commissions = []
            if (user.referred_by) {
                commissions.push({
                    user_id: user.referred_by,
                    source_user_id: user.id,
                    amount: (s.activation_fee) * (s.referral_percentage / 100),
                    type: 'REFERRAL',
                })
            }
            if (user.trainer_id) {
                commissions.push({
                    user_id: user.trainer_id,
                    source_user_id: user.id,
                    amount: (s.activation_fee) * (s.trainer_percentage / 100),
                    type: 'TRAINER',
                })
            }
            if (user.leader_id) {
                commissions.push({
                    user_id: user.leader_id,
                    source_user_id: user.id,
                    amount: (s.activation_fee) * (s.leader_percentage / 100),
                    type: 'LEADER',
                })
            }
            if (commissions.length > 0) {
                await supabase.from('commissions').insert(commissions)
            }
        }

        showMsg('success', `✅ ${user.full_name} manually activated!`)
        setApproving(null)
        load()
    }

    const pending = activations.filter(a => a.status === 'PENDING')
    const approved = activations.filter(a => a.status === 'APPROVED')

    // Filter by search
    const filteredPending = pending.filter(a =>
        !search ||
        a.users?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        a.users?.whatsapp?.includes(search) ||
        a.users?.email?.toLowerCase().includes(search.toLowerCase())
    )

    const filteredInactive = inactiveUsers.filter(u =>
        !search ||
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.whatsapp?.includes(search) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="page-header">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-500">Admin Control</p>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: '#e2e8f0' }}>
                    <span className="gradient-text">Activation</span> Management
                </h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                    Review payment requests and manually activate member accounts.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total Requests', value: activations.length, color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)', border: 'rgba(14,165,233,0.2)', icon: FileText },
                    { label: 'Pending', value: pending.length, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: Clock },
                    { label: 'Approved', value: approved.length, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', icon: CheckCircle },
                    { label: 'Inactive Users', value: inactiveUsers.length, color: '#a78bfa', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)', icon: Users },
                ].map(s => (
                    <div key={s.label} className="rounded-2xl p-4 flex flex-col gap-2 transition-all"
                        style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                        <s.icon size={18} style={{ color: s.color }} />
                        <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                        <div className="text-xs font-semibold text-slate-500">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Message */}
            {message.text && (
                <div className={cn('flex items-center gap-2 p-4 rounded-xl text-sm font-semibold',
                    message.type === 'success'
                        ? 'text-emerald-300'
                        : 'text-red-300')}
                    style={{
                        background: message.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
                    }}>
                    {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </div>
            )}

            {/* Tabs */}
            <div className="flex flex-col sm:flex-row gap-2 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                    onClick={() => setActiveTab('payments')}
                    className={cn(
                        'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all',
                        activeTab === 'payments'
                            ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}>
                    <FileText size={15} />
                    Payment Requests
                    {pending.length > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-black"
                            style={{ background: activeTab === 'payments' ? 'rgba(255,255,255,0.25)' : 'rgba(245,158,11,0.2)', color: activeTab === 'payments' ? 'white' : '#f59e0b' }}>
                            {pending.length} pending
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('inactive')}
                    className={cn(
                        'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all',
                        activeTab === 'inactive'
                            ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}>
                    <Users size={15} />
                    Inactive Members
                    {inactiveUsers.length > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-black"
                            style={{ background: activeTab === 'inactive' ? 'rgba(255,255,255,0.25)' : 'rgba(139,92,246,0.2)', color: activeTab === 'inactive' ? 'white' : '#a78bfa' }}>
                            {inactiveUsers.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, phone, or email..."
                    className="input-field pl-10 pr-10"
                />
                {search && (
                    <button onClick={() => setSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors">
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Refresh */}
            <div className="flex justify-end">
                <button
                    onClick={load}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-all border"
                    style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="glass-card p-16 text-center">
                    <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 text-sm">Loading data...</p>
                </div>
            ) : (
                <>
                    {/* ── PAYMENT REQUESTS TAB ────────────────────────────── */}
                    {activeTab === 'payments' && (
                        <div className="space-y-5">
                            {/* Pending Approvals */}
                            {filteredPending.length > 0 && (
                                <div className="glass-card overflow-hidden" style={{ borderColor: 'rgba(245,158,11,0.25)' }}>
                                    <div className="p-4 flex items-center gap-2 border-b"
                                        style={{ background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.15)' }}>
                                        <Clock size={16} style={{ color: '#f59e0b' }} />
                                        <h2 className="font-bold text-sm" style={{ color: '#f59e0b' }}>
                                            Pending Approvals ({filteredPending.length})
                                        </h2>
                                        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse"
                                            style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>
                                            ACTION REQUIRED
                                        </span>
                                    </div>
                                    <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                        {filteredPending.map(a => (
                                            <div key={a.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/[0.02] transition-all">
                                                {/* Avatar */}
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm"
                                                    style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                                                    {a.users?.full_name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-white text-sm">{a.users?.full_name || 'Unknown'}</div>
                                                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                                        {a.users?.whatsapp && (
                                                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                                                <Phone size={10} className="text-slate-500" /> {a.users.whatsapp}
                                                            </span>
                                                        )}
                                                        {a.users?.email && (
                                                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                                                <Mail size={10} className="text-slate-500" /> {a.users.email}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1 text-xs text-slate-500">
                                                            <Calendar size={10} /> {formatDateTime(a.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* Amount */}
                                                <div className="text-right flex-shrink-0">
                                                    <div className="text-lg font-black" style={{ color: '#10b981' }}>
                                                        {formatCurrency(a.amount)}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500">payment</div>
                                                </div>
                                                {/* Action */}
                                                <button
                                                    id={`approve-${a.id}`}
                                                    onClick={() => approvePayment(a)}
                                                    disabled={approving === a.id}
                                                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex-shrink-0"
                                                    style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', minWidth: '140px' }}>
                                                    {approving === a.id ? (
                                                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                                                    ) : (
                                                        <><UserCheck size={14} /> Approve & Activate</>
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* All Payment History */}
                            <div className="glass-card overflow-hidden">
                                <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: '#1e3a5f' }}>
                                    <FileText size={16} className="text-sky-400" />
                                    <h2 className="font-bold text-sm text-white">All Payment Records</h2>
                                    <span className="text-xs text-slate-500 ml-auto">{activations.length} total</span>
                                </div>
                                {activations.length === 0 ? (
                                    <div className="p-16 text-center">
                                        <FileText size={40} className="mx-auto text-slate-700 mb-3" />
                                        <p className="text-slate-500 font-medium">No payment records yet.</p>
                                        <p className="text-xs text-slate-600 mt-1">
                                            Members need to submit their activation payment from their dashboard.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                                        {activations.map(a => (
                                            <div key={a.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-all">
                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
                                                    style={{
                                                        background: a.status === 'APPROVED' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                                        color: a.status === 'APPROVED' ? '#10b981' : '#f59e0b'
                                                    }}>
                                                    {a.users?.full_name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-white text-sm truncate">{a.users?.full_name || 'Unknown'}</div>
                                                    <div className="text-xs text-slate-500">{a.users?.whatsapp} · {formatDateTime(a.created_at)}</div>
                                                </div>
                                                <div className="font-bold text-sm" style={{ color: '#10b981' }}>{formatCurrency(a.amount)}</div>
                                                <span className={cn('text-[11px] font-bold px-2.5 py-1 rounded-full')}
                                                    style={a.status === 'APPROVED'
                                                        ? { background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)' }
                                                        : { background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
                                                    {a.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── INACTIVE MEMBERS TAB ────────────────────────────── */}
                    {activeTab === 'inactive' && (
                        <div className="glass-card overflow-hidden" style={{ borderColor: 'rgba(139,92,246,0.2)' }}>
                            <div className="p-4 border-b flex items-center gap-2"
                                style={{ background: 'rgba(139,92,246,0.05)', borderColor: 'rgba(139,92,246,0.15)' }}>
                                <Shield size={16} style={{ color: '#a78bfa' }} />
                                <h2 className="font-bold text-sm" style={{ color: '#a78bfa' }}>
                                    Inactive Members ({filteredInactive.length})
                                </h2>
                                <span className="ml-auto text-xs text-slate-500">
                                    Click Activate to enable account
                                </span>
                            </div>

                            {filteredInactive.length === 0 ? (
                                <div className="p-16 text-center">
                                    <CheckCircle size={40} className="mx-auto text-emerald-700/50 mb-3" />
                                    <p className="text-slate-500 font-medium">No inactive members!</p>
                                    <p className="text-xs text-slate-600 mt-1">All registered members are active.</p>
                                </div>
                            ) : (
                                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                                    {filteredInactive.map(user => (
                                        <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-white/[0.02] transition-all group">
                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm"
                                                style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>
                                                {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-white text-sm">{user.full_name}</span>
                                                    {user.referral_code && (
                                                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                                                            style={{ background: 'rgba(255,255,255,0.07)', color: '#64748b' }}>
                                                            {user.referral_code}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                                        <Phone size={10} className="text-slate-500" /> {user.whatsapp}
                                                    </span>
                                                    {user.email && (
                                                        <span className="flex items-center gap-1 text-xs text-slate-400">
                                                            <Mail size={10} className="text-slate-500" /> {user.email}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                                        <Calendar size={10} /> Joined {formatDateTime(user.created_at)}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2 mt-1.5 flex-wrap">
                                                    {user.referred_by && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                                                            style={{ background: 'rgba(14,165,233,0.1)', color: '#0ea5e9' }}>
                                                            Has Referrer
                                                        </span>
                                                    )}
                                                    {user.trainer_id && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                                                            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                                                            Has Trainer
                                                        </span>
                                                    )}
                                                    {user.leader_id && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                                                            style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                                                            Has Leader
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Activate Button */}
                                            <button
                                                onClick={() => directActivate(user)}
                                                disabled={approving === user.id}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex-shrink-0"
                                                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', minWidth: '130px' }}>
                                                {approving === user.id ? (
                                                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Activating...</>
                                                ) : (
                                                    <><Zap size={14} /> Activate</>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
