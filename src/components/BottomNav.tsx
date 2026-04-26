import { Wrench, QrCode } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'

export function BottomNav() {
  const { currentPage, navigate } = useStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-card/95 backdrop-blur-md md:hidden">
      {/* Tools */}
      <button
        onClick={() => navigate('tools')}
        className={cn(
          'flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[11px] font-medium transition-colors',
          currentPage === 'tools' ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        <Wrench size={20} />
        <span>Tools</span>
      </button>

      {/* Scan — prominent centre button */}
      <button
        onClick={() => navigate('scan')}
        className="flex flex-1 flex-col items-center justify-center gap-1 py-3"
      >
        <span className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all',
          currentPage === 'scan'
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border bg-muted text-muted-foreground'
        )}>
          <QrCode size={22} />
        </span>
      </button>
    </nav>
  )
}
