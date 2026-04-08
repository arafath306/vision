import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                    }
                },
            },
        }
    )
}

/**
 * Creates a Supabase client with Service Role privileges.
 * WARNING: Only use this on the server for sensitive admin operations.
 */
export async function createAdminClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}

/**
 * Returns the active user ID. 
 * If an admin is impersonating a user (Ghost Mode), it returns the target user's ID.
 */
export async function getActiveUserId() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const cookieStore = await cookies()
    const ghostId = cookieStore.get('ghost_user_id')?.value

    if (ghostId && ghostId !== user.id) {
        // Security: Verify the actual logged-in user is an admin using the Admin Client
        const adminSupabase = await createAdminClient()
        const { data: profile } = await adminSupabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()
            
        if (profile?.role === 'ADMIN') {
            return ghostId
        }
    }

    return user.id
}
