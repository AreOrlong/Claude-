import { Bell, Search, ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard:     { title: 'ToolVault',      subtitle: 'Overview' },
  inventory:     { title: 'Inventory',      subtitle: 'All tools' },
  'tool-detail': { title: 'Tool Detail',    subtitle: 'Details' },
  scan:          { title: 'Scanner',        subtitle: 'Scan QR codes' },
  categories:    { title: 'Categories',     subtitle: 'By type' },
  locations:     { title: 'Locations',      subtitle: 'Storage' },
};

export function Header() {
  const { currentPage, getLowStockTools, navigate } = useStore();
  const info = PAGE_TITLES[currentPage] ?? PAGE_TITLES['dashboard'];
  const alertCount = getLowStockTools().length;
  const showBack = currentPage === 'tool-detail';

  return (
    <header className="flex h-14 items-center justify-between border-b border-surface-700/60 bg-surface-900/80 px-4 backdrop-blur-sm md:h-16 md:px-6">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => navigate('inventory')}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-700/60 text-surface-400 hover:text-surface-200 transition-colors md:hidden"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <div>
          <h1 className="text-sm font-semibold text-surface-50 md:text-base">{info.title}</h1>
          <p className="hidden text-xs text-surface-400 md:block">{info.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search — desktop only */}
        <button
          onClick={() => navigate('inventory')}
          className="hidden h-8 w-48 items-center gap-2 rounded border border-surface-700 bg-surface-800/60 px-3 text-xs text-surface-400 transition-colors hover:border-surface-600 hover:text-surface-300 md:flex"
        >
          <Search size={13} />
          <span>Search tools…</span>
          <kbd className="ml-auto rounded border border-surface-700 px-1 py-0 font-mono text-[10px] text-surface-600">⌘K</kbd>
        </button>

        {/* Search icon — mobile */}
        <button
          onClick={() => navigate('inventory')}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-700/60 text-surface-400 hover:text-surface-200 transition-colors md:hidden"
        >
          <Search size={16} />
        </button>

        {/* Alerts */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-surface-700/60 bg-surface-800/60 text-surface-400 transition-colors hover:border-surface-600 hover:text-surface-200">
          <Bell size={15} />
          {alertCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-0.5 text-[9px] font-bold text-black">
              {alertCount}
            </span>
          )}
        </button>

        {/* User pill — desktop only */}
        <div className="hidden items-center gap-2 rounded border border-surface-700/60 bg-surface-800/60 px-3 py-1.5 md:flex">
          <div className="h-5 w-5 rounded-full bg-cyan-500/30 ring-1 ring-cyan-500/40 flex items-center justify-center">
            <span className="text-[9px] font-bold text-cyan-300">OP</span>
          </div>
          <span className="text-xs font-medium text-surface-300">Operator</span>
        </div>
      </div>
    </header>
  );
}
