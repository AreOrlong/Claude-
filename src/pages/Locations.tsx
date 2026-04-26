import { useState } from 'react';
import { MapPin, Plus, Edit, Trash2, Package, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { StatusBadge } from '../components/StatusBadge';
import { getCategoryMeta } from '../utils/categories';
import { cn } from '../utils/cn';
import type { StorageLocation } from '../types';

interface LocationModalProps {
  location?: StorageLocation;
  onClose: () => void;
}

function LocationModal({ location, onClose }: LocationModalProps) {
  const { addLocation, updateLocation } = useStore();
  const isEdit = !!location;
  const [form, setForm] = useState({
    name:        location?.name ?? '',
    description: location?.description ?? '',
    cabinet:     location?.cabinet ?? '',
    row:         location?.row ?? '',
    capacity:    location?.capacity ?? 20,
  });

  function f<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      name:        form.name,
      description: form.description || undefined,
      cabinet:     form.cabinet || undefined,
      row:         form.row || undefined,
      capacity:    form.capacity,
    };
    if (isEdit && location) updateLocation(location.id, data);
    else addLocation(data);
    onClose();
  }

  const inputCls = 'w-full rounded-lg border border-surface-700/60 bg-surface-800/60 px-3 py-2 text-sm text-surface-200 placeholder-surface-500 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 transition-colors';
  const labelCls = 'mb-1 block text-[11px] font-medium uppercase tracking-widest text-surface-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-surface-700/60 bg-surface-900 shadow-2xl animate-slide-in">
        <div className="flex items-center justify-between border-b border-surface-700/60 px-5 py-4">
          <p className="text-sm font-semibold text-surface-100">{isEdit ? 'Edit Location' : 'Add Location'}</p>
          <button onClick={onClose} className="rounded p-1.5 text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition-colors">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className={labelCls}>Location Name *</label>
            <input required className={inputCls} placeholder="e.g. Cabinet A" value={form.name} onChange={(e) => f('name', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <input className={inputCls} placeholder="e.g. Main tool cabinet near CNC-1" value={form.description} onChange={(e) => f('description', e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Cabinet</label>
              <input className={inputCls} placeholder="A" value={form.cabinet} onChange={(e) => f('cabinet', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Row</label>
              <input className={inputCls} placeholder="1" value={form.row} onChange={(e) => f('row', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Capacity</label>
              <input type="number" min={1} className={inputCls} value={form.capacity} onChange={(e) => f('capacity', parseInt(e.target.value) || 1)} />
            </div>
          </div>
          <div className="flex gap-3 border-t border-surface-800 pt-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-surface-700/60 py-2 text-sm text-surface-400 hover:text-surface-200 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 rounded-lg bg-cyan-500 py-2 text-sm font-semibold text-black hover:bg-cyan-400 transition-colors">
              {isEdit ? 'Save' : 'Add Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Locations() {
  const { locations, tools, navigate, deleteLocation } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<StorageLocation | undefined>();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function handleDelete(id: string) {
    deleteLocation(id);
    setConfirmDeleteId(null);
  }

  return (
    <div className="space-y-5 animate-slide-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-surface-400">{locations.length} storage location{locations.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => { setEditingLocation(undefined); setShowModal(true); }}
          className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-black hover:bg-cyan-400 transition-colors"
        >
          <Plus size={14} /> Add Location
        </button>
      </div>

      {/* Location cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        {locations.map((loc) => {
          const locTools = tools.filter((t) => t.locationId === loc.id);
          const utilPct  = Math.min(100, Math.round((locTools.length / loc.capacity) * 100));
          const utilColor = utilPct >= 90 ? 'bg-rose-500' : utilPct >= 70 ? 'bg-amber-500' : 'bg-cyan-500';

          return (
            <div key={loc.id} className="rounded-xl border border-surface-700/60 bg-surface-900 p-5">
              {/* Header */}
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-800 border border-surface-700/60">
                    <MapPin size={16} className="text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-100">{loc.name}</p>
                    {loc.description && <p className="text-[11px] text-surface-500 mt-0.5">{loc.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => { setEditingLocation(loc); setShowModal(true); }}
                    className="rounded p-1.5 text-surface-500 hover:bg-surface-800 hover:text-surface-300 transition-colors"
                  >
                    <Edit size={13} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(loc.id)}
                    className="rounded p-1.5 text-surface-500 hover:bg-surface-800 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Cabinet / row labels */}
              {(loc.cabinet || loc.row) && (
                <div className="mb-3 flex gap-2">
                  {loc.cabinet && (
                    <span className="rounded border border-surface-700/60 bg-surface-800/60 px-2 py-0.5 font-mono text-[10px] text-surface-400">
                      Cabinet {loc.cabinet}
                    </span>
                  )}
                  {loc.row && (
                    <span className="rounded border border-surface-700/60 bg-surface-800/60 px-2 py-0.5 font-mono text-[10px] text-surface-400">
                      Row {loc.row}
                    </span>
                  )}
                </div>
              )}

              {/* Capacity bar */}
              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-surface-500"><Package size={10} /> {locTools.length} / {loc.capacity} slots</span>
                  <span className={cn('font-medium', utilPct >= 90 ? 'text-rose-400' : utilPct >= 70 ? 'text-amber-400' : 'text-cyan-400')}>
                    {utilPct}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-800">
                  <div className={cn('h-full rounded-full transition-all', utilColor)} style={{ width: `${utilPct}%` }} />
                </div>
              </div>

              {/* Tools preview */}
              {locTools.length > 0 ? (
                <div className="space-y-1.5">
                  {locTools.slice(0, 4).map((t) => {
                    const meta = getCategoryMeta(t.category);
                    return (
                      <button
                        key={t.id}
                        onClick={() => navigate('tool-detail', t.id)}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition-colors hover:bg-surface-800/60 group"
                      >
                        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', meta.color.replace('text-', 'bg-'))} />
                        <span className="flex-1 truncate text-xs text-surface-300 group-hover:text-cyan-400 transition-colors">{t.name}</span>
                        <StatusBadge status={t.status} size="sm" />
                      </button>
                    );
                  })}
                  {locTools.length > 4 && (
                    <p className="pl-2 text-[11px] text-surface-600">+{locTools.length - 4} more</p>
                  )}
                </div>
              ) : (
                <p className="text-center py-3 text-xs text-surface-600">Empty location</p>
              )}
            </div>
          );
        })}
      </div>

      {locations.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-700/60 py-24">
          <MapPin size={36} className="mb-3 text-surface-700" />
          <p className="text-sm text-surface-500">No storage locations defined</p>
          <button onClick={() => setShowModal(true)} className="mt-3 text-xs text-cyan-500 hover:text-cyan-400">Add your first location</button>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <LocationModal location={editingLocation} onClose={() => { setShowModal(false); setEditingLocation(undefined); }} />
      )}

      {/* Delete confirm */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-xl border border-rose-500/30 bg-surface-900 p-6 shadow-2xl animate-slide-in">
            <p className="font-semibold text-surface-100">Delete Location?</p>
            <p className="mt-1 text-sm text-surface-400">Tools at this location will remain in inventory but become unassigned.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 rounded-lg border border-surface-700/60 py-2 text-sm text-surface-400 hover:text-surface-200 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(confirmDeleteId)} className="flex-1 rounded-lg bg-rose-500 py-2 text-sm font-semibold text-white hover:bg-rose-400 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
