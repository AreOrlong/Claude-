import type { CategoryMeta, ToolCategory } from '../types';

export const CATEGORY_META: CategoryMeta[] = [
  { id: 'milling',   label: 'Milling',    color: 'text-cyan-400',   bgColor: 'bg-cyan-500/10',   borderColor: 'border-cyan-500/30' },
  { id: 'turning',   label: 'Turning',    color: 'text-violet-400', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/30' },
  { id: 'drilling',  label: 'Drilling',   color: 'text-blue-400',   bgColor: 'bg-blue-500/10',   borderColor: 'border-blue-500/30' },
  { id: 'grinding',  label: 'Grinding',   color: 'text-amber-400',  bgColor: 'bg-amber-500/10',  borderColor: 'border-amber-500/30' },
  { id: 'measuring', label: 'Measuring',  color: 'text-emerald-400',bgColor: 'bg-emerald-500/10',borderColor: 'border-emerald-500/30' },
  { id: 'holding',   label: 'Holding',    color: 'text-rose-400',   bgColor: 'bg-rose-500/10',   borderColor: 'border-rose-500/30' },
  { id: 'cutting',   label: 'Cutting',    color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30' },
  { id: 'other',     label: 'Other',      color: 'text-slate-400',  bgColor: 'bg-slate-500/10',  borderColor: 'border-slate-500/30' },
];

export function getCategoryMeta(id: ToolCategory): CategoryMeta {
  return CATEGORY_META.find((c) => c.id === id) ?? CATEGORY_META[CATEGORY_META.length - 1];
}

export const STATUS_STYLES: Record<string, { dot: string; text: string; badge: string }> = {
  available:    { dot: 'bg-emerald-400', text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  'in-use':     { dot: 'bg-blue-400',    text: 'text-blue-400',    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  'checked-out':{ dot: 'bg-amber-400',   text: 'text-amber-400',   badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  maintenance:  { dot: 'bg-rose-400',    text: 'text-rose-400',    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  retired:      { dot: 'bg-slate-500',   text: 'text-slate-500',   badge: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
};

export const CONDITION_STYLES: Record<string, string> = {
  new:      'text-emerald-400',
  good:     'text-cyan-400',
  fair:     'text-amber-400',
  worn:     'text-orange-400',
  damaged:  'text-rose-400',
  retired:  'text-slate-500',
};

export const STATUS_LABELS: Record<string, string> = {
  'available':    'Available',
  'in-use':       'In Use',
  'checked-out':  'Checked Out',
  'maintenance':  'Maintenance',
  'retired':      'Retired',
};

export const CONDITION_LABELS: Record<string, string> = {
  new: 'New', good: 'Good', fair: 'Fair', worn: 'Worn', damaged: 'Damaged', retired: 'Retired',
};
