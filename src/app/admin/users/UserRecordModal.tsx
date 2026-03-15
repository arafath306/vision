'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, User, Activity, DollarSign, ArrowDownLeft, Calendar, Link2, Users } from 'lucide-react'
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts'
import { formatCurrency, formatDate, getRoleLabel, cn } from '@/lib/utils'
import type { UserProfile } from '@/lib/types'

interface RecordStats {
    totalEarnings: number
    totalWithdrawals: number
    totalDirectReferrals: number
    totalClicks: number
    trainerName: string | null
    leaderName: string | null
}

interface UserRecordModalProps {
    user: UserProfile
    onClose: () => void
}

export default function UserRecordModal({ user, onClose }: UserRecordModalProps) {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<RecordStats>({
        totalEarnings: 0,
        totalWithdrawals: 0,
        totalDirectReferrals: 0,
        totalClicks: 0,
        trainerName: null,
        leaderName: null
    })
    const [leadChartData, setLeadChartData] = useState<any[]>([])
    const [earningChartData, setEarningChartData] = useState<any[]>([])

    useEffect(() => {
        const fetchRecord = async () => {
            setLoading(true)

            // 1. Fetch total earnings (commissions)
            const { data: comms } = await supabase
                .from('commissions')
                .select('amount, created_at')
                .eq('user_id', user.id)

            const totalEarned = comms?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

            // 2. Fetch withdrawals
            const { data: withdrawals } = await supabase
                .from('withdraw_requests')
                .select('amount, status')
                .eq('user_id', user.id)
                .in('status', ['APPROVED', 'PAID'])

            const totalWithdrawn = withdrawals?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

            // 3. Direct referrals
            const { count: refCount } = await supabase
                .from('users')
                .select('id', { count: 'exact', head: true })
                .eq('referred_by', user.id)

            // 4. Class clicks
            const { count: clicksCount } = await supabase
                .from('class_clicks')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', user.id)

            // 5. Trainer and Leader info
            let tName = null, lName = null
            if (user.trainer_id) {
                const { data: trData } = await supabase.from('users').select('full_name').eq('id', user.trainer_id).single()
                if (trData) tName = trData.full_name
            }
            if (user.leader_id) {
                const { data: ldData } = await supabase.from('users').select('full_name').eq('id', user.leader_id).single()
                if (ldData) lName = ldData.full_name
            }

            setStats({
                totalEarnings: totalEarned,
                totalWithdrawals: totalWithdrawn,
                totalDirectReferrals: refCount || 0,
                totalClicks: clicksCount || 0,
                trainerName: tName,
                leaderName: lName
            })

            // 6. Build Lead Chart Data (Only useful if they are a Trainer or Leader, or referring people)
            // Anyone joining where referred_by OR trainer_id OR leader_id = this user
            const { data: leads } = await supabase
                .from('users')
                .select('created_at')
                .or(`referred_by.eq.${user.id},trainer_id.eq.${user.id},leader_id.eq.${user.id}`)

            const leadMap: Record<string, number> = {}
            if (leads) {
                leads.forEach(l => {
                    const dateStr = new Date(l.created_at).toLocaleDateString('en-CA') // YYYY-MM-DD
                    leadMap[dateStr] = (leadMap[dateStr] || 0) + 1
                })
            }
            // Sort by date and take last 14 active days
            const leadData = Object.keys(leadMap).sort()
                .map(date => ({ date, leads: leadMap[date] }))
                .slice(-14)
            setLeadChartData(leadData)

            // 7. Build Earning Chart Data (Commissions over time)
            const earnMap: Record<string, number> = {}
            if (comms) {
                comms.forEach(c => {
                    const dateStr = new Date(c.created_at).toLocaleDateString('en-CA')
                    earnMap[dateStr] = (earnMap[dateStr] || 0) + Number(c.amount)
                })
            }
            const earnData = Object.keys(earnMap).sort()
                .map(date => ({ date, earnings: earnMap[date] }))
                .slice(-14)
            setEarningChartData(earnData)

            setLoading(false)
        }

        fetchRecord()
    }, [user, supabase])

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
            <div className="glass-card w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden" style={{ background: '#0a0f1e', borderColor: 'rgba(255,255,255,0.1)' }}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 border-b gap-3 flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex-1">
                        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                            <Activity size={20} className="text-sky-400 flex-shrink-0" />
                            <span className="truncate">User Record: {user.full_name}</span>
                        </h2>
                        <span className="text-xs sm:text-sm font-mono text-slate-400 mt-1 block">Code: {user.referral_code || 'N/A'}</span>
                    </div>
                    <button onClick={onClose} className="absolute right-4 top-4 sm:static p-2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center p-20">
                            <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Top Stats Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="rounded-2xl p-4 transition-all hover:bg-emerald-500/10" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
                                    <DollarSign size={18} style={{ color: '#10b981' }} className="mb-2" />
                                    <div className="text-xs text-emerald-500 font-semibold uppercase tracking-wider mb-1">Total Earned</div>
                                    <div className="text-2xl font-black text-white">{formatCurrency(stats.totalEarnings)}</div>
                                </div>
                                <div className="rounded-2xl p-4 transition-all hover:bg-amber-500/10" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
                                    <ArrowDownLeft size={18} style={{ color: '#f59e0b' }} className="mb-2" />
                                    <div className="text-xs text-amber-500 font-semibold uppercase tracking-wider mb-1">Total Withdrawn</div>
                                    <div className="text-2xl font-black text-white">{formatCurrency(stats.totalWithdrawals)}</div>
                                </div>
                                <div className="rounded-2xl p-4 transition-all hover:bg-purple-500/10" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.15)' }}>
                                    <Users size={18} style={{ color: '#a855f7' }} className="mb-2" />
                                    <div className="text-xs text-purple-500 font-semibold uppercase tracking-wider mb-1">Direct Referrals</div>
                                    <div className="text-2xl font-black text-white">{stats.totalDirectReferrals}</div>
                                </div>
                                <div className="rounded-2xl p-4 transition-all hover:bg-sky-500/10" style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.15)' }}>
                                    <Link2 size={18} style={{ color: '#0ea5e9' }} className="mb-2" />
                                    <div className="text-xs text-sky-500 font-semibold uppercase tracking-wider mb-1">Class Clicks</div>
                                    <div className="text-2xl font-black text-white">{stats.totalClicks}</div>
                                </div>
                            </div>

                            {/* Info Rows */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                                        <User size={16} className="text-slate-400" /> Member Info
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Status</span>
                                            <span className="font-bold text-white">{user.status}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Role</span>
                                            <span className="font-bold text-white">{getRoleLabel(user.role)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Joined</span>
                                            <span className="font-medium text-slate-300">{formatDate(user.created_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                                        <Users size={16} className="text-slate-400" /> Uplines
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Trainer Name</span>
                                            <span className={cn('font-bold', stats.trainerName ? 'text-sky-400' : 'text-slate-600')}>
                                                {stats.trainerName || 'None'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Team Leader Name</span>
                                            <span className={cn('font-bold', stats.leaderName ? 'text-purple-400' : 'text-slate-600')}>
                                                {stats.leaderName || 'None'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Charts */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h3 className="text-sm font-bold text-slate-300 mb-4">Lead Generation (Last 14 acts)</h3>
                                    <div className="h-48 w-full">
                                        {leadChartData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={leadChartData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickMargin={8} />
                                                    <YAxis stroke="#64748b" fontSize={10} />
                                                    <RechartsTooltip
                                                        contentStyle={{ background: '#0a0f1e', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px' }}
                                                        itemStyle={{ color: '#a855f7' }}
                                                    />
                                                    <Bar dataKey="leads" fill="#a855f7" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 font-medium">
                                                No lead data found
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 text-center">Number of members registering under this user over time</p>
                                </div>

                                <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h3 className="text-sm font-bold text-slate-300 mb-4">Earnings Chart (Last 14 acts)</h3>
                                    <div className="h-48 w-full">
                                        {earningChartData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={earningChartData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickMargin={8} />
                                                    <YAxis stroke="#64748b" fontSize={10} />
                                                    <RechartsTooltip
                                                        contentStyle={{ background: '#0a0f1e', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px' }}
                                                        itemStyle={{ color: '#10b981' }}
                                                    />
                                                    <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 font-medium">
                                                No earning data found
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 text-center">Earnings trend based on commissions</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
