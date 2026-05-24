import * as React from 'react'
import { cn } from '@/lib/utils.js'

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const TabsContext = React.createContext<{ value: string; onChange: (v: string) => void } | null>(null)

export const Tabs = ({ value, onValueChange, children, className }: TabsProps) => (
  <TabsContext.Provider value={{ value, onChange: onValueChange }}>
    <div className={className}>{children}</div>
  </TabsContext.Provider>
)

export const TabsList = ({ className, children, ...props }: TabsListProps) => (
  <div
    className={cn('bg-muted inline-flex items-center rounded-lg p-1 gap-1', className)}
    role="tablist"
    {...props}
  >
    {children}
  </div>
)

export const TabsTrigger = ({ value, className, children, ...props }: TabsTriggerProps) => {
  const ctx = React.useContext(TabsContext)
  const isActive = ctx?.value === value
  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => ctx?.onChange(value)}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export const TabsContent = ({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) => {
  const ctx = React.useContext(TabsContext)
  if (ctx?.value !== value) return null
  return <div className={className}>{children}</div>
}
