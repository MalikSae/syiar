'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export interface PaymentFormState {
  success: boolean
  message?: string
  warning?: string
  errors?: {
    bankName?: string
    bankAccountNumber?: string
    bankAccountHolder?: string
    termsAndConditions?: string
  }
}

export async function updatePaymentSettings(
  prevState: PaymentFormState | null,
  formData: FormData
): Promise<PaymentFormState> {
  // 1. Guardrail Sesi
  const session = await getSession()
  if (!session || session.accountType !== 'travel_user' || !session.tenantId) {
    return {
      success: false,
      message: 'Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.',
    }
  }

  // 2. Ekstrak data dari FormData
  const bankName = formData.get('bankName')?.toString().trim() || ''
  const bankAccountNumber = formData.get('bankAccountNumber')?.toString().trim() || ''
  const bankAccountHolder = formData.get('bankAccountHolder')?.toString().trim() || ''
  const termsAndConditions = formData.get('termsAndConditions')?.toString().trim() || ''

  // 3. Validasi Lembut (Soft Validation)
  const bankFieldsFilledCount = [bankName, bankAccountNumber, bankAccountHolder].filter(Boolean).length
  let warning: string | undefined = undefined

  if (bankFieldsFilledCount > 0 && bankFieldsFilledCount < 3) {
    warning = 'Lengkapi ketiga field rekening supaya info pembayaran jelas buat jamaah.'
  }

  // 4. Update Database
  try {
    await prisma.tenant.update({
      where: {
        id: session.tenantId,
      },
      data: {
        bankName: bankName || null,
        bankAccountNumber: bankAccountNumber || null,
        bankAccountHolder: bankAccountHolder || null,
        termsAndConditions: termsAndConditions || null,
      },
    })

    revalidatePath('/dashboard/settings/pembayaran')

    return {
      success: true,
      message: 'Pengaturan pembayaran berhasil disimpan.',
      warning,
    }
  } catch (error) {
    console.error('Gagal memperbarui pengaturan pembayaran:', error)
    return {
      success: false,
      message: 'Terjadi kesalahan sistem saat menyimpan pengaturan pembayaran.',
    }
  }
}
