'use client'

import DashboardSecurity from '@/app/dashboard/security/page'
import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export default function AdminSecurityPage() {
    return (
        <div className="relative w-full h-full min-h-[80vh] flex flex-col gap-6">
            <DashboardSecurity />
            
            {/* Visible portal entry to the Vault */}
            <div className="max-w-2xl mx-auto w-full mt-8">
                <div className="glass-card p-6 flex items-center justify-between bg-red-500/5 border-red-500/10 hover:border-red-500/30 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <ShieldAlert className="text-red-500" size={20} />
                        </div>
                        <div>
                            <h3 className="text-red-500 font-semibold" style={{ textShadow: '0 0 10px rgba(239,68,68,0.2)' }}>System Vault Access</h3>
                            <p className="text-xs text-slate-400">Highly restricted administrative area</p>
                        </div>
                    </div>
                    <Link 
                        href="/admin/security/vault" 
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-semibold transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] border border-red-500/20"
                    >
                        Enter Vault
                    </Link>
                </div>
            </div>
        </div>
    )
}
