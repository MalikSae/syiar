import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { COOKIE_RECRUIT_REF, isValidReferralCodeFormat } from '@/lib/referral-cookie'

interface RouteProps {
  params: Promise<{ slug: string; kode: string }>
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  const { slug, kode } = await params

  // 1. Guardrail Regex: jika format bukan pola kode referral, langsung 404 tanpa query DB
  if (!isValidReferralCodeFormat(kode)) {
    return new NextResponse(null, { status: 404 })
  }

  // 2. Resolve Tenant dari subdomain
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
  })

  if (!tenant || tenant.status !== 'active') {
    return new NextResponse(null, { status: 404 })
  }

  // 3. Tentukan target URL redirect bersih
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000'
  const protocol = request.headers.get('x-forwarded-proto') || (request.url.startsWith('https') ? 'https' : 'http')
  const redirectUrl = `${protocol}://${host}/gabung-agen`
  const response = NextResponse.redirect(redirectUrl)

  // 4. Validasi kode referral agen di database (harus approved dan milik tenant ini)
  const agent = await prisma.agent.findFirst({
    where: {
      tenantId: tenant.id,
      referralCode: kode,
      status: 'approved',
    },
  })

  // 5. Jika valid & approved, simpan cookie syiar_ref_recruit (30 hari, httpOnly=false)
  if (agent) {
    response.cookies.set(COOKIE_RECRUIT_REF, agent.referralCode, {
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
    })
  }

  return response
}
