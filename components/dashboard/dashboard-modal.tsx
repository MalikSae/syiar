'use client'

import React, { useEffect } from 'react'
import { X, type LucideIcon } from 'lucide-react'

export interface DashboardModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  icon?: LucideIcon
  iconColor?: string
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnOutsideClick?: boolean
}

export function DashboardModal({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  iconColor = 'text-brand-600 bg-brand-50 border-brand-100',
  children,
  footer,
  maxWidth = 'md',
  closeOnOutsideClick = true,
}: DashboardModalProps) {
  // Handle Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[maxWidth]

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={() => closeOnOutsideClick && onClose()}
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative bg-white rounded-xl border border-slate-200 shadow-2xl w-full ${maxWidthStyles} z-10 overflow-hidden transform transition-all animate-in zoom-in-95 duration-150`}
      >
        {/* Header */}
        {(title || Icon) && (
          <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              {Icon && (
                <div
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${iconColor}`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                </div>
              )}
              <div className="space-y-0.5">
                {title && (
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -mr-1.5 -mt-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="px-6 py-5 text-sm text-slate-700 space-y-4 max-h-[calc(85vh-160px)] overflow-y-auto">
          {children}
        </div>

        {/* Footer Actions */}
        {footer && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
