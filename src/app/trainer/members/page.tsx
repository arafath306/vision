import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDate, getStatusColor } from '@/lib/utils'
import { Users, Crosshair, Target } from 'lucide-react'

export default async function TrainerMembersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    // Get Teams the trainer belongs to
    const { data: myTeams } = await supabase.from('team_trainers').select('team_id').eq('trainer_id', user.id)
    const teamIds = (myTeams || []).map(t => t.team_id)

    let query = supabase
        .from('users')
        .select(`
            id, full_name, whatsapp, email, status, created_at, referred_by, team_id,
            teams:team_id(name)
        `)
        .eq('role', 'MEMBER')
        
    if (teamIds.length > 0) {
        query = query.or(`trainer_id.eq.${user.id},team_id.in.(${teamIds.join(',')})`)
    } else {
        query = query.eq('trainer_id', user.id)
    }

    const { data: members } = await query.order('created_at', { ascending: false })

    // If we want to show leads/converts for members:
    // We would need to fetch all users where referred_by is in the member ids.
    const memberIds = (members || []).map((m: any) => m.id)
    let leadStats: Record<string, { total: number, active: number }> = {}
    if (memberIds.length > 0) {
        const { data: referrals } = await supabase
            .from('users')
            .select('id, referred_by, status')
            .in('referred_by', memberIds)
            
        leadStats = (referrals || []).reduce((acc: any, r: any) => {
            if (!acc[r.referred_by]) acc[r.referred_by] = { total: 0, active: 0 }
            acc[r.referred_by].total++
            if (r.status === 'ACTIVE') acc[r.referred_by].active++
            return acc
        }, {})
    }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="page-header">
                <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>Team Members</h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>Members assigned to you and your teams</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total', value: (members || []).length, color: '#0ea5e9' },
                    { label: 'Active', value: (members || []).filter(m => m.status === 'ACTIVE').length, color: '#10b981' },
                    { label: 'Inactive', value: (members || []).filter(m => m.status !== 'ACTIVE').length, color: '#f59e0b' },
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
                        <Users size={18} style={{ color: '#0ea5e9' }} />
                        Member Directory
                    </h2>
                </div>
                {(members || []).length === 0 ? (
                    <div className="p-10 text-center">
                        <Users size={40} className="mx-auto mb-3 opacity-30" style={{ color: '#64748b' }} />
                        <p style={{ color: '#64748b' }}>No members assigned to you or your teams yet.</p>
                    </div>
                ) : (
                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Team</th>
                                    <th>Status</th>
                                    <th>Leads</th>
                                    <th>Converts</th>
                                    <th className="hidden sm:table-cell">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(members || []).map((m: any, i: number) => {
                                    const stats = leadStats[m.id] || { total: 0, active: 0 }
                                    return (
                                        <tr key={m.id}>
                                            <td style={{ color: '#64748b' }}>{i + 1}</td>
                                            <td>
                                                <div className="font-medium" style={{ color: '#e2e8f0' }}>{m.full_name}</div>
                                                <div className="text-[10px]" style={{ color: '#94a3b8' }}>{m.whatsapp}</div>
                                            </td>
                                            <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                                                {m.teams ? m.teams.name : <span className="text-slate-600">No Team</span>}
                                            </td>
                                            <td><span className={`badge ${getStatusColor(m.status)}`}>{m.status}</span></td>
                                            <td>
                                                <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: '#38bdf8' }}>
                                                    <Crosshair size={12} />
                                                    {stats.total}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: '#10b981' }}>
                                                    <Target size={12} />
                                                    {stats.active}
                                                </div>
                                            </td>
                                            <td className="hidden sm:table-cell" style={{ color: '#64748b', fontSize: '0.75rem' }}>{formatDate(m.created_at)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
