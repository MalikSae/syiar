import React from 'react'

export interface DashboardSectionProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function DashboardSection({
  icon: Icon,
  title,
  description,
  children,
  className = '',
}: DashboardSectionProps) {
  return (
    <section className={`mb-10 sm:mb-12 last:mb-0 ${className}`}>
      {/* Section Header */}
      <div className="border-b border-slate-200 pb-3 mb-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-brand-600 shrink-0" />}
          <span>{title}</span>
        </h2>
        {description && (
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {description}
          </p>
        )}
      </div>

      {/* Section Content: Mengalir langsung tanpa wrapper card/shadow */}
      <div>{children}</div>
    </section>
  )
}
