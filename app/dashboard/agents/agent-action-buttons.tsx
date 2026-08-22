'use client'

import { useTransition, useState } from 'react'
import { approveAgent, rejectAgent } from './actions'

interface AgentActionButtonsProps {
  agentId: string
  agentName: string
}

export default function AgentActionButtons({ agentId, agentName }: AgentActionButtonsProps) {
  const [isPending, startTransition] = useTransition()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleApprove = () => {
    setErrorMessage(null)
    startTransition(async () => {
      const res = await approveAgent(agentId)
      if (res?.error) {
        setErrorMessage(res.error)
      }
    })
  }

  const handleReject = () => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menolak dan menghapus pendaftaran agen "${agentName}"? Tindakan ini tidak dapat dibatalkan.`
    )
    if (!confirmed) return

    setErrorMessage(null)
    startTransition(async () => {
      const res = await rejectAgent(agentId)
      if (res?.error) {
        setErrorMessage(res.error)
      }
    })
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={handleApprove}
          disabled={isPending}
          className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Memproses...' : 'Approve'}
        </button>
        <button
          type="button"
          onClick={handleReject}
          disabled={isPending}
          className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-md shadow-sm text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Memproses...' : 'Reject'}
        </button>
      </div>
      {errorMessage && (
        <span className="text-xs text-red-600 font-medium mt-1">{errorMessage}</span>
      )}
    </div>
  )
}
