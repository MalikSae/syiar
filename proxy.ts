import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { resolveDomain } from '@/lib/domain-resolver'

export function proxy(request: NextRequest) {
  const { pathname } = new URL(request.url)

  // BASE_DOMAIN wajib dari env — jangan hardcode syiar.link atau localhost:3000 di sini
  const baseDomain = process.env.BASE_DOMAIN
  if (!baseDomain) {
    // Konfigurasi tidak valid — jangan proses, biarkan Next.js handle
    return NextResponse.next()
  }

  // Next.js dev server (Turbopack) tidak meneruskan hostname asli ke request.url —
  // request.url selalu berisi binding address server (mis. localhost:3000).
  // Hostname yang benar ada di header x-forwarded-host (production & dev) atau host.
  // x-forwarded-host diutamakan karena di-set oleh proxy layer (Nginx, Vercel, dll).
  const forwardedHost = request.headers.get('x-forwarded-host')
  const hostHeader = request.headers.get('host')
  // Strip port dari hostname header jika ada (mis. "alhijrah.localhost:3000" → "alhijrah.localhost")
  const rawHost = (forwardedHost || hostHeader || '').split(':')[0]
  const hostname = rawHost

  const resolution = resolveDomain(hostname, baseDomain)

  switch (resolution.type) {
    case 'root':
      // Request ke root domain (mis. localhost:3000) → pass-through, tidak diubah
      return NextResponse.next()

    case 'tenant': {
      // Subdomain tenant (mis. alhijrah.localhost:3000) → rewrite ke /tenant-route/{slug}{path}
      // Penting: NextResponse.rewrite, BUKAN redirect — URL di browser tidak berubah
      // Catatan: folder _tenant tidak bisa dipakai karena Next.js App Router
      // memperlakukan prefix underscore (_) sebagai Private Folder (tidak di-route).
      const rewriteUrl = request.nextUrl.clone()
      rewriteUrl.pathname = `/tenant-route/${resolution.slug}${pathname}`
      return NextResponse.rewrite(rewriteUrl)
    }

    case 'unknown':
      // custom domain resolution: Sprint 9
      // Hostname tidak cocok pola manapun (bukan root, bukan *.{baseDomain}).
      // Nantinya ini akan menjadi titik entry resolusi customDomain dari tabel Tenant.
      // Untuk sekarang: pass-through biasa.
      return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match semua request path KECUALI:
     *   - _next/static  : file static Next.js (JS, CSS)
     *   - _next/image   : image optimizer
     *   - _tenant       : path internal hasil rewrite proxy ini sendiri
     *   - favicon.ico   : favicon
     *   - file dengan ekstensi (svg, png, jpg, ico, dll)
     * Pola ini memastikan proxy tidak infinite loop pada rewritten request.
     */
    '/((?!_next/static|_next/image|tenant-route|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf)$).*)',
  ],
}
