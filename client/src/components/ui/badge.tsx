import * as React from 'react'
import { cn } from '@/lib/utils.js'

type Variant = 'default' | 'secondary' | 'outline' | 'destructive'

const variantClasses: Record<Variant, string> = {
  default:     'bg-primary text-primary-foreground hover:bg-primary/80',
  secondary:   'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline:     'border-border text-foreground border',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
}

export const Badge = ({ className, variant = 'secondary', ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
      variantClasses[variant],
      className,
    )}
    {...props}
  />
)
