import { NextRequest, NextResponse } from 'next/server';
export async function middleware(request: NextRequest) {
  // console.log('🔍 Middleware check for:', request.nextUrl.pathname);

  // Allow auth pages and API routes
  if (
    request.nextUrl.pathname.startsWith('/auth') ||
    request.nextUrl.pathname.startsWith('/api/auth') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  try {
    // For database sessions, check for session cookie
    const sessionToken =
      request.cookies.get('next-auth.session-token')?.value ||
      request.cookies.get('__Secure-next-auth.session-token')?.value;

    // console.log('🔍 Session token found:', !!sessionToken);

    if (!sessionToken) {
      // console.log('🚫 No session token found, redirecting to auth');
      const url = new URL('/auth', request.url);
      url.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    console.log('✅ Session token valid, allowing access');
    return NextResponse.next();
  } catch (error) {
    console.error('❌ Error in middleware:', error);
    const url = new URL('/auth', request.url);
    url.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/((?!api/auth|auth|_next/static|_next/image|favicon.ico).*)'],
};
