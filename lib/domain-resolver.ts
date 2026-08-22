/**
 * domain-resolver.ts
 * Helper untuk resolusi domain: membedakan root domain vs subdomain tenant.
 * Dipakai oleh middleware.ts.
 *
 * BASE_DOMAIN format: "localhost:3000" (lokal) atau "syiar.link" (production)
 * — selalu dibaca dari env var, jangan hardcode.
 */

export type DomainResolution =
  | { type: 'root' }
  | { type: 'tenant'; slug: string }
  | { type: 'unknown'; hostname: string }

/**
 * Menerima hostname dari request (tanpa port, misal: "localhost" atau "alhijrah.localhost")
 * dan BASE_DOMAIN dari env (bisa dengan atau tanpa port, misal: "localhost:3000").
 *
 * Return:
 *   { type: 'root' }                 → request ke root domain, pass-through
 *   { type: 'tenant', slug: '...' }  → subdomain tenant, perlu rewrite ke /_tenant/{slug}/...
 *   { type: 'unknown', hostname }    → tidak cocok pola manapun (custom domain — Sprint 9)
 */
export function resolveDomain(hostname: string, baseDomain: string): DomainResolution {
  // Strip port dari baseDomain jika ada (mis. "localhost:3000" → "localhost")
  const baseDomainHost = baseDomain.split(':')[0]

  // Root domain: hostname persis sama dengan host bagian dari BASE_DOMAIN
  if (hostname === baseDomainHost) {
    return { type: 'root' }
  }

  // Subdomain tenant: hostname berakhiran ".{baseDomainHost}"
  // Contoh: "alhijrah.localhost" ends with ".localhost"
  const subdomainSuffix = `.${baseDomainHost}`
  if (hostname.endsWith(subdomainSuffix)) {
    const slug = hostname.slice(0, hostname.length - subdomainSuffix.length)
    // Guard: slug tidak boleh kosong atau mengandung karakter tidak valid
    if (slug.length > 0 && /^[a-z0-9-]+$/.test(slug)) {
      return { type: 'tenant', slug }
    }
  }

  // custom domain resolution: Sprint 9
  // Hostname tidak cocok root domain maupun subdomain pola *.{baseDomainHost}.
  // Ini akan relevan ketika customDomain mulai dipakai — untuk sekarang pass-through.
  return { type: 'unknown', hostname }
}
