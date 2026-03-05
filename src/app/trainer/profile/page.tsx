import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileSettings from '@/components/ProfileSettings'
import type { UserProfile } from '@/lib/types'
import { Users, Award, DollarSign, Briefcase } from 'lucide-react'

export default async function TrainerProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase
        .from('users').select('*').eq('id', user.id).single()
    if (!profile) redirect('/trainer')

    // Get trainer stats
    const { count: memberCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('trainer_id', user.id)

    const { count: activeMembers } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('trainer_id', user.id)
        .eq('status', 'ACTIVE')

    const { data: commissions } = await supabase
        .from('commissions')
        .select('amount')
        .eq('user_id', user.id)
    const totalIncome = (commissions || []).reduce((s, c) => s + c.amount, 0)

    const { data: trainerCommissions } = await supabase
        .from('commissions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'TRAINER')
    const trainerIncome = (trainerCommissions || []).reduce((s, c) => s + c.amount, 0)

    const stats = [
        { label: 'My Members', value: memberCount || 0, icon: 'users', color: '#06b6d4' },
        { label: 'Active Members', value: activeMembers || 0, icon: 'award', color: '#10b981' },
        { label: 'Total Income', value: `৳${totalIncome}`, icon: 'dollar', color: '#0ea5e9' },
        { label: 'Trainer Bonus', value: `৳${trainerIncome}`, icon: 'briefcase', color: '#f59e0b' },
    ]

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            {/* Page Header */}
            <div className="page-header">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-500">Trainer Panel</p>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: '#e2e8f0' }}>
                    Trainer <span className="gradient-text">Profile</span>
                </h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>Manage your trainer profile and track your team performance.</p>
            </div>

            {/* Trainer Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map(s => (
                    <div key={s.label} className="stat-card p-4 hover:border-sky-500/20 transition-all group">
                        <div className="flex items-center gap-2 mb-2">
                            {s.icon === 'users' && <Users size={16} style={{ color: s.color }} />}
                            {s.icon === 'award' && <Award size={16} style={{ color: s.color }} />}
                            {s.icon === 'dollar' && <DollarSign size={16} style={{ color: s.color }} />}
                            {s.icon === 'briefcase' && <Briefcase size={16} style={{ color: s.color }} />}
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
