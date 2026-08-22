import bcrypt from 'bcryptjs'
import * as jose from 'jose'
import { cookies } from 'next/headers'

export type AccountType = 'travel_user' | 'agent' | 'platform_admin'

export interface SessionPayload {
  accountType: AccountType
  accountId: string
  tenantId?: string
}

const COOKIE_NAME = 'syiar_session'
const SESSION_EXPIRY_SECONDS = 7 * 24 * 60 * 60 // 7 hari

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not defined')
  }
  return new TextEncoder().encode(secret)
}

/**
 * Hash password plain text dengan bcryptjs (salt rounds 10)
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}

/**
 * Verifikasi password plain text terhadap hash
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

/**
 * Buat session JWT baru dan simpan ke cookie httpOnly
 */
export async function createSession(payload: SessionPayload): Promise<void> {
  const secretKey = getSecretKey()
  const jwt = await new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY_SECONDS,
    path: '/',
  })
}

/**
 * Baca dan validasi session JWT dari cookie.
 * Return null jika tidak ada cookie, token invalid, atau token expired.
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(COOKIE_NAME)
    if (!sessionCookie?.value) {
      return null
    }

    const secretKey = getSecretKey()
    const { payload } = await jose.jwtVerify(sessionCookie.value, secretKey)

    if (
      !payload ||
      typeof payload !== 'object' ||
      !payload.accountType ||
      !payload.accountId
    ) {
      return null
    }

    return {
      accountType: payload.accountType as AccountType,
      accountId: payload.accountId as string,
      tenantId: payload.tenantId ? (payload.tenantId as string) : undefined,
    }
  } catch {
    // JWT verification failed (expired, tampered, or invalid)
    return null
  }
}

/**
 * Hapus cookie session
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
