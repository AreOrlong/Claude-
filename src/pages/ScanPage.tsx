import { useRef, useState, useEffect, useCallback } from 'react';
import {
  QrCode, Camera, CameraOff, CheckCircle2, AlertTriangle,
  LogOut, RotateCcw, ArrowRight, X, RefreshCw,
} from 'lucide-react';
import jsQR from 'jsqr';
import { useStore } from '../store/useStore';
import { StatusBadge, ConditionBadge } from '../components/StatusBadge';
import { getCategoryMeta } from '../utils/categories';
import { cn } from '../utils/cn';
import type { Tool } from '../types';

type ScanState = 'idle' | 'scanning' | 'found' | 'not-found' | 'error';

interface ScannedTool extends Tool {
  _scannedAt: string;
}

export function ScanPage() {
  const { tools, getToolById, getLocationById, checkoutTool, returnTool, addScanLog, navigate } = useStore();

  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const rafRef      = useRef<number | null>(null);
  const lastScanRef = useRef<number>(0);

  const [cameraActive, setCameraActive]   = useState(false);
  const [scanState, setScanState]         = useState<ScanState>('idle');
  const [scannedTool, setScannedTool]     = useState<ScannedTool | null>(null);
  const [errorMsg, setErrorMsg]           = useState('');
  const [checkoutName, setCheckoutName]   = useState('');
  const [checkoutPurpose, setCheckoutPurpose] = useState('');
  const [returnName, setReturnName]       = useState('');
  const [actionDone, setActionDone]       = useState<'checkout' | 'return' | null>(null);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = useCallback(async () => {
    setScanState('scanning');
    setScannedTool(null);
    setActionDone(null);
    setErrorMsg('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      setScanState('error');
      setErrorMsg('Camera access denied. Please allow camera permissions and try again.');
    }
  }, []);

  const scanFrame = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const now = Date.now();
    if (now - lastScanRef.current < 200) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    lastScanRef.current = now;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code) {
      let toolId: string | null = null;
      try {
        const parsed = JSON.parse(code.data) as { toolId?: string };
        toolId = parsed.toolId ?? null;
      } catch {
        toolId = code.data.startsWith('tool-') ? code.data : null;
      }

      if (toolId) {
        const found = getToolById(toolId);
        stopCamera();
        if (found) {
          setScannedTool({ ...found, _scannedAt: new Date().toISOString() });
          setScanState('found');
          addScanLog({
            toolId: found.id,
            toolName: found.name,
            action: 'view',
            timestamp: new Date().toISOString(),
            performedBy: 'Scanner',
          });
        } else {
          setScanState('not-found');
          setErrorMsg(`QR code detected (ID: ${toolId}) but no matching tool found in inventory.`);
        }
        return;
      }
    }

    rafRef.current = requestAnimationFrame(scanFrame);
  }, [getToolById, stopCamera, addScanLog]);

  useEffect(() => {
    if (cameraActive) {
      rafRef.current = requestAnimationFrame(scanFrame);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [cameraActive, scanFrame]);

  function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!scannedTool || !checkoutName.trim()) return;
    checkoutTool(scannedTool.id, checkoutName.trim(), checkoutPurpose.trim() || undefined);
    setActionDone('checkout');
    const updated = getToolById(scannedTool.id);
    if (updated) setScannedTool({ ...updated, _scannedAt: scannedTool._scannedAt });
  }

  function handleReturn(e: React.FormEvent) {
    e.preventDefault();
    if (!scannedTool) return;
    returnTool(scannedTool.id, returnName.trim() || 'Operator');
    setActionDone('return');
    const updated = getToolById(scannedTool.id);
    if (updated) setScannedTool({ ...updated, _scannedAt: scannedTool._scannedAt });
  }

  function reset() {
    setScannedTool(null);
    setScanState('idle');
    setActionDone(null);
    setCheckoutName('');
    setCheckoutPurpose('');
    setReturnName('');
    setErrorMsg('');
  }

  const inputCls = 'w-full rounded-lg border border-surface-700/60 bg-surface-800/60 px-3 py-2 text-sm text-surface-200 placeholder-surface-500 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 transition-colors';

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-slide-in">
      {/* Scanner viewport */}
      <div className="relative overflow-hidden rounded-xl border border-surface-700/60 bg-surface-900 aspect-video">
        {/* Video element */}
        <video
          ref={videoRef}
          className={cn('h-full w-full object-cover', !cameraActive && 'hidden')}
          muted
          playsInline
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Overlay when camera is active */}
        {cameraActive && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner brackets */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-48 w-48">
                <span className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-cyan-400 rounded-tl" />
                <span className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-cyan-400 rounded-tr" />
                <span className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-cyan-400 rounded-bl" />
                <span className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-cyan-400 rounded-br" />
                {/* Scan line */}
                <div className="absolute inset-x-0 h-px animate-scan-line bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />
              </div>
            </div>
            {/* HUD */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <span className="rounded-full border border-cyan-500/30 bg-surface-900/80 px-4 py-1.5 text-xs font-medium text-cyan-400 backdrop-blur-sm">
                Scanning for QR code…
              </span>
            </div>
            {/* Stop button */}
            <button
              onClick={() => { stopCamera(); reset(); }}
              className="pointer-events-auto absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-surface-700/60 bg-surface-900/80 px-3 py-1.5 text-xs text-surface-400 backdrop-blur-sm hover:text-surface-200 transition-colors"
            >
              <X size={12} /> Stop
            </button>
          </div>
        )}

        {/* Idle state */}
        {!cameraActive && scanState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-surface-700/60 bg-surface-800">
              <QrCode size={28} className="text-surface-400" />
            </div>
            <div>
              <p className="text-base font-semibold text-surface-200">Ready to Scan</p>
              <p className="mt-1 text-sm text-surface-500">Point your camera at a tool's QR code to look it up, check in, or check out.</p>
            </div>
            <button
              onClick={startCamera}
              className="flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-cyan-400 animate-pulse-glow"
            >
              <Camera size={16} /> Start Scanner
            </button>
          </div>
        )}

        {/* Error state */}
        {(scanState === 'error' || scanState === 'not-found') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10">
              <CameraOff size={24} className="text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-rose-300">
                {scanState === 'error' ? 'Camera Error' : 'Tool Not Found'}
              </p>
              <p className="mt-1 text-xs text-surface-500">{errorMsg}</p>
            </div>
            <button
              onClick={() => { reset(); startCamera(); }}
              className="flex items-center gap-2 rounded-lg border border-surface-700/60 bg-surface-800 px-4 py-2 text-sm text-surface-300 transition-colors hover:border-surface-600 hover:text-surface-100"
            >
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        )}

        {/* Found state */}
        {scanState === 'found' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 ring-2 ring-emerald-500/40">
              <CheckCircle2 size={24} className="text-emerald-400" />
            </div>
          </div>
        )}
      </div>

      {/* Scan result */}
      {scannedTool && scanState === 'found' && (
        <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-6 animate-slide-in space-y-5">
          {/* Tool info header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {(() => {
                const meta = getCategoryMeta(scannedTool.category);
                return (
                  <span className={cn('mb-2 inline-block rounded border px-2 py-0.5 text-xs font-medium', meta.bgColor, meta.borderColor, meta.color)}>
                    {meta.label}
                  </span>
                );
              })()}
              <h2 className="text-lg font-bold text-surface-50 leading-tight">{scannedTool.name}</h2>
              <p className="font-mono text-sm text-surface-500">{scannedTool.partNumber}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <StatusBadge status={scannedTool.status} />
              <ConditionBadge condition={scannedTool.condition} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            {[
              { label: 'Location', value: getLocationById(scannedTool.locationId)?.name ?? '—' },
              { label: 'Quantity', value: `${scannedTool.quantity} units`, warn: scannedTool.quantity <= scannedTool.minQuantity },
              { label: 'Manufacturer', value: scannedTool.manufacturer ?? '—' },
            ].map(({ label, value, warn }) => (
              <div key={label} className="rounded-lg border border-surface-800 bg-surface-800/40 p-2.5">
                <p className="text-[10px] font-medium uppercase tracking-widest text-surface-500">{label}</p>
                <p className={cn('mt-0.5 font-medium', warn ? 'text-amber-400' : 'text-surface-200')}>{value}</p>
              </div>
            ))}
          </div>

          {/* Action done banner */}
          {actionDone && (
            <div className={cn(
              'flex items-center gap-3 rounded-lg border p-3',
              actionDone === 'checkout'
                ? 'border-amber-500/30 bg-amber-500/10'
                : 'border-emerald-500/30 bg-emerald-500/10'
            )}>
              <CheckCircle2 size={16} className={actionDone === 'checkout' ? 'text-amber-400' : 'text-emerald-400'} />
              <p className="text-sm font-medium text-surface-200">
                {actionDone === 'checkout' ? `Tool checked out to ${checkoutName}` : 'Tool returned successfully'}
              </p>
            </div>
          )}

          {/* Action forms */}
          {!actionDone && (
            <div className="space-y-4 border-t border-surface-800 pt-4">
              <p className="text-xs font-medium uppercase tracking-widest text-surface-500">Take Action</p>

              {(scannedTool.status === 'available' || scannedTool.status === 'in-use') && (
                <form onSubmit={handleCheckout} className="space-y-2.5">
                  <p className="text-xs font-medium text-amber-400 flex items-center gap-1.5">
                    <LogOut size={12} /> Check Out
                  </p>
                  <input required className={inputCls} placeholder="Your name *" value={checkoutName} onChange={(e) => setCheckoutName(e.target.value)} />
                  <input className={inputCls} placeholder="Purpose (optional)" value={checkoutPurpose} onChange={(e) => setCheckoutPurpose(e.target.value)} />
                  <button type="submit" className="w-full rounded-lg bg-amber-500/20 border border-amber-500/30 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-500/30 transition-colors">
                    Confirm Check Out
                  </button>
                </form>
              )}

              {(scannedTool.status === 'checked-out' || scannedTool.status === 'in-use') && (
                <form onSubmit={handleReturn} className="space-y-2.5 border-t border-surface-800 pt-4">
                  <p className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                    <RotateCcw size={12} /> Return Tool
                  </p>
                  <input className={inputCls} placeholder="Returned by (optional)" value={returnName} onChange={(e) => setReturnName(e.target.value)} />
                  <button type="submit" className="w-full rounded-lg bg-emerald-500/20 border border-emerald-500/30 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/30 transition-colors">
                    Confirm Return
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between border-t border-surface-800 pt-4">
            <button
              onClick={() => navigate('tool-detail', scannedTool.id)}
              className="flex items-center gap-1.5 text-xs text-cyan-500 hover:text-cyan-400 transition-colors"
            >
              Full details <ArrowRight size={12} />
            </button>
            <button
              onClick={() => { reset(); startCamera(); }}
              className="flex items-center gap-1.5 rounded-lg border border-surface-700/60 px-3 py-1.5 text-xs text-surface-400 hover:border-surface-500 hover:text-surface-200 transition-colors"
            >
              <RefreshCw size={12} /> Scan Another
            </button>
          </div>
        </div>
      )}

      {/* Manual lookup */}
      <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-5">
        <h2 className="mb-3 text-sm font-semibold text-surface-200">Manual Lookup</h2>
        <p className="mb-4 text-xs text-surface-500">No camera? Search by tool name or part number below.</p>
        <div className="space-y-2">
          {tools.slice(0, 5).map((t) => (
            <button
              key={t.id}
              onClick={() => navigate('tool-detail', t.id)}
              className="flex w-full items-center gap-3 rounded-lg border border-surface-800 bg-surface-800/40 px-3 py-2.5 text-left transition-colors hover:border-surface-700 hover:bg-surface-800/80"
            >
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-medium text-surface-200">{t.name}</p>
                <p className="font-mono text-[10px] text-surface-500">{t.partNumber}</p>
              </div>
              <StatusBadge status={t.status} size="sm" />
              <ArrowRight size={12} className="shrink-0 text-surface-600" />
            </button>
          ))}
          <button
            onClick={() => navigate('inventory')}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-surface-700/60 py-2.5 text-xs text-surface-500 transition-colors hover:border-surface-600 hover:text-surface-300"
          >
            <AlertTriangle size={12} /> View all tools in inventory
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-4">
        <p className="mb-2 text-xs font-semibold text-cyan-400">Scanning Tips</p>
        <ul className="space-y-1 text-xs text-surface-500">
          <li>• Ensure good lighting — avoid glare on the QR code</li>
          <li>• Hold the camera 15–30 cm from the code</li>
          <li>• Each tool's QR code can be printed from the Tool Detail page</li>
          <li>• QR codes encode the tool ID for instant lookup</li>
        </ul>
      </div>
    </div>
  );
}
