import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Sheet({ open, onClose, title, children, className }: SheetProps) {
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Mobile: slide up from bottom · Desktop: slide in from right */}
      <div className={cn(
        'relative flex flex-col bg-card shadow-2xl overflow-hidden',
        'fixed bottom-0 left-0 right-0 max-h-[92vh] rounded-t-2xl border-t border-border animate-slide-in-bottom',
        'md:static md:bottom-auto md:left-auto md:right-auto md:max-h-none',
        'md:h-full md:w-[480px] md:rounded-none md:border-t-0 md:border-l md:animate-slide-in-right',
        className
      )}>
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          {title && <h2 className="text-base font-semibold text-foreground truncate pr-4">{title}</h2>}
          <button
            onClick={onClose}
            className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
