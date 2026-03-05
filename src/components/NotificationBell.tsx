'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, Info, CheckCircle, AlertTriangle, AlertCircle, X, Check } from 'lucide-react'
import { formatDateTime, cn } from '@/lib/utils'

interface Notification {
    id: string
    title: string
    message: string
    type: string
    target_type: string
    created_at: string
}

export default function NotificationBell() {
    const supabase = createClient()
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [readIds, setReadIds] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        loadNotifications()

        // Close on outside click
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const loadNotifications = async () => {
        setLoading(true)
        const { data: nots } = await supabase
            .from('notifications')
            .select('id, title, message, type, target_type, created_at')
            .order('created_at', { ascending: false })
            .limit(20)

        const { data: reads } = await supabase
            .from('notification_reads')
            .select('notification_id')

        setNotifications(nots || [])
        setReadIds(new Set((reads || []).map(r => r.notification_id)))
        setLoading(false)
    }

    const markAsRead = async (notId: string) => {
        if (readIds.has(notId)) return
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase.from('notification_reads').insert({
            notification_id: notId,
            user_id: user.id,
        })
        setReadIds(prev => new Set([...prev, notId]))
    }

    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const unread = notifications.filter(n => !readIds.has(n.id))
        if (unread.length === 0) return

        const inserts = unread.map(n => ({
            notification_id: n.id,
            user_id: user.id,
        }))

        await supabase.from('notification_reads').insert(inserts)
        setReadIds(new Set(notifications.map(n => n.id)))
    }

    const unreadCount = notifications.filter(n => !readIds.has(n.id)).length

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
            case 'warning': return <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
            case 'danger': return <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
            default: return <Info size={14} className="text-sky-500 flex-shrink-0" />
        }
    }

    const getTimeDiff = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime()
        const mins = Math.floor(diff / 60000)
        if (mins < 1) return 'Just now'
        if (mins < 60) return `${mins}m ago`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs}h ago`
        const days = Math.floor(hrs / 24)
        return `${days}d ago`
    }

    return (
        <div className="relative" ref={ref}>
            {/* Bell Button */}
            <button
                onClick={() => {
                    setOpen(!open)
                    if (!open) loadNotifications()
                }}
                className="relative p-2 rounded-xl hover:bg-white/5 active:scale-90 transition-all"
            >
                <div className="relative">
                    <Bell size={22} className={cn(
                        "transition-all duration-300",
                        open ? "text-sky-400 rotate-12" : "text-slate-400 hover:text-slate-200"
                    )} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-[#0d1530] shadow-glow-red animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </div>
            </button>

            {/* Mobile/Android Specific Overlay */}
            {open && (
                <>
                    {/* Dark Backdrop for Mobile & Desktop */}
                    <div
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] sm:hidden animate-fade-in"
                        onClick={() => setOpen(false)}
                    />

                    {/* Dropdown Container */}
                    <div className={cn(
                        "fixed left-1/2 -translate-x-1/2 top-20 w-[95%] max-w-[420px] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:translate-x-0 sm:w-[380px]",
                        "max-h-[80vh] sm:max-h-[600px] rounded-[2rem] border border-white/10 bg-[#0d1530]/95 backdrop-blur-2xl shadow-3xl z-[101] overflow-hidden flex flex-col animate-fade-in-up",
                        "shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]"
                    )}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center">
                                    <Bell size={18} className="text-sky-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white leading-none">Notifications</h3>
                                    {unreadCount > 0 ? (
                                        <p className="text-[10px] font-bold text-sky-400 mt-1 uppercase tracking-widest">{unreadCount} new alerts</p>
                                    ) : (
                                        <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Inbox Zero</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="p-2 text-slate-500 hover:text-emerald-400 active:scale-95 transition-all outline-none"
                                        title="Mark all as read"
                                    >
                                        <Check size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-2 text-slate-500 hover:text-white active:scale-95 transition-all outline-none"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Notification List Area */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-3">
                                    <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
                                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Synchronizing...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="py-20 text-center px-10">
                                    <div className="w-16 h-16 rounded-[2rem] bg-slate-800/50 flex items-center justify-center mx-auto mb-4 border border-white/5">
                                        <Bell size={28} className="text-slate-600" />
                                    </div>
                                    <p className="text-sm text-slate-300 font-bold mb-1">Clear Horizon</p>
                                    <p className="text-xs text-slate-500 leading-relaxed">You don't have any notifications at the moment.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {notifications.map(n => {
                                        const isRead = readIds.has(n.id)
                                        return (
                                            <button
                                                key={n.id}
                                                onClick={() => markAsRead(n.id)}
                                                className={cn(
                                                    "w-full text-left p-5 transition-all hover:bg-white/[0.03] active:bg-white/[0.05] group relative outline-none",
                                                    !isRead ? "bg-sky-500/[0.02]" : "bg-transparent opacity-80"
                                                )}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={cn(
                                                        "mt-1 w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300 shadow-lg",
                                                        !isRead ? "bg-sky-500/10 group-hover:bg-sky-500/20" : "bg-slate-800/50"
                                                    )}>
                                                        {getIcon(n.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0 pr-2">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className={cn(
                                                                "text-sm font-bold transition-colors truncate",
                                                                !isRead ? "text-white" : "text-slate-400"
                                                            )}>
                                                                {n.title}
                                                            </h4>
                                                            {!isRead && (
                                                                <div className="w-2 h-2 bg-sky-500 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
                                                            )}
                                                        </div>
                                                        <p className={cn(
                                                            "text-[12px] leading-relaxed line-clamp-3 mb-2",
                                                            !isRead ? "text-slate-300" : "text-slate-500 font-medium"
                                                        )}>
                                                            {n.message}
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] text-sky-500/60 font-black uppercase tracking-widest font-mono">
                                                                {n.type}
                                                            </span>
                                                            <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                                                <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                                {getTimeDiff(n.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer / Scroll Hint */}
                        {notifications.length > 0 && (
                            <div className="px-6 py-4 border-t border-white/5 bg-white/2 text-center group active:scale-95 transition-all cursor-pointer">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] group-hover:text-sky-400 transition-colors">
                                    End of stream
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
