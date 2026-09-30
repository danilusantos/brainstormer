import type { ComponentType, MouseEventHandler } from 'react'
import type { LucideProps } from 'lucide-react'
import { Tooltip } from './Tooltip'

type Variant = 'default' | 'primary' | 'danger'
type Size = 'sm' | 'md'

interface IconButtonProps {
  icon: ComponentType<LucideProps>
  label: string           // vira o tooltip (nome da funcionalidade)
  onClick?: MouseEventHandler<HTMLButtonElement>
  variant?: Variant
  size?: Size
  disabled?: boolean
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right'
}

/**
 * Botão de ícone com tooltip — bloco base do design system.
 * Em vez de "ícone + texto", mostramos só o ícone e o nome aparece no tooltip.
 */
export function IconButton({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  tooltipSide = 'bottom',
}: IconButtonProps) {
  const sizeClasses: Record<Size, string> = {
    sm: 'h-8 w-8',
    md: 'h-9 w-9',
  }

  const iconSize = size === 'sm' ? 16 : 18

  const variantClasses: Record<Variant, string> = {
    default: 'text-ink-secondary hover:bg-surface-hover hover:text-ink',
    primary: 'text-brand hover:bg-brand-soft',
    danger: 'text-danger hover:bg-red-50',
  }

  return (
    <Tooltip label={label} side={tooltipSide}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={`inline-flex items-center justify-center rounded-lg transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${sizeClasses[size]} ${variantClasses[variant]}`}
      >
        <Icon size={iconSize} strokeWidth={2} />
      </button>
    </Tooltip>
  )
}
