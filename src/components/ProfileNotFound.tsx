'use client'

import { createClient } from '@/lib/supabase/client'
import { X, LogOut } from 'lucide-react'

export default function ProfileNotFound() {
    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        window.location.href = '/auth/login'
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-white p-10">
            <div className="glass-card p-10 text-center max-w-md w-full animate-fade-in-up">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ background: 'rgba(239,68,68,0.1)' }}>
                    <X size={32} style={{ color: '#ef4444' }} />
                </div>
                <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
                <p className="text-gray-400 mb-6 font-medium">
                    আপনার অ্যাকাউন্টটি তৈরি হয়েছে কিন্তু ডাটাবেজের `users` টেবিলে প্রোফাইল ডাটা পাওয়া যাচ্ছে না।
                </p>
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg mb-6 text-sm text-left">
                    <p className="text-blue-400 font-semibold mb-2">কিভাবে ঠিক করবেন:</p>
                    <ul className="list-disc list-inside text-gray-400 space-y-1">
                        <li>Supabase SQL Editor-এ গিয়ে ডাটাবেজ স্ক্রিপ্টটি রান দিন।</li>
                        <li> অথবা নিচের বাটনে ক্লিক করে সাইন আউট করুন এবং নতুন করে রেজিস্টার করার চেষ্টা করুন।</li>
                    </ul>
                </div>
                <button
                    onClick={handleSignOut}
                    className="btn-accent w-full" style={{ justifyContent: 'center' }}>
                    <LogOut size={16} /> Sign Out & Try Again
                </button>
            </div>
        </div>
    )
}
