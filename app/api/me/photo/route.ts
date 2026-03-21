import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()

  if (!session?.accessToken) {
    return new NextResponse(null, { status: 401 })
  }

  try {
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me/photo/$value',
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      // User has no photo — return 404 so client falls back to initials
      return new NextResponse(null, { status: 404 })
    }

    const photoBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') ?? 'image/jpeg'

    return new NextResponse(photoBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',  // cache 1 hour
      },
    })
  } catch (error) {
    console.error('Error fetching MS Graph photo:', error)
    return new NextResponse(null, { status: 500 })
  }
}
