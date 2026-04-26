import { MapPin, Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/store/useStore'
import { StatusBadge, ConditionBadge } from './StatusBadge'
import { getCategoryMeta } from '@/utils/categories'
import { cn } from '@/lib/utils'
import type { Tool } from '@/types'

interface ToolCardProps { tool: Tool; view?: 'grid' | 'list'; onSelect?: (id: string) => void }

export function ToolCard({ tool, view = 'grid', onSelect }: ToolCardProps) {
  const { getLocationById } = useStore()
  const location = getLocationById(tool.locationId)
  const meta = getCategoryMeta(tool.category)
  const isLowStock = tool.quantity <= tool.minQuantity

  if (view === 'list') {
    return (
      <button
        onClick={() => onSelect?.(tool.id)}
        className="group flex w-full items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 text-left transition-all hover:border-primary/30 hover:bg-accent/30 hover:shadow-sm"
      >
        <span className={cn('h-2 w-2 shrink-0 rounded-full', meta.color.replace('text-', 'bg-'))} />
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">{tool.name}</p>
          <p className="font-mono text-[11px] text-muted-foreground">{tool.partNumber}</p>
        </div>
        <Badge variant="outline" className={cn('shrink-0 text-[10px]', meta.color)}>{meta.label}</Badge>
        <StatusBadge status={tool.status} size="sm" />
        <ConditionBadge condition={tool.condition} size="sm" />
        <div className="hidden items-center gap-1 text-[11px] text-muted-foreground md:flex shrink-0">
          <MapPin size={10} />{location?.name ?? '—'}
        </div>
        <div className={cn('flex items-center gap-1 shrink-0 font-mono text-xs', isLowStock ? 'font-bold text-amber-400' : 'text-muted-foreground')}>
          <Package size={11} className={isLowStock ? 'text-amber-400' : ''} />{tool.quantity}
        </div>
      </button>
    )
  }

  return (
    <Card
      className="group cursor-pointer transition-all hover:border-primary/30 hover:shadow-md"
      onClick={() => onSelect?.(tool.id)}
    >
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <Badge variant="outline" className={cn('text-[10px]', meta.color)}>{meta.label}</Badge>
          <StatusBadge status={tool.status} size="sm" />
        </div>

        <p className="text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors mb-1">
          {tool.name}
        </p>
        <p className="font-mono text-[11px] text-muted-foreground mb-3">{tool.partNumber}</p>

        <Separator />

        <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px]">
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin size={10} /><span className="truncate">{location?.name ?? '—'}</span>
          </div>
          <div className={cn('flex items-center justify-end gap-1 font-mono font-medium', isLowStock ? 'text-amber-400' : 'text-muted-foreground')}>
            <Package size={10} />{tool.quantity} units
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <span>Cond:</span><ConditionBadge condition={tool.condition} size="sm" />
          </div>
          {tool.manufacturer && (
            <div className="truncate text-right text-muted-foreground/60">{tool.manufacturer}</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function Separator() {
  return <div className="h-px bg-border" />
}
