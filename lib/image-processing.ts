/**
 * lib/image-processing.ts
 * Client-side Canvas image processing utilities:
 * - Crop ke aspect ratio tertentu (1:1 untuk paket/icon, 21:9 untuk hero banner), resize, dan WebP conversion
 * - Proportional resize dan WebP conversion untuk logo horizontal (preserving aspect ratio alami)
 */

export interface ProcessedImageResult {
  file: File
  previewUrl: string
  width: number
  height: number
}

/**
 * Memvalidasi file gambar dari input browser
 */
export function validateImageFile(file: File, maxSizeBytes: number = 10 * 1024 * 1024): string | null {
  if (!file || !file.type.startsWith('image/')) {
    return 'File yang dipilih harus berupa file gambar (JPG, PNG, WebP).'
  }
  if (file.size > maxSizeBytes) {
    const maxMb = Math.round(maxSizeBytes / (1024 * 1024))
    return `Ukuran file gambar terlalu besar (maksimal ${maxMb}MB).`
  }
  return null
}

/**
 * Memproses gambar dengan Center-Crop ke target Aspect Ratio (lebar / tinggi) tertentu dan konversi ke WebP
 */
export function processImageToAspectRatio(
  file: File,
  aspectRatio: number,
  maxWidth: number = 1920
): Promise<ProcessedImageResult> {
  return new Promise((resolve, reject) => {
    const validationError = validateImageFile(file)
    if (validationError) {
      return reject(new Error(validationError))
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'))

    reader.onload = (event) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Gagal memuat gambar ke browser.'))

      img.onload = () => {
        try {
          const currentAspect = img.width / img.height
          let sWidth = img.width
          let sHeight = img.height
          let sx = 0
          let sy = 0

          // 1. Hitung koordinat Center Crop berdasarkan target aspect ratio
          if (currentAspect > aspectRatio) {
            // Gambar lebih lebar dari target aspect ratio -> potong sisi kiri & kanan
            sHeight = img.height
            sWidth = img.height * aspectRatio
            sx = (img.width - sWidth) / 2
            sy = 0
          } else {
            // Gambar lebih tinggi dari target aspect ratio -> potong sisi atas & bawah
            sWidth = img.width
            sHeight = img.width / aspectRatio
            sx = 0
            sy = (img.height - sHeight) / 2
          }

          // 2. Resize proporsional ke batas maxWidth
          const targetWidth = Math.min(Math.round(sWidth), maxWidth)
          const targetHeight = Math.max(1, Math.round(targetWidth / aspectRatio))

          const canvas = document.createElement('canvas')
          canvas.width = targetWidth
          canvas.height = targetHeight
          const ctx = canvas.getContext('2d')

          if (!ctx) {
            return reject(new Error('Gagal menginisialisasi canvas browser.'))
          }

          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight)

          // 3. Konversi ke WebP (kualitas 0.85) dengan fallback JPEG
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const processedFile = new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.webp`, {
                  type: 'image/webp',
                })
                const previewUrl = URL.createObjectURL(blob)
                resolve({ file: processedFile, previewUrl, width: targetWidth, height: targetHeight })
              } else {
                canvas.toBlob(
                  (jpegBlob) => {
                    if (jpegBlob) {
                      const processedFile = new File([jpegBlob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, {
                        type: 'image/jpeg',
                      })
                      const previewUrl = URL.createObjectURL(jpegBlob)
                      resolve({ file: processedFile, previewUrl, width: targetWidth, height: targetHeight })
                    } else {
                      reject(new Error('Gagal mengonversi gambar.'))
                    }
                  },
                  'image/jpeg',
                  0.85
                )
              }
            },
            'image/webp',
            0.85
          )
        } catch (err) {
          reject(err)
        }
      }

      img.src = event.target?.result as string
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Wrapper tipis: Crop 1:1 persegi (Foto Paket, Icon Tenant)
 */
export function processSquareImage(
  file: File,
  maxSize: number = 1200
): Promise<ProcessedImageResult> {
  return processImageToAspectRatio(file, 1, maxSize)
}

/**
 * Wrapper tipis: Crop 21:9 rasio lebar khas banner (Hero Background Image Tenant)
 */
export function processHeroImage(
  file: File,
  maxWidth: number = 1920
): Promise<ProcessedImageResult> {
  return processImageToAspectRatio(file, 21 / 9, maxWidth)
}

/**
 * Memproses gambar logo horizontal: TANPA crop paksa, hanya resize proporsional jika melebihi batas
 * Digunakan untuk: Logo Horizontal Tenant
 */
export function processLogoImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 400
): Promise<ProcessedImageResult> {
  return new Promise((resolve, reject) => {
    const validationError = validateImageFile(file)
    if (validationError) {
      return reject(new Error(validationError))
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'))

    reader.onload = (event) => {
      const img = new Image()
      img.onerror = () => reject(new Error('Gagal memuat gambar ke browser.'))

      img.onload = () => {
        try {
          // 1. Skala proporsional jika melebihi maxWidth atau maxHeight
          const scale = Math.min(1, maxWidth / img.width, maxHeight / img.height)
          const targetWidth = Math.max(1, Math.round(img.width * scale))
          const targetHeight = Math.max(1, Math.round(img.height * scale))

          const canvas = document.createElement('canvas')
          canvas.width = targetWidth
          canvas.height = targetHeight
          const ctx = canvas.getContext('2d')

          if (!ctx) {
            return reject(new Error('Gagal menginisialisasi canvas browser.'))
          }

          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, targetWidth, targetHeight)

          // 2. Konversi ke WebP (kualitas 0.85) dengan fallback PNG/JPEG
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const processedFile = new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.webp`, {
                  type: 'image/webp',
                })
                const previewUrl = URL.createObjectURL(blob)
                resolve({ file: processedFile, previewUrl, width: targetWidth, height: targetHeight })
              } else {
                canvas.toBlob(
                  (pngBlob) => {
                    if (pngBlob) {
                      const processedFile = new File([pngBlob], `${file.name.replace(/\.[^.]+$/, '')}.png`, {
                        type: 'image/png',
                      })
                      const previewUrl = URL.createObjectURL(pngBlob)
                      resolve({ file: processedFile, previewUrl, width: targetWidth, height: targetHeight })
                    } else {
                      reject(new Error('Gagal mengonversi gambar.'))
                    }
                  },
                  'image/png'
                )
              }
            },
            'image/webp',
            0.85
          )
        } catch (err) {
          reject(err)
        }
      }

      img.src = event.target?.result as string
    }

    reader.readAsDataURL(file)
  })
}
