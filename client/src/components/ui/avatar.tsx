import * as React from 'react'
import { cn } from '@/lib/utils.js'

interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = { sm: 'h-7 w-7 text-xs', md: 'h-9 w-9 text-sm', lg: 'h-12 w-12 text-base' }

export const Avatar = ({ src, alt, fallback, size = 'md', className, ...props }: AvatarProps) => {
  const initials = fallback
    ? fallback.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <span
      className={cn(
        'bg-muted text-muted-foreground inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium',
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt ?? fallback ?? ''} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </span>
  )
}
