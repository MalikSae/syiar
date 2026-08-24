import Link from 'next/link'
import { Clock, Plane, Building, ArrowRight } from 'lucide-react'
import { formatRupiah, getLowestPrice } from '@/lib/package-helpers'
import { GeometricPlaceholder } from './geometric-placeholder'

export interface PackageCardData {
  id: string
  name: string
  slug: string
  duration: string
  airline: string
  hotelMakkah: string
  hotelMadinah: string
  priceQuad?: number | null
  priceTriple?: number | null
  priceDouble?: number | null
  featuredImageUrl?: string | null
  nearestDepartureDate?: Date | string | null
}

interface PackageCardProps {
  pkg: PackageCardData
}

export function PackageCard({ pkg }: PackageCardProps) {
  const lowestPrice = getLowestPrice(pkg)

  // Format Hotel: "{nama hotel makkah} | {nama hotel madinah}"
  const hotelDisplay =
    pkg.hotelMakkah && pkg.hotelMadinah
      ? `${pkg.hotelMakkah} | ${pkg.hotelMadinah}`
      : pkg.hotelMakkah || pkg.hotelMadinah || '-'

  return (
    <Link
      href={`/paket/${pkg.slug}`}
      className="group bg-white rounded-xl sm:rounded-2xl border border-stone-200/90 hover:border-brand-600/40 shadow-xs hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300 flex flex-row sm:flex-col overflow-hidden cursor-pointer"
    >
      {/* Thumbnail Section (1:1 Ratio — Kiri di Mobile, Atas di Desktop) */}
      <div className="w-[125px] xs:w-[140px] sm:w-full shrink-0 aspect-square relative bg-stone-100 overflow-hidden">
        {pkg.featuredImageUrl ? (
          <img
            src={pkg.featuredImageUrl}
            alt={pkg.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <GeometricPlaceholder name={pkg.name} />
        )}

        {/* Duration Badge Floating */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/90 backdrop-blur-md px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/60 shadow-xs flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] font-bold text-site-text">
          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-500" />
          <span>{pkg.duration}</span>
        </div>
      </div>

      {/* Content Section (Kanan di Mobile, Bawah di Desktop) */}
      <div className="p-3.5 sm:p-6 flex-1 flex flex-col justify-between min-w-0 space-y-2.5 sm:space-y-4">
        <div className="space-y-1.5 sm:space-y-2.5 min-w-0">
          {/* Package Name in Plus Jakarta Sans (font-jakarta), Single Line */}
          <h3
            className="font-jakarta text-sm sm:text-lg lg:text-xl font-bold text-site-text truncate block leading-snug group-hover:text-brand-600 transition-colors"
            title={pkg.name}
          >
            {pkg.name}
          </h3>

          {/* Airline & Hotel Brief */}
          <div className="space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs text-site-text-muted">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Plane className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-stone-400 shrink-0" />
              <span className="truncate">{pkg.airline}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Building className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-stone-400 shrink-0" />
              <span className="truncate" title={hotelDisplay}>
                {hotelDisplay}
              </span>
            </div>
          </div>
        </div>

        {/* Price & CTA Action */}
        <div className="pt-2.5 sm:pt-4 border-t border-stone-100 flex items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-site-text-muted block leading-tight">
              Mulai dari
            </span>
            <span className="text-xs sm:text-base font-black text-brand-600 truncate block">
              {lowestPrice ? formatRupiah(lowestPrice) : 'Hubungi Travel'}
            </span>
          </div>

          <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-auto sm:h-auto sm:px-4 sm:py-2 bg-site-dark group-hover:bg-brand-600 text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0">
            <span className="hidden sm:inline">Lihat Detail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </Link>
  )
}
