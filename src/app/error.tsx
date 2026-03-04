'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error)

        // Check if it's a ChunkLoadError or related loading error
        const isChunkError =
            error.name === 'ChunkLoadError' ||
            error.message?.includes('ChunkLoadError') ||
            error.message?.includes('Loading chunk') ||
            error.message?.includes('failed to fetch')

        if (isChunkError) {
            console.warn('ChunkLoadError detected in Error Boundary, attempting auto-reload...')
            // Attempt to fix by hard reloading
            window.location.reload()
        }
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0f1e]">
            <div className="glass-card p-8 max-w-md w-full text-center animate-fade-in-up border-red-500/20">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={32} className="text-red-500" />
                </div>

                <h2 className="text-2xl font-bold mb-3 text-white">Application Error</h2>
                <p className="text-slate-400 mb-8 text-sm">
                    Something went wrong while loading this page. This usually happens after an update.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => {
                            // First attempt: Reset the error boundary
                            reset()
                            // Second attempt (if clicking again): Hard reload
                            setTimeout(() => {
                                window.location.reload()
                            }, 100)
                        }}
                        className="btn-primary w-full justify-center"
                    >
                        <RefreshCw size={18} /> Try Again
                    </button>

                    <Link href="/" className="btn-outline w-full justify-center text-slate-300 border-slate-700 hover:bg-slate-800">
                        <Home size={18} /> Back to Home
                    </Link>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-black/40 rounded-lg text-left overflow-auto max-h-40">
                        <p className="text-xs font-mono text-red-400 truncate">{error.message}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
