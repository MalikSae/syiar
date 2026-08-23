'use client'

import { useState, useTransition } from 'react'
import { togglePackageStatus } from './actions'
import { UploadCloud } from 'lucide-react'

interface PackageToggleButtonProps {
  packageId: string
  status: string
}

export default function PackageToggleButton({
  packageId,
  status: initialStatus,
}: PackageToggleButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState(initialStatus)

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const result = await togglePackageStatus(packageId)
        if (result?.newStatus) {
          setStatus(result.newStatus)
        }
      } catch (err) {
        console.error('Error toggling package status:', err)
      }
    })
  }

  // Jika paket masih draft, tampilkan tombol "Terbitkan"
  if (status === 'draft') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
        title="Terbitkan paket agar aktif dan tampil di microsite"
      >
        <UploadCloud className="w-3.5 h-3.5" />
        <span>{isPending ? 'Menerbitkan...' : 'Terbitkan'}</span>
      </button>
    )
  }

  const isActive = status === 'active'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      onClick={handleToggle}
      disabled={isPending}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 align-middle ${
        isActive ? 'bg-emerald-500' : 'bg-slate-200'
      }`}
      title={isActive ? 'Klik untuk menonaktifkan paket' : 'Klik untuk mengaktifkan paket'}
    >
      <span className="sr-only">Toggle status paket</span>
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          isActive ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
