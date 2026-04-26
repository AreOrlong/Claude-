import { useState } from 'react'
import { ArrowLeft, Edit, Trash2, LogOut, RotateCcw, Wrench, MapPin, Calendar, Hash, Package, AlertTriangle, Clock } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { useStore } from '@/store/useStore'
import { StatusBadge, ConditionBadge } from '@/components/StatusBadge'
import { QRDisplay } from '@/components/QRDisplay'
import { ToolModal } from '@/components/ToolModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { getCategoryMeta } from '@/utils/categories'
import { cn } from '@/lib/utils'

export function ToolDetail() {
  const { selectedToolId, getToolById, getLocationById, navigate, deleteTool, checkoutTool, returnTool } = useStore()
  const tool = getToolById(selectedToolId ?? '')

  const [showEdit, setShowEdit]     = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [showReturn, setShowReturn] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [checkoutName, setCheckoutName]   = useState('')
  const [checkoutPurpose, setCheckoutPurpose] = useState('')
  const [returnName, setReturnName] = useState('')

  if (!tool) return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <Wrench size={40} className="mb-4 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">Tool not found</p>
      <Button variant="link" onClick={() => navigate('tools')}>Back to inventory</Button>
    </div>
  )

  const location     = getLocationById(tool.locationId)
  const meta         = getCategoryMeta(tool.category)
  const canCheckout  = tool.status === 'available' || tool.status === 'in-use'
  const canReturn    = tool.status === 'checked-out' || tool.status === 'in-use'
  const openCheckout = tool.checkoutHistory.find((e) => !e.returnedAt)

  function handleDelete() { deleteTool(tool!.id); navigate('tools') }

  function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    if (!checkoutName.trim()) return
    checkoutTool(tool!.id, checkoutName.trim(), checkoutPurpose.trim() || undefined)
    setShowCheckout(false); setCheckoutName(''); setCheckoutPurpose('')
  }

  function handleReturn(e: React.FormEvent) {
    e.preventDefault()
    returnTool(tool!.id, returnName.trim() || 'Operator')
    setShowReturn(false); setReturnName('')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4 animate-slide-up">
      {/* Breadcrumb */}
      <div className="hidden items-center gap-2 md:flex">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => navigate('tools')}>
          <ArrowLeft size={14} /> Inventory
        </Button>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm text-foreground">{tool.name}</span>
      </div>

      {/* Header card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={cn('text-xs', meta.color)}>{meta.label}</Badge>
                {tool.subcategory && <span className="text-xs text-muted-foreground">{tool.subcategory}</span>}
              </div>
              <h1 className="text-xl font-bold leading-tight text-foreground">{tool.name}</h1>
              <p className="font-mono text-sm text-muted-foreground mt-0.5">{tool.partNumber}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}><Edit size={13} /> Edit</Button>
              <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setConfirmDelete(true)}>
                <Trash2 size={13} />
              </Button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={tool.status} />
            <ConditionBadge condition={tool.condition} />
            {tool.quantity <= tool.minQuantity && (
              <Badge variant="warning" className="gap-1"><AlertTriangle size={10} /> Low Stock</Badge>
            )}
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: <MapPin size={12} />, label: 'Location', value: location?.name ?? '—' },
              { icon: <Package size={12} />, label: 'Quantity', value: `${tool.quantity} / min ${tool.minQuantity}` },
              { icon: <Hash size={12} />, label: 'Serial', value: tool.serialNumber ?? '—', mono: true },
              { icon: <Wrench size={12} />, label: 'Manufacturer', value: tool.manufacturer ?? '—' },
            ].map(({ icon, label, value, mono }) => (
              <div key={label}>
                <p className="mb-0.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{icon}{label}</p>
                <p className={cn('text-sm text-foreground', mono && 'font-mono')}>{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Main tabs */}
        <div className="md:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="specs">Specs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardContent className="p-5 space-y-4">
                  {tool.notes && (
                    <div>
                      <p className="mb-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">Notes</p>
                      <p className="text-sm leading-relaxed text-foreground/80">{tool.notes}</p>
                    </div>
                  )}
                  <div>
                    <p className="mb-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">Timeline</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between"><span className="flex items-center gap-1.5 text-muted-foreground"><Calendar size={11} /> Added</span><span className="font-mono text-foreground">{format(new Date(tool.addedDate), 'MMM d, yyyy')}</span></div>
                      {tool.lastUsed && <div className="flex justify-between"><span className="flex items-center gap-1.5 text-muted-foreground"><Clock size={11} /> Last used</span><span className="font-mono text-foreground">{formatDistanceToNow(new Date(tool.lastUsed), { addSuffix: true })}</span></div>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardContent className="p-5 space-y-4">
                  {tool.checkoutHistory.length > 0 && (
                    <div>
                      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Checkout History</p>
                      <div className="space-y-2">
                        {[...tool.checkoutHistory].reverse().map((e) => (
                          <div key={e.id} className="flex gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                            <div className={cn('mt-0.5 h-2 w-2 shrink-0 rounded-full', e.returnedAt ? 'bg-emerald-400' : 'bg-amber-400')} />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs font-medium text-foreground">{e.checkedOutBy}</span>
                                {e.purpose && <span className="text-[11px] text-muted-foreground">— {e.purpose}</span>}
                              </div>
                              <div className="mt-0.5 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1"><LogOut size={9} />{format(new Date(e.checkedOutAt), 'MMM d, HH:mm')}</span>
                                {e.returnedAt ? <span className="flex items-center gap-1"><RotateCcw size={9} />{format(new Date(e.returnedAt), 'MMM d, HH:mm')}</span> : <span className="text-amber-500">Not returned</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {tool.maintenanceHistory.length > 0 && (
                    <div>
                      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">Maintenance</p>
                      <div className="space-y-2">
                        {[...tool.maintenanceHistory].reverse().map((e) => (
                          <div key={e.id} className="flex gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                            <Wrench size={12} className="mt-0.5 shrink-0 text-blue-400" />
                            <div>
                              <div className="flex items-center gap-2"><span className="text-xs font-medium capitalize text-foreground">{e.type}</span><span className="text-[11px] text-muted-foreground">by {e.performedBy}</span></div>
                              <p className="mt-0.5 text-xs text-muted-foreground">{e.notes}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {tool.checkoutHistory.length === 0 && tool.maintenanceHistory.length === 0 && (
                    <p className="py-6 text-center text-sm text-muted-foreground">No history yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specs">
              <Card>
                <CardContent className="p-5">
                  {Object.keys(tool.specs).length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">No specifications recorded</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                      {Object.entries(tool.specs).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between border-b border-border pb-2">
                          <span className="text-xs capitalize text-muted-foreground">{k.replace(/_/g, ' ')}</span>
                          <span className="font-mono text-xs text-foreground">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {canCheckout && (
                <Button variant="warning" className="w-full" onClick={() => setShowCheckout(true)}>
                  <LogOut size={14} /> Check Out
                </Button>
              )}
              {canReturn && (
                <Button variant="success" className="w-full" onClick={() => setShowReturn(true)}>
                  <RotateCcw size={14} /> Return Tool
                </Button>
              )}
              {!canCheckout && !canReturn && (
                <p className="py-2 text-center text-xs text-muted-foreground">No actions available for current status</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">QR Code</CardTitle></CardHeader>
            <CardContent>
              <QRDisplay toolId={tool.id} toolName={tool.name} partNumber={tool.partNumber} size={130} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Checkout dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Check Out Tool</DialogTitle></DialogHeader>
          <form id="checkout-form" onSubmit={handleCheckout}>
            <div className="space-y-3 px-6 py-4">
              <div className="space-y-1.5"><label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Your Name *</label>
                <Input required placeholder="Name" value={checkoutName} onChange={(e) => setCheckoutName(e.target.value)} /></div>
              <div className="space-y-1.5"><label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Purpose</label>
                <Input placeholder="Optional" value={checkoutPurpose} onChange={(e) => setCheckoutPurpose(e.target.value)} /></div>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckout(false)}>Cancel</Button>
            <Button type="submit" form="checkout-form" variant="warning">Confirm Checkout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return dialog */}
      <Dialog open={showReturn} onOpenChange={setShowReturn}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Return Tool</DialogTitle></DialogHeader>
          <form id="return-form" onSubmit={handleReturn}>
            <div className="space-y-3 px-6 py-4">
              <p className="text-sm text-muted-foreground">Returning from: <span className="text-foreground font-medium">{openCheckout?.checkedOutBy ?? 'Unknown'}</span></p>
              <div className="space-y-1.5"><label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Returned By</label>
                <Input placeholder="Your name (optional)" value={returnName} onChange={(e) => setReturnName(e.target.value)} /></div>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturn(false)}>Cancel</Button>
            <Button type="submit" form="return-form" variant="success">Confirm Return</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Tool?</DialogTitle></DialogHeader>
          <p className="px-6 py-2 text-sm text-muted-foreground">This will permanently delete <span className="font-medium text-foreground">{tool.name}</span>. This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showEdit && <ToolModal tool={tool} onClose={() => setShowEdit(false)} />}
    </div>
  )
}
