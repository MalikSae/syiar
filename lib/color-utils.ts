/**
 * lib/color-utils.ts
 * Utility untuk konversi warna HSL dan derivasi palet warna dinamis Tenant
 */

export interface SitePalette {
  accent: string
  accentSoft: string
  bg: string
  dark: string
}

/**
 * Nilai default palet microsite statis (dipakai saat primaryColor NULL)
 */
export const DEFAULT_SITE_PALETTE: SitePalette = {
  accent: '#F38020',
  accentSoft: '#FAAE40',
  bg: '#F7F3EC',
  dark: '#133433',
}

/**
 * Konversi HEX string (#RRGGBB atau #RGB) ke HSL { h: 0-360, s: 0-100, l: 0-100 }
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let cleanHex = hex.replace(/^#/, '').trim()

  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((char) => char + char)
      .join('')
  }

  if (cleanHex.length !== 6) {
    return { h: 28, s: 90, l: 54 } // Fallback to Cloudflare Orange
  }

  const r = parseInt(cleanHex.substring(0, 2), 16) / 255
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) * 60
        break
      case g:
        h = ((b - r) / delta + 2) * 60
        break
      case b:
        h = ((r - g) / delta + 4) * 60
        break
    }
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/**
 * Konversi HSL { h: 0-360, s: 0-100, l: 0-100 } ke HEX string (#RRGGBB)
 */
export function hslToHex(h: number, s: number, l: number): string {
  const normH = ((h % 360) + 360) % 360
  const normS = Math.max(0, Math.min(100, s)) / 100
  const normL = Math.max(0, Math.min(100, l)) / 100

  const c = (1 - Math.abs(2 * normL - 1)) * normS
  const x = c * (1 - Math.abs(((normH / 60) % 2) - 1))
  const m = normL - c / 2

  let r = 0
  let g = 0
  let b = 0

  if (normH >= 0 && normH < 60) {
    r = c
    g = x
    b = 0
  } else if (normH >= 60 && normH < 120) {
    r = x
    g = c
    b = 0
  } else if (normH >= 120 && normH < 180) {
    r = 0
    g = c
    b = x
  } else if (normH >= 180 && normH < 240) {
    r = 0
    g = x
    b = c
  } else if (normH >= 240 && normH < 300) {
    r = x
    g = 0
    b = c
  } else {
    r = c
    g = 0
    b = x
  }

  const toHex = (val: number) => {
    const hex = Math.round((val + m) * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

/**
 * Menghasilkan palet lengkap 4 warna yang harmonis:
 * 1. Kalau primaryColorHex NULL / default -> return NILAI TETAP PERSIS (tanpa derivasi)
 * 2. Kalau primaryColorHex ADA -> derivasi accent, accentSoft, bg, dark
 */
export function getSitePalette(primaryColorHex: string | null | undefined): SitePalette {
  if (!primaryColorHex || primaryColorHex === 'default' || !/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(primaryColorHex)) {
    return DEFAULT_SITE_PALETTE
  }

  const { h, s, l } = hexToHsl(primaryColorHex)

  // 1. Accent: primaryColor apa adanya
  const accent = primaryColorHex.toUpperCase()

  // 2. Accent Soft: lightness +15-18%, saturasi sama (capped di 92%)
  const softL = Math.min(92, Math.round(l + 16))
  const accentSoft = hslToHex(h, s, softL)

  // 3. Background: Hue sama, Saturation ~16-18%, Lightness ~96-97% (tint sangat halus)
  const bg = hslToHex(h, 18, 96)

  // 4. Dark: Hue sama, Saturation ~30%, Lightness ~13% (gelap kaya & elegan)
  const dark = hslToHex(h, 30, 13)

  return {
    accent,
    accentSoft,
    bg,
    dark,
  }
}
