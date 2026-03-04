'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ReferralBanner({ code }: { code: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="glass-card p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 relative overflow-hidden group"
            style={{ borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

            <div className="relative z-10">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: '#10b981' }}>
                    Your Exclusive Referral Code
                </p>
                <div className="flex items-center gap-3">
                    <span className="text-3xl font-mono font-black tracking-tight" style={{ color: '#e2e8f0' }}>{code}</span>
                </div>
                <p className="text-xs mt-1.5 font-medium" style={{ color: '#64748b' }}>
                    Share this code and earn <span className="text-emerald-400 font-bold">100 BDT</span> commission on every activation
                </p>
            </div>

            <button
                onClick={handleCopy}
                className={cn(
                    "relative z-10 btn-accent sm:w-auto h-12 px-6 flex items-center justify-center gap-2 transition-all duration-300",
                    copied ? "bg-emerald-600 scale-95" : "hover:shadow-[0_8px_20px_-6px_rgba(16,185,129,0.4)]"
                )}>
                {copied ? (
                    <>
                        <Check size={18} className="animate-in zoom-in duration-300" />
                        <span>Code Copied!</span>
                    </>
                ) : (
                    <>
                        <Copy size={18} />
                        <span>Copy My Code</span>
                    </>
                )}
            </button>
        </div>
    )
}
