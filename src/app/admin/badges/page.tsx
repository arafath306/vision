'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, AlertCircle, X, Plus, Edit2, Trash2, Award, Zap, Shield } from 'lucide-react'
import { BadgeDefinition } from '@/lib/badgeUtils'
import { cn } from '@/lib/utils'

const ROLES = ['MEMBER', 'TEAM_TRAINER', 'TEAM_LEADER', 'ADMIN']

export default function AdminBadgesPage() {
    const supabase = createClient()
    const [badges, setBadges] = useState<BadgeDefinition[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingBadge, setEditingBadge] = useState<BadgeDefinition | null>(null)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    const [form, setForm] = useState({
        name: '',
        role: 'MEMBER',
        required_referrals: 0,
        required_income: 0,
        color_class: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
        icon_emoji: '🏆',
        is_auto_assign: true,
        description: ''
    })

    const loadBadges = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase.from('badges').select('*').order('required_income', { ascending: true })
        setBadges((data || []) as BadgeDefinition[])
        setLoading(false)
    }, [supabase])

    useEffect(() => { loadBadges() }, [loadBadges])

    const openModal = (badge?: BadgeDefinition) => {
        if (badge) {
            setEditingBadge(badge)
            setForm({
                name: badge.name,
                role: badge.role,
                required_referrals: badge.required_referrals,
                required_income: badge.required_income,
                color_class: badge.color_class,
                icon_emoji: badge.icon_emoji,
                is_auto_assign: badge.is_auto_assign,
                description: badge.description || ''
            } as any)
        } else {
            setEditingBadge(null)
            setForm({
                name: '',
                role: 'MEMBER',
                required_referrals: 0,
                required_income: 0,
                color_class: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
                icon_emoji: '🏆',
                is_auto_assign: true,
                description: ''
            })
        }
        setShowModal(true)
        setMessage({ type: '', text: '' })
    }

    const saveBadge = async () => {
        if (!form.name) return setMessage({ type: 'error', text: 'Name is required' })
        setSaving(true)
        
        const { error } = editingBadge 
            ? await supabase.from('badges').update(form).eq('id', editingBadge.id)
            : await supabase.from('badges').insert(form)

        if (error) {
            setMessage({ type: 'error', text: 'Operation failed: ' + error.message })
        } else {
            setMessage({ type: 'success', text: 'Badge saved successfully!' })
            loadBadges()
            setTimeout(() => setShowModal(false), 800)
        }
        setSaving(false)
    }

    const deleteBadge = async (id: string) => {
        if (!confirm('Are you sure you want to delete this badge? This might affect users currently holding it.')) return
        const { error } = await supabase.from('badges').delete().eq('id', id)
        if (error) alert('Delete failed')
        else loadBadges()
    }

    const colorOptions = [
        { name: 'Sky / Default', class: 'text-sky-400 bg-sky-400/10 border-sky-400/20 shadow-sky-400/20' },
        { name: 'Emerald', class: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-emerald-400/20' },
        { name: 'Amber / Gold', class: 'text-amber-400 bg-amber-400/10 border-amber-400/20 shadow-amber-400/20' },
        { name: 'Indigo / Diamond', class: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20 shadow-indigo-400/20' },
        { name: 'Rose', class: 'text-rose-400 bg-rose-400/10 border-rose-400/20 shadow-rose-400/20' },
        { name: 'Fuchsia', class: 'text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/20 shadow-fuchsia-400/20' },
        { name: 'Slate / Newbie', class: 'text-slate-400 bg-slate-400/10 border-slate-400/20' },
        { name: 'Orange', class: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
        { name: 'Purple', class: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
    ]

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#e2e8f0' }}>
                            <Award className="text-sky-400" /> Badge Management
                        </h1>
                        <p className="text-sm mt-1" style={{ color: '#64748b' }}>Define and control user achievement tiers</p>
                    </div>
                    <button className="btn-primary" onClick={() => openModal()}>
                        <Plus size={18} /> Create New Badge
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="glass-card p-6 h-40 animate-pulse bg-slate-800/10" />
                        ))
                    ) : (
                        badges.map(badge => (
                            <div key={badge.id} className="glass-card p-6 group relative overflow-hidden flex flex-col justify-between">
                                <div className="absolute top-0 right-0 p-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openModal(badge)} className="p-1.5 rounded-lg bg-white/5 hover:bg-sky-500/10 text-sky-400">
                                        <Edit2 size={14} />
                                    </button>
                                    <button onClick={() => deleteBadge(badge.id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-red-500">
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-2xl">{badge.icon_emoji}</span>
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight" style={{ color: '#f1f5f9' }}>{badge.name}</h3>
                                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{badge.role.replace('_', ' ')}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500">Requirements:</span>
                                            <span className="font-bold text-slate-300">
                                                {badge.required_referrals} Refs / ৳{badge.required_income}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={cn('badge text-[0.7rem] px-2 py-1 border flex items-center gap-1.5', badge.color_class)}>
                                                {badge.icon_emoji} {badge.name} Preview
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                    <div className="flex items-center gap-1.5">
                                        {badge.is_auto_assign ? (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                                                <Zap size={10} /> Auto
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                                                <Shield size={10} /> Manual
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-slate-600">ID: {badge.id.slice(0, 8)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create/Edit Modal - Ultimate Robust Positioning */}
            {showModal && (
                <div className="fixed inset-0 z-[99999] flex items-start justify-center overflow-y-auto bg-black/95 p-4 py-10 sm:py-20 animate-fade-in" style={{ background: 'rgba(0,0,0,0.95)' }}>
                    <div className="w-full max-w-xl bg-[#0d1530] border border-white/10 rounded-2xl flex flex-col shadow-[0_0_100px_rgba(0,0,0,1)] relative" style={{ background: '#0d1530' }}>
                        {/* Header */}
                        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Award className="text-sky-400" size={20} />
                                {editingBadge ? 'Update Badge' : 'New Achievement Badge'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            {message.text && (
                                <div className={cn('p-4 rounded-xl flex items-center gap-3 text-sm font-bold', 
                                    message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20')}>
                                    {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                    {message.text}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
                                <div className="sm:col-span-2">
                                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2 block">Badge Name</label>
                                    <input type="text" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all" placeholder="e.g. Diamond Earner"
                                        value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2 block">Required Role</label>
                                    <select className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-sky-500/20 focus:outline-none cursor-pointer" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                                        {ROLES.map(r => <option key={r} value={r} className="bg-[#0d1530]">{r}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2 block">Icon (Emoji)</label>
                                    <input type="text" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-sky-500/20 focus:outline-none" placeholder="🏆"
                                        value={form.icon_emoji} onChange={e => setForm({...form, icon_emoji: e.target.value})} />
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2 block">Required Referrals</label>
                                    <input type="number" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
                                        value={form.required_referrals} onChange={e => setForm({...form, required_referrals: parseInt(e.target.value) || 0})} />
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2 block">Required Income (৳)</label>
                                    <input type="number" className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
                                        value={form.required_income} onChange={e => setForm({...form, required_income: parseFloat(e.target.value) || 0})} />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-2 block">Preview Design / Theme</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {colorOptions.map(opt => (
                                            <button key={opt.class} 
                                                onClick={() => setForm({...form, color_class: opt.class})}
                                                className={cn('text-[10px] p-2 rounded-lg border text-left transition-all', 
                                                    form.color_class === opt.class ? 'border-sky-500 bg-sky-500/10 ring-2 ring-sky-500/20' : 'border-white/5 hover:border-white/10')}>
                                                <div className={cn('w-full h-4 rounded-sm mb-1', opt.class.split(' ').find(c => c.startsWith('bg-')))} />
                                                {opt.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/5 transition-all group">
                                        <input type="checkbox" className="w-6 h-6 rounded-lg accent-sky-500 cursor-pointer" 
                                            checked={form.is_auto_assign} onChange={e => setForm({...form, is_auto_assign: e.target.checked})} />
                                        <div className="flex-1 text-left">
                                            <div className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">Auto-Assignment</div>
                                            <p className="text-[10px] text-slate-500 font-medium tracking-tight">System awards this badge when goals are reached.</p>
                                        </div>
                                        <Zap size={20} className={form.is_auto_assign ? 'text-emerald-400' : 'text-slate-700'} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-white/5 bg-black/20 flex gap-3">
                            <button className="flex-1 bg-sky-600 hover:bg-sky-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2" onClick={saveBadge} disabled={saving}>
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>{editingBadge ? 'Apply Changes' : 'Create Achievement'}</>
                                )}
                            </button>
                            <button className="px-8 border border-white/10 text-slate-400 hover:text-white py-4 rounded-2xl font-bold transition-all" onClick={() => setShowModal(false)} type="button">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
