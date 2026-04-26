import { Bell, QrCode } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'

export function Header() {
  const { currentPage, getLowStockTools, navigate } = useStore()
  const alertCount = getLowStockTools().length

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {/* Logo mark — mobile only (sidebar hidden) */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/30">
            <svg className="h-3.5 w-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-sm font-bold text-foreground">ToolVault</span>
        </div>

        {/* Desktop page title */}
        <div className="hidden md:block">
          <h1 className="text-sm font-semibold text-foreground">
            {currentPage === 'scan' ? 'Scanner' : 'ToolVault'}
          </h1>
          <p className="text-xs text-muted-foreground">
            {currentPage === 'scan' ? 'Scan QR codes to check in/out' : 'Machine tool inventory'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Quick scan button — mobile */}
        <Button
          variant="ghost" size="icon" className="h-8 w-8 md:hidden"
          onClick={() => navigate('scan')}
        >
          <QrCode size={16} />
        </Button>

        {/* Alerts */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell size={15} />
          </Button>
          {alertCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-0.5 text-[9px] font-bold text-black">
              {alertCount}
            </span>
          )}
        </div>

        {/* User chip — desktop */}
        <div className="hidden items-center gap-2 rounded-md border border-border bg-muted/50 px-2.5 py-1.5 md:flex">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 ring-1 ring-primary/30">
            <span className="text-[9px] font-bold text-primary">OP</span>
          </div>
          <span className="text-xs font-medium text-foreground">Operator</span>
        </div>
      </div>
    </header>
  )
}
