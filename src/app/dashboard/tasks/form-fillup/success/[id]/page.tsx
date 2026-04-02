'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { CheckCircle, Share2, ArrowLeft, Download, ShieldCheck, UserCheck, Key, Hash } from 'lucide-react'

export default function FormSuccessPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [form, setForm] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchForm = async () => {
            const supabase = createClient()
            try {
                const { data, error } = await supabase
                    .from('registration_forms')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (error || !data) throw new Error('Form not found')
                setForm(data)
            } catch (err: any) {
                setError(err.message || 'Error fetching form data')
            } finally {
                setIsLoading(false)
            }
        }
        fetchForm()
    }, [id])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20 animate-fade-in-up">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
                    <p className="text-slate-400 font-semibold">Generating Certificate...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto mt-20 p-8 glass-card border border-red-500/20 text-center animate-fade-in-up">
                <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Notice</h2>
                <p className="text-slate-400 mb-6">{error}</p>
                <Link href="/dashboard/tasks/form-fillup" className="btn-primary w-full justify-center">Return to Forms</Link>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto pb-10 animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
                <button onClick={() => window.history.back()} className="p-2.5 bg-slate-800 rounded-xl hover:bg-slate-700 text-slate-300 transition-colors hidden sm:block">
                    <ArrowLeft size={18} />
                </button>
                <div className="flex gap-3">
                    <button className="btn-outline text-sm" onClick={() => window.print()}>
                        <Download size={16} /> Screenshot
                    </button>
                    <Link href="/dashboard/tasks/form-fillup" className="btn-primary text-sm shadow-xl shadow-emerald-500/20" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderColor: '#059669' }}>
                         My Forms
                    </Link>
                </div>
            </div>

            <div className="relative group perspective" id="application-certificate">
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/40 to-emerald-500/40 rounded-[2.5rem] blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                
                <div className="relative p-1 glass-card overflow-hidden bg-slate-900 rounded-[2rem] border border-white/10 ring-1 ring-white/5 shadow-2xl">
                    <div className="text-center p-8 pb-10 border-b relative" style={{ borderColor: 'rgba(30,58,95,0.6)', background: 'linear-gradient(180deg, rgba(14,165,233,0.05) 0%, transparent 100%)' }}>
                        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-sky-500 via-emerald-500 to-sky-500" />
                        <div className="w-20 h-20 bg-emerald-500 rounded-full mx-auto flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.4)] mb-6 ring-8 ring-emerald-500/20">
                            <CheckCircle size={40} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 mb-2">
                            SkyX Vision It
                        </h2>
                        <h3 className="text-xl text-white font-bold opacity-90 tracking-wide uppercase">Official Application Form</h3>
                        <p className="text-slate-400 mt-2 text-sm font-medium">Successfully Registered via Team Network</p>
                    </div>

                    <div className="p-8 sm:px-12 grid gap-6 bg-[#0a0f1e]/80">
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner">
                            <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                                <Hash size={24} />
                            </div>
                            <div>
                                <div className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-1">Employee ID / System Code</div>
                                <div className="text-xl sm:text-2xl font-mono font-black text-sky-400 tracking-widest">{form.employee_id}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                                <UserCheck size={20} className="text-emerald-400 shrink-0" />
                                <div>
                                    <div className="text-[0.65rem] uppercase font-bold text-slate-500 tracking-wider">Account Name</div>
                                    <div className="text-sm font-bold text-slate-200">{form.account_name}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                                <Share2 size={20} className="text-emerald-400 shrink-0" />
                                <div>
                                    <div className="text-[0.65rem] uppercase font-bold text-slate-500 tracking-wider">WhatsApp Number</div>
                                    <div className="text-sm font-bold text-slate-200">{form.account_number}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 sm:col-span-2">
                                <Key size={20} className="text-amber-400 shrink-0" />
                                <div>
                                    <div className="text-[0.65rem] uppercase font-bold text-slate-500 tracking-wider">Temporary Password</div>
                                    <div className="text-base font-mono font-bold text-amber-400 tracking-widest bg-amber-500/10 px-3 py-1 rounded border border-amber-500/20 inline-block mt-1">
                                        {form.password}
                                    </div>
                                    <p className="text-[0.65rem] text-slate-500 mt-2 block w-full italic">Please change this password after activating your account.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0a0f1e] p-6 text-center border-t border-white/5">
                        <div className="inline-flex items-center gap-2 justify-center text-emerald-400 font-semibold bg-emerald-500/10 rounded-full px-4 py-1.5 border border-emerald-500/20">
                            <ShieldCheck size={16} /> Verified Form Submission
                        </div>
                        <p className="text-xs text-slate-500 tracking-wider mt-4">
                            Keep this receipt safe. Contact administration for activation. <br/>
                            Date generated: {new Date(form.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 text-center text-slate-500 text-sm">
                Take a screenshot of this page and send it to your team leader or trainer.
            </div>
        </div>
    )
}
