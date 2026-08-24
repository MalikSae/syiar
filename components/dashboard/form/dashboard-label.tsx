import React from 'react'

export interface DashboardLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
  optional?: boolean
  badge?: React.ReactNode
}

export function DashboardLabel({
  children,
  required = false,
  optional = false,
  badge,
  className = '',
  ...props
}: DashboardLabelProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label
        className={`block text-xs font-bold text-slate-700 uppercase tracking-wider ${className}`}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
        {optional && (
          <span className="text-[11px] text-slate-400 font-normal lowercase tracking-normal ml-1">
            (opsional)
          </span>
        )}
      </label>

      {badge && <div className="shrink-0">{badge}</div>}
    </div>
  )
}
