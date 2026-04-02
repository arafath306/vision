'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, FileText, CheckCircle, Clock } from 'lucide-react'

export default function TrainerFormsPage() {
    const [forms, setForms] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const fetchForms = async () => {
            const supabase = createClient()
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                // Fetch all forms submitted by members under this trainer
                // RLS Policy already restricts it to forms where submitted_by is in team
                const { data, error } = await supabase
                    .from('registration_forms')
                    .select('*, users:submitted_by(full_name, whatsapp)')
                    .order('created_at', { ascending: false })

                if (error) throw error
                setForms(data || [])
            } catch (err: any) {
                console.error("Error fetching forms:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchForms()
    }, [])

    const filteredForms = forms.filter(f => 
        f.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
        f.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.whatsapp.includes(searchQuery)
    )

    return (
        <div className="max-w-7xl mx-auto animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Member Forms</h1>
                    <p className="text-slate-400">View and track all form fillup applications submitted by your team members.</p>
                </div>
                
                <div className="relative w-full md:w-80 shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search Employee ID or WhatsApp..."
                        className="input-field pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="border-b bg-white/5" style={{ borderColor: 'var(--border)' }}>
                                <th className="p-4 font-semibold text-slate-300">Date</th>
                                <th className="p-4 font-semibold text-slate-300">Employee ID</th>
                                <th className="p-4 font-semibold text-slate-300">Applicant Details</th>
                                <th className="p-4 font-semibold text-slate-300">Submitted By</th>
                                <th className="p-4 font-semibold text-slate-300">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading forms...</td></tr>
                            ) : filteredForms.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-16 text-center">
                                        <FileText size={48} className="mx-auto text-slate-600 mb-4" />
                                        <p className="text-slate-400">No forms found matching your search.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredForms.map((form) => (
                                    <tr key={form.id} className="border-b hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border)' }}>
                                        <td className="p-4 text-slate-400 whitespace-nowrap">
                                            {new Date(form.created_at).toLocaleDateString()}
                                            <div className="text-xs text-slate-500">{new Date(form.created_at).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-mono text-sky-400 font-bold bg-sky-500/10 px-2 py-1 rounded">
                                                {form.employee_id}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-200">{form.full_name}</div>
                                            <div className="text-xs text-slate-500">{form.whatsapp}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-slate-300">{form.users?.full_name || 'Member'}</div>
                                            <div className="text-xs text-slate-500">{form.users?.whatsapp}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                                                ${form.status === 'ACCOUNT_CREATED' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'}`}>
                                                {form.status === 'ACCOUNT_CREATED' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                                {form.status === 'ACCOUNT_CREATED' ? 'Created' : 'Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
