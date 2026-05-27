import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple'

const variants: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}

// Subscription status badge helper
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    active:     { label: 'Active',      variant: 'success' },
    trialing:   { label: 'Trial',       variant: 'info' },
    past_due:   { label: 'Past due',    variant: 'warning' },
    canceled:   { label: 'Canceled',    variant: 'error' },
    incomplete: { label: 'Incomplete',  variant: 'warning' },
  }
  const { label, variant } = map[status] ?? { label: status, variant: 'default' }
  return <Badge variant={variant}>{label}</Badge>
}

// Role badge helper
export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { variant: BadgeVariant }> = {
    owner:  { variant: 'purple' },
    admin:  { variant: 'info' },
    member: { variant: 'default' },
    viewer: { variant: 'default' },
  }
  const { variant } = map[role] ?? { variant: 'default' }
  return <Badge variant={variant} className="capitalize">{role}</Badge>
}
