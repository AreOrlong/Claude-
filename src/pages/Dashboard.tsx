import { ArrowRight, AlertTriangle, CheckCircle2, Clock, Package, Activity, TrendingUp, Wrench } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, Cell } from 'recharts'
import { useStore } from '@/store/useStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from '@/components/StatusBadge'
import { getCategoryMeta } from '@/utils/categories'
import { cn } from '@/lib/utils'

const ACTION_LABEL: Record<string, string>  = { checkout: 'Checked out', return: 'Returned', inspect: 'Inspected', view: 'Viewed' }
const ACTION_COLOR: Record<string, string>  = { checkout: 'text-amber-400', return: 'text-emerald-400', inspect: 'text-blue-400', view: 'text-muted-foreground' }

function StatCard({ label, value, sub, icon, colorClass }: {
  label: string; value: number | string; sub: string; icon: React.ReactNode; colorClass: string
}) {
  return (
    <Card className="transition-all hover:border-border/80 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className={cn('mt-2 text-3xl font-bold tracking-tight', colorClass)}>{value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
          </div>
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', colorClass.replace('text-', 'bg-') + '/10')}>
            <span className={colorClass}>{icon}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Dashboard() {
  const { tools, scanLogs, getLowStockTools, getStatusCounts, getToolsByCategory, navigate } = useStore()

  const statusCounts   = getStatusCounts()
  const categoryCount  = getToolsByCategory()
  const lowStock       = getLowStockTools()
  const recentLogs     = scanLogs.slice(0, 7)
  const totalQty       = tools.reduce((s, t) => s + t.quantity, 0)
  const available      = statusCounts['available'] ?? 0
  const checkedOut     = (statusCounts['checked-out'] ?? 0) + (statusCounts['in-use'] ?? 0)
  const needsAttention = (statusCounts['maintenance'] ?? 0) + lowStock.length

  const chartData = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => ({ name: getCategoryMeta(cat as never).label, count, meta: getCategoryMeta(cat as never) }))

  const CHART_COLORS = ['#06b6d4','#8b5cf6','#22c55e','#f59e0b','#ef4444','#3b82f6','#f97316','#64748b']

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total Units"   value={totalQty}       sub={`${tools.length} tool types`}           icon={<Package size={20} />}       colorClass="text-primary" />
        <StatCard label="Available"     value={available}      sub="Ready for use"                           icon={<CheckCircle2 size={20} />}   colorClass="text-emerald-400" />
        <StatCard label="Checked Out"   value={checkedOut}     sub="Currently deployed"                      icon={<Clock size={20} />}          colorClass="text-amber-400" />
        <StatCard label="Needs Attention" value={needsAttention} sub={`${lowStock.length} low · ${statusCounts['maintenance'] ?? 0} maint`} icon={<AlertTriangle size={20} />} colorClass="text-rose-400" />
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {/* Bar chart */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <span>By Category</span>
              <TrendingUp size={14} className="text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={22} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <ReTooltip
                  contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12, color: 'hsl(var(--foreground))' }}
                  cursor={{ fill: 'hsl(var(--accent))' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity feed */}
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-sm">
              <span>Recent Activity</span>
              <Activity size={14} className="text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            {recentLogs.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No activity yet</p>
            ) : (
              <div className="space-y-0.5">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent/50">
                    <span className={cn('w-14 shrink-0 text-[10px] font-semibold', ACTION_COLOR[log.action])}>
                      {ACTION_LABEL[log.action]}
                    </span>
                    <button
                      onClick={() => navigate('inventory')}
                      className="min-w-0 flex-1 truncate text-left text-xs text-foreground hover:text-primary transition-colors"
                    >
                      {log.toolName}
                    </button>
                    <span className="hidden shrink-0 text-xs text-muted-foreground md:block">{log.performedBy}</span>
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground/60 tabular-nums">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low stock alerts */}
      {lowStock.length > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-amber-400">
              <AlertTriangle size={14} />
              Low Stock Alerts
              <span className="ml-auto text-[11px] font-normal text-amber-500/60">{lowStock.length} below minimum</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
              {lowStock.map((t) => (
                <button
                  key={t.id}
                  onClick={() => navigate('tool-detail', t.id)}
                  className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-background/60 px-3 py-2.5 text-left transition-colors hover:border-amber-500/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-foreground">{t.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{t.partNumber}</p>
                  </div>
                  <div className="ml-3 shrink-0 text-right">
                    <p className="font-mono text-base font-bold text-amber-400">{t.quantity}</p>
                    <p className="text-[10px] text-muted-foreground">min {t.minQuantity}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status overview + Recent tools */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fleet Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(statusCounts).map(([status, count]) => {
                const dotColors: Record<string, string> = {
                  'available': 'bg-emerald-400', 'in-use': 'bg-blue-400',
                  'checked-out': 'bg-amber-400', 'maintenance': 'bg-rose-400', 'retired': 'bg-muted-foreground',
                }
                return (
                  <div key={status} className="flex flex-col items-center rounded-lg border border-border bg-muted/30 p-3 text-center">
                    <div className={cn('mb-1.5 h-2 w-2 rounded-full', dotColors[status] ?? 'bg-muted-foreground')} />
                    <p className="font-mono text-xl font-bold text-foreground">{count}</p>
                    <p className="mt-0.5 text-[9px] capitalize text-muted-foreground">{status.replace('-', ' ')}</p>
                  </div>
                )
              })}
            </div>
            <Button variant="ghost" size="sm" className="mt-3 w-full text-xs text-muted-foreground" onClick={() => navigate('inventory')}>
              View all tools <ArrowRight size={12} />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Wrench size={14} className="text-muted-foreground" /> Recently Added
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="space-y-0">
              {[...tools]
                .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
                .slice(0, 5)
                .map((t, i, arr) => (
                  <div key={t.id}>
                    <div className="flex items-center gap-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => navigate('tool-detail', t.id)}
                          className="block truncate text-left text-xs font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {t.name}
                        </button>
                        <p className="font-mono text-[10px] text-muted-foreground">{t.partNumber}</p>
                      </div>
                      <StatusBadge status={t.status} size="sm" />
                      <span className="hidden font-mono text-[10px] text-muted-foreground tabular-nums md:block">
                        {format(new Date(t.addedDate), 'MMM d')}
                      </span>
                    </div>
                    {i < arr.length - 1 && <Separator />}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
