'use client'

import React, { useState, useRef, useEffect, forwardRef } from 'react'
import { type LucideIcon, ChevronDown, Check } from 'lucide-react'

export interface SiteSelectOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface SiteSelectProps {
  id?: string
  name?: string
  options: SiteSelectOption[]
  value?: string
  defaultValue?: string
  placeholder?: string
  icon?: LucideIcon
  disabled?: boolean
  hasError?: boolean
  errorMessage?: string
  helperText?: string
  className?: string
  onChange?: (value: string) => void
}

export const SiteSelect = forwardRef<HTMLButtonElement, SiteSelectProps>(
  (
    {
      id,
      name,
      options = [],
      value: controlledValue,
      defaultValue,
      placeholder = 'Pilih opsi...',
      icon: Icon,
      disabled = false,
      hasError = false,
      errorMessage,
      helperText,
      className = '',
      onChange,
    },
    ref
  ) => {
    const isControlled = controlledValue !== undefined
    const [internalValue, setInternalValue] = useState<string>(
      defaultValue || (isControlled ? controlledValue : '')
    )
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const currentValue = isControlled ? controlledValue : internalValue
    const selectedOption = options.find((opt) => opt.value === currentValue)
    const isError = hasError || Boolean(errorMessage)

    // Handle click outside to close dropdown
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false)
        }
      }
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen])

    // Keyboard support (Escape to close)
    useEffect(() => {
      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape' && isOpen) {
          setIsOpen(false)
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    const handleSelect = (option: SiteSelectOption) => {
      if (option.disabled || disabled) return
      if (!isControlled) {
        setInternalValue(option.value)
      }
      onChange?.(option.value)
      setIsOpen(false)
    }

    // Base Trigger Styles
    const baseTriggerStyles =
      'w-full py-2.5 text-sm rounded-lg transition-all font-sans flex items-center justify-between text-left cursor-pointer select-none'

    const stateStyles = disabled
      ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed border'
      : isError
      ? 'bg-stone-50/40 text-site-text border border-red-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500'
      : isOpen
      ? 'bg-white text-site-text'
      : 'bg-stone-50/40 text-site-text border border-stone-200 hover:bg-stone-100/70 focus:bg-white focus:outline-none'

    const leftPadding = Icon ? 'pl-10 pr-3.5' : 'px-3.5'

    return (
      <div className="space-y-1.5 w-full" ref={dropdownRef}>
        {/* Hidden input for HTML form submissions */}
        {name && <input type="hidden" name={name} value={currentValue || ''} />}

        <div className="relative">
          {/* Left Icon */}
          {Icon && (
            <Icon
              className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 ${
                disabled ? 'text-stone-400' : isError ? 'text-red-500' : 'text-stone-400'
              }`}
            />
          )}

          {/* Trigger Button */}
          <button
            ref={ref}
            id={id}
            type="button"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            style={
              isOpen
                ? {
                    borderColor: 'var(--site-accent, #F38020)',
                    boxShadow:
                      '0 0 0 2px color-mix(in srgb, var(--site-accent, #F38020) 25%, transparent)',
                  }
                : undefined
            }
            className={`${baseTriggerStyles} ${stateStyles} ${leftPadding} ${className}`}
          >
            <span
              className={`truncate block ${
                !selectedOption ? 'text-stone-400' : 'text-site-text font-medium'
              }`}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>

            <ChevronDown
              style={isOpen ? { color: 'var(--site-accent, #F38020)' } : undefined}
              className={`w-4 h-4 ml-2 shrink-0 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : 'text-stone-400'
              }`}
            />
          </button>

          {/* Dropdown Menu Popup */}
          {isOpen && (
            <div
              role="listbox"
              className="absolute z-50 mt-1.5 w-full bg-white rounded-lg border border-stone-200 shadow-lg py-1.5 max-h-60 overflow-auto focus:outline-none animate-in fade-in zoom-in-95 duration-100"
            >
              {options.length === 0 ? (
                <div className="px-3.5 py-2.5 text-xs text-stone-400 text-center">
                  Tidak ada opsi tersedia
                </div>
              ) : (
                options.map((option) => {
                  const isSelected = option.value === currentValue
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={option.disabled}
                      onClick={() => handleSelect(option)}
                      style={
                        isSelected
                          ? {
                              backgroundColor:
                                'color-mix(in srgb, var(--site-accent, #F38020) 10%, transparent)',
                              color: 'var(--site-accent, #F38020)',
                            }
                          : undefined
                      }
                      className={`w-full px-3.5 py-2 text-left text-sm flex items-center justify-between transition-colors cursor-pointer ${
                        option.disabled
                          ? 'opacity-40 cursor-not-allowed bg-stone-50'
                          : isSelected
                          ? 'font-bold'
                          : 'text-stone-700 hover:bg-stone-100/80 hover:text-site-text'
                      }`}
                    >
                      <div className="space-y-0.5 truncate pr-2">
                        <span className="block truncate">{option.label}</span>
                        {option.description && (
                          <span className="block text-[11px] font-normal text-stone-400 truncate">
                            {option.description}
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <Check
                          style={{ color: 'var(--site-accent, #F38020)' }}
                          className="w-4 h-4 shrink-0"
                        />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <p className="text-xs text-red-600 font-semibold pl-0.5">{errorMessage}</p>
        )}

        {/* Helper text */}
        {helperText && !errorMessage && (
          <p className="text-xs text-site-text-muted mt-1.5 leading-relaxed pl-0.5">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

SiteSelect.displayName = 'SiteSelect'
