'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Home, Search, Save, Target, Gift, Bell, CheckCircle, AlertCircle, TrendingUp, Sparkles, User, Activity } from 'lucide-react'

export default function AdminRoomControl() {
    const supabase = createClient()
    const [users, setUsers] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [selectedUser, setSelectedUser] = useState<any>(null)

    const [form, setForm] = useState({
        dailyTarget: '',
        targetProgress: 0,
        specialOffer: '',
        roomAnnouncement: ''
    })

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('users')
            .select('id, full_name, whatsapp, status, role')
            .order('created_at', { ascending: false })
            
        if (!error && data) {
            setUsers(data)
        }
        setLoading(false)
    }

    const loadRoomData = async (userId: string) => {
        const { data, error } = await supabase
            .from('user_rooms')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (data) {
            setForm({
                dailyTarget: data.daily_target || '',
                targetProgress: data.target_progress || 0,
                specialOffer: data.special_offer || '',
                roomAnnouncement: data.room_announcement || ''
            })
        } else {
            // Reset to defaults if no room data
            setForm({
                dailyTarget: 'Complete your session to earn bonuses!',
                targetProgress: 0,
                specialOffer: 'Extra 10% bonus on next referral!',
                roomAnnouncement: 'Welcome to your private room!'
            })
        }
    }

    const filteredUsers = users.filter(u => 
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.whatsapp?.includes(searchQuery)
    )

    const handleSelectUser = (user: any) => {
        setSelectedUser(user)
        loadRoomData(user.id)
        setMessage({ type: '', text: '' })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedUser) return
        
        setSubmitting(true)
        setMessage({ type: '', text: '' })

        const { error } = await supabase
            .from('user_rooms')
            .upsert({
                user_id: selectedUser.id,
                daily_target: form.dailyTarget,
                target_progress: form.targetProgress,
                special_offer: form.specialOffer,
                room_announcement: form.roomAnnouncement
            })

        if (error) {
            console.error(error)
            setMessage({ type: 'error', text: 'Failed to update user room. Make sure the table exists.' })
        } else {
            setMessage({ type: 'success', text: `Room controls updated for ${selectedUser.full_name}!` })
        }
        setSubmitting(false)
    }

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            <div className="page-header border-b border-slate-800 pb-5">
                <h1 className="text-2xl font-black flex items-center gap-3 text-sky-400 uppercase tracking-tighter">
                    <Sparkles size={24} /> Room Control Center
                </h1>
                <p className="text-sm mt-1 text-slate-500 font-medium">Personalize specific user rooms with daily targets and special deals</p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-bold shadow-lg ${
                    message.type === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                    {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <p>{message.text}</p>
                </div>
            )}

            <div className="grid lg:grid-cols-12 gap-8 items-start">
                {/* User List Sidebar */}
                <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col h-[700px] shadow-2xl">
                    <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <User size={16} className="text-sky-500" />
                        Select User
                    </h2>
                    
                    <div className="relative mb-4">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                        <input 
                            type="text"
                            placeholder="Find member..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 outline-none focus:border-sky-500/50 transition-all font-medium"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="p-10 text-center text-slate-600 text-xs font-bold animate-pulse">Scanning users...</div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-10 text-center text-slate-600 text-xs font-bold">No matching members.</div>
                        ) : (
                            filteredUsers.map(u => (
                                <button 
                                    key={u.id} 
                                    onClick={() => handleSelectUser(u)}
                                    className={`w-full p-4 border rounded-xl flex items-center gap-4 transition-all text-left group ${
                                        selectedUser?.id === u.id 
                                            ? 'bg-sky-500/10 border-sky-500/40 shadow-[0_0_15px_rgba(14,165,233,0.1)]' 
                                            : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                                        selectedUser?.id === u.id ? 'bg-sky-400 text-slate-950 border-sky-400' : 'bg-slate-900 text-slate-500 border-slate-800'
                                    }`}>
                                        <User size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-bold text-sm truncate ${selectedUser?.id === u.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                            {u.full_name}
                                        </div>
                                        <div className="text-[10px] font-black text-slate-600 flex items-center gap-1.5 mt-0.5">
                                            {u.whatsapp} <span className="w-1 h-1 rounded-full bg-slate-700"></span> {u.role}
                                        </div>
                                    </div>
                                    {selectedUser?.id === u.id && <CheckCircle size={14} className="text-sky-500" />}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Control Panel */}
                <div className="lg:col-span-8 space-y-6">
                    {selectedUser ? (
                        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
                            
                            <div className="flex items-center gap-6 mb-10 border-b border-slate-800/50 pb-8 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-2xl">
                                    <Activity size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white">{selectedUser.full_name}</h2>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-widest">{selectedUser.role}</span>
                                        <span className="text-xs text-slate-600 font-bold">{selectedUser.id}</span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                                {/* Daily Target */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sky-400 font-black text-xs uppercase tracking-widest">
                                        <Target size={16} /> Daily Target Task
                                    </div>
                                    <textarea 
                                        required
                                        value={form.dailyTarget}
                                        onChange={e => setForm({...form, dailyTarget: e.target.value})}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm text-slate-200 outline-none focus:border-sky-500/50 min-h-[100px] leading-relaxed transition-all font-medium"
                                        placeholder="Enter target for today..."
                                    />
                                    
                                    <div className="bg-slate-950/50 rounded-2xl p-5 border border-slate-800">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <TrendingUp size={14} className="text-emerald-500" /> Target Progress Score
                                            </span>
                                            <span className="text-lg font-black text-emerald-500 font-mono">{form.targetProgress}%</span>
                                        </div>
                                        <input 
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={form.targetProgress}
                                            onChange={e => setForm({...form, targetProgress: parseInt(e.target.value)})}
                                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                        />
                                        <div className="flex justify-between mt-2 text-[10px] font-black text-slate-700 uppercase tracking-tighter">
                                            <span>Not Started</span>
                                            <span>Completed</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Special Offer */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-purple-400 font-black text-xs uppercase tracking-widest">
                                        <Gift size={16} /> Special Offer Text
                                    </div>
                                    <input 
                                        type="text"
                                        value={form.specialOffer}
                                        onChange={e => setForm({...form, specialOffer: e.target.value})}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-200 outline-none focus:border-purple-500/50 transition-all font-medium"
                                        placeholder="e.g. 50% discount on next badge..."
                                    />
                                </div>

                                {/* Room Announcement */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-widest">
                                        <Bell size={16} /> Room Announcement
                                    </div>
                                    <input 
                                        type="text"
                                        value={form.roomAnnouncement}
                                        onChange={e => setForm({...form, roomAnnouncement: e.target.value})}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-200 outline-none focus:border-amber-500/50 transition-all font-medium"
                                        placeholder="e.g. You are doing great, keep it up!"
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="w-full bg-sky-500 hover:bg-sky-600 text-slate-950 font-black rounded-2xl p-5 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-3 shadow-xl hover:shadow-sky-500/20 uppercase tracking-widest text-sm"
                                >
                                    {submitting ? 'Updating User State...' : 'Save Member Room Configuration'}
                                    {!submitting && <Save size={18} />}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="h-[700px] bg-slate-900/20 border border-slate-800 border-dashed rounded-3xl flex flex-col items-center justify-center text-center p-10">
                            <div className="w-24 h-24 bg-slate-800/50 rounded-3xl flex items-center justify-center text-slate-700 mb-6 border border-slate-800 rotate-12">
                                <Sparkles size={48} />
                            </div>
                            <h3 className="text-xl font-black text-slate-600 uppercase tracking-widest mb-3">No Room Selected</h3>
                            <p className="text-sm text-slate-700 font-bold max-w-sm">Please select a member from the sidebar to customize their private activity hub.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
