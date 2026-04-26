import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { CATEGORY_META } from '@/utils/categories'
import type { Tool, ToolCategory, ToolStatus, ToolCondition } from '@/types'

type FormData = {
  name: string; partNumber: string; serialNumber: string; category: ToolCategory
  subcategory: string; manufacturer: string; locationId: string; status: ToolStatus
  condition: ToolCondition; quantity: number; minQuantity: number; notes: string
  specs: { key: string; value: string }[]
}

export function ToolModal({ tool, onClose }: { tool?: Tool; onClose: () => void }) {
  const { locations, addTool, updateTool } = useStore()
  const isEdit = !!tool
  const specEntries = tool ? Object.entries(tool.specs).map(([key, value]) => ({ key, value })) : [{ key: '', value: '' }]

  const [form, setForm] = useState<FormData>({
    name: tool?.name ?? '', partNumber: tool?.partNumber ?? '', serialNumber: tool?.serialNumber ?? '',
    category: tool?.category ?? 'milling', subcategory: tool?.subcategory ?? '',
    manufacturer: tool?.manufacturer ?? '', locationId: tool?.locationId ?? (locations[0]?.id ?? ''),
    status: tool?.status ?? 'available', condition: tool?.condition ?? 'new',
    quantity: tool?.quantity ?? 1, minQuantity: tool?.minQuantity ?? 1,
    notes: tool?.notes ?? '', specs: specEntries,
  })

  const f = <K extends keyof FormData>(k: K, v: FormData[K]) => setForm((s) => ({ ...s, [k]: v }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const specs = Object.fromEntries(form.specs.filter((s) => s.key.trim()).map((s) => [s.key.trim(), s.value.trim()]))
    const data = { name: form.name, partNumber: form.partNumber, serialNumber: form.serialNumber || undefined,
      category: form.category, subcategory: form.subcategory || undefined, manufacturer: form.manufacturer || undefined,
      locationId: form.locationId, status: form.status, condition: form.condition,
      quantity: form.quantity, minQuantity: form.minQuantity, notes: form.notes || undefined,
      specs, lastUsed: tool?.lastUsed }
    if (isEdit && tool) updateTool(tool.id, data)
    else addTool(data)
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Tool' : 'Add New Tool'}</DialogTitle>
          <DialogDescription>Fill in the tool details below</DialogDescription>
        </DialogHeader>

        <form id="tool-form" onSubmit={handleSubmit}>
          <div className="max-h-[60vh] overflow-y-auto px-6 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">Tool Name *</Label>
                <Input id="name" required value={form.name} onChange={(e) => f('name', e.target.value)} placeholder="Carbide End Mill 12mm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pn">Part Number *</Label>
                <Input id="pn" required className="font-mono" value={form.partNumber} onChange={(e) => f('partNumber', e.target.value)} placeholder="EM-4F-12-C" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Serial Number</Label>
                <Input className="font-mono" value={form.serialNumber} onChange={(e) => f('serialNumber', e.target.value)} placeholder="Optional" />
              </div>
              <div className="space-y-1.5">
                <Label>Manufacturer</Label>
                <Input value={form.manufacturer} onChange={(e) => f('manufacturer', e.target.value)} placeholder="Sandvik, Mitutoyo…" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category *</Label>
                <Select value={form.category} onValueChange={(v) => f('category', v as ToolCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORY_META.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Subcategory</Label>
                <Input value={form.subcategory} onChange={(e) => f('subcategory', e.target.value)} placeholder="End Mill, Insert…" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Location *</Label>
                <Select value={form.locationId} onValueChange={(v) => f('locationId', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => f('status', v as ToolStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in-use">In Use</SelectItem>
                    <SelectItem value="checked-out">Checked Out</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Condition</Label>
                <Select value={form.condition} onValueChange={(v) => f('condition', v as ToolCondition)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="worn">Worn</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Quantity *</Label>
                <Input type="number" min={0} value={form.quantity} onChange={(e) => f('quantity', parseInt(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label>Min Quantity</Label>
                <Input type="number" min={0} value={form.minQuantity} onChange={(e) => f('minQuantity', parseInt(e.target.value) || 0)} />
              </div>
            </div>

            <Separator />

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Specifications</Label>
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-primary"
                  onClick={() => f('specs', [...form.specs, { key: '', value: '' }])}>
                  <Plus size={12} /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {form.specs.map((spec, i) => (
                  <div key={i} className="flex gap-2">
                    <Input className="w-32 font-mono text-xs" placeholder="key" value={spec.key}
                      onChange={(e) => { const s = [...form.specs]; s[i] = { ...s[i], key: e.target.value }; f('specs', s) }} />
                    <Input className="flex-1 font-mono text-xs" placeholder="value" value={spec.value}
                      onChange={(e) => { const s = [...form.specs]; s[i] = { ...s[i], value: e.target.value }; f('specs', s) }} />
                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => f('specs', form.specs.filter((_, idx) => idx !== i))}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea rows={3} value={form.notes} onChange={(e) => f('notes', e.target.value)} placeholder="Usage notes, maintenance reminders…" />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="tool-form">{isEdit ? 'Save Changes' : 'Add Tool'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
