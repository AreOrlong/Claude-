import { useState, useMemo } from 'react'
import { Search, Plus, LayoutGrid, List, X, SlidersHorizontal } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { ToolCard } from '@/components/ToolCard'
import { ToolModal } from '@/components/ToolModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CATEGORY_META } from '@/utils/categories'
import { cn } from '@/lib/utils'
import type { ToolCategory, ToolStatus } from '@/types'

const STATUS_OPTIONS: { value: ToolStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' }, { value: 'available', label: 'Available' },
  { value: 'in-use', label: 'In Use' }, { value: 'checked-out', label: 'Checked Out' },
  { value: 'maintenance', label: 'Maintenance' }, { value: 'retired', label: 'Retired' },
]

export function Inventory() {
  const { tools, navigate } = useStore()
  const [query, setQuery]                 = useState('')
  const [view, setView]                   = useState<'grid' | 'list'>('grid')
  const [categoryFilter, setCategoryFilter] = useState<ToolCategory | 'all'>('all')
  const [statusFilter, setStatusFilter]   = useState<ToolStatus | 'all'>('all')
  const [showModal, setShowModal]         = useState(false)
  const [showFilters, setShowFilters]     = useState(false)

  const filtered = useMemo(() => tools.filter((t) => {
    const q = query.toLowerCase()
    return (
      (!q || t.name.toLowerCase().includes(q) || t.partNumber.toLowerCase().includes(q) ||
        (t.serialNumber?.toLowerCase().includes(q) ?? false) ||
        (t.manufacturer?.toLowerCase().includes(q) ?? false)) &&
      (categoryFilter === 'all' || t.category === categoryFilter) &&
      (statusFilter === 'all' || t.status === statusFilter)
    )
  }), [tools, query, categoryFilter, statusFilter])

  const hasFilters = categoryFilter !== 'all' || statusFilter !== 'all'

  return (
    <div className="space-y-3 animate-slide-up">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, part #, serial, manufacturer…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-8"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>

        <Button
          variant={showFilters ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setShowFilters((v) => !v)}
          className="gap-1.5 shrink-0"
        >
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Filters</span>
          {hasFilters && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">!</span>}
        </Button>

        <div className="flex items-center rounded-md border border-border bg-card p-0.5">
          <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setView('grid')}>
            <LayoutGrid size={14} />
          </Button>
          <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setView('list')}>
            <List size={14} />
          </Button>
        </div>

        <Button size="sm" onClick={() => setShowModal(true)} className="shrink-0 gap-1.5">
          <Plus size={14} /><span className="hidden sm:inline">Add Tool</span>
        </Button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="space-y-3 rounded-lg border border-border bg-card p-4 animate-fade-in">
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Category</p>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setCategoryFilter('all')} className={cn('rounded-md border px-2.5 py-1 text-xs font-medium transition-colors', categoryFilter === 'all' ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground')}>All</button>
              {CATEGORY_META.map((c) => (
                <button key={c.id} onClick={() => setCategoryFilter(c.id)} className={cn('rounded-md border px-2.5 py-1 text-xs font-medium transition-colors', categoryFilter === c.id ? `${c.bgColor} ${c.borderColor} ${c.color}` : 'border-border text-muted-foreground hover:text-foreground')}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((o) => (
                <button key={o.value} onClick={() => setStatusFilter(o.value)} className={cn('rounded-md border px-2.5 py-1 text-xs font-medium transition-colors', statusFilter === o.value ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground')}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          {hasFilters && (
            <button onClick={() => { setCategoryFilter('all'); setStatusFilter('all') }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Clear all filters
            </button>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">{filtered.length} tool{filtered.length !== 1 ? 's' : ''}</p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <Search size={28} className="mb-3 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">No tools found</p>
          <p className="text-xs text-muted-foreground/60">Try adjusting search or filters</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((t) => <ToolCard key={t.id} tool={t} view="grid" onSelect={(id) => navigate('tools', id)} />)}
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((t) => <ToolCard key={t.id} tool={t} view="list" onSelect={(id) => navigate('tools', id)} />)}
        </div>
      )}

      {showModal && <ToolModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
