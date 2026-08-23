import Link from 'next/link'
import { Clock, Plane, Building, ArrowRight, Calendar } from 'lucide-react'
import { formatRupiah, getLowestPrice, formatIndonesianDate } from '@/lib/package-helpers'
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

  return (
    <div className="group bg-white rounded-xl sm:rounded-2xl border border-stone-200/90 hover:border-brand-600/40 shadow-xs hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Thumbnail Section (1:1 Ratio) */}
      <div className="relative aspect-square bg-stone-100 overflow-hidden">
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
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/60 shadow-xs flex items-center gap-1.5 text-[11px] font-bold text-site-text">
          <Clock className="w-3.5 h-3.5 text-brand-500" />
          <span>{pkg.duration}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Nearest Departure Tag (HANYA tampil jika punya jadwal aktif) */}
          {pkg.nearestDepartureDate && (
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-600 bg-brand-600/10 border border-brand-600/30 px-2.5 py-0.5 rounded-md">
              <Calendar className="w-3 h-3 text-brand-500 shrink-0" />
              <span className="truncate">
                Keberangkatan terdekat: {formatIndonesianDate(pkg.nearestDepartureDate, { includeWeekday: false })}
              </span>
            </div>
          )}

          {/* Package Name in Fraunces (font-serif), Single Line */}
          <h3
            className="font-serif text-lg sm:text-xl font-bold text-site-text truncate block leading-snug group-hover:text-brand-600 transition-colors"
            title={pkg.name}
          >
            {pkg.name}
          </h3>

          {/* Airline & Hotel Brief */}
          <div className="space-y-1.5 pt-1 text-xs text-site-text-muted">
            <div className="flex items-center gap-2">
              <Plane className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span className="truncate">{pkg.airline}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span className="truncate">Makkah: {pkg.hotelMakkah}</span>
            </div>
          </div>
        </div>

        {/* Price & CTA Action */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-site-text-muted block">
              Mulai dari
            </span>
            <span className="text-sm sm:text-base font-black text-brand-600">
              {lowestPrice ? formatRupiah(lowestPrice) : 'Hubungi Travel'}
            </span>
          </div>

          <Link
            href={`/paket/${pkg.slug}`}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-site-dark hover:bg-brand-600 text-white text-xs font-bold rounded-lg transition-all shadow-xs group-hover:bg-brand-600"
          >
            <span>Detail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
