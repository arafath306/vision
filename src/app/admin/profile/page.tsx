import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileSettings from '@/components/ProfileSettings'
import type { UserProfile } from '@/lib/types'
import { Users, Shield, DollarSign, Activity } from 'lucide-react'

export default async function AdminProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase
        .from('users').select('*').eq('id', user.id).single()
    if (!profile || profile.role !== 'ADMIN') redirect('/dashboard')

    // Get admin stats
    const { count: totalUsers } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })

    const { count: activeUsers } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'ACTIVE')

    const { count: pendingActivations } = await supabase
        .from('activation_payments')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'PENDING')

    const { count: pendingWithdrawals } = await supabase
        .from('withdraw_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'PENDING')

    const stats = [
        { label: 'Total Users', value: totalUsers || 0, icon: 'users', color: '#06b6d4' },
        { label: 'Active Users', value: activeUsers || 0, icon: 'shield', color: '#10b981' },
        { label: 'Pending Acts.', value: pendingActivations || 0, icon: 'activity', color: '#f59e0b' },
        { label: 'Pending W/D', value: pendingWithdrawals || 0, icon: 'dollar', color: '#ef4444' },
    ]

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            {/* Page Header */}
            <div className="page-header">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-slate-500">Admin Panel</p>
                <h1 className="text-2xl font-black tracking-tight" style={{ color: '#e2e8f0' }}>
                    Admin <span className="gradient-text">Profile</span>
                </h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>System overview and your personal admin profile settings.</p>
            </div>

            {/* Admin Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map(s => (
                    <div key={s.label} className="stat-card p-4 hover:border-sky-500/20 transition-all group">
                        <div className="flex items-center gap-2 mb-2">
                            {s.icon === 'users' && <Users size={16} style={{ color: s.color }} />}
                            {s.icon === 'shield' && <Shield size={16} style={{ color: s.color }} />}
                            {s.icon === 'activity' && <Activity size={16} style={{ color: s.color }} />}
                            {s.icon === 'dollar' && <DollarSign size={16} style={{ color: s.color }} />}
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
