import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDate, getStatusColor } from '@/lib/utils'
import { Users } from 'lucide-react'

export default async function TrainerMembersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: members } = await supabase
        .from('users')
        .select('id, full_name, whatsapp, email, status, created_at, referred_by')
        .eq('trainer_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="page-header">
                <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>My Members</h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>All members assigned to you</p>
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
                        <p style={{ color: '#64748b' }}>No members assigned yet.</p>
                    </div>
                ) : (
                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                        <table>
                            <thead><tr><th>#</th><th>Name</th><th>WhatsApp</th><th>Email</th><th>Status</th><th>Joined</th></tr></thead>
                            <tbody>
                                {(members || []).map((m, i) => (
                                    <tr key={m.id}>
                                        <td style={{ color: '#64748b' }}>{i + 1}</td>
                                        <td className="font-medium" style={{ color: '#e2e8f0' }}>{m.full_name}</td>
                                        <td style={{ color: '#94a3b8' }}>{m.whatsapp}</td>
                                        <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{m.email}</td>
                                        <td><span className={`badge ${getStatusColor(m.status)}`}>{m.status}</span></td>
                                        <td style={{ color: '#64748b', fontSize: '0.75rem' }}>{formatDate(m.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
