import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface EmptyAction {
  label: string
  href?: string
  onClick?: () => void
  variant?: 'default' | 'outline'
  icon?: React.ReactNode
}

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  actions?: EmptyAction[]
}

export function EmptyState({ icon, title, description, actions }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 py-16">
      {icon && (
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="mb-6 text-center text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
        {description}
      </p>
      {actions && actions.length > 0 && (
        <div className="flex w-full max-w-xs flex-col gap-3 px-4">
          {actions.map((action, index) => {
            const buttonContent = (
              <Button
                key={index}
                variant={action.variant || 'default'}
                onClick={action.onClick}
                className={`h-12 w-full rounded-xl text-base font-semibold ${
                  action.variant === 'outline'
                    ? 'border-2 transition-all hover:border-primary hover:bg-primary/5'
                    : 'shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30'
                }`}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Button>
            )

            if (action.href) {
              return (
                <Link key={index} href={action.href}>
                  {buttonContent}
                </Link>
              )
            }
            return buttonContent
          })}
        </div>
      )}
    </div>
  )
}
