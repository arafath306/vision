import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/DashboardShell'
import ProfileNotFound from '@/components/ProfileNotFound'
import type { UserProfile } from '@/lib/types'

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/auth/login')

    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) {
        return <ProfileNotFound />
    }

    if (profile.role === 'ADMIN') redirect('/admin')
    if (profile.role === 'TEAM_LEADER') redirect('/leader')
    if (profile.role === 'TEAM_TRAINER') redirect('/trainer')

    return <DashboardShell profile={profile as UserProfile}>{children}</DashboardShell>
}
