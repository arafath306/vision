'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Save, Shield, User, MapPin, Phone, Lock, FileText, CheckCircle } from 'lucide-react'

export default function NewFormFillup() {
    const router = useRouter()
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        whatsapp: '',
        contactNumber: '',
        district: '',
        upazila: '',
        village: '',
        gender: 'Male',
        hasNid: false,
        nidRegion: '',
        nidNumber: '',
        accountName: '',
        accountNumber: '',
        password: '',
        confirmPassword: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        setForm(p => ({ ...p, [name]: val }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validations
        if (form.password.length < 6) return setError('Password must be at least 6 characters.')
        if (form.password !== form.confirmPassword) return setError('Passwords do not match.')
        if (form.hasNid && (!form.nidRegion || !form.nidNumber)) return setError('NID Region and Number are required if Yes.')

        setSubmitting(true)
        const supabase = createClient()
        
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Generate Employee ID (Random 6 chars)
            const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase()
            const employeeId = `SKYX-${randomCode}`

            const { data, error: insertError } = await supabase.from('registration_forms').insert({
                submitted_by: user.id,
                employee_id: employeeId,
                full_name: form.fullName,
                email: form.email,
                whatsapp: form.whatsapp,
                contact_number: form.contactNumber,
                district: form.district,
                upazila: form.upazila,
                village: form.village,
                gender: form.gender,
                has_nid: form.hasNid,
                nid_region: form.nidRegion,
                nid_number: form.nidNumber,
                account_name: form.accountName,
                account_number: form.accountNumber,
                password: form.password,
                status: 'PENDING'
            }).select().single()

            if (insertError) throw insertError

            router.push(`/dashboard/tasks/form-fillup/success?id=${data.id}`)
        } catch (err: any) {
            console.error('Submission error:', err)
            setError(err.message || 'Failed to submit the form.')
            setSubmitting(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in-up pb-10">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Form Fillup Application</h1>
                    <p className="text-slate-400">Please provide all accurate details for the applicant.</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-sm flex items-center gap-3">
                    <Shield size={16} /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="glass-card p-6 md:p-8">
                    <h2 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-3">
                        <User size={20} className="text-sky-400" /> Personal Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="form-label">Full Name <span className="text-red-500">*</span></label>
                            <input required type="text" name="fullName" value={form.fullName} onChange={handleChange} className="input-field" placeholder="Applicant Name" />
                        </div>
                        <div>
                            <label className="form-label">Email <span className="text-red-500">*</span></label>
                            <input required type="email" name="email" value={form.email} onChange={handleChange} className="input-field" placeholder="Email Address" />
                        </div>
                        <div>
                            <label className="form-label">WhatsApp Number <span className="text-red-500">*</span></label>
                            <input required type="text" name="whatsapp" value={form.whatsapp} onChange={handleChange} className="input-field" placeholder="01XXXXXXXXX" />
                        </div>
                        <div>
                            <label className="form-label">Contact Number <span className="text-red-500">*</span></label>
                            <input required type="text" name="contactNumber" value={form.contactNumber} onChange={handleChange} className="input-field" placeholder="Active Phone Number" />
                        </div>
                        <div>
                            <label className="form-label">Gender <span className="text-red-500">*</span></label>
                            <select required name="gender" value={form.gender} onChange={handleChange} className="input-field">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Address Information */}
                <div className="glass-card p-6 md:p-8">
                    <h2 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-3">
                        <MapPin size={20} className="text-emerald-400" /> Address Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="form-label">Zilla (District) <span className="text-red-500">*</span></label>
                            <input required type="text" name="district" value={form.district} onChange={handleChange} className="input-field" placeholder="e.g. Dhaka" />
                        </div>
                        <div>
                            <label className="form-label">Upazila <span className="text-red-500">*</span></label>
                            <input required type="text" name="upazila" value={form.upazila} onChange={handleChange} className="input-field" placeholder="e.g. Savar" />
                        </div>
                        <div>
                            <label className="form-label">Village / Area <span className="text-red-500">*</span></label>
                            <input required type="text" name="village" value={form.village} onChange={handleChange} className="input-field" placeholder="e.g. Ashulia" />
                        </div>
                    </div>
                </div>

                {/* NID Information */}
                <div className="glass-card p-6 md:p-8">
                    <h2 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-3">
                        <FileText size={20} className="text-amber-400" /> NID Information (Optional)
                    </h2>
                    
                    <div className="mb-6 flex items-center gap-3">
                        <input type="checkbox" id="hasNid" name="hasNid" checked={form.hasNid} onChange={handleChange} 
                            className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-sky-500 focus:ring-sky-500" />
                        <label htmlFor="hasNid" className="text-sm font-semibold text-slate-300 cursor-pointer">Applicant has NID/Smart Card?</label>
                    </div>

                    {form.hasNid && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 border border-amber-500/20 rounded-xl bg-amber-500/5 animate-fade-in-up">
                            <div>
                                <label className="form-label">NID Region/Area</label>
                                <input required={form.hasNid} type="text" name="nidRegion" value={form.nidRegion} onChange={handleChange} className="input-field bg-slate-900 border-white/5" placeholder="Issuing Region" />
                            </div>
                            <div>
                                <label className="form-label">NID Number</label>
                                <input required={form.hasNid} type="text" name="nidNumber" value={form.nidNumber} onChange={handleChange} className="input-field bg-slate-900 border-white/5" placeholder="10 or 17 digit NID Number" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Account Settings */}
                <div className="glass-card p-6 md:p-8 border-l-4 border-l-sky-500">
                    <h2 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-3">
                        <Lock size={20} className="text-indigo-400" /> Account Settings
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="form-label">Account Name <span className="text-red-500">*</span></label>
                            <input required type="text" name="accountName" value={form.accountName} onChange={handleChange} className="input-field" placeholder="Username" />
                        </div>
                        <div>
                            <label className="form-label">Account Number (WhatsApp) <span className="text-red-500">*</span></label>
                            <input required type="text" name="accountNumber" value={form.accountNumber} onChange={handleChange} className="input-field" placeholder="01XXXXXXXXX" />
                        </div>
                        <div>
                            <label className="form-label">Password <span className="text-red-500">*</span></label>
                            <input required minLength={6} type="password" name="password" value={form.password} onChange={handleChange} className="input-field" placeholder="Minimum 6 characters" />
                        </div>
                        <div>
                            <label className="form-label">Confirm Password <span className="text-red-500">*</span></label>
                            <input required minLength={6} type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="input-field" placeholder="Re-type password" />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={submitting} className="btn-primary py-4 px-10 text-lg w-full md:w-auto shadow-xl shadow-sky-500/20">
                        {submitting ? (
                            <span className="flex items-center gap-2">Processing <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></span>
                        ) : (
                            <span className="flex items-center gap-2"><Save size={20} /> Submit Your Form</span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
