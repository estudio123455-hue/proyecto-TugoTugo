import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only run on API routes that might need name cleaning
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    // Trigger automatic name cleaning in the background
    // This is a non-blocking operation
    fetch(`${request.nextUrl.origin}/api/auth/auto-clean-names`, {
      method: 'GET',
    }).catch(error => {
      console.log('Background name cleaning failed:', error)
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
