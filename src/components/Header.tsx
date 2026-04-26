import { Bell, Search } from 'lucide-react';
import { useStore } from '../store/useStore';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard:  { title: 'Dashboard',     subtitle: 'Tool inventory overview' },
  inventory:  { title: 'Inventory',     subtitle: 'All tools and equipment' },
  'tool-detail': { title: 'Tool Detail', subtitle: 'Detailed tool information' },
  scan:       { title: 'Scanner',       subtitle: 'Scan QR codes to track tools' },
  categories: { title: 'Categories',    subtitle: 'Tool categories and counts' },
  locations:  { title: 'Locations',     subtitle: 'Storage locations and cabinets' },
};

export function Header() {
  const { currentPage, getLowStockTools, navigate } = useStore();
  const info = PAGE_TITLES[currentPage] ?? PAGE_TITLES['dashboard'];
  const alertCount = getLowStockTools().length;

  return (
    <header className="flex h-16 items-center justify-between border-b border-surface-700/60 bg-surface-900/80 px-6 backdrop-blur-sm">
      <div>
        <h1 className="text-base font-semibold text-surface-50">{info.title}</h1>
        <p className="text-xs text-surface-400">{info.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick search trigger */}
        <button
          onClick={() => navigate('inventory')}
          className="flex h-8 w-56 items-center gap-2 rounded border border-surface-700 bg-surface-800/60 px-3 text-xs text-surface-400 transition-colors hover:border-surface-600 hover:text-surface-300"
        >
          <Search size={13} />
          <span>Search tools…</span>
          <kbd className="ml-auto rounded border border-surface-700 px-1 py-0 font-mono text-[10px] text-surface-600">⌘K</kbd>
        </button>

        {/* Alerts */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded border border-surface-700/60 bg-surface-800/60 text-surface-400 transition-colors hover:border-surface-600 hover:text-surface-200">
          <Bell size={15} />
          {alertCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-0.5 text-[9px] font-bold text-black">
              {alertCount}
            </span>
          )}
        </button>

        {/* User pill */}
        <div className="flex items-center gap-2 rounded border border-surface-700/60 bg-surface-800/60 px-3 py-1.5">
          <div className="h-5 w-5 rounded-full bg-cyan-500/30 ring-1 ring-cyan-500/40 flex items-center justify-center">
            <span className="text-[9px] font-bold text-cyan-300">OP</span>
          </div>
          <span className="text-xs font-medium text-surface-300">Operator</span>
        </div>
      </div>
    </header>
  );
}
