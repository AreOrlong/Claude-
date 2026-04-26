import {
  LayoutDashboard,
  Wrench,
  QrCode,
  FolderOpen,
  MapPin,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useStore } from '../store/useStore';
import type { Page } from '../types';

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export function Sidebar() {
  const { currentPage, navigate, getLowStockTools } = useStore();
  const lowStock = getLowStockTools().length;

  const navItems: NavItem[] = [
    { id: 'dashboard',  label: 'Dashboard',  icon: <LayoutDashboard size={18} /> },
    { id: 'inventory',  label: 'Inventory',  icon: <Wrench size={18} />, badge: lowStock > 0 ? lowStock : undefined },
    { id: 'scan',       label: 'Scanner',    icon: <QrCode size={18} /> },
    { id: 'categories', label: 'Categories', icon: <FolderOpen size={18} /> },
    { id: 'locations',  label: 'Locations',  icon: <MapPin size={18} /> },
  ];

  return (
    <aside className="flex h-full w-60 flex-col border-r border-surface-700/60 bg-surface-900">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-surface-700/60 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-cyan-500/10 ring-1 ring-cyan-500/40">
          <svg className="h-4 w-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
            <path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold tracking-wide text-surface-50">ToolVault</p>
          <p className="text-[10px] font-mono text-surface-400 tracking-widest uppercase">Machine Tools</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => {
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={cn(
                'group flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20'
                  : 'text-surface-300 hover:bg-surface-800 hover:text-surface-100'
              )}
            >
              <span className={cn('transition-colors', active ? 'text-cyan-400' : 'text-surface-500 group-hover:text-surface-300')}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded bg-amber-500/20 px-1 text-[10px] font-bold text-amber-400">
                  {item.badge}
                </span>
              )}
              {active && <ChevronRight size={14} className="text-cyan-500/60" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-surface-700/60 p-3">
        <button className="flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm font-medium text-surface-400 transition-colors hover:bg-surface-800 hover:text-surface-200">
          <Settings size={18} />
          Settings
        </button>
        <p className="mt-2 px-3 text-[10px] font-mono text-surface-600">v1.0.0 · ToolVault</p>
      </div>
    </aside>
  );
}
