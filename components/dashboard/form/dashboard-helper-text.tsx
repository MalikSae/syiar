import React from 'react'

export interface DashboardHelperTextProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export function DashboardHelperText({
  children,
  className = '',
  ...props
}: DashboardHelperTextProps) {
  if (!children) return null

  return (
    <p
      className={`text-[11px] text-slate-400 pl-1 leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  )
}
