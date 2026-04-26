import { LayoutDashboard, Wrench, QrCode, FolderOpen, MapPin } from 'lucide-react';
import { cn } from '../utils/cn';
import { useStore } from '../store/useStore';
import type { Page } from '../types';

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard',  label: 'Home',      icon: <LayoutDashboard size={20} /> },
  { id: 'inventory',  label: 'Inventory', icon: <Wrench size={20} /> },
  { id: 'scan',       label: 'Scan',      icon: <QrCode size={20} /> },
  { id: 'categories', label: 'Categories',icon: <FolderOpen size={20} /> },
  { id: 'locations',  label: 'Locations', icon: <MapPin size={20} /> },
];

export function BottomNav() {
  const { currentPage, navigate } = useStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-surface-700/60 bg-surface-900/95 backdrop-blur-md md:hidden">
      {navItems.map((item) => {
        const active = currentPage === item.id ||
          (item.id === 'inventory' && currentPage === 'tool-detail');
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
              item.id === 'scan'
                ? active
                  ? 'text-cyan-400'
                  : 'text-surface-400'
                : active
                ? 'text-cyan-400'
                : 'text-surface-500 hover:text-surface-300'
            )}
          >
            {item.id === 'scan' ? (
              <span className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border transition-all',
                active
                  ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                  : 'border-surface-700/60 bg-surface-800 text-surface-400'
              )}>
                {item.icon}
              </span>
            ) : (
              <span className={cn('transition-colors', active ? 'text-cyan-400' : 'text-surface-500')}>
                {item.icon}
              </span>
            )}
            {item.id !== 'scan' && <span>{item.label}</span>}
          </button>
        );
      })}
    </nav>
  );
}
