import {
  Wrench, AlertTriangle, CheckCircle2, Clock,
  TrendingUp, ArrowRight, Activity, Package,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useStore } from '../store/useStore';
import { StatusBadge } from '../components/StatusBadge';
import { getCategoryMeta, STATUS_STYLES } from '../utils/categories';
import { cn } from '../utils/cn';

function StatCard({
  label, value, sub, icon, accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className={cn(
      'rounded-lg border bg-surface-900 p-5 transition-colors hover:border-surface-600',
      'border-surface-700/60'
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-surface-400 uppercase tracking-widest">{label}</p>
          <p className={cn('mt-2 text-3xl font-bold tracking-tight', accent)}>{value}</p>
          {sub && <p className="mt-1 text-xs text-surface-500">{sub}</p>}
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', `${accent.replace('text-', 'bg-').replace('400', '500')}/10`)}>
          <span className={accent}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { tools, scanLogs, getLowStockTools, getStatusCounts, getToolsByCategory, navigate } = useStore();

  const statusCounts = getStatusCounts();
  const categoryCount = getToolsByCategory();
  const lowStock = getLowStockTools();
  const recentLogs = scanLogs.slice(0, 8);

  const totalQty = tools.reduce((s, t) => s + t.quantity, 0);
  const available = statusCounts['available'] ?? 0;
  const checkedOut = (statusCounts['checked-out'] ?? 0) + (statusCounts['in-use'] ?? 0);
  const needsAttention = (statusCounts['maintenance'] ?? 0) + lowStock.length;

  const ACTION_COLORS: Record<string, string> = {
    checkout: 'text-amber-400',
    return:   'text-emerald-400',
    inspect:  'text-blue-400',
    view:     'text-surface-400',
  };
  const ACTION_LABELS: Record<string, string> = {
    checkout: 'Checked out',
    return:   'Returned',
    inspect:  'Inspected',
    view:     'Viewed',
  };

  const categoryRows = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const maxCat = Math.max(...categoryRows.map(([, n]) => n), 1);

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Inventory"
          value={totalQty}
          sub={`${tools.length} tool types`}
          icon={<Package size={20} />}
          accent="text-cyan-400"
        />
        <StatCard
          label="Available"
          value={available}
          sub="Ready for use"
          icon={<CheckCircle2 size={20} />}
          accent="text-emerald-400"
        />
        <StatCard
          label="Checked Out"
          value={checkedOut}
          sub="Currently deployed"
          icon={<Clock size={20} />}
          accent="text-amber-400"
        />
        <StatCard
          label="Needs Attention"
          value={needsAttention}
          sub={`${statusCounts['maintenance'] ?? 0} maintenance · ${lowStock.length} low stock`}
          icon={<AlertTriangle size={20} />}
          accent="text-rose-400"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Category breakdown */}
        <div className="col-span-1 rounded-lg border border-surface-700/60 bg-surface-900 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-surface-200">By Category</h2>
            <TrendingUp size={14} className="text-surface-500" />
          </div>
          <div className="space-y-3">
            {categoryRows.map(([cat, count]) => {
              const meta = getCategoryMeta(cat as never);
              const pct = Math.round((count / maxCat) * 100);
              return (
                <div key={cat}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className={cn('text-xs font-medium', meta.color)}>{meta.label}</span>
                    <span className="font-mono text-xs text-surface-400">{count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-800">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', meta.color.replace('text-', 'bg-'))}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="col-span-2 rounded-lg border border-surface-700/60 bg-surface-900 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-surface-200">Recent Activity</h2>
            <Activity size={14} className="text-surface-500" />
          </div>
          <div className="space-y-1">
            {recentLogs.length === 0 && (
              <p className="text-center py-8 text-sm text-surface-500">No activity yet</p>
            )}
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-3 rounded px-3 py-2 transition-colors hover:bg-surface-800/60"
              >
                <span className={cn('w-16 shrink-0 text-xs font-medium', ACTION_COLORS[log.action])}>
                  {ACTION_LABELS[log.action]}
                </span>
                <button
                  onClick={() => navigate('inventory')}
                  className="flex-1 truncate text-left text-sm text-surface-300 hover:text-cyan-400 transition-colors"
                >
                  {log.toolName}
                </button>
                <span className="text-xs text-surface-500">{log.performedBy}</span>
                <span className="font-mono text-[11px] text-surface-600 tabular-nums">
                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low stock alerts */}
      {lowStock.length > 0 && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-amber-300">Low Stock Alerts</h2>
            <span className="ml-auto text-xs text-amber-500/60">{lowStock.length} tool{lowStock.length > 1 ? 's' : ''} below minimum</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {lowStock.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate('tool-detail', t.id)}
                className="flex items-center justify-between rounded border border-amber-500/20 bg-surface-900/60 px-3 py-2 text-left transition-colors hover:border-amber-500/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-surface-200">{t.name}</p>
                  <p className="font-mono text-[10px] text-surface-500">{t.partNumber}</p>
                </div>
                <div className="ml-3 flex shrink-0 flex-col items-end">
                  <span className="font-mono text-sm font-bold text-amber-400">{t.quantity}</span>
                  <span className="text-[10px] text-surface-500">min {t.minQuantity}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status grid */}
      <div className="rounded-lg border border-surface-700/60 bg-surface-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-surface-200">Fleet Status</h2>
          <button
            onClick={() => navigate('inventory')}
            className="flex items-center gap-1 text-xs text-cyan-500 hover:text-cyan-400 transition-colors"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(statusCounts).map(([status, count]) => {
            const s = STATUS_STYLES[status];
            if (!s) return null;
            return (
              <div key={status} className="rounded border border-surface-700/40 bg-surface-800/40 p-3 text-center">
                <div className={cn('mx-auto mb-1 h-2 w-2 rounded-full', s.dot)} />
                <p className="font-mono text-xl font-bold text-surface-100">{count}</p>
                <p className="mt-0.5 text-[10px] text-surface-400 capitalize">{status.replace('-', ' ')}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent tools */}
      <div className="rounded-lg border border-surface-700/60 bg-surface-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-surface-200">Recently Added</h2>
          <Wrench size={14} className="text-surface-500" />
        </div>
        <div className="divide-y divide-surface-800">
          {[...tools]
            .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
            .slice(0, 5)
            .map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-4 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => navigate('tool-detail', t.id)}
                    className="block truncate text-sm font-medium text-surface-200 hover:text-cyan-400 transition-colors text-left"
                  >
                    {t.name}
                  </button>
                  <p className="font-mono text-[11px] text-surface-500">{t.partNumber}</p>
                </div>
                <StatusBadge status={t.status} size="sm" />
                <span className="font-mono text-xs text-surface-500 tabular-nums">
                  {format(new Date(t.addedDate), 'MMM d, yyyy')}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
