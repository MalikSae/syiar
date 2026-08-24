import React, { forwardRef } from 'react'

export interface SiteTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean
  errorMessage?: string
  helperText?: string
}

export const SiteTextarea = forwardRef<HTMLTextAreaElement, SiteTextareaProps>(
  (
    {
      className = '',
      hasError = false,
      errorMessage,
      helperText,
      disabled,
      rows = 3,
      id,
      ...props
    },
    ref
  ) => {
    const isError = hasError || Boolean(errorMessage)

    const baseStyles =
      'w-full p-3.5 rounded-lg transition-all resize-y leading-relaxed font-sans text-sm'

    const stateStyles = disabled
      ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed select-none placeholder:text-stone-400/70 border'
      : isError
      ? 'bg-stone-50/40 text-site-text placeholder:text-stone-400 border border-red-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500'
      : 'bg-stone-50/40 text-site-text placeholder:text-stone-400 border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'

    return (
      <div className="space-y-1.5 w-full">
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          disabled={disabled}
          className={`${baseStyles} ${stateStyles} ${className}`}
          {...props}
        />

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

SiteTextarea.displayName = 'SiteTextarea'
