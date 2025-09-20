'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type TabsContextType = {
  value: string
  setValue?: (v: string) => void
}

const TabsContext = React.createContext<TabsContextType | null>(null)

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  onValueChange?: (value: string) => void
}

export function Tabs({ value, onValueChange, className, children, ...props }: TabsProps) {
  const setValue = (v: string) => {
    onValueChange?.(v)
  }
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn(className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className)} {...props} />
  )
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

export function TabsTrigger({ value, className, ...props }: TabsTriggerProps) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error('TabsTrigger must be used within Tabs')
  const isActive = ctx.value === value
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => ctx.setValue?.(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isActive ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        className
      )}
      {...props}
    />
  )
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error('TabsContent must be used within Tabs')
  if (ctx.value !== value) return null
  return (
    <div role="tabpanel" className={cn(className)} {...props}>
      {children}
    </div>
  )
}

