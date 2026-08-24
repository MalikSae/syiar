import React, { forwardRef } from 'react'

export interface DashboardTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean
  errorMessage?: string
  helperText?: string
}

export const DashboardTextarea = forwardRef<
  HTMLTextAreaElement,
  DashboardTextareaProps
>(
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
      'w-full p-3.5 text-sm rounded-lg transition-all resize-y leading-relaxed font-sans'

    const stateStyles = disabled
      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed select-none placeholder:text-slate-400/70 border'
      : isError
      ? 'bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-red-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
      : 'bg-slate-50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'

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

DashboardTextarea.displayName = 'DashboardTextarea'
