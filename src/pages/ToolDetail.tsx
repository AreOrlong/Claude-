import { useState } from 'react';
import {
  ArrowLeft, Edit, Trash2, LogOut, RotateCcw, Wrench,
  MapPin, Calendar, Hash, Package, AlertTriangle, Clock,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useStore } from '../store/useStore';
import { StatusBadge, ConditionBadge } from '../components/StatusBadge';
import { QRDisplay } from '../components/QRDisplay';
import { ToolModal } from '../components/ToolModal';
import { getCategoryMeta } from '../utils/categories';
import { cn } from '../utils/cn';

export function ToolDetail() {
  const { selectedToolId, getToolById, getLocationById, navigate, deleteTool, checkoutTool, returnTool } = useStore();
  const tool = getToolById(selectedToolId ?? '');

  const [showEdit, setShowEdit]               = useState(false);
  const [checkoutName, setCheckoutName]       = useState('');
  const [checkoutPurpose, setCheckoutPurpose] = useState('');
  const [showCheckout, setShowCheckout]       = useState(false);
  const [returnName, setReturnName]           = useState('');
  const [showReturn, setShowReturn]           = useState(false);
  const [confirmDelete, setConfirmDelete]     = useState(false);

  if (!tool) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Wrench size={40} className="mb-4 text-surface-600" />
        <p className="text-sm text-surface-400">Tool not found</p>
        <button onClick={() => navigate('inventory')} className="mt-3 text-xs text-cyan-500 hover:text-cyan-400">
          Back to inventory
        </button>
      </div>
    );
  }

  const location    = getLocationById(tool.locationId);
  const meta        = getCategoryMeta(tool.category);
  const canCheckout = tool.status === 'available' || tool.status === 'in-use';
  const canReturn   = tool.status === 'checked-out' || tool.status === 'in-use';
  const openCheckout = tool.checkoutHistory.find((e) => !e.returnedAt);

  function handleDelete() {
    deleteTool(tool!.id);
    navigate('inventory');
  }

  function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    if (!checkoutName.trim()) return;
    checkoutTool(tool!.id, checkoutName.trim(), checkoutPurpose.trim() || undefined);
    setShowCheckout(false);
    setCheckoutName('');
    setCheckoutPurpose('');
  }

  function handleReturn(e: React.FormEvent) {
    e.preventDefault();
    returnTool(tool!.id, returnName.trim() || 'Operator');
    setShowReturn(false);
    setReturnName('');
  }

  const inputCls = 'w-full rounded-lg border border-surface-700/60 bg-surface-800/60 px-3 py-2 text-sm text-surface-200 placeholder-surface-500 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 transition-colors';

  return (
    <div className="mx-auto max-w-5xl space-y-4 animate-slide-in md:space-y-6">
      {/* Breadcrumb — desktop only (mobile uses header back button) */}
      <div className="hidden items-center gap-3 md:flex">
        <button onClick={() => navigate('inventory')} className="flex items-center gap-2 text-sm text-surface-400 hover:text-surface-200 transition-colors">
          <ArrowLeft size={15} /> Inventory
        </button>
        <span className="text-surface-600">/</span>
        <span className="text-sm text-surface-200">{tool.name}</span>
      </div>

      {/* Mobile: stacked; Desktop: 2/3 + 1/3 side panel */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {/* Main info */}
        <div className="space-y-4 md:col-span-2">
          {/* Header card */}
          <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-4 md:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={cn('rounded border px-2 py-0.5 text-xs font-medium', meta.bgColor, meta.borderColor, meta.color)}>
                    {meta.label}
                  </span>
                  {tool.subcategory && <span className="text-xs text-surface-500">{tool.subcategory}</span>}
                </div>
                <h1 className="text-lg font-bold leading-tight text-surface-50 md:text-xl">{tool.name}</h1>
                <p className="font-mono text-sm text-surface-500 mt-0.5">{tool.partNumber}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setShowEdit(true)}
                  className="flex items-center gap-1 rounded-lg border border-surface-700/60 px-2.5 py-1.5 text-xs text-surface-400 transition-colors hover:border-surface-500 hover:text-surface-200"
                >
                  <Edit size={12} /> Edit
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1 rounded-lg border border-rose-500/20 px-2.5 py-1.5 text-xs text-rose-500 transition-colors hover:border-rose-500/40 hover:bg-rose-500/5"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={tool.status} />
              <ConditionBadge condition={tool.condition} />
              {tool.quantity <= tool.minQuantity && (
                <span className="flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
                  <AlertTriangle size={11} /> Low Stock
                </span>
              )}
            </div>

            {/* Quick meta — 2 cols on mobile */}
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-surface-800 pt-4 md:grid-cols-4">
              {[
                { icon: <MapPin size={12} />,    label: 'Location',     value: location?.name ?? '—' },
                { icon: <Package size={12} />,   label: 'Qty',          value: `${tool.quantity} / min ${tool.minQuantity}` },
                { icon: <Hash size={12} />,      label: 'Serial',       value: tool.serialNumber ?? '—', mono: true },
                { icon: <Wrench size={12} />,    label: 'Manufacturer', value: tool.manufacturer ?? '—' },
              ].map(({ icon, label, value, mono }) => (
                <div key={label}>
                  <div className="mb-0.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-widest text-surface-500">
                    {icon} {label}
                  </div>
                  <p className={cn('text-xs text-surface-200 md:text-sm', mono && 'font-mono')}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions — shown inline on mobile above specs */}
          <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-4 md:hidden">
            <h2 className="mb-3 text-sm font-semibold text-surface-200">Actions</h2>
            <div className="space-y-2">
              {canCheckout && !showCheckout && (
                <button onClick={() => setShowCheckout(true)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/20">
                  <LogOut size={14} /> Check Out
                </button>
              )}
              {canReturn && !showReturn && (
                <button onClick={() => setShowReturn(true)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20">
                  <RotateCcw size={14} /> Return Tool
                </button>
              )}
            </div>
            {showCheckout && (
              <form onSubmit={handleCheckout} className="mt-3 space-y-2.5 border-t border-surface-800 pt-3 animate-fade-in">
                <input required className={inputCls} placeholder="Your name *" value={checkoutName} onChange={(e) => setCheckoutName(e.target.value)} />
                <input className={inputCls} placeholder="Purpose (optional)" value={checkoutPurpose} onChange={(e) => setCheckoutPurpose(e.target.value)} />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 rounded-lg bg-amber-500 py-2 text-xs font-semibold text-black hover:bg-amber-400 transition-colors">Confirm</button>
                  <button type="button" onClick={() => setShowCheckout(false)} className="rounded-lg border border-surface-700/60 px-3 py-2 text-xs text-surface-400 transition-colors">Cancel</button>
                </div>
              </form>
            )}
            {showReturn && (
              <form onSubmit={handleReturn} className="mt-3 space-y-2.5 border-t border-surface-800 pt-3 animate-fade-in">
                <p className="text-xs text-surface-400">From: <span className="text-surface-200">{openCheckout?.checkedOutBy ?? 'Unknown'}</span></p>
                <input className={inputCls} placeholder="Returned by (optional)" value={returnName} onChange={(e) => setReturnName(e.target.value)} />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 rounded-lg bg-emerald-500 py-2 text-xs font-semibold text-black hover:bg-emerald-400 transition-colors">Confirm Return</button>
                  <button type="button" onClick={() => setShowReturn(false)} className="rounded-lg border border-surface-700/60 px-3 py-2 text-xs text-surface-400 transition-colors">Cancel</button>
                </div>
              </form>
            )}
          </div>

          {/* Specs */}
          {Object.keys(tool.specs).length > 0 && (
            <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-4 md:p-5">
              <h2 className="mb-3 text-sm font-semibold text-surface-200">Specifications</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-3">
                {Object.entries(tool.specs).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-2 border-b border-surface-800 pb-2">
                    <span className="text-xs capitalize text-surface-500">{k.replace(/_/g, ' ')}</span>
                    <span className="font-mono text-xs text-surface-300">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {tool.notes && (
            <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-4 md:p-5">
              <h2 className="mb-2 text-sm font-semibold text-surface-200">Notes</h2>
              <p className="text-sm leading-relaxed text-surface-400">{tool.notes}</p>
            </div>
          )}

          {/* Checkout history */}
          {tool.checkoutHistory.length > 0 && (
            <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-4 md:p-5">
              <h2 className="mb-3 text-sm font-semibold text-surface-200">Checkout History</h2>
              <div className="space-y-2">
                {[...tool.checkoutHistory].reverse().map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 rounded-lg border border-surface-800 bg-surface-800/40 px-3 py-2.5">
                    <div className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', entry.returnedAt ? 'bg-emerald-400' : 'bg-amber-400')} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-medium text-surface-200">{entry.checkedOutBy}</span>
                        {entry.purpose && <span className="text-[11px] text-surface-500">— {entry.purpose}</span>}
                      </div>
                      <div className="mt-0.5 flex flex-wrap gap-3 text-[10px] text-surface-500">
                        <span className="flex items-center gap-1"><LogOut size={9} /> {format(new Date(entry.checkedOutAt), 'MMM d, HH:mm')}</span>
                        {entry.returnedAt && (
                          <span className="flex items-center gap-1"><RotateCcw size={9} /> {format(new Date(entry.returnedAt), 'MMM d, HH:mm')}</span>
                        )}
                        {!entry.returnedAt && <span className="text-amber-500">Not returned</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance history */}
          {tool.maintenanceHistory.length > 0 && (
            <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-4 md:p-5">
              <h2 className="mb-3 text-sm font-semibold text-surface-200">Maintenance History</h2>
              <div className="space-y-2">
                {[...tool.maintenanceHistory].reverse().map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 rounded-lg border border-surface-800 bg-surface-800/40 px-3 py-2.5">
                    <Wrench size={12} className="mt-0.5 shrink-0 text-blue-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium capitalize text-surface-200">{entry.type}</span>
                        <span className="text-[11px] text-surface-500">by {entry.performedBy}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-surface-400">{entry.notes}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[10px] text-surface-600">
                        <Clock size={9} /> {format(new Date(entry.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar — hidden on mobile (actions shown inline above) */}
        <div className="hidden space-y-4 md:block">
          {/* Actions */}
          <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-5">
            <h2 className="mb-4 text-sm font-semibold text-surface-200">Actions</h2>
            <div className="space-y-2">
              {canCheckout && !showCheckout && (
                <button onClick={() => setShowCheckout(true)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/20">
                  <LogOut size={14} /> Check Out
                </button>
              )}
              {canReturn && !showReturn && (
                <button onClick={() => setShowReturn(true)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20">
                  <RotateCcw size={14} /> Return Tool
                </button>
              )}
            </div>
            {showCheckout && (
              <form onSubmit={handleCheckout} className="mt-4 space-y-3 border-t border-surface-800 pt-4 animate-fade-in">
                <p className="text-xs font-medium text-surface-400">Checkout details</p>
                <input required className={inputCls} placeholder="Your name *" value={checkoutName} onChange={(e) => setCheckoutName(e.target.value)} />
                <input className={inputCls} placeholder="Purpose (optional)" value={checkoutPurpose} onChange={(e) => setCheckoutPurpose(e.target.value)} />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 rounded-lg bg-amber-500 py-2 text-xs font-semibold text-black hover:bg-amber-400 transition-colors">Confirm</button>
                  <button type="button" onClick={() => setShowCheckout(false)} className="rounded-lg border border-surface-700/60 px-3 py-2 text-xs text-surface-400 transition-colors">Cancel</button>
                </div>
              </form>
            )}
            {showReturn && (
              <form onSubmit={handleReturn} className="mt-4 space-y-3 border-t border-surface-800 pt-4 animate-fade-in">
                <p className="text-xs font-medium text-surface-400">From: <span className="text-surface-200">{openCheckout?.checkedOutBy ?? 'Unknown'}</span></p>
                <input className={inputCls} placeholder="Returned by (optional)" value={returnName} onChange={(e) => setReturnName(e.target.value)} />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 rounded-lg bg-emerald-500 py-2 text-xs font-semibold text-black hover:bg-emerald-400 transition-colors">Confirm Return</button>
                  <button type="button" onClick={() => setShowReturn(false)} className="rounded-lg border border-surface-700/60 px-3 py-2 text-xs text-surface-400 transition-colors">Cancel</button>
                </div>
              </form>
            )}
          </div>

          {/* QR Code */}
          <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-5">
            <h2 className="mb-4 text-sm font-semibold text-surface-200">QR Code</h2>
            <QRDisplay toolId={tool.id} toolName={tool.name} partNumber={tool.partNumber} />
          </div>

          {/* Timestamps */}
          <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-5">
            <h2 className="mb-3 text-sm font-semibold text-surface-200">Timeline</h2>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-surface-500"><Calendar size={11} /> Added</span>
                <span className="font-mono text-surface-400">{format(new Date(tool.addedDate), 'MMM d, yyyy')}</span>
              </div>
              {tool.lastUsed && (
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-surface-500"><Clock size={11} /> Last used</span>
                  <span className="font-mono text-surface-400">{formatDistanceToNow(new Date(tool.lastUsed), { addSuffix: true })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR + Timeline — mobile only, shown at bottom */}
      <div className="grid grid-cols-2 gap-4 md:hidden">
        <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-4">
          <h2 className="mb-3 text-sm font-semibold text-surface-200">QR Code</h2>
          <QRDisplay toolId={tool.id} toolName={tool.name} partNumber={tool.partNumber} size={100} />
        </div>
        <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-4">
          <h2 className="mb-3 text-sm font-semibold text-surface-200">Timeline</h2>
          <div className="space-y-2 text-xs">
            <div>
              <p className="text-[10px] text-surface-500">Added</p>
              <p className="font-mono text-surface-300">{format(new Date(tool.addedDate), 'MMM d, yyyy')}</p>
            </div>
            {tool.lastUsed && (
              <div>
                <p className="text-[10px] text-surface-500">Last used</p>
                <p className="font-mono text-surface-300">{formatDistanceToNow(new Date(tool.lastUsed), { addSuffix: true })}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-xl border border-rose-500/30 bg-surface-900 p-6 shadow-2xl animate-slide-in">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10"><Trash2 size={18} className="text-rose-400" /></div>
              <div>
                <p className="font-semibold text-surface-100">Delete Tool</p>
                <p className="text-xs text-surface-500">Cannot be undone</p>
              </div>
            </div>
            <p className="mb-5 text-sm text-surface-400">Delete <span className="font-medium text-surface-200">{tool.name}</span>?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 rounded-lg border border-surface-700/60 py-2 text-sm text-surface-400 transition-colors hover:text-surface-200">Cancel</button>
              <button onClick={handleDelete} className="flex-1 rounded-lg bg-rose-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-400">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showEdit && <ToolModal tool={tool} onClose={() => setShowEdit(false)} />}
    </div>
  );
}
