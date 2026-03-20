import { Loader2 } from 'lucide-react'

export default function PageLoader() {
    return (
        <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center">
            <div className="relative flex items-center justify-center w-20 h-20 mb-6 group">
                {/* Glow behind */}
                <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-xl group-hover:bg-sky-500/30 transition-colors duration-500" />
                
                {/* Outer spin ring */}
                <div className="absolute inset-0 rounded-[2rem] border-[3px] border-t-sky-500/80 border-r-emerald-500/80 border-b-transparent border-l-transparent animate-[spin_1.5s_linear_infinite]" />
                
                {/* Inner counter spin ring */}
                <div className="absolute inset-2 rounded-[1.5rem] border-[3px] border-b-sky-400 border-l-emerald-400 border-t-transparent border-r-transparent animate-[spin_2s_linear_infinite_reverse]" />
                
                {/* Center dot */}
                <div className="w-4 h-4 bg-sky-400 rounded-full shadow-[0_0_15px_#38bdf8] animate-pulse" />
            </div>

            <div className="text-center space-y-2">
                <h3 className="text-lg font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400 animate-pulse">
                    Loading Data
                </h3>
                <p className="text-xs font-semibold text-slate-500 tracking-wide">
                    Optimizing experience...
                </p>
            </div>
        </div>
    )
}
