import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDate, getStatusColor } from '@/lib/utils'
import { Users, Crosshair, Target, ShieldCheck } from 'lucide-react'

export default async function LeaderMembersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    // Get Teams the leader manages
    const { data: myTeams } = await supabase.from('teams').select('id, name').eq('leader_id', user.id)
    const teamIds = (myTeams || []).map(t => t.id)
    
    // Get Trainers the leader manages directly
    const { data: trainers } = await supabase.from('users').select('id').eq('leader_id', user.id).eq('role', 'TEAM_TRAINER')
    const trainerIds = (trainers || []).map(t => t.id)

    // Construct query for members
    let query = supabase
        .from('users')
        .select(`
            id, full_name, whatsapp, email, status, created_at, referred_by,
            trainer:trainer_id(full_name),
            teams:team_id(name)
        `)
        .eq('role', 'MEMBER')
        
    const orConditions = []
    if (teamIds.length > 0) orConditions.push(`team_id.in.(${teamIds.join(',')})`)
    if (trainerIds.length > 0) orConditions.push(`trainer_id.in.(${trainerIds.join(',')})`)
    
    // If leader has no teams and no trainers, they have no members to show
    let members: any[] = []
    if (orConditions.length > 0) {
        const { data } = await query.or(orConditions.join(',')).order('created_at', { ascending: false })
        members = data || []
    }

    // Determine Leads and Converts per Member
    const memberIds = members.map((m: any) => m.id)
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
                <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>All Team Members</h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>Members across all teams and trainers you manage</p>
            </div>
            
            <div className="grid sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Members', value: members.length, color: '#a855f7' },
                    { label: 'Teams Managed', value: teamIds.length, color: '#38bdf8' },
                    { label: 'Active Members', value: members.filter(m => m.status === 'ACTIVE').length, color: '#10b981' },
                    { label: 'Inactive Members', value: members.filter(m => m.status !== 'ACTIVE').length, color: '#f59e0b' },
                ].map(s => (
                    <div key={s.label} className="stat-card p-4 rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
                        <div className="text-[10px] font-bold mb-1 uppercase tracking-wider" style={{ color: '#94a3b8' }}>{s.label}</div>
                        <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-5 border-b flex items-center gap-2" style={{ borderColor: '#1e3a5f' }}>
                    <ShieldCheck size={20} style={{ color: '#a855f7' }} />
                    <h2 className="section-title" style={{ fontSize: '1rem', color: '#e2e8f0', margin: 0 }}>
                        Member Performance Directory
                    </h2>
                </div>
                
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name & Phone</th>
                                <th>Team/Trainer</th>
                                <th>Status</th>
                                <th className="text-center">Total Leads</th>
                                <th className="text-center">Converted</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-10">
                                    <div className="flex flex-col items-center justify-center opacity-40">
                                        <Users size={32} className="mb-2" />
                                        <span>No members found in your network.</span>
                                    </div>
                                </td></tr>
                            ) : members.map((m: any, i: number) => {
                                const stats = leadStats[m.id] || { total: 0, active: 0 }
                                return (
                                    <tr key={m.id}>
                                        <td style={{ color: '#64748b' }}>{i + 1}</td>
                                        <td>
                                            <div className="font-bold text-sm" style={{ color: '#f8fafc' }}>{m.full_name}</div>
                                            <div className="text-[10px] text-slate-500">{m.whatsapp}</div>
                                        </td>
                                        <td style={{ fontSize: '0.75rem' }}>
                                            {m.teams ? (
                                                <div className="font-semibold text-indigo-400 border border-indigo-400/20 bg-indigo-400/10 px-2 py-0.5 rounded-md inline-block">
                                                    Team: {m.teams.name}
                                                </div>
                                            ) : m.trainer ? (
                                                <div className="text-slate-400">Trainer: {m.trainer.full_name}</div>
                                            ) : (
                                                <div className="text-slate-600 italic">No direct mapping</div>
                                            )}
                                        </td>
                                        <td><span className={`badge ${getStatusColor(m.status)}`}>{m.status}</span></td>
                                        <td className="text-center">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-xs text-sky-400">
                                                <Crosshair size={12} /> {stats.total}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-xs text-emerald-400">
                                                <Target size={12} /> {stats.active}
                                            </div>
                                        </td>
                                        <td style={{ color: '#64748b', fontSize: '0.75rem' }}>{formatDate(m.created_at)}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
