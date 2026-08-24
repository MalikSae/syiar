import React from 'react'
import { AlertCircle } from 'lucide-react'

export interface SiteErrorMessageProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  message?: string
  children?: React.ReactNode
}

export function SiteErrorMessage({
  title,
  message,
  children,
  className = '',
  ...props
}: SiteErrorMessageProps) {
  const content = children || message
  if (!title && !content) return null

  return (
    <div
      role="alert"
      className={`p-3.5 sm:p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 animate-in fade-in ${className}`}
      {...props}
    >
      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        {title && <p className="font-bold text-red-900 font-jakarta">{title}</p>}
        {content && <div className="text-red-700 leading-relaxed font-sans">{content}</div>}
      </div>
    </div>
  )
}
