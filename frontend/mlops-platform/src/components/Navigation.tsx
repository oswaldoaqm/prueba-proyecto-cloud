import { BarChart3, GitBranch, Eye, FileText, TrendingUp, Database } from 'lucide-react'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'features', label: 'Features', icon: Database },
  { id: 'models', label: 'Models', icon: GitBranch },
  { id: 'predict', label: 'Predict', icon: Eye },
  { id: 'logs', label: 'Logs', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
]

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="sticky top-0 z-40 border-b border-[#1e293b] px-6 py-4 backdrop-blur-md bg-[rgba(10,14,39,0.7)]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-2">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm
                  transition-all duration-300 relative group
                  ${
                    isActive
                      ? 'text-cyan-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }
                `}
              >
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                <span className="hidden sm:inline">{label}</span>
                
                {/* Active indicator line */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
