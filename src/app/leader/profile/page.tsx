import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileSettings from '@/components/ProfileSettings'
import type { UserProfile } from '@/lib/types'
import { Users, Award, DollarSign, Shield } from 'lucide-react'

export default async function LeaderProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase
        .from('users').select('*').eq('id', user.id).single()
    if (!profile) redirect('/leader')

    // Get leader stats
    const { count: trainerCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('leader_id', user.id)
        .eq('role', 'TEAM_TRAINER')

    const { count: memberCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('leader_id', user.id)

    const { data: commissions } = await supabase
        .from('commissions')
        .select('amount')
        .eq('user_id', user.id)
    const totalIncome = (commissions || []).reduce((s, c) => s + c.amount, 0)

    const { data: leaderCommissions } = await supabase
        .from('commissions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'LEADER')
    const leaderIncome = (leaderCommissions || []).reduce((s, c) => s + c.amount, 0)

    const stats = [
        { label: 'My Trainers', value: trainerCount || 0, icon: 'shield', color: '#8b5cf6' },
        { label: 'Total Members', value: memberCount || 0, icon: 'users', color: '#06b6d4' },
        { label: 'Total Income', value: `৳${totalIncome}`, icon: 'dollar', color: '#10b981' },
        { label: 'Leader Bonus', value: `৳${leaderIncome}`, icon: 'award', color: '#f59e0b' },
    ]

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            {/* Page Header */}
            <div className="page-header">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-500">Leader Panel</p>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: '#e2e8f0' }}>
                    Leader <span className="gradient-text">Profile</span>
                </h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>View your leadership stats and manage your profile.</p>
            </div>

            {/* Leader Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map(s => (
                    <div key={s.label} className="stat-card p-4 hover:border-sky-500/20 transition-all group">
                        <div className="flex items-center gap-2 mb-2">
                            {s.icon === 'shield' && <Shield size={16} style={{ color: s.color }} />}
                            {s.icon === 'users' && <Users size={16} style={{ color: s.color }} />}
                            {s.icon === 'dollar' && <DollarSign size={16} style={{ color: s.color }} />}
                            {s.icon === 'award' && <Award size={16} style={{ color: s.color }} />}
                            <span className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-500">{s.label}</span>
                        </div>
                        <div className="text-xl font-black text-slate-200 group-hover:text-white transition-colors">{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Profile Settings Component */}
            <ProfileSettings profile={profile as UserProfile} />
        </div>
    )
}
