'use client'

import type { UserProfile } from '@/lib/types'
import {
    Phone, Mail, Calendar, Shield, BadgeCheck,
    MapPin, TextQuote, Share2, Award, UserCheck
} from 'lucide-react'
import { formatDate, getRoleLabel, getRoleColor, cn } from '@/lib/utils'

interface PublicProfileCardProps {
    profile: UserProfile
}

export default function PublicProfileCard({ profile }: PublicProfileCardProps) {
    return (
        <div className="max-w-xl mx-auto space-y-6 animate-fade-in-up">
            {/* Main Premium Card */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900 shadow-2xl">
                {/* Dynamic Background Gradient */}
                <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-br from-blue-600/30 via-emerald-500/20 to-transparent" />
                <div className="absolute top-10 right-10 w-32 h-32 bg-sky-500/10 rounded-full blur-[80px]" />

                <div className="relative p-8 flex flex-col items-center">
                    {/* Avatar with Ring */}
                    <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-blue-500 to-emerald-400 p-1 shadow-2xl shadow-sky-500/20">
                            <div className="w-full h-full rounded-[1.8rem] bg-slate-900 flex items-center justify-center text-4xl font-black text-white">
                                {profile.full_name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        {profile.status === 'ACTIVE' && (
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-4 border-slate-900 box-content">
                                <BadgeCheck size={20} />
                            </div>
                        )}
                    </div>

                    {/* Name & Role */}
                    <div className="text-center space-y-2 mb-8">
                        <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
                            {profile.full_name}
                            {profile.role === 'ADMIN' && <Shield size={20} className="text-sky-400" />}
                        </h1>
                        <div className="flex items-center justify-center gap-3">
                            <span className={cn("badge px-4 py-1 text-[0.65rem] font-black uppercase tracking-widest", getRoleColor(profile.role))}>
                                {getRoleLabel(profile.role)}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                <UserCheck size={12} className="text-emerald-500/50" />
                                {profile.status}
                            </span>
                        </div>
                    </div>

                    {/* Bio Section */}
                    {profile.bio ? (
                        <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 mb-8 relative">
                            <TextQuote size={20} className="absolute -top-2 -left-2 text-sky-500 bg-slate-900 rounded-lg p-1" />
                            <p className="text-sm text-slate-300 italic leading-relaxed text-center px-4">
                                "{profile.bio}"
                            </p>
                        </div>
                    ) : (
                        <div className="h-4" />
                    )}

                    {/* Contact Grid */}
                    <div className="grid grid-cols-2 w-full gap-3 mb-8">
                        <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                            <p className="text-[0.6rem] uppercase tracking-widest text-slate-500 font-bold mb-1">WhatsApp</p>
                            <p className="text-sm font-bold text-white flex items-center gap-1.5">
                                <Phone size={14} className="text-emerald-500" />
                                {profile.whatsapp}
                            </p>
                        </div>
                        <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                            <p className="text-[0.6rem] uppercase tracking-widest text-slate-500 font-bold mb-1">Location</p>
                            <p className="text-sm font-bold text-white flex items-center gap-1.5">
                                <MapPin size={14} className="text-blue-500" />
                                {profile.address || 'Global'}
                            </p>
                        </div>
                    </div>

                    {/* Stats Strip */}
                    <div className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600/10 to-emerald-500/10 border-y border-white/5">
                        <div className="text-center">
                            <p className="text-[0.6rem] uppercase tracking-widest text-slate-500 font-bold">Joined</p>
                            <p className="text-xs font-bold text-slate-300">{formatDate(profile.created_at)}</p>
                        </div>
                        <div className="h-6 w-px bg-white/10" />
                        <div className="text-center">
                            <p className="text-[0.6rem] uppercase tracking-widest text-slate-500 font-bold">ID Code</p>
                            <p className="text-xs font-bold text-emerald-400 font-mono">{profile.referral_code}</p>
                        </div>
                        <div className="h-6 w-px bg-white/10" />
                        <div className="text-center">
                            <p className="text-[0.6rem] uppercase tracking-widest text-slate-500 font-bold">Verification</p>
                            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500">
                                <Award size={12} />
                                {profile.status === 'ACTIVE' ? 'CERTIFIED' : 'PENDING'}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 w-full">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/u/${profile.referral_code}`);
                                alert('Public profile link copied!');
                            }}
                            className="w-full py-4 rounded-2xl bg-slate-800 border border-white/5 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-700 transition-all active:scale-95 group shadow-xl"
                        >
                            <Share2 size={16} className="text-sky-400 group-hover:rotate-12 transition-transform" />
                            Share My Identity
                        </button>
                    </div>
                </div>
            </div>

            {/* Platform Tag */}
            <div className="text-center">
                <p className="text-[0.65rem] font-bold text-slate-600 uppercase tracking-[0.3em]">
                    Verified Member of <span className="text-sky-500/80">SkyX Vision It</span>
                </p>
            </div>
        </div>
    )
}
