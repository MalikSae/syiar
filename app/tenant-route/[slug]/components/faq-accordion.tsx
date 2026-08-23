'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

export interface FAQItem {
  question: string
  answer: string
}

interface FAQAccordionProps {
  items?: FAQItem[]
}

export function FAQAccordion({ items = [] }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  if (!items || items.length === 0) {
    return null
  }

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx
        return (
          <div
            key={idx}
            className={`rounded-xl border transition-all duration-200 overflow-hidden ${
              isOpen
                ? 'bg-white border-brand-300 shadow-sm'
                : 'bg-white/80 border-stone-200/90 hover:border-stone-300 hover:bg-white'
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                    isOpen ? 'bg-brand-50 text-brand-600' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-site-text leading-snug">
                  {item.question}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-brand-600' : ''
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 text-xs sm:text-sm text-site-text-muted leading-relaxed border-t border-stone-100">
                <div className="pl-10 whitespace-pre-line">{item.answer}</div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
