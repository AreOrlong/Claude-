import { Wrench } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/StatusBadge'
import { CATEGORY_META } from '@/utils/categories'
import { cn } from '@/lib/utils'

export function Categories() {
  const { tools, navigate } = useStore()

  const byCategory = CATEGORY_META.map((meta) => {
    const catTools   = tools.filter((t) => t.category === meta.id)
    const available  = catTools.filter((t) => t.status === 'available').length
    const checkedOut = catTools.filter((t) => t.status === 'checked-out' || t.status === 'in-use').length
    const maint      = catTools.filter((t) => t.status === 'maintenance').length
    const totalQty   = catTools.reduce((s, t) => s + t.quantity, 0)
    return { meta, tools: catTools, available, checkedOut, maint, totalQty }
  }).filter((c) => c.tools.length > 0)

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {byCategory.map(({ meta, tools: catTools, totalQty }) => (
          <Card key={meta.id} className={cn('transition-all hover:shadow-md', meta.bgColor, meta.borderColor)}>
            <CardContent className="p-4">
              <p className={cn('text-[10px] font-semibold uppercase tracking-widest', meta.color)}>{meta.label}</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{catTools.length}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{totalQty} units</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Per-category detail */}
      {byCategory.map(({ meta, tools: catTools, available, checkedOut, maint }) => (
        <Card key={meta.id}>
          <CardHeader className={cn('rounded-t-xl border-b py-3', meta.bgColor, meta.borderColor)}>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench size={14} className={meta.color} />
                <span className={cn('text-sm', meta.color)}>{meta.label}</span>
                <span className="font-mono text-xs text-muted-foreground">{catTools.length} types</span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-emerald-400">{available} avail</span>
                {checkedOut > 0 && <span className="text-amber-400">{checkedOut} out</span>}
                {maint > 0 && <span className="text-rose-400">{maint} maint</span>}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {catTools.map((t) => (
                <button
                  key={t.id}
                  onClick={() => navigate('tool-detail', t.id)}
                  className="group flex w-full items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-accent/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">{t.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{t.partNumber}{t.subcategory && ` · ${t.subcategory}`}</p>
                  </div>
                  <StatusBadge status={t.status} size="sm" />
                  <span className={cn('font-mono text-xs tabular-nums shrink-0', t.quantity <= t.minQuantity ? 'font-bold text-amber-400' : 'text-muted-foreground')}>
                    {t.quantity}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {byCategory.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24">
          <Wrench size={36} className="mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No tools in inventory yet</p>
        </div>
      )}
    </div>
  )
}
