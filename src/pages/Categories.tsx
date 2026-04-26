import { Wrench } from 'lucide-react';
import { useStore } from '../store/useStore';
import { CATEGORY_META } from '../utils/categories';
import { StatusBadge } from '../components/StatusBadge';
import { cn } from '../utils/cn';

export function Categories() {
  const { tools, navigate } = useStore();

  const byCategory = CATEGORY_META.map((meta) => {
    const catTools   = tools.filter((t) => t.category === meta.id);
    const available  = catTools.filter((t) => t.status === 'available').length;
    const checkedOut = catTools.filter((t) => t.status === 'checked-out' || t.status === 'in-use').length;
    const maint      = catTools.filter((t) => t.status === 'maintenance').length;
    const totalQty   = catTools.reduce((s, t) => s + t.quantity, 0);
    return { meta, tools: catTools, available, checkedOut, maint, totalQty };
  }).filter((c) => c.tools.length > 0);

  return (
    <div className="space-y-4 animate-slide-in md:space-y-6">
      {/* Summary — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
        {byCategory.map(({ meta, tools: catTools, totalQty }) => (
          <div key={meta.id} className={cn('rounded-lg border p-3 md:p-4', meta.bgColor, meta.borderColor)}>
            <p className={cn('text-[10px] font-semibold uppercase tracking-widest md:text-xs', meta.color)}>{meta.label}</p>
            <p className="mt-1.5 text-2xl font-bold text-surface-100 md:mt-2 md:text-3xl">{catTools.length}</p>
            <p className="mt-0.5 text-[10px] text-surface-500">{totalQty} units</p>
          </div>
        ))}
      </div>

      {/* Per-category sections */}
      {byCategory.map(({ meta, tools: catTools, available, checkedOut, maint }) => (
        <div key={meta.id} className="rounded-xl border border-surface-700/60 bg-surface-900 overflow-hidden">
          <div className={cn('flex items-center justify-between border-b px-4 py-3', meta.bgColor, meta.borderColor.replace('border-', 'border-b-'))}>
            <div className="flex items-center gap-2.5">
              <Wrench size={13} className={meta.color} />
              <span className={cn('text-sm font-semibold', meta.color)}>{meta.label}</span>
              <span className="font-mono text-xs text-surface-500">{catTools.length}</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-surface-500">
              <span className="text-emerald-400">{available} avail</span>
              {checkedOut > 0 && <span className="text-amber-400">{checkedOut} out</span>}
              {maint > 0 && <span className="text-rose-400">{maint} maint</span>}
            </div>
          </div>

          <div className="divide-y divide-surface-800">
            {catTools.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate('tool-detail', t.id)}
                className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-800/60"
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-surface-200 group-hover:text-cyan-400 transition-colors">{t.name}</p>
                  <p className="font-mono text-[10px] text-surface-500">{t.partNumber}{t.subcategory && ` · ${t.subcategory}`}</p>
                </div>
                <StatusBadge status={t.status} size="sm" />
                <span className={cn('font-mono text-xs tabular-nums shrink-0', t.quantity <= t.minQuantity ? 'font-bold text-amber-400' : 'text-surface-500')}>
                  {t.quantity}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {byCategory.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-700/60 py-24">
          <Wrench size={36} className="mb-3 text-surface-700" />
          <p className="text-sm text-surface-500">No tools in inventory yet</p>
        </div>
      )}
    </div>
  );
}
