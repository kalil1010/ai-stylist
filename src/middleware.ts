import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Enforce HTTPS in production behind common proxies (Render, Railway, etc.)
export function middleware(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    const proto = req.headers.get('x-forwarded-proto')
    if (proto && proto !== 'https') {
      const url = new URL(req.url)
      url.protocol = 'https:'
      return NextResponse.redirect(url, 308)
    }
  }
  return NextResponse.next()
}

// Apply everywhere; customize to skip assets if needed
export const config = {
  matcher: '/:path*',
}

