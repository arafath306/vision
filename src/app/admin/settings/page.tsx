'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import {
    Settings, Save, CheckCircle, AlertCircle,
    DollarSign, Percent, Info
} from 'lucide-react'

export default function AdminSettingsPage() {
    const supabase = createClient()
    const [form, setForm] = useState({
        activation_fee: '',
        referral_percentage: '',
        trainer_percentage: '',
        leader_percentage: '',
    })
    const [settingsId, setSettingsId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        const load = async () => {
            const { data } = await supabase.from('system_settings').select('*').single()
            if (data) {
                setSettingsId(data.id)
                setForm({
                    activation_fee: data.activation_fee.toString(),
                    referral_percentage: data.referral_percentage.toString(),
                    trainer_percentage: data.trainer_percentage.toString(),
                    leader_percentage: data.leader_percentage.toString(),
                })
            }
            setLoading(false)
        }
        load()
    }, [])

    const update = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

    const totalCommissionPct =
        parseFloat(form.referral_percentage || '0') +
        parseFloat(form.trainer_percentage || '0') +
        parseFloat(form.leader_percentage || '0')

    const activationFee = parseFloat(form.activation_fee || '0')

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage({ type: '', text: '' })

        const payload = {
            activation_fee: parseFloat(form.activation_fee),
            referral_percentage: parseFloat(form.referral_percentage),
            trainer_percentage: parseFloat(form.trainer_percentage),
            leader_percentage: parseFloat(form.leader_percentage),
        }

        let error
        if (settingsId) {
            ({ error } = await supabase.from('system_settings').update(payload).eq('id', settingsId))
        } else {
            ({ error } = await supabase.from('system_settings').insert(payload))
        }

        if (error) {
            setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
        } else {
            setMessage({ type: 'success', text: 'Settings saved successfully!' })
        }
        setSaving(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-60">
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in-up max-w-2xl">
            <div className="page-header">
                <h1 className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>
                    <span className="gradient-text">System</span> Settings
                </h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                    Configure commission percentages and activation fee. Changes apply to all future activations.
                </p>
            </div>

            {message.text && (
                <div className={message.type === 'success' ? 'alert-success' : 'alert-error'}>
                    {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
                {/* Activation Fee */}
                <div className="glass-card p-6">
                    <h2 className="section-title mb-5" style={{ fontSize: '1rem' }}>
                        <DollarSign size={18} style={{ color: '#0ea5e9' }} />
                        Activation Fee
                    </h2>
                    <div>
                        <label htmlFor="activation-fee" className="form-label">One-Time Activation Fee (BDT)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold" style={{ color: '#64748b' }}>৳</span>
                            <input
                                id="activation-fee"
                                type="number"
                                className="input-field"
                                style={{ paddingLeft: '1.75rem' }}
                                placeholder="e.g. 500"
                                min="0"
                                step="1"
                                value={form.activation_fee}
                                onChange={e => update('activation_fee', e.target.value)}
                                required
                            />
                        </div>
                        <p className="text-xs mt-1" style={{ color: '#64748b' }}>
                            This is the fee new members must pay to activate their account.
                        </p>
                    </div>
                </div>

                {/* Commission Percentages */}
                <div className="glass-card p-6">
                    <h2 className="section-title mb-2" style={{ fontSize: '1rem' }}>
                        <Percent size={18} style={{ color: '#10b981' }} />
                        Commission Percentages
                    </h2>
                    <p className="text-xs mb-5" style={{ color: '#64748b' }}>
                        These percentages are applied to the activation fee when a new member is activated.
                    </p>

                    <div className="space-y-5">
                        <div>
                            <label htmlFor="referral-pct" className="form-label">
                                Referral Commission %
                                <span className="ml-2 font-normal" style={{ color: '#64748b' }}>
                                    (paid to the member who referred)
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    id="referral-pct"
                                    type="number"
                                    className="input-field"
                                    style={{ paddingRight: '2rem' }}
                                    placeholder="e.g. 10"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={form.referral_percentage}
                                    onChange={e => update('referral_percentage', e.target.value)}
                                    required
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold" style={{ color: '#64748b' }}>%</span>
                            </div>
                            {activationFee > 0 && (
                                <p className="text-xs mt-1" style={{ color: '#10b981' }}>
                                    = {formatCurrency(activationFee * parseFloat(form.referral_percentage || '0') / 100)} per activation
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="trainer-pct" className="form-label">
                                Trainer Commission %
                                <span className="ml-2 font-normal" style={{ color: '#64748b' }}>
                                    (paid to the assigned trainer)
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    id="trainer-pct"
                                    type="number"
                                    className="input-field"
                                    style={{ paddingRight: '2rem' }}
                                    placeholder="e.g. 5"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={form.trainer_percentage}
                                    onChange={e => update('trainer_percentage', e.target.value)}
                                    required
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold" style={{ color: '#64748b' }}>%</span>
                            </div>
                            {activationFee > 0 && (
                                <p className="text-xs mt-1" style={{ color: '#8b5cf6' }}>
                                    = {formatCurrency(activationFee * parseFloat(form.trainer_percentage || '0') / 100)} per activation
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="leader-pct" className="form-label">
                                Leader Commission %
                                <span className="ml-2 font-normal" style={{ color: '#64748b' }}>
                                    (paid to the team leader)
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    id="leader-pct"
                                    type="number"
                                    className="input-field"
                                    style={{ paddingRight: '2rem' }}
                                    placeholder="e.g. 3"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={form.leader_percentage}
                                    onChange={e => update('leader_percentage', e.target.value)}
                                    required
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold" style={{ color: '#64748b' }}>%</span>
                            </div>
                            {activationFee > 0 && (
                                <p className="text-xs mt-1" style={{ color: '#f59e0b' }}>
                                    = {formatCurrency(activationFee * parseFloat(form.leader_percentage || '0') / 100)} per activation
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="mt-6 p-4 rounded-lg" style={{ background: 'rgba(14,165,233,0.07)', border: '1px solid rgba(14,165,233,0.2)' }}>
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#0ea5e9' }}>
                            <Info size={14} /> Commission Summary (per activation)
                        </h3>
                        <div className="space-y-2">
                            {[
                                { label: 'Activation Fee', value: formatCurrency(activationFee), color: '#e2e8f0' },
                                { label: `Referral (${form.referral_percentage || 0}%)`, value: formatCurrency(activationFee * parseFloat(form.referral_percentage || '0') / 100), color: '#10b981' },
                                { label: `Trainer (${form.trainer_percentage || 0}%)`, value: formatCurrency(activationFee * parseFloat(form.trainer_percentage || '0') / 100), color: '#8b5cf6' },
                                { label: `Leader (${form.leader_percentage || 0}%)`, value: formatCurrency(activationFee * parseFloat(form.leader_percentage || '0') / 100), color: '#f59e0b' },
                            ].map(row => (
                                <div key={row.label} className="flex justify-between text-sm">
                                    <span style={{ color: '#94a3b8' }}>{row.label}</span>
                                    <span className="font-semibold" style={{ color: row.color }}>{row.value}</span>
                                </div>
                            ))}
                            <div className="divider" style={{ margin: '0.5rem 0' }} />
                            <div className="flex justify-between text-sm font-bold">
                                <span style={{ color: '#94a3b8' }}>Total Commission Out</span>
                                <span style={{ color: totalCommissionPct > 100 ? '#ef4444' : '#0ea5e9' }}>
                                    {formatCurrency(activationFee * totalCommissionPct / 100)} ({totalCommissionPct.toFixed(1)}%)
                                </span>
                            </div>
                            {totalCommissionPct > 100 && (
                                <p className="text-xs" style={{ color: '#ef4444' }}>
                                    ⚠ Total commission exceeds 100%! Please reduce percentages.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    id="save-settings-btn"
                    type="submit"
                    className="btn-primary"
                    style={{ padding: '0.75rem 2rem' }}
                    disabled={saving || totalCommissionPct > 100}>
                    {saving ? (
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                        </span>
                    ) : (
                        <><Save size={16} /> Save Settings</>
                    )}
                </button>
            </form>
        </div>
    )
}
