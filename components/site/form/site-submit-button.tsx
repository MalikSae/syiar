import React from 'react'
import { Loader2, type LucideIcon } from 'lucide-react'

export interface SiteSubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isPending?: boolean
  loadingText?: string
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

export function SiteSubmitButton({
  children,
  isPending = false,
  loadingText = 'Memproses...',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  className = '',
  type = 'submit',
  style,
  ...props
}: SiteSubmitButtonProps) {
  const isDisabled = disabled || isPending

  return (
    <button
      type={type}
      disabled={isDisabled}
      style={{
        backgroundColor: 'var(--site-accent, #F38020)',
        ...style,
      }}
      className={`px-5 py-3 sm:py-2.5 hover:brightness-90 active:brightness-75 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer select-none font-jakarta min-h-[46px] sm:min-h-[40px] ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      {...props}
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  )
}
