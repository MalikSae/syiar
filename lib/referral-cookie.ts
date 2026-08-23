import { cookies } from 'next/headers'

export const COOKIE_BOOKING_REF = 'syiar_ref_booking'
export const COOKIE_RECRUIT_REF = 'syiar_ref_recruit'
const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60

/**
 * Pola regex format kode referral agen:
 * Format yang di-generate sistem: 3-4 karakter alfanumerik kapital + 4 digit angka (misal: "AHMA1344", "HASA3529", "AGEN1001")
 * Mencakup kode kapital alfanumerik dengan panjang 4-16 karakter.
 */
export const REFERRAL_CODE_PATTERN = /^[A-Z0-9]{4,16}$/

/**
 * Validasi awal apakah suatu string memiliki format yang valid sebagai kode referral
 */
export function isValidReferralCodeFormat(code: string | null | undefined): boolean {
  if (!code || typeof code !== 'string') return false
  return REFERRAL_CODE_PATTERN.test(code.trim())
}

/**
 * Simpan kode referral booking jamaah ke cookie (30 hari, httpOnly=false)
 */
export async function setBookingReferral(code: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_BOOKING_REF, code.trim(), {
    maxAge: THIRTY_DAYS_SECONDS,
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
  })
}

/**
 * Baca kode referral booking jamaah dari cookie
 */
export async function getBookingReferral(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_BOOKING_REF)?.value
}

/**
 * Simpan kode referral rekrutmen agen ke cookie (30 hari, httpOnly=false)
 */
export async function setRecruitReferral(code: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_RECRUIT_REF, code.trim(), {
    maxAge: THIRTY_DAYS_SECONDS,
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
  })
}

/**
 * Baca kode referral rekrutmen agen dari cookie
 */
export async function getRecruitReferral(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_RECRUIT_REF)?.value
}
