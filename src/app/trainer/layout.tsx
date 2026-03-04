import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/DashboardShell'
import type { UserProfile } from '@/lib/types'

export default async function TrainerLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
    if (!profile) redirect('/auth/login')
    if (profile.role !== 'TEAM_TRAINER' && profile.role !== 'ADMIN') redirect('/dashboard')

    return <DashboardShell profile={profile as UserProfile}>{children}</DashboardShell>
}
