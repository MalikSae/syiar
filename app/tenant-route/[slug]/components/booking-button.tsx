import Link from 'next/link'

interface BookingButtonProps {
  packageSlug: string
  packageName?: string
}

export function BookingButton({ packageSlug }: BookingButtonProps) {
  return (
    <Link
      href={`/paket/${packageSlug}/daftar`}
      className="w-full py-3.5 sm:py-4 px-6 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 cursor-pointer text-center"
    >
      <span>Daftar Sekarang</span>
    </Link>
  )
}
