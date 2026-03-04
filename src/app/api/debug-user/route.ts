import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Not logged in', authError })
    }

    const { data: profile, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    return NextResponse.json({
        authenticatedUserId: user.id,
        email: user.email,
        profileFound: !!profile,
        profile,
        dbError
    })
}
