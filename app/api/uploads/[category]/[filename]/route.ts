import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

interface RouteProps {
  params: Promise<{ category: string; filename: string }>
}

const ALLOWED_CATEGORIES = ['packages', 'tenants']

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const { category, filename } = await params

    if (!category || !filename || typeof category !== 'string' || typeof filename !== 'string') {
      return NextResponse.json({ error: 'Category and filename parameters are required' }, { status: 400 })
    }

    // Guardrail Keamanan: Validasi Whitelist Category
    if (!ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid upload category' }, { status: 400 })
    }

    // Guardrail Keamanan: Cegah Path Traversal pada category maupun filename
    const hasTraversal = (str: string) =>
      str.includes('..') ||
      str.includes('/') ||
      str.includes('\\') ||
      str.includes('%2e%2e') ||
      str.includes('%2f') ||
      str.includes('%5c')

    if (hasTraversal(category) || hasTraversal(filename)) {
      return NextResponse.json({ error: 'Invalid filename or path traversal detected' }, { status: 400 })
    }

    const uploadsDir = path.resolve(process.cwd(), 'uploads', category)
    const filePath = path.resolve(uploadsDir, filename)

    // Pastikan path target berada persis di dalam folder uploads/{category}
    if (!filePath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const fileBuffer = fs.readFileSync(filePath)
    const ext = path.extname(filename).toLowerCase()

    let contentType = 'image/webp'
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg'
    else if (ext === '.png') contentType = 'image/png'
    else if (ext === '.webp') contentType = 'image/webp'
    else if (ext === '.svg') contentType = 'image/svg+xml'

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err: any) {
    console.error('Error serving upload file:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
