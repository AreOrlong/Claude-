import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { CATEGORY_META } from '../utils/categories';
import { cn } from '../utils/cn';
import type { Tool, ToolCategory, ToolStatus, ToolCondition } from '../types';

interface ToolModalProps {
  tool?: Tool;
  onClose: () => void;
}

type FormData = {
  name: string;
  partNumber: string;
  serialNumber: string;
  category: ToolCategory;
  subcategory: string;
  manufacturer: string;
  locationId: string;
  status: ToolStatus;
  condition: ToolCondition;
  quantity: number;
  minQuantity: number;
  notes: string;
  specs: { key: string; value: string }[];
};

export function ToolModal({ tool, onClose }: ToolModalProps) {
  const { locations, addTool, updateTool } = useStore();
  const isEdit = !!tool;

  const specEntries = tool
    ? Object.entries(tool.specs).map(([key, value]) => ({ key, value }))
    : [{ key: '', value: '' }];

  const [form, setForm] = useState<FormData>({
    name:         tool?.name ?? '',
    partNumber:   tool?.partNumber ?? '',
    serialNumber: tool?.serialNumber ?? '',
    category:     tool?.category ?? 'milling',
    subcategory:  tool?.subcategory ?? '',
    manufacturer: tool?.manufacturer ?? '',
    locationId:   tool?.locationId ?? (locations[0]?.id ?? ''),
    status:       tool?.status ?? 'available',
    condition:    tool?.condition ?? 'new',
    quantity:     tool?.quantity ?? 1,
    minQuantity:  tool?.minQuantity ?? 1,
    notes:        tool?.notes ?? '',
    specs:        specEntries,
  });

  function field<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addSpec() {
    setForm((f) => ({ ...f, specs: [...f.specs, { key: '', value: '' }] }));
  }

  function removeSpec(i: number) {
    setForm((f) => ({ ...f, specs: f.specs.filter((_, idx) => idx !== i) }));
  }

  function updateSpec(i: number, k: 'key' | 'value', v: string) {
    setForm((f) => {
      const s = [...f.specs];
      s[i] = { ...s[i], [k]: v };
      return { ...f, specs: s };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const specs = Object.fromEntries(
      form.specs.filter((s) => s.key.trim()).map((s) => [s.key.trim(), s.value.trim()])
    );
    const data = {
      name:         form.name,
      partNumber:   form.partNumber,
      serialNumber: form.serialNumber || undefined,
      category:     form.category,
      subcategory:  form.subcategory || undefined,
      manufacturer: form.manufacturer || undefined,
      locationId:   form.locationId,
      status:       form.status,
      condition:    form.condition,
      quantity:     form.quantity,
      minQuantity:  form.minQuantity,
      notes:        form.notes || undefined,
      specs,
      lastUsed:     tool?.lastUsed,
    };

    if (isEdit && tool) {
      updateTool(tool.id, data);
    } else {
      addTool(data);
    }
    onClose();
  }

  const inputCls = 'w-full rounded-lg border border-surface-700/60 bg-surface-800/60 px-3 py-2 text-sm text-surface-200 placeholder-surface-500 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 transition-colors';
  const selectCls = cn(inputCls, 'cursor-pointer');
  const labelCls = 'mb-1 block text-[11px] font-medium uppercase tracking-widest text-surface-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl rounded-xl border border-surface-700/60 bg-surface-900 shadow-2xl animate-slide-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-700/60 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-surface-100">
              {isEdit ? 'Edit Tool' : 'Add New Tool'}
            </h2>
            <p className="text-xs text-surface-500">Fill in tool details below</p>
          </div>
          <button onClick={onClose} className="rounded p-1.5 text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <div className="space-y-5">
              {/* Name + Part # */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Tool Name *</label>
                  <input required className={inputCls} value={form.name} onChange={(e) => field('name', e.target.value)} placeholder="e.g. Carbide End Mill 12mm" />
                </div>
                <div>
                  <label className={labelCls}>Part Number *</label>
                  <input required className={cn(inputCls, 'font-mono')} value={form.partNumber} onChange={(e) => field('partNumber', e.target.value)} placeholder="e.g. EM-4F-12-C" />
                </div>
              </div>

              {/* Serial + Manufacturer */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Serial Number</label>
                  <input className={cn(inputCls, 'font-mono')} value={form.serialNumber} onChange={(e) => field('serialNumber', e.target.value)} placeholder="Optional" />
                </div>
                <div>
                  <label className={labelCls}>Manufacturer</label>
                  <input className={inputCls} value={form.manufacturer} onChange={(e) => field('manufacturer', e.target.value)} placeholder="e.g. Sandvik, Mitutoyo" />
                </div>
              </div>

              {/* Category + Subcategory */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Category *</label>
                  <select required className={selectCls} value={form.category} onChange={(e) => field('category', e.target.value as ToolCategory)}>
                    {CATEGORY_META.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Subcategory</label>
                  <input className={inputCls} value={form.subcategory} onChange={(e) => field('subcategory', e.target.value)} placeholder="e.g. End Mill, Insert, Chuck…" />
                </div>
              </div>

              {/* Location + Status + Condition */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Location *</label>
                  <select required className={selectCls} value={form.locationId} onChange={(e) => field('locationId', e.target.value)}>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select className={selectCls} value={form.status} onChange={(e) => field('status', e.target.value as ToolStatus)}>
                    <option value="available">Available</option>
                    <option value="in-use">In Use</option>
                    <option value="checked-out">Checked Out</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Condition</label>
                  <select className={selectCls} value={form.condition} onChange={(e) => field('condition', e.target.value as ToolCondition)}>
                    <option value="new">New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="worn">Worn</option>
                    <option value="damaged">Damaged</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>

              {/* Quantity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Quantity *</label>
                  <input required type="number" min={0} className={inputCls} value={form.quantity} onChange={(e) => field('quantity', parseInt(e.target.value) || 0)} />
                </div>
                <div>
                  <label className={labelCls}>Min Quantity (reorder alert)</label>
                  <input type="number" min={0} className={inputCls} value={form.minQuantity} onChange={(e) => field('minQuantity', parseInt(e.target.value) || 0)} />
                </div>
              </div>

              {/* Specs */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className={labelCls}>Specifications</label>
                  <button type="button" onClick={addSpec} className="flex items-center gap-1 text-xs text-cyan-500 hover:text-cyan-400 transition-colors">
                    <Plus size={12} /> Add spec
                  </button>
                </div>
                <div className="space-y-2">
                  {form.specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        className={cn(inputCls, 'w-36 font-mono text-xs')}
                        placeholder="key"
                        value={spec.key}
                        onChange={(e) => updateSpec(i, 'key', e.target.value)}
                      />
                      <input
                        className={cn(inputCls, 'flex-1 font-mono text-xs')}
                        placeholder="value"
                        value={spec.value}
                        onChange={(e) => updateSpec(i, 'value', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeSpec(i)}
                        className="shrink-0 rounded p-1.5 text-surface-600 hover:bg-surface-800 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className={labelCls}>Notes</label>
                <textarea
                  className={cn(inputCls, 'resize-none')}
                  rows={3}
                  value={form.notes}
                  onChange={(e) => field('notes', e.target.value)}
                  placeholder="Usage notes, maintenance reminders, warnings…"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-surface-700/60 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-surface-700/60 px-4 py-2 text-sm font-medium text-surface-400 transition-colors hover:border-surface-600 hover:text-surface-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-cyan-400"
            >
              {isEdit ? 'Save Changes' : 'Add Tool'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
