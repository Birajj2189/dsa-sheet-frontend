import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// /sheet is public — unauthenticated users can browse topics;
// user-specific actions are gated client-side via AuthModal
const PROTECTED_PATHS = ['/dashboard', '/profile']
const AUTH_PATHS = ['/login', '/signup']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasAccessToken = !!request.cookies.get('accessToken')?.value

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
  const isAuthPath = AUTH_PATHS.some((p) => pathname.startsWith(p))

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !hasAccessToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect already-authenticated users away from auth pages
  if (isAuthPath && hasAccessToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|api).*)'],
}
