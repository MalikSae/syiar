import crypto from 'crypto'

/**
 * booking-code.ts — Utility Generator Kode Booking
 *
 * Menggunakan karakter alfanumerik yang bebas dari ambiguitas visual:
 * - Dikecualikan: '0' (nol), 'O' (huruf O), '1' (angka 1), 'I' (huruf I), 'L' (huruf L).
 * - Karakter yang digunakan (30 karakter):
 *   2, 3, 4, 5, 6, 7, 8, 9,
 *   A, B, C, D, E, F, G, H, J, K, M, N, P, Q, R, S, T, U, V, W, X, Y, Z
 *
 * Panjang default: 8 karakter (misal: "K7R9M2XP").
 * Sangat mudah dibaca & diketik manual jamaah saat cek status booking di halaman /booking-status.
 */

const UNAMBIGUOUS_CHARACTERS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'

export function generateBookingCode(length: number = 8): string {
  const bytes = crypto.randomBytes(length)
  let code = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = bytes[i] % UNAMBIGUOUS_CHARACTERS.length
    code += UNAMBIGUOUS_CHARACTERS[randomIndex]
  }

  return code
}
