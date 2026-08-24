import React from 'react'

export interface SiteHelperTextProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export function SiteHelperText({
  children,
  className = '',
  ...props
}: SiteHelperTextProps) {
  if (!children) return null

  return (
    <p
      className={`text-xs text-site-text-muted mt-1.5 leading-relaxed pl-0.5 ${className}`}
      {...props}
    >
      {children}
    </p>
  )
}
