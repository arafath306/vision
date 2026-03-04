import { ArrowLeft, CheckCircle, Clock, DollarSign, Info, MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface TaskPageProps {
    title: string
    emoji: string
    rate: string
    description: string
    requirements: string[]
    workflow: string[]
    tips: string[]
    gradient: string
}

export default function TaskPageTemplate({
    title, emoji, rate, description, requirements, workflow, tips, gradient
}: TaskPageProps) {
    return (
        <div className="space-y-6 animate-fade-in-up pb-20 sm:pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Link href="/dashboard" className="btn-outline sm:w-auto h-9 px-4 text-xs font-bold self-start">
                    <ArrowLeft size={14} className="mr-1" /> Return
                </Link>
                <h1 className="text-xl font-black tracking-tight flex items-center gap-2" style={{ color: '#e2e8f0' }}>
                    <span className="text-3xl">{emoji}</span> {title}
                </h1>
            </div>

            {/* Hero Card */}
            <div className="glass-card p-6 md:p-10 overflow-hidden relative group" style={{ background: gradient }}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-[100px] pointer-events-none" />
                <div className="relative z-10">
                    <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl">{emoji}</div>
                    <h2 className="text-3xl font-black mb-3 tracking-tighter" style={{ color: '#e2e8f0' }}>{title}</h2>
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xl mb-6 shadow-xl"
                        style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
                        <DollarSign size={20} /> {rate}
                    </div>
                    <p style={{ color: '#cbd5e1' }} className="text-lg leading-relaxed max-w-2xl">{description}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Requirements */}
                <div className="glass-card p-5">
                    <h3 className="section-title mb-4" style={{ fontSize: '0.95rem' }}>
                        <Info size={16} style={{ color: '#0ea5e9' }} />
                        Requirements
                    </h3>
                    <ul className="space-y-2">
                        {requirements.map((r, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#94a3b8' }}>
                                <CheckCircle size={14} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
                                {r}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Workflow */}
                <div className="glass-card p-5">
                    <h3 className="section-title mb-4" style={{ fontSize: '0.95rem' }}>
                        <Clock size={16} style={{ color: '#0ea5e9' }} />
                        How It Works
                    </h3>
                    <ol className="space-y-2">
                        {workflow.map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm" style={{ color: '#94a3b8' }}>
                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                                    style={{ background: 'rgba(14,165,233,0.2)', color: '#0ea5e9' }}>{i + 1}</span>
                                {step}
                            </li>
                        ))}
                    </ol>
                </div>

                {/* Tips */}
                <div className="glass-card p-5">
                    <h3 className="section-title mb-4" style={{ fontSize: '0.95rem' }}>
                        <DollarSign size={16} style={{ color: '#f59e0b' }} />
                        Pro Tips
                    </h3>
                    <ul className="space-y-2">
                        {tips.map((t, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#94a3b8' }}>
                                <span style={{ color: '#f59e0b', flexShrink: 0 }}>💡</span>
                                {t}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* CTA */}
            <div className="glass-card p-6 text-center" style={{ borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.05)' }}>
                <MessageCircle size={32} className="mx-auto mb-3" style={{ color: '#10b981' }} />
                <h3 className="font-bold text-lg mb-2" style={{ color: '#e2e8f0' }}>Ready to Start This Task?</h3>
                <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>
                    Contact your assigned Trainer or reach out to admin directly to get task assignments.
                </p>
                <a href="https://wa.me/8801313961899?text=Hello%2C%20I%20want%20to%20start%20working%20on%20{title}"
                    target="_blank" rel="noopener noreferrer"
                    className="btn-accent" style={{ justifyContent: 'center', display: 'inline-flex', padding: '0.75rem 2rem' }}>
                    <MessageCircle size={16} />
                    Contact Admin / Trainer
                </a>
            </div>
        </div>
    )
}
