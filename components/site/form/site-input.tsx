import React, { forwardRef } from 'react'
import { type LucideIcon } from 'lucide-react'

export interface SiteInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  prefixText?: string
  suffixText?: string
  hasError?: boolean
  errorMessage?: string
  helperText?: string
}

export const SiteInput = forwardRef<HTMLInputElement, SiteInputProps>(
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

    const baseStyles =
      'w-full py-2.5 rounded-lg transition-all font-sans text-sm'

    const stateStyles = disabled
      ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed select-none placeholder:text-stone-400/70 border'
      : isError
      ? 'bg-stone-50/40 text-site-text placeholder:text-stone-400 border border-red-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500'
      : 'bg-stone-50/40 text-site-text placeholder:text-stone-400 border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'

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
                disabled ? 'text-stone-400' : isError ? 'text-red-500' : 'text-stone-400'
              }`}
            />
          )}

          {/* Left Prefix */}
          {prefixText && (
            <span
              className={`absolute left-0 inset-y-0 pl-3.5 flex items-center text-xs sm:text-sm font-semibold pointer-events-none select-none ${
                disabled ? 'text-stone-400' : isError ? 'text-red-600' : 'text-stone-400'
              }`}
            >
              {prefixText}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            className={`${baseStyles} ${stateStyles} ${leftPadding} ${rightPadding} ${className}`}
            {...props}
          />

          {/* Right Icon */}
          {Icon && iconPosition === 'right' && !suffixText && (
            <Icon
              className={`w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                disabled ? 'text-stone-400' : isError ? 'text-red-500' : 'text-stone-400'
              }`}
            />
          )}

          {/* Right Suffix */}
          {suffixText && (
            <span
              className={`absolute right-0 inset-y-0 pr-3.5 flex items-center text-sm font-semibold pointer-events-none select-none ${
                disabled ? 'text-stone-400' : isError ? 'text-red-600' : 'text-stone-400'
              }`}
            >
              {suffixText}
            </span>
          )}
        </div>

        {/* Field Error */}
        {errorMessage && (
          <p className="text-xs text-red-600 font-semibold pl-0.5">{errorMessage}</p>
        )}

        {/* Helper Text */}
        {helperText && !errorMessage && (
          <p className="text-xs text-site-text-muted mt-1.5 leading-relaxed pl-0.5">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

SiteInput.displayName = 'SiteInput'
