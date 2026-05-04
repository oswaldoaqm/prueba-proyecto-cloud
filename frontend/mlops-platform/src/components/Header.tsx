import { Zap } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle: string
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="relative border-b border-[#1e293b] px-6 py-8 md:py-12 overflow-hidden">
      {/* Gradient background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl border border-cyan-500/30 backdrop-blur-sm">
            <Zap className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
        </div>
        <p className="text-slate-400 text-sm md:text-base font-500 ml-[3.25rem]">{subtitle}</p>
      </div>
    </header>
  )
}
