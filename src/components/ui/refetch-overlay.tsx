import { cn } from '@/lib/utils'

interface RefetchOverlayProps {
  isFetching: boolean
  children: React.ReactNode
  className?: string
}

export function RefetchOverlay({ isFetching, children, className }: RefetchOverlayProps) {
  return (
    <div className={cn('transition-opacity duration-200', className)}>
      <div className={cn(isFetching && 'pointer-events-none opacity-50')}>
        {children}
      </div>
    </div>
  )
}
