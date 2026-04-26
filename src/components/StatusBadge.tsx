import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ToolStatus, ToolCondition } from '@/types'

const STATUS_CONFIG: Record<ToolStatus, { variant: 'success' | 'info' | 'warning' | 'destructive' | 'muted'; dot: string; label: string }> = {
  'available':    { variant: 'success',     dot: 'bg-emerald-400', label: 'Available' },
  'in-use':       { variant: 'info',        dot: 'bg-blue-400',    label: 'In Use' },
  'checked-out':  { variant: 'warning',     dot: 'bg-amber-400',   label: 'Checked Out' },
  'maintenance':  { variant: 'destructive', dot: 'bg-rose-400',    label: 'Maintenance' },
  'retired':      { variant: 'muted',       dot: 'bg-muted-foreground', label: 'Retired' },
}

const CONDITION_CONFIG: Record<ToolCondition, { color: string; label: string }> = {
  new:     { color: 'text-emerald-400', label: 'New' },
  good:    { color: 'text-primary',     label: 'Good' },
  fair:    { color: 'text-amber-400',   label: 'Fair' },
  worn:    { color: 'text-orange-400',  label: 'Worn' },
  damaged: { color: 'text-rose-400',    label: 'Damaged' },
  retired: { color: 'text-muted-foreground', label: 'Retired' },
}

export function StatusBadge({ status, size = 'md' }: { status: ToolStatus; size?: 'sm' | 'md' }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <Badge variant={cfg.variant} className={cn('gap-1.5', size === 'sm' && 'px-1.5 py-0 text-[10px]')}>
      <span className={cn('rounded-full', cfg.dot, size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2')} />
      {cfg.label}
    </Badge>
  )
}

export function ConditionBadge({ condition, size = 'md' }: { condition: ToolCondition; size?: 'sm' | 'md' }) {
  const cfg = CONDITION_CONFIG[condition]
  return (
    <span className={cn('font-medium', cfg.color, size === 'sm' ? 'text-[10px]' : 'text-xs')}>
      {cfg.label}
    </span>
  )
}
