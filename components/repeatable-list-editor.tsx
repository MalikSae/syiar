'use client'

import { useState } from 'react'
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  type LucideIcon,
} from 'lucide-react'
import { TRAVEL_ICONS, getTravelIconComponent } from '@/lib/travel-icons'

export { TRAVEL_ICONS, getTravelIconComponent }

export interface ListEditorField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'icon-picker'
  placeholder?: string
  maxLength?: number
  rows?: number
  helpText?: string
}

export interface RepeatableListEditorProps<T extends Record<string, any>> {
  items: T[]
  fields: ListEditorField[]
  onChange: (items: T[]) => void
  maxItems?: number
  minItems?: number
  addButtonLabel?: string
  emptyMessage?: string
  itemTitlePrefix?: string
  idPrefix?: string
}

export function RepeatableListEditor<T extends Record<string, any>>({
  items,
  fields,
  onChange,
  maxItems = 10,
  minItems = 0,
  addButtonLabel = 'Tambah Item',
  emptyMessage = 'Belum ada item yang ditambahkan.',
  itemTitlePrefix = 'Item',
  idPrefix = 'list-editor',
}: RepeatableListEditorProps<T>) {
  const [activeIconPickerIndex, setActiveIconPickerIndex] = useState<number | null>(null)

  // Tambah item baru dengan nilai awal
  const handleAddItem = () => {
    if (items.length >= maxItems) return

    const newItem: Record<string, any> = {}
    fields.forEach((field) => {
      if (field.type === 'icon-picker') {
        newItem[field.key] = 'Shield'
      } else {
        newItem[field.key] = ''
      }
    })

    onChange([...items, newItem as T])
  }

  // Hapus item pada index tertentu
  const handleRemoveItem = (index: number) => {
    if (items.length <= minItems) return
    const updated = items.filter((_, i) => i !== index)
    onChange(updated)
    if (activeIconPickerIndex === index) {
      setActiveIconPickerIndex(null)
    }
  }

  // Ubah nilai field tertentu pada item index
  const handleFieldChange = (index: number, key: string, value: any) => {
    const updated = items.map((item, i) => {
      if (i === index) {
        return { ...item, [key]: value }
      }
      return item
    })
    onChange(updated)
  }

  // Pindahkan item ke atas
  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const updated = [...items]
    const temp = updated[index - 1]
    updated[index - 1] = updated[index]
    updated[index] = temp
    onChange(updated)
  }

  // Pindahkan item ke bawah
  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return
    const updated = [...items]
    const temp = updated[index + 1]
    updated[index + 1] = updated[index]
    updated[index] = temp
    onChange(updated)
  }

  const isMaxReached = items.length >= maxItems

  return (
    <div className="space-y-4">
      {/* Empty State jika belum ada item */}
      {items.length === 0 && (
        <div className="p-8 text-center bg-slate-50/70 rounded-2xl border-2 border-dashed border-slate-200/80">
          <p className="text-xs sm:text-sm text-slate-500 font-medium">{emptyMessage}</p>
          <button
            type="button"
            id={`btn-add-empty-${idPrefix}`}
            onClick={handleAddItem}
            className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{addButtonLabel}</span>
          </button>
        </div>
      )}

      {/* List Items */}
      {items.length > 0 && (
        <div className="space-y-3.5">
          {items.map((item, index) => (
            <div
              key={`${idPrefix}-${index}`}
              id={`item-card-${idPrefix}-${index}`}
              className="p-4 sm:p-5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-2xl transition-all shadow-2xs space-y-4"
            >
              {/* Header Item Card */}
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
                    {itemTitlePrefix} #{index + 1}
                  </span>
                </div>

                {/* Card Action Tools */}
                <div className="flex items-center gap-1">
                  {/* Up Button */}
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveUp(index)}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                    title="Geser ke atas"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>

                  {/* Down Button */}
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => handleMoveDown(index)}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
                    title="Geser ke bawah"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    id={`btn-remove-${idPrefix}-${index}`}
                    disabled={items.length <= minItems}
                    onClick={() => handleRemoveItem(index)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-30 rounded-lg transition-colors cursor-pointer ml-1"
                    title="Hapus item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form Fields for this item */}
              <div className="grid grid-cols-1 gap-4">
                {fields.map((field) => {
                  const fieldId = `${idPrefix}-${index}-${field.key}`
                  const value = item[field.key] ?? ''

                  if (field.type === 'icon-picker') {
                    const CurrentIcon = getTravelIconComponent(value)
                    const isPickerOpen = activeIconPickerIndex === index

                    return (
                      <div key={field.key} className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          {field.label}
                        </label>

                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            {/* Selected Icon Badge */}
                            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200/80 text-brand-600 flex items-center justify-center shrink-0 shadow-2xs">
                              <CurrentIcon className="w-5 h-5" />
                            </div>

                            <div className="flex-1">
                              <div className="text-xs font-bold text-slate-800">
                                {TRAVEL_ICONS[value]?.label || value || 'Shield'}
                              </div>
                              <div className="text-[11px] font-mono text-slate-400">
                                {value || 'Shield'}
                              </div>
                            </div>

                            <button
                              type="button"
                              id={`btn-icon-picker-${idPrefix}-${index}`}
                              onClick={() =>
                                setActiveIconPickerIndex(isPickerOpen ? null : index)
                              }
                              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                            >
                              {isPickerOpen ? 'Tutup Pilihan' : 'Pilih Icon'}
                            </button>
                          </div>

                          {/* Visual Grid Icon Selector */}
                          {isPickerOpen && (
                            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2 animate-in fade-in duration-150">
                              <div className="flex items-center justify-between text-xs text-slate-500 font-medium pb-1.5 border-b border-slate-100">
                                <span>Pilih salah satu icon tema travel:</span>
                                <button
                                  type="button"
                                  onClick={() => setActiveIconPickerIndex(null)}
                                  className="text-slate-400 hover:text-slate-700 p-0.5 rounded-md"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                                {Object.entries(TRAVEL_ICONS).map(([iconKey, iconData]) => {
                                  const IconComponent = iconData.icon
                                  const isSelected = value === iconKey

                                  return (
                                    <button
                                      key={iconKey}
                                      type="button"
                                      id={`btn-select-icon-${idPrefix}-${index}-${iconKey}`}
                                      onClick={() => {
                                        handleFieldChange(index, field.key, iconKey)
                                        setActiveIconPickerIndex(null)
                                      }}
                                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                                        isSelected
                                          ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold ring-2 ring-brand-500/20'
                                          : 'bg-slate-50/70 hover:bg-slate-100 border-slate-200/80 text-slate-700 hover:border-slate-300'
                                      }`}
                                    >
                                      <IconComponent className="w-5 h-5 shrink-0" />
                                      <span className="text-[10px] leading-tight line-clamp-1">
                                        {iconKey}
                                      </span>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  }

                  if (field.type === 'textarea') {
                    return (
                      <div key={field.key} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor={fieldId}
                            className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                          >
                            {field.label}
                          </label>
                          {field.maxLength && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {value.length}/{field.maxLength}
                            </span>
                          )}
                        </div>
                        <textarea
                          id={fieldId}
                          rows={field.rows || 2}
                          maxLength={field.maxLength}
                          value={value}
                          onChange={(e) =>
                            handleFieldChange(index, field.key, e.target.value)
                          }
                          placeholder={field.placeholder}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-y leading-relaxed font-sans"
                        />
                        {field.helpText && (
                          <p className="text-[11px] text-slate-400">{field.helpText}</p>
                        )}
                      </div>
                    )
                  }

                  // Default text input
                  return (
                    <div key={field.key} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor={fieldId}
                          className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                        >
                          {field.label}
                        </label>
                        {field.maxLength && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {value.length}/{field.maxLength}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        id={fieldId}
                        maxLength={field.maxLength}
                        value={value}
                        onChange={(e) =>
                          handleFieldChange(index, field.key, e.target.value)
                        }
                        placeholder={field.placeholder}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-sans"
                      />
                      {field.helpText && (
                        <p className="text-[11px] text-slate-400">{field.helpText}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Add item button / Fixed count indicator at bottom of list */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 font-medium">
              {minItems === maxItems
                ? `Wajib tepat ${maxItems} item`
                : `${items.length} dari maksimal ${maxItems} item`}
            </span>
            {minItems !== maxItems && (
              <button
                type="button"
                id={`btn-add-${idPrefix}`}
                disabled={isMaxReached}
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{addButtonLabel}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
