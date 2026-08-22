/**
 * app/tenant-route/[slug]/page.tsx — Halaman tenant (hasil rewrite dari proxy.ts).
 * Placeholder verifikasi: tampil ketika akses via {slug}.localhost:3000.
 * Slug diambil dari params — belum ada query ke database (itu task Sprint berikutnya).
 * Akan diganti microsite/dashboard sesungguhnya di sprint berikutnya.
 *
 * Catatan: folder ini adalah target internal rewrite proxy.ts.
 * URL di browser tetap menampilkan subdomain asli ({slug}.localhost:3000)
 * karena menggunakan NextResponse.rewrite, bukan redirect.
 */
interface TenantPageProps {
  params: Promise<{ slug: string }>
}

export default async function TenantPage({ params }: TenantPageProps) {
  const { slug } = await params

  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem' }}>
      <p>TENANT: {slug}</p>
    </main>
  )
}
