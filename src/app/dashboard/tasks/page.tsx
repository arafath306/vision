import Link from 'next/link'
import {
    Database, FileText, Image, Video, Palette,
    Package, ClipboardList, Share2, Briefcase
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const taskCategories = [
    { href: '/dashboard/tasks/data-entry', label: 'Data Entry', icon: Database, color: '#3b82f6' },
    { href: '/dashboard/tasks/form-fillup', label: 'Form Fillup', icon: FileText, color: '#10b981' },
    { href: '/dashboard/tasks/photo-editing', label: 'Photo Editing', icon: Image, color: '#8b5cf6' },
    { href: '/dashboard/tasks/video-editing', label: 'Video Editing', icon: Video, color: '#ec4899' },
    { href: '/dashboard/tasks/graphic-design', label: 'Graphic Design', icon: Palette, color: '#f59e0b' },
    { href: '/dashboard/tasks/pen-packaging', label: 'Pen Packaging', icon: Package, color: '#0ea5e9' },
    { href: '/dashboard/tasks/soap-packaging', label: 'Soap Packaging', icon: Package, color: '#14b8a6' },
    { href: '/dashboard/tasks/social-media', label: 'Social Media', icon: Share2, color: '#6366f1' },
    { href: '/dashboard/tasks/copy-paste', label: 'Copy Paste', icon: ClipboardList, color: '#64748b' },
]

export default function TasksIndexPage() {
    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            <div>
                <h1 className="text-2xl font-black text-slate-200 flex items-center gap-2">
                    <Briefcase className="text-sky-500" /> Task Categories
                </h1>
                <p className="text-sm text-slate-400">Select a category below to view and perform available tasks.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {taskCategories.map(cat => (
                    <Link key={cat.href} href={cat.href}
                        className="glass-card hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col items-center justify-center text-center gap-4 hover:shadow-[0_0_20px_rgba(14,165,233,0.15)] group">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold transition-transform group-hover:scale-110 shadow-lg"
                            style={{ background: `linear-gradient(135deg, ${cat.color}dd, ${cat.color}77)` }}>
                            <cat.icon size={26} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-200 text-base">{cat.label}</h2>
                        </div>
                    </Link>
                ))}
            </div>
        </div >
    )
}
