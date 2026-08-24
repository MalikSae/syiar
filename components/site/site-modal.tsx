'use client'

import React, { useEffect } from 'react'
import { X, type LucideIcon } from 'lucide-react'

export interface SiteModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  icon?: LucideIcon
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnOutsideClick?: boolean
}

export function SiteModal({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  children,
  footer,
  maxWidth = 'md',
  closeOnOutsideClick = true,
}: SiteModalProps) {
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
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={() => closeOnOutsideClick && onClose()}
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative bg-white rounded-xl border border-stone-200 shadow-2xl w-full ${maxWidthStyles} z-10 overflow-hidden transform transition-all animate-in zoom-in-95 duration-150 font-sans`}
      >
        {/* Header */}
        {(title || Icon) && (
          <div className="px-6 pt-6 pb-4 border-b border-stone-100 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              {Icon && (
                <div
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--site-accent, #F38020) 10%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--site-accent, #F38020) 25%, transparent)',
                    color: 'var(--site-accent, #F38020)',
                  }}
                  className="w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 mt-0.5"
                >
                  <Icon className="w-5 h-5 shrink-0" />
                </div>
              )}
              <div className="space-y-0.5">
                {title && (
                  <h3 className="text-base sm:text-lg font-bold text-site-text font-jakarta leading-snug">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-xs sm:text-sm text-site-text-muted leading-relaxed font-sans">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -mr-1.5 -mt-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Tutup modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="px-6 py-5 text-sm text-site-text space-y-4 max-h-[calc(85vh-160px)] overflow-y-auto">
          {children}
        </div>

        {/* Footer Actions */}
        {footer && (
          <div className="px-6 py-4 bg-stone-50/70 border-t border-stone-100 flex items-center justify-end gap-3 font-jakarta">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
