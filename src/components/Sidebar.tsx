import { Wrench, QrCode, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { Separator } from '@/components/ui/separator'
import type { Page } from '@/types'

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'tools', label: 'Tools',   icon: <Wrench size={16} /> },
  { id: 'scan',  label: 'Scanner', icon: <QrCode size={16} /> },
]

export function Sidebar() {
  const { currentPage, navigate } = useStore()

  return (
    <aside className="flex h-full w-52 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/30">
          <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
            <path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight text-foreground">ToolVault</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Machine Tools</p>
        </div>
      </div>

      <Separator />

      <nav className="flex-1 space-y-0.5 p-2 pt-3">
        {navItems.map((item) => {
          const active = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={cn(
                'group flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-all',
                active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <span className={cn(active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {active && <ChevronRight size={13} className="text-primary/50" />}
            </button>
          )
        })}
      </nav>

      <Separator />

      <div className="p-3">
        <p className="px-3 font-mono text-[10px] text-muted-foreground/40">v1.0.0</p>
      </div>
    </aside>
  )
}
