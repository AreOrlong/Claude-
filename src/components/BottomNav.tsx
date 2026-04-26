import { LayoutDashboard, Wrench, QrCode, FolderOpen, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import type { Page } from '@/types'

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard',  label: 'Home',       icon: <LayoutDashboard size={20} /> },
  { id: 'inventory',  label: 'Inventory',  icon: <Wrench size={20} /> },
  { id: 'scan',       label: 'Scan',       icon: <QrCode size={22} /> },
  { id: 'categories', label: 'Categories', icon: <FolderOpen size={20} /> },
  { id: 'locations',  label: 'Locations',  icon: <MapPin size={20} /> },
]

export function BottomNav() {
  const { currentPage, navigate } = useStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-card/95 backdrop-blur-md md:hidden">
      {navItems.map((item) => {
        const active = currentPage === item.id || (item.id === 'inventory' && currentPage === 'tool-detail')
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {item.id === 'scan' ? (
              <span className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted text-muted-foreground'
              )}>
                {item.icon}
              </span>
            ) : (
              <>
                {item.icon}
                <span>{item.label}</span>
              </>
            )}
          </button>
        )
      })}
    </nav>
  )
}
