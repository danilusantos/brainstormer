import { useState, type ReactNode } from 'react'

type TooltipSide = 'top' | 'bottom' | 'left' | 'right'

interface TooltipProps {
  label: string
  side?: TooltipSide
  children: ReactNode
}

/**
 * Tooltip minimalista do design system.
 * Mostra o rótulo ao passar o mouse ou focar no elemento filho.
 * Usado para dar nome às funcionalidades sem poluir a UI com texto.
 */
export function Tooltip({ label, side = 'bottom', children }: TooltipProps) {
  const [open, setOpen] = useState(false)

  const positions: Record<TooltipSide, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  }

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute z-[999] whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-white shadow-float ${positions[side]}`}
        >
          {label}
        </span>
      )}
    </span>
  )
}
