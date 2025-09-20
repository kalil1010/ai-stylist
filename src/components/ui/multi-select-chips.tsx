'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface ChipOption {
  label: string
  value: string
}

interface MultiSelectChipsProps {
  options: ChipOption[]
  value: string[]
  onChange: (next: string[]) => void
  className?: string
  single?: boolean
  allowCustom?: boolean
  customPlaceholder?: string
}

export function MultiSelectChips({ options, value, onChange, className, single, allowCustom, customPlaceholder }: MultiSelectChipsProps) {
  const toggle = (val: string) => {
    if (single) {
      onChange(value.includes(val) ? [] : [val])
      return
    }
    const set = new Set(value)
    if (set.has(val)) set.delete(val)
    else set.add(val)
    onChange(Array.from(set))
  }

  // Include selected values that aren't in the provided options
  const optionMap = new Map(options.map(o => [o.value, o.label] as const))
  const extras = value.filter(v => !optionMap.has(v)).map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))
  const allOptions = [...options, ...extras]

  const [custom, setCustom] = React.useState('')
  const addCustom = () => {
    const trimmed = custom.trim()
    if (!trimmed) return
    const val = trimmed
    if (single) onChange([val])
    else if (!value.includes(val)) onChange([...value, val])
    setCustom('')
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {allOptions.map((opt) => {
        const active = value.includes(opt.value)
        return (
          <button
            type="button"
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={cn(
              'px-3 py-1.5 rounded-full border text-sm transition-colors',
              active
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground'
            )}
          >
            {opt.label}
          </button>
        )
      })}
      {allowCustom && (
        <div className="flex items-center gap-2">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
            placeholder={customPlaceholder || 'Add custom'}
            className="h-9 rounded-full border border-input bg-background px-3 text-sm"
          />
          <button type="button" onClick={addCustom} className="px-3 py-1.5 rounded-full border text-sm hover:bg-accent hover:text-accent-foreground">
            Add
          </button>
        </div>
      )}
    </div>
  )
}
