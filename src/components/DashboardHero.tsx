import Image from 'next/image'
import { courses } from '@/data/courses'
import Link from 'next/link'
import { ArrowRight, Briefcase } from 'lucide-react'

export default function DashboardHero() {
  return (
    <div className="space-y-10 mb-8 animate-fade-in-up">
      {/* 1. Hero Banner Image */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(14,165,233,0.15)] border border-white/10 group bg-[#0d1530]">
        {/* We use an aspect ratio container for mobile responsiveness */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
          <Image 
            src="/banner.png" 
            alt="SkyX Vision IT Banner"
            fill
            className="object-cover md:object-contain transform transition-transform duration-700 group-hover:scale-105"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-transparent opacity-60 pointer-events-none" />
      </div>

      {/* 2. Corporate Header */}
      <div className="text-center px-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-sky-500/20 rounded-full blur-[50px] -z-10" />
        <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase" style={{ color: '#e2e8f0', letterSpacing: '-0.02em' }}>
          SkyX <span className="gradient-text">Vision IT</span>
        </h1>
        <div className="h-1 w-20 mx-auto mt-4 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500" />
        <p className="mt-4 text-sm md:text-base font-medium max-w-2xl mx-auto leading-relaxed" style={{ color: '#94a3b8' }}>
          Bangladesh's #1 Task-Based Business & E-Learning Platform. 
          <br className="hidden sm:block" /> Empowering you to Learn, Work, and Earn from your mobile device.
        </p>
      </div>

      {/* 3. Vertical Task List */}
      <div className="space-y-5">
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20 shadow-inner">
            <Briefcase size={20} className="text-sky-400" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">Work Categories</h2>
            <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Select a task to view details</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          {courses.map((course, idx) => (
            <Link href={`/courses/${course.slug}`} key={course.slug} className="block">
              <div className="glass-card-hover p-4 flex flex-col md:flex-row gap-5 relative overflow-hidden group/task border-white/5 bg-[#0d1530]/80">
                {/* Thumbnail - Made prominent for easy explanation in meetings */}
                <div className="w-full md:w-64 h-48 md:h-36 rounded-xl overflow-hidden relative shrink-0 border border-white/10 shadow-lg">
                  <Image 
                    src={course.thumbnail} 
                    alt={course.title} 
                    fill 
                    className="object-cover group-hover/task:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/90 via-[#0a0f1e]/40 to-transparent flex flex-col justify-end p-4">
                    <span className="text-4xl mb-1 drop-shadow-lg">{course.icon}</span>
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                    {course.status}
                  </div>
                </div>

                {/* Details Section */}
                <div className="flex-1 flex flex-col py-1">
                  <h3 className="text-lg md:text-xl font-bold mb-1" style={{ color: '#e2e8f0' }}>{course.title}</h3>
                  <div className="text-sm font-bold mb-3" style={{ color: '#0ea5e9' }}>{course.desc}</div>
                  
                  <p className="text-xs md:text-sm leading-relaxed mb-4 flex-grow" style={{ color: '#94a3b8' }}>
                    {course.detailedDesc}
                  </p>
                  
                  <div className="pt-3 border-t border-[#1e3a5f]/50 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded border border-slate-700/50">
                          ⏱️ {course.duration}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5 group-hover/task:text-sky-300 transition-colors bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20 group-hover/task:bg-sky-500/20">
                        View Details <ArrowRight size={14} className="group-hover/task:translate-x-1 transition-transform" />
                      </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
