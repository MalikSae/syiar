import React from 'react'

export interface SiteLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
  optional?: boolean
  badge?: React.ReactNode
}

export function SiteLabel({
  children,
  required = false,
  optional = false,
  badge,
  className = '',
  ...props
}: SiteLabelProps) {
  return (
    <div className="flex items-center justify-between gap-2 mb-1.5">
      <label
        className={`block font-bold text-site-text text-xs sm:text-sm font-jakarta ${className}`}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-1 font-bold">*</span>}
        {optional && (
          <span className="text-stone-400 font-normal text-xs sm:text-sm ml-1 font-sans">
            (Opsional)
          </span>
        )}
      </label>

      {badge && <div className="shrink-0">{badge}</div>}
    </div>
  )
}
