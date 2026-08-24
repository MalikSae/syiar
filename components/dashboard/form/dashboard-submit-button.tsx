import React from 'react'
import { Loader2, type LucideIcon } from 'lucide-react'

export interface DashboardSubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isPending?: boolean
  loadingText?: string
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

export function DashboardSubmitButton({
  children,
  isPending = false,
  loadingText = 'Menyimpan...',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  className = '',
  type = 'submit',
  ...props
}: DashboardSubmitButtonProps) {
  const isDisabled = disabled || isPending

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`px-5 py-3 sm:py-2.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-60 text-white font-bold text-sm rounded-lg transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed select-none min-h-[46px] sm:min-h-[40px] ${
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
