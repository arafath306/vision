import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Auth — SkyX Vision It',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen mesh-bg" style={{ background: '#0a0f1e' }}>
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full opacity-10 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)' }} />
                <div className="absolute bottom-1/4 -right-20 w-72 h-72 rounded-full opacity-10 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
            </div>
            <div className="relative">
                {children}
            </div>
        </div>
    )
}
