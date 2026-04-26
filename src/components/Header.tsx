import { Bell, Search, ArrowLeft } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard:     { title: 'ToolVault',    subtitle: 'Overview' },
  inventory:     { title: 'Inventory',    subtitle: 'All tools and equipment' },
  'tool-detail': { title: 'Tool Detail',  subtitle: 'Detailed tool information' },
  scan:          { title: 'Scanner',      subtitle: 'Scan QR codes to track tools' },
  categories:    { title: 'Categories',   subtitle: 'Tool categories and counts' },
  locations:     { title: 'Locations',    subtitle: 'Storage locations and cabinets' },
}

export function Header() {
  const { currentPage, getLowStockTools, navigate } = useStore()
  const info = PAGE_TITLES[currentPage] ?? PAGE_TITLES['dashboard']
  const alertCount = getLowStockTools().length
  const showBack = currentPage === 'tool-detail'

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {showBack && (
          <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={() => navigate('inventory')}>
            <ArrowLeft size={16} />
          </Button>
        )}
        <div>
          <h1 className="text-sm font-semibold text-foreground">{info.title}</h1>
          <p className="hidden text-xs text-muted-foreground md:block">{info.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden h-8 w-48 justify-start gap-2 text-muted-foreground md:flex"
          onClick={() => navigate('inventory')}
        >
          <Search size={13} />
          <span className="flex-1 text-left text-xs">Search tools…</span>
          <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px] text-muted-foreground">⌘K</kbd>
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={() => navigate('inventory')}>
          <Search size={16} />
        </Button>

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
