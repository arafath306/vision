import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDate, getStatusColor } from '@/lib/utils'
import { Users } from 'lucide-react'

export default async function LeaderMembersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: trainers } = await supabase
        .from('users').select('id').eq('leader_id', user.id).eq('role', 'TEAM_TRAINER')

    const trainerIds = (trainers || []).map(t => t.id)
    const { data: members } = trainerIds.length
        ? await supabase.from('users')
            .select('id, full_name, whatsapp, email, status, created_at, trainer:trainer_id(full_name)')
            .in('trainer_id', trainerIds)
            .order('created_at', { ascending: false })
        : { data: [] }

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="page-header">
                <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>All Team Members</h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>All members across your entire team</p>
            </div>
            <div className="glass-card overflow-hidden">
                <div className="p-5 border-b" style={{ borderColor: '#1e3a5f' }}>
                    <h2 className="section-title" style={{ fontSize: '1rem' }}>
                        <Users size={18} style={{ color: '#0ea5e9' }} />
                        {(members || []).length} Total Members
                    </h2>
                </div>
                <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table>
                        <thead><tr><th>#</th><th>Name</th><th>WhatsApp</th><th>Trainer</th><th>Status</th><th>Joined</th></tr></thead>
                        <tbody>
                            {(members || []).length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8" style={{ color: '#64748b' }}>No members yet.</td></tr>
                            ) : (members || []).map((m: any, i: number) => (
                                <tr key={m.id}>
                                    <td style={{ color: '#64748b' }}>{i + 1}</td>
                                    <td className="font-medium" style={{ color: '#e2e8f0' }}>{m.full_name}</td>
                                    <td style={{ color: '#94a3b8' }}>{m.whatsapp}</td>
                                    <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{m.trainer?.full_name || '—'}</td>
                                    <td><span className={`badge ${getStatusColor(m.status)}`}>{m.status}</span></td>
                                    <td style={{ color: '#64748b', fontSize: '0.75rem' }}>{formatDate(m.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
