import { useState, useMemo } from 'react'
import {
  Search, Plus, X, LogOut, RotateCcw, Wrench, AlertTriangle,
  ChevronRight, MapPin, Package, Settings, Trash2, CheckCircle2,
  ClipboardList, Settings2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet } from '@/components/ui/sheet'
import { StatusBadge, ConditionBadge } from '@/components/StatusBadge'
import { ToolModal } from '@/components/ToolModal'
import { Locations } from '@/pages/Locations'
import { CATEGORY_META, getCategoryMeta, STATUS_STYLES } from '@/utils/categories'
import { getBaselineFeeds, calcRPM, calcFeed } from '@/utils/feedsAndSpeeds'
import { cn } from '@/lib/utils'
import type { Tool, ToolCategory } from '@/types'

// ─── Tool Detail Sheet ───────────────────────────────────────────────────────

function ToolDetailSheet({
  toolId,
  onClose,
  onEdit,
}: {
  toolId: string
  onClose: () => void
  onEdit: () => void
}) {
  const { tools, getLocationById, checkoutTool, returnTool, deleteTool } = useStore()
  const tool = tools.find((t) => t.id === toolId)

  const [action, setAction]                   = useState<'checkout' | 'return' | null>(null)
  const [checkoutName, setCheckoutName]       = useState('')
  const [checkoutPurpose, setCheckoutPurpose] = useState('')
  const [returnName, setReturnName]           = useState('')
  const [done, setDone]                       = useState<'checkout' | 'return' | null>(null)
  const [showDelete, setShowDelete]           = useState(false)

  if (!tool) return null

  const location   = getLocationById(tool.locationId)
  const meta       = getCategoryMeta(tool.category)
  const canCheckout = tool.status === 'available' || tool.status === 'in-use'
  const canReturn   = tool.status === 'checked-out' || tool.status === 'in-use'
  const isLowStock  = tool.quantity <= tool.minQuantity

  // Feeds & speeds — look for diameter in specs
  const fsRows     = getBaselineFeeds(tool.category)
  const rawDia     = tool.specs['Diameter (mm)'] ?? tool.specs['Diameter'] ?? tool.specs['diameter'] ?? ''
  const diameterMm = rawDia ? parseFloat(rawDia) : NaN
  const rawFlutes  = tool.specs['Flutes'] ?? tool.specs['flutes'] ?? tool.specs['Number of Flutes'] ?? ''
  const flutes     = rawFlutes ? parseInt(rawFlutes) : NaN
  const hasFs      = fsRows.length > 0

  function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    if (!checkoutName.trim()) return
    checkoutTool(tool!.id, checkoutName.trim(), checkoutPurpose.trim() || undefined)
    setDone('checkout')
    setAction(null)
  }

  function handleReturn(e: React.FormEvent) {
    e.preventDefault()
    returnTool(tool!.id, returnName.trim() || 'Operator')
    setDone('return')
    setAction(null)
  }

  return (
    <div className="relative flex flex-col h-full">
      {/* Status row */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-muted/20 px-5 py-3">
        <StatusBadge status={tool.status} />
        <ConditionBadge condition={tool.condition} />
        <Badge variant="outline" className={cn('ml-auto text-[10px]', meta.color)}>{meta.label}</Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5 pb-20">
        {/* Success banner */}
        {done && (
          <div className={cn('flex items-center gap-2 rounded-xl border p-3',
            done === 'checkout' ? 'border-amber-500/20 bg-amber-500/10' : 'border-emerald-500/20 bg-emerald-500/10')}>
            <CheckCircle2 size={15} className={done === 'checkout' ? 'text-amber-400' : 'text-emerald-400'} />
            <p className="text-sm font-medium text-foreground">
              {done === 'checkout' ? `Checked out to ${checkoutName}` : 'Returned to inventory'}
            </p>
            <button onClick={() => setDone(null)} className="ml-auto text-muted-foreground hover:text-foreground"><X size={13} /></button>
          </div>
        )}

        {/* Primary CTA — checkout */}
        {!done && canCheckout && (
          action === 'checkout' ? (
            <form onSubmit={handleCheckout} className="space-y-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-400">
                <LogOut size={14} /> Who is taking this tool?
              </p>
              <Input required autoFocus placeholder="Your name *" value={checkoutName} onChange={(e) => setCheckoutName(e.target.value)} />
              <Input placeholder="What's it for? (optional)" value={checkoutPurpose} onChange={(e) => setCheckoutPurpose(e.target.value)} />
              <div className="flex gap-2">
                <Button type="submit" variant="warning" className="flex-1 h-11">Confirm Check Out</Button>
                <Button type="button" variant="outline" onClick={() => setAction(null)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <Button className="w-full h-12 gap-2 text-sm" variant="warning" onClick={() => setAction('checkout')}>
              <LogOut size={16} /> Check Out This Tool
            </Button>
          )
        )}

        {/* Primary CTA — return */}
        {!done && canReturn && (
          action === 'return' ? (
            <form onSubmit={handleReturn} className="space-y-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                <RotateCcw size={14} /> Returning this tool
              </p>
              <Input autoFocus placeholder="Your name (optional)" value={returnName} onChange={(e) => setReturnName(e.target.value)} />
              <div className="flex gap-2">
                <Button type="submit" variant="success" className="flex-1 h-11">Confirm Return</Button>
                <Button type="button" variant="outline" onClick={() => setAction(null)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <Button className="w-full h-12 gap-2 text-sm" variant="success" onClick={() => setAction('return')}>
              <RotateCcw size={16} /> Return This Tool
            </Button>
          )
        )}

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Location</p>
            <p className="flex items-center gap-1 text-sm text-foreground"><MapPin size={12} className="text-muted-foreground" />{location?.name ?? '—'}</p>
          </div>
          <div className={cn('rounded-lg border p-3', isLowStock ? 'border-amber-500/30 bg-amber-500/5' : 'border-border bg-muted/30')}>
            <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Quantity</p>
            <p className={cn('flex items-center gap-1 text-sm', isLowStock ? 'font-bold text-amber-400' : 'text-foreground')}>
              <Package size={12} className={isLowStock ? 'text-amber-400' : 'text-muted-foreground'} />
              {tool.quantity}
              <span className="text-xs text-muted-foreground font-normal">(min {tool.minQuantity})</span>
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Part #</p>
            <p className="font-mono text-sm text-foreground">{tool.partNumber}</p>
          </div>
          {tool.manufacturer && (
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Manufacturer</p>
              <p className="text-sm text-foreground">{tool.manufacturer}</p>
            </div>
          )}
        </div>

        {/* Feeds & Speeds */}
        {hasFs && (
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Feeds &amp; Speeds — Baseline
            </p>
            {!isNaN(diameterMm) && (
              <p className="mb-2 text-xs text-muted-foreground">
                {diameterMm}mm diameter · {!isNaN(flutes) ? `${flutes} flutes` : 'flutes unknown'}
              </p>
            )}
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                    <th className="px-3 py-2 text-left font-medium">Material</th>
                    <th className="px-3 py-2 text-right font-medium">SFM</th>
                    {!isNaN(diameterMm) && <th className="px-3 py-2 text-right font-medium">RPM</th>}
                    {!isNaN(diameterMm) && !isNaN(flutes) && <th className="px-3 py-2 text-right font-medium">Feed IPM</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {fsRows.map((row) => {
                    const rpm  = !isNaN(diameterMm) ? calcRPM(row.sfm, diameterMm) : null
                    const feed = rpm && !isNaN(flutes) ? calcFeed(rpm, row.chipLoad, flutes) : null
                    return (
                      <tr key={row.material} className="transition-colors hover:bg-accent/30">
                        <td className="px-3 py-2 text-foreground">{row.material}</td>
                        <td className="px-3 py-2 text-right font-mono text-primary">{row.sfm}</td>
                        {!isNaN(diameterMm) && <td className="px-3 py-2 text-right font-mono">{rpm?.toLocaleString()}</td>}
                        {!isNaN(diameterMm) && !isNaN(flutes) && <td className="px-3 py-2 text-right font-mono">{feed}</td>}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground/60">
              Starting values — carbide tooling. Adjust for depth/width of cut and coolant.
            </p>
          </div>
        )}

        {/* Notes */}
        {tool.notes && (
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Notes</p>
            <p className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">{tool.notes}</p>
          </div>
        )}

        {/* Specs */}
        {Object.keys(tool.specs).length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Specifications</p>
            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
              {Object.entries(tool.specs).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs text-muted-foreground">{k}</span>
                  <span className="font-mono text-xs text-foreground">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checkout history */}
        {tool.checkoutHistory.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <ClipboardList size={10} className="inline mr-1" />Recent History
            </p>
            <div className="space-y-1">
              {[...tool.checkoutHistory].reverse().slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-md px-3 py-2 text-xs hover:bg-accent/30">
                  <div>
                    <span className="font-medium text-foreground">{entry.checkedOutBy}</span>
                    {entry.purpose && <span className="ml-2 text-muted-foreground">— {entry.purpose}</span>}
                  </div>
                  <span className="shrink-0 text-muted-foreground/60">
                    {formatDistanceToNow(new Date(entry.checkedOutAt), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 border-t border-border bg-card p-4">
        <Button variant="outline" className="flex-1 gap-1.5" onClick={onEdit}>
          <Settings size={14} /> Edit Tool
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 text-destructive/50 hover:border-destructive/40 hover:text-destructive"
          onClick={() => setShowDelete(true)}
        >
          <Trash2 size={14} />
        </Button>
      </div>

      {/* Delete confirm overlay */}
      {showDelete && (
        <div
          className="absolute inset-0 z-10 flex items-end bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowDelete(false)}
        >
          <div
            className="w-full rounded-2xl border border-border bg-card p-5 space-y-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-semibold text-foreground">Delete "{tool.name}"?</p>
            <p className="text-sm text-muted-foreground">This permanently removes the tool from inventory.</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowDelete(false)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={() => { deleteTool(tool!.id); onClose() }}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Tools Page ──────────────────────────────────────────────────────────

export function Tools() {
  const { tools } = useStore()

  const [query, setQuery]           = useState('')
  const [catFilter, setCatFilter]   = useState<ToolCategory | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingTool, setEditingTool]   = useState<Tool | undefined>()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showLocations, setShowLocations] = useState(false)

  // Quick inline checkout/return — stores which tool row has the action expanded
  const [quickAction, setQuickAction] = useState<{ toolId: string; type: 'checkout' | 'return' } | null>(null)
  const [quickName, setQuickName]   = useState('')
  const [quickPurpose, setQuickPurpose] = useState('')
  const { checkoutTool, returnTool } = useStore()

  const available   = tools.filter((t) => t.status === 'available').length
  const checkedOut  = tools.filter((t) => t.status === 'checked-out' || t.status === 'in-use').length
  const lowStockCnt = tools.filter((t) => t.quantity <= t.minQuantity && t.status !== 'retired').length

  const filtered = useMemo(() => tools.filter((t) => {
    const q = query.toLowerCase()
    return (
      (!q || t.name.toLowerCase().includes(q) || t.partNumber.toLowerCase().includes(q) || (t.manufacturer?.toLowerCase().includes(q) ?? false)) &&
      (catFilter === 'all' || t.category === catFilter)
    )
  }), [tools, query, catFilter])

  function openDetail(id: string) {
    setQuickAction(null)
    setSelectedId(id)
  }

  function triggerQuick(tool: Tool, type: 'checkout' | 'return') {
    setQuickName('')
    setQuickPurpose('')
    setQuickAction({ toolId: tool.id, type })
  }

  function submitQuick(e: React.FormEvent) {
    e.preventDefault()
    if (!quickAction) return
    if (quickAction.type === 'checkout') {
      if (!quickName.trim()) return
      checkoutTool(quickAction.toolId, quickName.trim(), quickPurpose.trim() || undefined)
    } else {
      returnTool(quickAction.toolId, quickName.trim() || 'Operator')
    }
    setQuickAction(null)
    setQuickName('')
    setQuickPurpose('')
  }

  return (
    <div className="space-y-3 animate-slide-up">
      {/* Stats + Add button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{available} Available
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />{checkedOut} Out
          </span>
          {lowStockCnt > 0 && (
            <span className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-400">
              <AlertTriangle size={11} />{lowStockCnt} Low
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowLocations(true)}>
            <Settings2 size={14} /><span className="hidden sm:inline">Storage</span>
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => { setEditingTool(undefined); setShowAddModal(true) }}>
            <Plus size={14} /> Add Tool
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, part number, manufacturer…"
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

      {/* Category chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setCatFilter('all')}
          className={cn('shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
            catFilter === 'all' ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground')}
        >All</button>
        {CATEGORY_META.map((c) => (
          <button
            key={c.id}
            onClick={() => setCatFilter(c.id)}
            className={cn('shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              catFilter === c.id ? `${c.bgColor} ${c.borderColor} ${c.color}` : 'border-border text-muted-foreground hover:text-foreground')}
          >{c.label}</button>
        ))}
      </div>

      {/* Tool list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
          <Wrench size={28} className="mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No tools found</p>
        </div>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {filtered.map((tool) => {
            const meta       = getCategoryMeta(tool.category)
            const canCheckout = tool.status === 'available' || tool.status === 'in-use'
            const canReturn   = tool.status === 'checked-out' || tool.status === 'in-use'
            const isLow       = tool.quantity <= tool.minQuantity
            const isExpanded  = quickAction?.toolId === tool.id

            return (
              <div key={tool.id}>
                {/* Main row */}
                <div className={cn('flex items-center gap-3 px-4 py-3 transition-colors', isExpanded && 'bg-accent/20')}>
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', STATUS_STYLES[tool.status]?.dot ?? 'bg-muted-foreground')} />

                  <button className="min-w-0 flex-1 text-left" onClick={() => openDetail(tool.id)}>
                    <p className="truncate text-sm font-medium text-foreground hover:text-primary transition-colors">{tool.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {tool.partNumber}
                      {isLow && <span className="ml-2 text-amber-400">⚠ low stock</span>}
                      <span className={cn('ml-2', meta.color)}>{meta.label}</span>
                    </p>
                  </button>

                  {/* Quick action button */}
                  {canReturn ? (
                    <Button
                      size="sm" variant="success"
                      className="shrink-0 h-8 gap-1 text-xs"
                      onClick={() => isExpanded && quickAction?.type === 'return' ? setQuickAction(null) : triggerQuick(tool, 'return')}
                    >
                      <RotateCcw size={12} /> Return
                    </Button>
                  ) : canCheckout ? (
                    <Button
                      size="sm" variant="warning"
                      className="shrink-0 h-8 gap-1 text-xs"
                      onClick={() => isExpanded && quickAction?.type === 'checkout' ? setQuickAction(null) : triggerQuick(tool, 'checkout')}
                    >
                      <LogOut size={12} /> Check Out
                    </Button>
                  ) : (
                    <StatusBadge status={tool.status} size="sm" />
                  )}

                  <button onClick={() => openDetail(tool.id)} className="shrink-0 p-1 text-muted-foreground hover:text-foreground">
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Inline action form */}
                {isExpanded && (
                  <form onSubmit={submitQuick} className={cn(
                    'border-t px-4 py-3 space-y-2 animate-slide-in',
                    quickAction?.type === 'checkout' ? 'border-amber-500/20 bg-amber-500/5' : 'border-emerald-500/20 bg-emerald-500/5'
                  )}>
                    <p className={cn('text-xs font-semibold flex items-center gap-1.5',
                      quickAction?.type === 'checkout' ? 'text-amber-400' : 'text-emerald-400')}>
                      {quickAction?.type === 'checkout' ? <><LogOut size={11} /> Checking out — who's taking it?</> : <><RotateCcw size={11} /> Returning to inventory</>}
                    </p>
                    <div className="flex gap-2">
                      <Input
                        required={quickAction?.type === 'checkout'}
                        autoFocus
                        placeholder={quickAction?.type === 'checkout' ? 'Your name *' : 'Your name (optional)'}
                        value={quickName}
                        onChange={(e) => setQuickName(e.target.value)}
                        className="h-8 text-sm"
                      />
                      {quickAction?.type === 'checkout' && (
                        <Input
                          placeholder="Purpose (optional)"
                          value={quickPurpose}
                          onChange={(e) => setQuickPurpose(e.target.value)}
                          className="h-8 text-sm"
                        />
                      )}
                      <Button
                        type="submit" size="sm"
                        variant={quickAction?.type === 'checkout' ? 'warning' : 'success'}
                        className="h-8 shrink-0"
                      >Done</Button>
                      <Button type="button" size="sm" variant="ghost" className="h-8 shrink-0" onClick={() => setQuickAction(null)}>
                        <X size={13} />
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Detail sheet */}
      <Sheet
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        title={tools.find((t) => t.id === selectedId)?.name ?? ''}
      >
        {selectedId && (
          <ToolDetailSheet
            toolId={selectedId}
            onClose={() => setSelectedId(null)}
            onEdit={() => {
              const t = tools.find((x) => x.id === selectedId)
              if (t) { setEditingTool(t); setShowAddModal(true) }
            }}
          />
        )}
      </Sheet>

      {/* Storage locations sheet */}
      <Sheet open={showLocations} onClose={() => setShowLocations(false)} title="Storage Locations">
        <div className="p-4">
          <Locations />
        </div>
      </Sheet>

      {/* Add / Edit tool modal */}
      {showAddModal && (
        <ToolModal
          tool={editingTool}
          onClose={() => { setShowAddModal(false); setEditingTool(undefined) }}
        />
      )}
    </div>
  )
}
