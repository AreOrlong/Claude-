import { MapPin, Package } from 'lucide-react';
import { useStore } from '../store/useStore';
import { StatusBadge, ConditionBadge } from './StatusBadge';
import { getCategoryMeta } from '../utils/categories';
import { cn } from '../utils/cn';
import type { Tool } from '../types';

interface ToolCardProps {
  tool: Tool;
  view?: 'grid' | 'list';
  onSelect?: (id: string) => void;
}

export function ToolCard({ tool, view = 'grid', onSelect }: ToolCardProps) {
  const { getLocationById } = useStore();
  const location = getLocationById(tool.locationId);
  const meta = getCategoryMeta(tool.category);

  if (view === 'list') {
    return (
      <button
        onClick={() => onSelect?.(tool.id)}
        className="group flex w-full items-center gap-4 rounded-lg border border-surface-700/60 bg-surface-900 px-4 py-3 text-left transition-all hover:border-surface-600 hover:bg-surface-800/60"
      >
        {/* Category dot */}
        <span className={cn('h-2 w-2 shrink-0 rounded-full', meta.color.replace('text-', 'bg-'))} />

        {/* Name + part # */}
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-surface-100 group-hover:text-cyan-400 transition-colors">
            {tool.name}
          </p>
          <p className="font-mono text-[11px] text-surface-500">{tool.partNumber}</p>
        </div>

        {/* Category */}
        <span className={cn('shrink-0 rounded border px-2 py-0.5 text-[10px] font-medium', meta.bgColor, meta.borderColor, meta.color)}>
          {meta.label}
        </span>

        {/* Status */}
        <StatusBadge status={tool.status} size="sm" />

        {/* Condition */}
        <ConditionBadge condition={tool.condition} size="sm" />

        {/* Location */}
        <div className="flex items-center gap-1 shrink-0 text-[11px] text-surface-500">
          <MapPin size={10} />
          <span>{location?.name ?? '—'}</span>
        </div>

        {/* Qty */}
        <div className="flex items-center gap-1 shrink-0">
          <Package size={11} className={tool.quantity <= tool.minQuantity ? 'text-amber-400' : 'text-surface-500'} />
          <span className={cn('font-mono text-xs', tool.quantity <= tool.minQuantity ? 'text-amber-400 font-bold' : 'text-surface-400')}>
            {tool.quantity}
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => onSelect?.(tool.id)}
      className="group flex flex-col rounded-lg border border-surface-700/60 bg-surface-900 p-4 text-left transition-all hover:border-cyan-500/30 hover:bg-surface-800/60"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className={cn('rounded border px-2 py-0.5 text-[10px] font-medium', meta.bgColor, meta.borderColor, meta.color)}>
          {meta.label}
        </span>
        <StatusBadge status={tool.status} size="sm" />
      </div>

      {/* Name */}
      <p className="text-sm font-semibold text-surface-100 group-hover:text-cyan-400 transition-colors leading-snug mb-1">
        {tool.name}
      </p>
      <p className="font-mono text-[11px] text-surface-500 mb-3">{tool.partNumber}</p>

      {/* Divider */}
      <div className="h-px bg-surface-800 mb-3" />

      {/* Bottom meta */}
      <div className="mt-auto grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-surface-500">
          <MapPin size={10} />
          <span className="truncate">{location?.name ?? '—'}</span>
        </div>
        <div className="flex items-center justify-end gap-1.5">
          <Package size={10} className={tool.quantity <= tool.minQuantity ? 'text-amber-400' : 'text-surface-500'} />
          <span className={cn('font-mono font-medium', tool.quantity <= tool.minQuantity ? 'text-amber-400' : 'text-surface-400')}>
            {tool.quantity} units
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-surface-500">
          <span>Cond:</span>
          <ConditionBadge condition={tool.condition} size="sm" />
        </div>
        {tool.manufacturer && (
          <div className="flex justify-end">
            <span className="truncate text-surface-600">{tool.manufacturer}</span>
          </div>
        )}
      </div>
    </button>
  );
}
