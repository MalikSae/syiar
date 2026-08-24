import React, { forwardRef } from 'react'
import { type LucideIcon } from 'lucide-react'

export interface DashboardInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  prefixText?: string
  suffixText?: string
  hasError?: boolean
  errorMessage?: string
  helperText?: string
}

export const DashboardInput = forwardRef<HTMLInputElement, DashboardInputProps>(
  (
    {
      className = '',
      icon: Icon,
      iconPosition = 'left',
      prefixText,
      suffixText,
      hasError = false,
      errorMessage,
      helperText,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const isError = hasError || Boolean(errorMessage)

    const baseInputStyles =
      'w-full py-2.5 text-sm rounded-lg transition-all font-sans'

    // Interactive & Color States
    const stateStyles = disabled
      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed select-none placeholder:text-slate-400/70 border'
      : isError
      ? 'bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-red-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
      : 'bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'

    // Padding Calculations
    const leftPadding = prefixText
      ? 'pl-10 pr-3.5'
      : Icon && iconPosition === 'left'
      ? 'pl-10 pr-3.5'
      : 'px-3.5'

    const rightPadding = suffixText
      ? 'pr-12'
      : Icon && iconPosition === 'right'
      ? 'pr-10 pl-3.5'
      : ''

    return (
      <div className="space-y-1.5 w-full">
        <div className="relative flex items-center">
          {/* Left Icon */}
          {Icon && iconPosition === 'left' && !prefixText && (
            <Icon
              className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                disabled ? 'text-slate-400' : isError ? 'text-red-400' : 'text-slate-400'
              }`}
            />
          )}

          {/* Left Prefix Text (e.g. "Rp") */}
          {prefixText && (
            <span
              className={`absolute left-0 inset-y-0 pl-3.5 flex items-center text-xs font-semibold pointer-events-none select-none ${
                disabled ? 'text-slate-400' : isError ? 'text-red-500' : 'text-slate-400'
              }`}
            >
              {prefixText}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            className={`${baseInputStyles} ${stateStyles} ${leftPadding} ${rightPadding} ${className}`}
            {...props}
          />

          {/* Right Icon */}
          {Icon && iconPosition === 'right' && !suffixText && (
            <Icon
              className={`w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                disabled ? 'text-slate-400' : isError ? 'text-red-400' : 'text-slate-400'
              }`}
            />
          )}

          {/* Right Suffix Text */}
          {suffixText && (
            <span
              className={`absolute right-0 inset-y-0 pr-3.5 flex items-center text-xs font-semibold pointer-events-none select-none ${
                disabled ? 'text-slate-400' : isError ? 'text-red-500' : 'text-slate-400'
              }`}
            >
              {suffixText}
            </span>
          )}
        </div>

        {/* Field-level error */}
        {errorMessage && (
          <p className="text-xs text-red-600 font-medium pl-1">{errorMessage}</p>
        )}

        {/* Helper text */}
        {helperText && !errorMessage && (
          <p className="text-[11px] text-slate-400 pl-1 leading-relaxed">{helperText}</p>
        )}
      </div>
    )
  }
)

DashboardInput.displayName = 'DashboardInput'
