/**
 * Helper untuk membuat slug URL bersih dari teks (lowercase, strip non-alfanumerik, spasi jadi dash)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
