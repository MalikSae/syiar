import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

interface RouteProps {
  params: Promise<{ filename: string }>
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    const { filename } = await params

    if (!filename || typeof filename !== 'string') {
      return NextResponse.json({ error: 'Filename parameter is required' }, { status: 400 })
    }

    // Guardrail Keamanan: Cegah Path Traversal
    if (
      filename.includes('..') ||
      filename.includes('/') ||
      filename.includes('\\') ||
      filename.includes('%2e%2e') ||
      filename.includes('%2f') ||
      filename.includes('%5c')
    ) {
      return NextResponse.json({ error: 'Invalid filename or path traversal detected' }, { status: 400 })
    }

    const uploadsDir = path.resolve(process.cwd(), 'uploads', 'packages')
    const filePath = path.resolve(uploadsDir, filename)

    // Pastikan path target berada persis di dalam folder uploads/packages
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

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err: any) {
    console.error('Error serving package image upload:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
