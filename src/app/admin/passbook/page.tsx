'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, DollarSign, Search, CheckCircle, Plus } from 'lucide-react'

export default function AdminManagePassbook() {
    const supabase = createClient()
    const [users, setUsers] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    const [form, setForm] = useState({
        userId: '',
        amount: '',
        type: 'BONUS',
        sourceUserId: ''
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
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

    const filteredUsers = users.filter(u => 
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.whatsapp?.includes(searchQuery) ||
        u.id.includes(searchQuery)
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage({ type: '', text: '' })

        if (!form.userId) return setMessage({ type: 'error', text: 'Please select a receiving user.' })
        if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
            return setMessage({ type: 'error', text: 'Please enter a valid amount.' })
        }

        setSubmitting(true)

        const payload: any = {
            user_id: form.userId,
            amount: Number(form.amount),
            type: form.type,
        }

        if (form.sourceUserId) {
            payload.source_user_id = form.sourceUserId
        }

        const { error } = await supabase.from('commissions').insert(payload)

        if (error) {
            console.error(error)
            setMessage({ type: 'error', text: 'Failed to add passbook payment. Please try again.' })
        } else {
            setMessage({ type: 'success', text: `Successfully added ${form.amount} TK logic to passbook!` })
            setForm({ ...form, amount: '', sourceUserId: '' })
        }
        
        setSubmitting(false)
    }

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            <div className="page-header border-b border-slate-800 pb-5">
                <h1 className="text-2xl font-bold flex items-center gap-3 text-emerald-400">
                    <BookOpen size={24} /> Manage Passbook
                </h1>
                <p className="text-sm mt-1 text-slate-400">Manually issue income or deductions to any users passbook</p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                    message.type === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                    <CheckCircle size={20} />
                    <p className="font-semibold text-sm">{message.text}</p>
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Plus size={18} className="text-emerald-400" />
                        Add Manual Payment
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Receiving User <span className="text-red-500">*</span></label>
                            <select 
                                required
                                value={form.userId}
                                onChange={e => setForm({...form, userId: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500/50"
                            >
                                <option value="" disabled>Select a user to receive income</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.full_name} ({u.whatsapp}) - {u.role}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Amount (TK) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    <input 
                                        required
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        value={form.amount}
                                        onChange={e => setForm({...form, amount: e.target.value})}
                                        placeholder="0.00"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500/50 font-mono"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-300 mb-1.5">Income Type <span className="text-red-500">*</span></label>
                                <select 
                                    required
                                    value={form.type}
                                    onChange={e => setForm({...form, type: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500/50 uppercase"
                                >
                                    <option value="BONUS">System Bonus</option>
                                    <option value="REFERRAL">Referral Income</option>
                                    <option value="TASK">Task Income</option>
                                    <option value="FORM_FILLUP">Form Fillup</option>
                                    <option value="PRODUCT_SELL">Product Sell</option>
                                    <option value="MANUAL">Manual Adjustment</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Source User (Optional)</label>
                            <select 
                                value={form.sourceUserId}
                                onChange={e => setForm({...form, sourceUserId: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500/50"
                            >
                                <option value="">System (No specific source user)</option>
                                {users.map(u => (
                                    <option key={`source-${u.id}`} value={u.id}>{u.full_name} ({u.whatsapp})</option>
                                ))}
                            </select>
                            <p className="text-[11px] text-slate-500 mt-1">If selected, the passbook will display "Income from [Name]". If not, it will display "System".</p>
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl px-4 py-3.5 transition-colors disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                        >
                            {submitting ? 'Adding...' : 'Add to Passbook'}
                        </button>
                    </form>
                </div>

                {/* User Search Aid */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col h-[550px]">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Search size={18} className="text-sky-400" />
                        Find User Dictionary
                    </h2>
                    
                    <div className="relative mb-4">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            type="text"
                            placeholder="Search by name, whatsapp, or ID..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 outline-none focus:border-sky-500/50"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                        {loading ? (
                            <div className="p-10 text-center text-slate-500 text-sm">Loading users...</div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-10 text-center text-slate-500 text-sm">No users found.</div>
                        ) : (
                            filteredUsers.slice(0, 50).map(u => (
                                <div key={u.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between hover:border-slate-700 cursor-pointer" onClick={() => setForm({...form, userId: u.id})}>
                                    <div>
                                        <div className="font-bold text-sm text-slate-200">{u.full_name}</div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">{u.whatsapp}</div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                                        {u.status}
                                    </span>
                                </div>
                            ))
                        )}
                        {filteredUsers.length > 50 && (
                            <div className="text-center text-xs text-slate-500 mt-4 py-2">
                                Showing 50 of {filteredUsers.length} users. Keep typing to refine.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
