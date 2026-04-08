'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function loginAsUser(targetUserId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { error: 'Not authenticated. Please login again.' }
    
    // Security check: Only admins can ghost login
    // Use Admin Client to avoid RLS restrictions during validation
    const adminSupabase = await createAdminClient()
    const { data: profile } = await adminSupabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
        
    if (profile?.role !== 'ADMIN') {
        return { error: 'Unauthorized. Only admins can use Ghost Login.' }
    }

    const cookieStore = await cookies()
    
    if (targetUserId === 'exit') {
        cookieStore.delete('ghost_user_id')
        redirect('/admin/security/vault')
    } else {
        // Double check target user exists
        const { data: targetUser } = await adminSupabase
            .from('users')
            .select('id')
            .eq('id', targetUserId)
            .single()
            
        if (!targetUser) return { error: 'Target user not found.' }

        cookieStore.set('ghost_user_id', targetUserId, {
            path: '/',
            maxAge: 60 * 60, // 1 hour
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        })
        
        // Use redirect directly. Next.js handles this by throwing a special error.
        redirect('/dashboard')
    }
}
