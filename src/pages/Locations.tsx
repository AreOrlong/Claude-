import { useState } from 'react'
import { MapPin, Plus, Edit, Trash2, Package } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { StatusBadge } from '@/components/StatusBadge'
import { getCategoryMeta } from '@/utils/categories'
import { cn } from '@/lib/utils'
import type { StorageLocation } from '@/types'

function LocationDialog({ location, onClose }: { location?: StorageLocation; onClose: () => void }) {
  const { addLocation, updateLocation } = useStore()
  const [form, setForm] = useState({ name: location?.name ?? '', description: location?.description ?? '', cabinet: location?.cabinet ?? '', row: location?.row ?? '', capacity: location?.capacity ?? 20 })
  const f = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((s) => ({ ...s, [k]: v }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = { name: form.name, description: form.description || undefined, cabinet: form.cabinet || undefined, row: form.row || undefined, capacity: form.capacity }
    if (location) updateLocation(location.id, data)
    else addLocation(data)
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>{location ? 'Edit Location' : 'Add Location'}</DialogTitle></DialogHeader>
        <form id="loc-form" onSubmit={handleSubmit}>
          <div className="space-y-3 px-6 py-4">
            <div className="space-y-1.5"><Label>Name *</Label><Input required placeholder="Cabinet A" value={form.name} onChange={(e) => f('name', e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Description</Label><Input placeholder="Near CNC-1" value={form.description} onChange={(e) => f('description', e.target.value)} /></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5"><Label>Cabinet</Label><Input placeholder="A" value={form.cabinet} onChange={(e) => f('cabinet', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Row</Label><Input placeholder="1" value={form.row} onChange={(e) => f('row', e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Capacity</Label><Input type="number" min={1} value={form.capacity} onChange={(e) => f('capacity', parseInt(e.target.value) || 1)} /></div>
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="loc-form">{location ? 'Save' : 'Add Location'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function Locations() {
  const { locations, tools, navigate, deleteLocation } = useStore()
  const [showModal, setShowModal]   = useState(false)
  const [editing, setEditing]       = useState<StorageLocation | undefined>()
  const [deleteId, setDeleteId]     = useState<string | null>(null)

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{locations.length} location{locations.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => { setEditing(undefined); setShowModal(true) }} className="gap-1.5">
          <Plus size={14} /> Add Location
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {locations.map((loc) => {
          const locTools = tools.filter((t) => t.locationId === loc.id)
          const utilPct  = Math.min(100, Math.round((locTools.length / loc.capacity) * 100))
          const progressClass = utilPct >= 90 ? 'bg-rose-500' : utilPct >= 70 ? 'bg-amber-500' : 'bg-primary'

          return (
            <Card key={loc.id} className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
                      <MapPin size={16} className="text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{loc.name}</CardTitle>
                      {loc.description && <p className="text-[11px] text-muted-foreground mt-0.5">{loc.description}</p>}
                    </div>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(loc); setShowModal(true) }}><Edit size={12} /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive" onClick={() => setDeleteId(loc.id)}><Trash2 size={12} /></Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pb-4">
                {(loc.cabinet || loc.row) && (
                  <div className="flex gap-1.5">
                    {loc.cabinet && <span className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">Cabinet {loc.cabinet}</span>}
                    {loc.row && <span className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">Row {loc.row}</span>}
                  </div>
                )}

                <div>
                  <div className="mb-1.5 flex justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-muted-foreground"><Package size={10} /> {locTools.length} / {loc.capacity} slots</span>
                    <span className={cn('font-medium', utilPct >= 90 ? 'text-rose-400' : utilPct >= 70 ? 'text-amber-400' : 'text-primary')}>{utilPct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className={cn('h-full rounded-full transition-all', progressClass)} style={{ width: `${utilPct}%` }} />
                  </div>
                </div>

                {locTools.length > 0 ? (
                  <div className="space-y-1">
                    {locTools.slice(0, 4).map((t) => {
                      const m = getCategoryMeta(t.category)
                      return (
                        <button key={t.id} onClick={() => navigate('tool-detail', t.id)} className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent">
                          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', m.color.replace('text-', 'bg-'))} />
                          <span className="flex-1 truncate text-xs text-foreground group-hover:text-primary transition-colors">{t.name}</span>
                          <StatusBadge status={t.status} size="sm" />
                        </button>
                      )
                    })}
                    {locTools.length > 4 && <p className="pl-2 text-[11px] text-muted-foreground">+{locTools.length - 4} more</p>}
                  </div>
                ) : (
                  <p className="py-2 text-center text-xs text-muted-foreground/60">Empty</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {locations.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-24">
          <MapPin size={36} className="mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No storage locations defined</p>
          <Button variant="link" onClick={() => setShowModal(true)}>Add your first location</Button>
        </div>
      )}

      {showModal && <LocationDialog location={editing} onClose={() => { setShowModal(false); setEditing(undefined) }} />}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Location?</DialogTitle></DialogHeader>
          <p className="px-6 py-2 text-sm text-muted-foreground">Tools here will remain in inventory but become unassigned.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { deleteLocation(deleteId!); setDeleteId(null) }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
