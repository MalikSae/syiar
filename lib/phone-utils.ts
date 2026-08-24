/**
 * phone-utils.ts — Utility Normalisasi Nomor Telepon / WhatsApp
 *
 * Standar Kanonik: format "628xxxxxxxx" (tanpa tanda +, tanpa spasi, tanpa tanda baca).
 * Format ini konsisten dipakai untuk penyimpanan database dan kemudahan integrasi WhatsApp API.
 *
 * Mendukung input:
 * - "08123456789"    -> "628123456789"
 * - "+628123456789"  -> "628123456789"
 * - "628123456789"   -> "628123456789"
 * - "0812-3456-789"  -> "628123456789"
 * - "+62 812 3456"   -> "628123456"
 * - "8123456789"     -> "628123456789"
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return ''

  // 1. Ambil hanya karakter angka
  const digits = phone.replace(/\D/g, '')
  if (!digits) return ''

  // 2. Normalisasi prefix ke format "62..."
  if (digits.startsWith('0')) {
    return '62' + digits.slice(1)
  }

  if (digits.startsWith('62')) {
    return digits
  }

  if (digits.startsWith('8')) {
    return '62' + digits
  }

  return digits
}
