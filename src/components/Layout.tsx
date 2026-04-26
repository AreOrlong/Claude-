import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { TooltipProvider } from '@/components/ui/tooltip'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background font-sans text-foreground">
        {/* Subtle grid */}
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(6,182,212,1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="hidden md:flex">
          <Sidebar />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-6 md:pb-6">
            {children}
          </main>
        </div>

        <BottomNav />
      </div>
    </TooltipProvider>
  )
}
