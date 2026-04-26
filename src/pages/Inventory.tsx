import { useState, useMemo } from 'react';
import { Search, Plus, LayoutGrid, List, X, SlidersHorizontal } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ToolCard } from '../components/ToolCard';
import { CATEGORY_META } from '../utils/categories';
import { cn } from '../utils/cn';
import type { ToolCategory, ToolStatus } from '../types';
import { ToolModal } from '../components/ToolModal';

type ViewMode = 'grid' | 'list';

export function Inventory() {
  const { tools, navigate } = useStore();

  const [query, setQuery]                 = useState('');
  const [view, setView]                   = useState<ViewMode>('grid');
  const [categoryFilter, setCategoryFilter] = useState<ToolCategory | 'all'>('all');
  const [statusFilter, setStatusFilter]   = useState<ToolStatus | 'all'>('all');
  const [showModal, setShowModal]         = useState(false);
  const [showFilters, setShowFilters]     = useState(false);

  const filtered = useMemo(() => {
    return tools.filter((t) => {
      const q = query.toLowerCase();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.partNumber.toLowerCase().includes(q) ||
        (t.serialNumber?.toLowerCase().includes(q) ?? false) ||
        (t.manufacturer?.toLowerCase().includes(q) ?? false) ||
        t.category.includes(q);
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      const matchesStatus   = statusFilter === 'all' || t.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [tools, query, categoryFilter, statusFilter]);

  const STATUS_OPTIONS: { value: ToolStatus | 'all'; label: string }[] = [
    { value: 'all',          label: 'All' },
    { value: 'available',    label: 'Available' },
    { value: 'in-use',       label: 'In Use' },
    { value: 'checked-out',  label: 'Checked Out' },
    { value: 'maintenance',  label: 'Maintenance' },
    { value: 'retired',      label: 'Retired' },
  ];

  return (
    <div className="space-y-3 animate-slide-in md:space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            type="text"
            placeholder="Search tools…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-surface-700/60 bg-surface-900 pl-9 pr-8 py-2.5 text-sm text-surface-200 placeholder-surface-500 outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
            showFilters
              ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
              : 'border-surface-700/60 bg-surface-900 text-surface-400 hover:border-surface-600 hover:text-surface-200'
          )}
        >
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Filters</span>
          {(categoryFilter !== 'all' || statusFilter !== 'all') && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[9px] font-bold text-black">!</span>
          )}
        </button>

        {/* View toggle */}
        <div className="flex items-center rounded-lg border border-surface-700/60 bg-surface-900 p-1">
          <button
            onClick={() => setView('grid')}
            className={cn('rounded p-1.5 transition-colors', view === 'grid' ? 'bg-surface-700 text-surface-100' : 'text-surface-500 hover:text-surface-300')}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setView('list')}
            className={cn('rounded p-1.5 transition-colors', view === 'list' ? 'bg-surface-700 text-surface-100' : 'text-surface-500 hover:text-surface-300')}
          >
            <List size={15} />
          </button>
        </div>

        {/* Add tool */}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-cyan-400 md:px-4"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Add Tool</span>
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="space-y-3 rounded-lg border border-surface-700/60 bg-surface-900/60 p-4 animate-fade-in">
          {/* Category filter */}
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-surface-500">Category</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setCategoryFilter('all')}
                className={cn(
                  'rounded border px-2 py-0.5 text-xs font-medium transition-colors',
                  categoryFilter === 'all'
                    ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                    : 'border-surface-700/60 text-surface-400 hover:text-surface-200'
                )}
              >
                All
              </button>
              {CATEGORY_META.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategoryFilter(c.id)}
                  className={cn(
                    'rounded border px-2 py-0.5 text-xs font-medium transition-colors',
                    categoryFilter === c.id
                      ? `${c.bgColor} ${c.borderColor} ${c.color}`
                      : 'border-surface-700/60 text-surface-400 hover:text-surface-200'
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status filter */}
          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-surface-500">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setStatusFilter(o.value)}
                  className={cn(
                    'rounded border px-2 py-0.5 text-xs font-medium transition-colors',
                    statusFilter === o.value
                      ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                      : 'border-surface-700/60 text-surface-400 hover:text-surface-200'
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => { setCategoryFilter('all'); setStatusFilter('all'); }}
            className="text-xs text-surface-500 hover:text-surface-300 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-surface-500">
        {filtered.length} tool{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Tool grid / list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-surface-700/60 py-16 text-center">
          <Search size={28} className="mb-3 text-surface-600" />
          <p className="text-sm font-medium text-surface-400">No tools found</p>
          <p className="text-xs text-surface-600">Adjust your search or filters</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3 xl:grid-cols-4">
          {filtered.map((t) => (
            <ToolCard key={t.id} tool={t} view="grid" onSelect={(id) => navigate('tool-detail', id)} />
          ))}
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((t) => (
            <ToolCard key={t.id} tool={t} view="list" onSelect={(id) => navigate('tool-detail', id)} />
          ))}
        </div>
      )}

      {showModal && <ToolModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
