'use client'

import React, { useState, useRef, useEffect, forwardRef } from 'react'
import { type LucideIcon, ChevronDown, Check } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface DashboardSelectProps {
  id?: string
  name?: string
  options: SelectOption[]
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

export const DashboardSelect = forwardRef<HTMLButtonElement, DashboardSelectProps>(
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

    const handleSelect = (option: SelectOption) => {
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
      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed border'
      : isError
      ? 'bg-slate-50 text-slate-900 border border-red-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500'
      : isOpen
      ? 'bg-white text-slate-900 border border-brand-500 ring-2 ring-brand-500/20'
      : 'bg-slate-50 text-slate-900 border border-slate-200 hover:bg-slate-100/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'

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
                disabled ? 'text-slate-400' : isError ? 'text-red-400' : 'text-slate-400'
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
            className={`${baseTriggerStyles} ${stateStyles} ${leftPadding} ${className}`}
          >
            <span
              className={`truncate block ${
                !selectedOption ? 'text-slate-400' : 'text-slate-900 font-medium'
              }`}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>

            <ChevronDown
              className={`w-4 h-4 ml-2 shrink-0 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-brand-600' : 'text-slate-400'
              }`}
            />
          </button>

          {/* Dropdown Menu Popup */}
          {isOpen && (
            <div
              role="listbox"
              className="absolute z-50 mt-1.5 w-full bg-white rounded-lg border border-slate-200 shadow-lg py-1.5 max-h-60 overflow-auto focus:outline-none animate-in fade-in zoom-in-95 duration-100"
            >
              {options.length === 0 ? (
                <div className="px-3.5 py-2.5 text-xs text-slate-400 text-center">
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
                      className={`w-full px-3.5 py-2 text-left text-sm flex items-center justify-between transition-colors cursor-pointer ${
                        option.disabled
                          ? 'opacity-40 cursor-not-allowed bg-slate-50'
                          : isSelected
                          ? 'bg-brand-50 text-brand-900 font-bold'
                          : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                      }`}
                    >
                      <div className="space-y-0.5 truncate pr-2">
                        <span className="block truncate">{option.label}</span>
                        {option.description && (
                          <span className="block text-[11px] font-normal text-slate-400 truncate">
                            {option.description}
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-brand-600 shrink-0" />
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

DashboardSelect.displayName = 'DashboardSelect'
