import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// /sheet is public — unauthenticated users can browse topics;
// user-specific actions are gated client-side via AuthModal
//
// Important for production:
// The backend runs on a different HTTPS domain than Amplify, so HttpOnly auth
// cookies belong to the API domain and are not visible to this Next.js proxy.
// Dashboard/profile protection is therefore handled client-side via /auth/me.
const PROTECTED_PATHS: string[] = []

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))

  // Kept as a no-op extension point for future same-domain deployments.
  if (isProtected) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|api).*)'],
}
