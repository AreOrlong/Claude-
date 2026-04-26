import { useRef, useState, useEffect, useCallback } from 'react'
import { QrCode, Camera, CameraOff, CheckCircle2, LogOut, RotateCcw, ArrowRight, X, RefreshCw } from 'lucide-react'
import jsQR from 'jsqr'
import { useStore } from '@/store/useStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StatusBadge, ConditionBadge } from '@/components/StatusBadge'
import { getCategoryMeta } from '@/utils/categories'
import { cn } from '@/lib/utils'
import type { Tool } from '@/types'

type ScanState = 'idle' | 'scanning' | 'found' | 'not-found' | 'error'

export function ScanPage() {
  const { getToolById, getLocationById, checkoutTool, returnTool, addScanLog, navigate } = useStore()

  const videoRef  = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef    = useRef<number | null>(null)
  const lastScan  = useRef(0)

  const [cameraActive, setCameraActive] = useState(false)
  const [scanState, setScanState]       = useState<ScanState>('idle')
  const [scannedTool, setScannedTool]   = useState<Tool | null>(null)
  const [errorMsg, setErrorMsg]         = useState('')
  const [checkoutName, setCheckoutName] = useState('')
  const [checkoutPurpose, setCheckoutPurpose] = useState('')
  const [returnName, setReturnName]     = useState('')
  const [actionDone, setActionDone]     = useState<'checkout' | 'return' | null>(null)

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraActive(false)
  }, [])

  useEffect(() => () => stopCamera(), [stopCamera])

  const startCamera = useCallback(async () => {
    setScanState('scanning'); setScannedTool(null); setActionDone(null); setErrorMsg('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 } } })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play() }
      setCameraActive(true)
    } catch {
      setScanState('error'); setErrorMsg('Camera access denied. Please allow camera permissions.')
    }
  }, [])

  const scanFrame = useCallback(() => {
    const video = videoRef.current; const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) { rafRef.current = requestAnimationFrame(scanFrame); return }
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    canvas.width = video.videoWidth; canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)
    const now = Date.now()
    if (now - lastScan.current < 200) { rafRef.current = requestAnimationFrame(scanFrame); return }
    lastScan.current = now
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' })
    if (code) {
      let toolId: string | null = null
      try { const p = JSON.parse(code.data) as { toolId?: string }; toolId = p.toolId ?? null } catch { toolId = code.data.startsWith('tool-') ? code.data : null }
      if (toolId) {
        const found = getToolById(toolId); stopCamera()
        if (found) {
          setScannedTool(found); setScanState('found')
          addScanLog({ toolId: found.id, toolName: found.name, action: 'view', timestamp: new Date().toISOString(), performedBy: 'Scanner' })
        } else { setScanState('not-found'); setErrorMsg(`ID "${toolId}" not found in inventory.`) }
        return
      }
    }
    rafRef.current = requestAnimationFrame(scanFrame)
  }, [getToolById, stopCamera, addScanLog])

  useEffect(() => { if (cameraActive) { rafRef.current = requestAnimationFrame(scanFrame) } return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) } }, [cameraActive, scanFrame])

  function reset() { setScannedTool(null); setScanState('idle'); setActionDone(null); setCheckoutName(''); setCheckoutPurpose(''); setReturnName(''); setErrorMsg('') }

  function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    if (!scannedTool || !checkoutName.trim()) return
    checkoutTool(scannedTool.id, checkoutName.trim(), checkoutPurpose.trim() || undefined)
    setActionDone('checkout')
    const updated = getToolById(scannedTool.id); if (updated) setScannedTool(updated)
  }

  function handleReturn(e: React.FormEvent) {
    e.preventDefault()
    if (!scannedTool) return
    returnTool(scannedTool.id, returnName.trim() || 'Operator')
    setActionDone('return')
    const updated = getToolById(scannedTool.id); if (updated) setScannedTool(updated)
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 animate-slide-up">
      {/* Camera viewport */}
      <Card className="overflow-hidden">
        <div className="relative aspect-video bg-muted/50">
          <video ref={videoRef} className={cn('h-full w-full object-cover', !cameraActive && 'hidden')} muted playsInline />
          <canvas ref={canvasRef} className="hidden" />

          {cameraActive && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-48 w-48">
                  {['tl','tr','bl','br'].map((c) => (
                    <span key={c} className={cn('absolute h-8 w-8 border-2 border-primary', c==='tl'&&'left-0 top-0 border-b-0 border-r-0 rounded-tl', c==='tr'&&'right-0 top-0 border-b-0 border-l-0 rounded-tr', c==='bl'&&'bottom-0 left-0 border-t-0 border-r-0 rounded-bl', c==='br'&&'bottom-0 right-0 border-t-0 border-l-0 rounded-br')} />
                  ))}
                  <div className="absolute inset-x-0 h-px animate-scan-line bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />
                </div>
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                <Badge variant="outline" className="border-primary/30 bg-background/80 text-primary backdrop-blur-sm">Scanning…</Badge>
              </div>
              <Button variant="outline" size="sm" className="pointer-events-auto absolute right-3 top-3 h-8 gap-1.5 border-border/60 bg-background/80 backdrop-blur-sm text-xs" onClick={() => { stopCamera(); reset() }}>
                <X size={12} /> Stop
              </Button>
            </div>
          )}

          {!cameraActive && scanState === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card">
                <QrCode size={26} className="text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Ready to Scan</p>
                <p className="mt-1 text-sm text-muted-foreground">Point camera at a tool's QR code</p>
              </div>
              <Button onClick={startCamera} className="gap-2 animate-pulse-glow"><Camera size={16} /> Start Scanner</Button>
            </div>
          )}

          {(scanState === 'error' || scanState === 'not-found') && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10"><CameraOff size={22} className="text-destructive" /></div>
              <div><p className="text-sm font-semibold text-destructive">{scanState === 'error' ? 'Camera Error' : 'Not Found'}</p><p className="mt-1 text-xs text-muted-foreground">{errorMsg}</p></div>
              <Button variant="outline" size="sm" onClick={() => { reset(); startCamera() }}><RefreshCw size={13} /> Try Again</Button>
            </div>
          )}
        </div>
      </Card>

      {/* Scan result */}
      {scannedTool && scanState === 'found' && (
        <Card className="animate-slide-up">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <Badge variant="outline" className={cn('mb-2 text-[10px]', getCategoryMeta(scannedTool.category).color)}>{getCategoryMeta(scannedTool.category).label}</Badge>
                <p className="text-lg font-bold text-foreground leading-tight">{scannedTool.name}</p>
                <p className="font-mono text-sm text-muted-foreground">{scannedTool.partNumber}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <StatusBadge status={scannedTool.status} />
                <ConditionBadge condition={scannedTool.condition} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px]">
              {[{ label: 'Location', value: getLocationById(scannedTool.locationId)?.name ?? '—' }, { label: 'Qty', value: `${scannedTool.quantity} units`, warn: scannedTool.quantity <= scannedTool.minQuantity }, { label: 'Maker', value: scannedTool.manufacturer ?? '—' }].map(({ label, value, warn }) => (
                <div key={label} className="rounded-lg border border-border bg-muted/30 p-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
                  <p className={cn('mt-0.5 font-medium', warn ? 'text-amber-400' : 'text-foreground')}>{value}</p>
                </div>
              ))}
            </div>

            {actionDone && (
              <div className={cn('flex items-center gap-2 rounded-lg border p-3', actionDone === 'checkout' ? 'border-amber-500/20 bg-amber-500/10' : 'border-emerald-500/20 bg-emerald-500/10')}>
                <CheckCircle2 size={15} className={actionDone === 'checkout' ? 'text-amber-400' : 'text-emerald-400'} />
                <p className="text-sm font-medium">{actionDone === 'checkout' ? `Checked out to ${checkoutName}` : 'Returned successfully'}</p>
              </div>
            )}

            {!actionDone && (
              <div className="space-y-3 border-t border-border pt-3">
                {(scannedTool.status === 'available' || scannedTool.status === 'in-use') && (
                  <form onSubmit={handleCheckout} className="space-y-2">
                    <p className="text-xs font-medium text-amber-400 flex items-center gap-1.5"><LogOut size={12} /> Check Out</p>
                    <Input required placeholder="Your name *" value={checkoutName} onChange={(e) => setCheckoutName(e.target.value)} />
                    <Input placeholder="Purpose (optional)" value={checkoutPurpose} onChange={(e) => setCheckoutPurpose(e.target.value)} />
                    <Button type="submit" variant="warning" className="w-full">Confirm Check Out</Button>
                  </form>
                )}
                {(scannedTool.status === 'checked-out' || scannedTool.status === 'in-use') && (
                  <form onSubmit={handleReturn} className="space-y-2 border-t border-border pt-3">
                    <p className="text-xs font-medium text-emerald-400 flex items-center gap-1.5"><RotateCcw size={12} /> Return</p>
                    <Input placeholder="Your name (optional)" value={returnName} onChange={(e) => setReturnName(e.target.value)} />
                    <Button type="submit" variant="success" className="w-full">Confirm Return</Button>
                  </form>
                )}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border pt-3">
              <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary" onClick={() => navigate('tools')}>
                Full details <ArrowRight size={12} />
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => { reset(); startCamera() }}>
                <RefreshCw size={12} /> Scan Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="border-primary/10 bg-primary/5">
        <CardContent className="p-4">
          <p className="mb-2 text-xs font-semibold text-primary">Scanning Tips</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• Good lighting — avoid glare on the QR code</li>
            <li>• Hold camera 15–30 cm from the code</li>
            <li>• Print QR codes from the Tool Detail page</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
