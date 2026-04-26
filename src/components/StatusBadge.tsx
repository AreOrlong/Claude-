import { cn } from '../utils/cn';
import { STATUS_STYLES, STATUS_LABELS, CONDITION_STYLES, CONDITION_LABELS } from '../utils/categories';
import type { ToolStatus, ToolCondition } from '../types';

interface StatusBadgeProps {
  status: ToolStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES['available'];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border font-medium',
        s.badge,
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
      )}
    >
      <span className={cn('rounded-full', s.dot, size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2')} />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

interface ConditionBadgeProps {
  condition: ToolCondition;
  size?: 'sm' | 'md';
}

export function ConditionBadge({ condition, size = 'md' }: ConditionBadgeProps) {
  const color = CONDITION_STYLES[condition] ?? 'text-slate-400';
  return (
    <span className={cn('font-medium', color, size === 'sm' ? 'text-[10px]' : 'text-xs')}>
      {CONDITION_LABELS[condition] ?? condition}
    </span>
  );
}
