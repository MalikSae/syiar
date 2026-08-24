'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { PackageCard, PackageCardData } from '../components/package-card'
import { fetchMorePackages } from './actions'
import { Loader2, CheckCircle2 } from 'lucide-react'

interface InfinitePackageListProps {
  tenantId: string
  initialPackages: PackageCardData[]
  initialHasMore: boolean
  q?: string
  month?: string
  pageSize?: number
}

export function InfinitePackageList({
  tenantId,
  initialPackages,
  initialHasMore,
  q = '',
  month = '',
  pageSize = 6,
}: InfinitePackageListProps) {
  const [packages, setPackages] = useState<PackageCardData[]>(initialPackages)
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const observerTarget = useRef<HTMLDivElement | null>(null)

  // Reset state jika initialPackages / filter berubah
  useEffect(() => {
    setPackages(initialPackages)
    setHasMore(initialHasMore)
    setIsLoading(false)
  }, [initialPackages, initialHasMore, q, month])

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const result = await fetchMorePackages({
        tenantId,
        q,
        month,
        skip: packages.length,
        take: pageSize,
      })

      if (result.packages.length > 0) {
        setPackages((prev) => {
          const existingIds = new Set(prev.map((p) => p.id))
          const newUniquePackages = result.packages.filter((p) => !existingIds.has(p.id))
          return [...prev, ...newUniquePackages]
        })
      }
      setHasMore(result.hasMore)
    } catch (error) {
      console.error('Error fetching more packages:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, tenantId, q, month, packages.length, pageSize])

  useEffect(() => {
    const target = observerTarget.current
    if (!target || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      {
        rootMargin: '200px',
        threshold: 0.1,
      }
    )

    observer.observe(target)
    return () => {
      observer.disconnect()
    }
  }, [loadMore, hasMore, isLoading])

  return (
    <div className="space-y-8">
      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} />
        ))}
      </div>

      {/* Sentinel / Loading & Status Indicator */}
      <div ref={observerTarget} className="py-6 flex flex-col items-center justify-center min-h-[60px]">
        {isLoading && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 shadow-xs text-xs font-semibold text-site-text-muted animate-in fade-in">
            <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />
            <span>Memuat paket lainnya...</span>
          </div>
        )}

        {!hasMore && packages.length > pageSize && (
          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-100 text-stone-500 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-stone-400" />
            <span>Semua paket telah ditampilkan ({packages.length} paket)</span>
          </div>
        )}
      </div>
    </div>
  )
}
