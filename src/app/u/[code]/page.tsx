import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PublicProfileCard from '@/components/PublicProfileCard'
import type { UserProfile } from '@/lib/types'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function PublicPage({ params }: { params: { code: string } }) {
    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('referral_code', params.code.toUpperCase())
        .single()

    if (!profile) return notFound()

    return (
        <div className="min-h-screen bg-[#0a0f1e] text-white py-16 px-4">
            <div className="max-w-xl mx-auto mb-8">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-400 transition-colors font-bold text-sm group">
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to SkyX Vision
                </Link>
            </div>

            <PublicProfileCard profile={profile as UserProfile} />
        </div>
    )
}
