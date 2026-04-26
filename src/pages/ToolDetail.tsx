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
  const [showEdit, setShowEdit] = useState(false);
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPurpose, setCheckoutPurpose] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [returnName, setReturnName] = useState('');
  const [showReturn, setShowReturn] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const location = getLocationById(tool.locationId);
  const meta = getCategoryMeta(tool.category);
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
    <div className="mx-auto max-w-5xl space-y-6 animate-slide-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('inventory')}
          className="flex items-center gap-2 text-sm text-surface-400 hover:text-surface-200 transition-colors"
        >
          <ArrowLeft size={15} />
          Inventory
        </button>
        <span className="text-surface-600">/</span>
        <span className="text-sm text-surface-200">{tool.name}</span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main info */}
        <div className="col-span-2 space-y-5">
          {/* Header card */}
          <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="mb-2 flex items-center gap-2 flex-wrap">
                  <span className={cn('rounded border px-2 py-0.5 text-xs font-medium', meta.bgColor, meta.borderColor, meta.color)}>
                    {meta.label}
                  </span>
                  {tool.subcategory && (
                    <span className="text-xs text-surface-500">{tool.subcategory}</span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-surface-50 leading-tight">{tool.name}</h1>
                <p className="font-mono text-sm text-surface-500 mt-1">{tool.partNumber}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowEdit(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-surface-700/60 px-3 py-2 text-sm text-surface-400 transition-colors hover:border-surface-500 hover:text-surface-200"
                >
                  <Edit size={13} />
                  Edit
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-rose-500/20 px-3 py-2 text-sm text-rose-500 transition-colors hover:border-rose-500/40 hover:bg-rose-500/5"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={tool.status} />
              <ConditionBadge condition={tool.condition} />
              {tool.quantity <= tool.minQuantity && (
                <span className="flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">
                  <AlertTriangle size={11} /> Low Stock
                </span>
              )}
            </div>

            {/* Quick meta */}
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-surface-800 pt-5 sm:grid-cols-4">
              {[
                { icon: <MapPin size={13} />, label: 'Location', value: location?.name ?? '—' },
                { icon: <Package size={13} />, label: 'Quantity', value: `${tool.quantity} / min ${tool.minQuantity}` },
                { icon: <Hash size={13} />, label: 'Serial', value: tool.serialNumber ?? '—', mono: true },
                { icon: <Wrench size={13} />, label: 'Manufacturer', value: tool.manufacturer ?? '—' },
              ].map(({ icon, label, value, mono }) => (
                <div key={label}>
                  <div className="mb-0.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-widest text-surface-500">
                    {icon} {label}
                  </div>
                  <p className={cn('text-sm text-surface-200', mono && 'font-mono')}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Specs */}
          {Object.keys(tool.specs).length > 0 && (
            <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-5">
              <h2 className="mb-4 text-sm font-semibold text-surface-200">Specifications</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 sm:grid-cols-3">
                {Object.entries(tool.specs).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-2 border-b border-surface-800 pb-2">
                    <span className="text-xs text-surface-500 capitalize">{k.replace(/_/g, ' ')}</span>
                    <span className="font-mono text-xs text-surface-300">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {tool.notes && (
            <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-5">
              <h2 className="mb-3 text-sm font-semibold text-surface-200">Notes</h2>
              <p className="text-sm leading-relaxed text-surface-400">{tool.notes}</p>
            </div>
          )}

          {/* Checkout history */}
          {tool.checkoutHistory.length > 0 && (
            <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-5">
              <h2 className="mb-4 text-sm font-semibold text-surface-200">Checkout History</h2>
              <div className="space-y-2">
                {[...tool.checkoutHistory].reverse().map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 rounded-lg border border-surface-800 bg-surface-800/40 px-4 py-3">
                    <div className={cn('mt-0.5 h-2 w-2 shrink-0 rounded-full', entry.returnedAt ? 'bg-emerald-400' : 'bg-amber-400')} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-surface-200">{entry.checkedOutBy}</span>
                        {entry.purpose && <span className="text-xs text-surface-500">— {entry.purpose}</span>}
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-[11px] text-surface-500">
                        <span className="flex items-center gap-1">
                          <LogOut size={10} /> {format(new Date(entry.checkedOutAt), 'MMM d, HH:mm')}
                        </span>
                        {entry.returnedAt && (
                          <span className="flex items-center gap-1">
                            <RotateCcw size={10} /> {format(new Date(entry.returnedAt), 'MMM d, HH:mm')}
                          </span>
                        )}
                        {!entry.returnedAt && (
                          <span className="text-amber-500">Not returned yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maintenance history */}
          {tool.maintenanceHistory.length > 0 && (
            <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-5">
              <h2 className="mb-4 text-sm font-semibold text-surface-200">Maintenance History</h2>
              <div className="space-y-2">
                {[...tool.maintenanceHistory].reverse().map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 rounded-lg border border-surface-800 bg-surface-800/40 px-4 py-3">
                    <Wrench size={13} className="mt-0.5 shrink-0 text-blue-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium capitalize text-surface-200">{entry.type}</span>
                        <span className="text-xs text-surface-500">by {entry.performedBy}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-surface-400">{entry.notes}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-surface-600">
                        <Clock size={10} /> {format(new Date(entry.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Actions */}
          <div className="rounded-xl border border-surface-700/60 bg-surface-900 p-5">
            <h2 className="mb-4 text-sm font-semibold text-surface-200">Actions</h2>
            <div className="space-y-2">
              {canCheckout && !showCheckout && (
                <button
                  onClick={() => setShowCheckout(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
                >
                  <LogOut size={14} /> Check Out
                </button>
              )}
              {canReturn && !showReturn && (
                <button
                  onClick={() => setShowReturn(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
                >
                  <RotateCcw size={14} /> Return Tool
                </button>
              )}
            </div>

            {/* Checkout form */}
            {showCheckout && (
              <form onSubmit={handleCheckout} className="mt-4 space-y-3 border-t border-surface-800 pt-4 animate-fade-in">
                <p className="text-xs font-medium text-surface-400">Checkout details</p>
                <input required className={inputCls} placeholder="Your name *" value={checkoutName} onChange={(e) => setCheckoutName(e.target.value)} />
                <input className={inputCls} placeholder="Purpose (optional)" value={checkoutPurpose} onChange={(e) => setCheckoutPurpose(e.target.value)} />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 rounded-lg bg-amber-500 py-2 text-xs font-semibold text-black hover:bg-amber-400 transition-colors">Confirm</button>
                  <button type="button" onClick={() => setShowCheckout(false)} className="rounded-lg border border-surface-700/60 px-3 py-2 text-xs text-surface-400 hover:text-surface-200 transition-colors">Cancel</button>
                </div>
              </form>
            )}

            {/* Return form */}
            {showReturn && (
              <form onSubmit={handleReturn} className="mt-4 space-y-3 border-t border-surface-800 pt-4 animate-fade-in">
                <p className="text-xs font-medium text-surface-400">
                  Return from: <span className="text-surface-200">{openCheckout?.checkedOutBy ?? 'Unknown'}</span>
                </p>
                <input className={inputCls} placeholder="Returned by (your name)" value={returnName} onChange={(e) => setReturnName(e.target.value)} />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 rounded-lg bg-emerald-500 py-2 text-xs font-semibold text-black hover:bg-emerald-400 transition-colors">Confirm Return</button>
                  <button type="button" onClick={() => setShowReturn(false)} className="rounded-lg border border-surface-700/60 px-3 py-2 text-xs text-surface-400 hover:text-surface-200 transition-colors">Cancel</button>
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
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 justify-between">
                <span className="flex items-center gap-1.5 text-surface-500"><Calendar size={11} /> Added</span>
                <span className="font-mono text-surface-400">{format(new Date(tool.addedDate), 'MMM d, yyyy')}</span>
              </div>
              {tool.lastUsed && (
                <div className="flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-1.5 text-surface-500"><Clock size={11} /> Last used</span>
                  <span className="font-mono text-surface-400">{formatDistanceToNow(new Date(tool.lastUsed), { addSuffix: true })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirm overlay */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-xl border border-rose-500/30 bg-surface-900 p-6 shadow-2xl animate-slide-in">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10">
                <Trash2 size={18} className="text-rose-400" />
              </div>
              <div>
                <p className="font-semibold text-surface-100">Delete Tool</p>
                <p className="text-xs text-surface-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="mb-5 text-sm text-surface-400">
              Are you sure you want to delete <span className="text-surface-200 font-medium">{tool.name}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 rounded-lg border border-surface-700/60 py-2 text-sm text-surface-400 hover:text-surface-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-lg bg-rose-500 py-2 text-sm font-semibold text-white hover:bg-rose-400 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showEdit && <ToolModal tool={tool} onClose={() => setShowEdit(false)} />}
    </div>
  );
}
