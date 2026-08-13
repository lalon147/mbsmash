import { NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Home-screen install assets must be reachable without a session — Safari
  // fetches the manifest and icons before (and independently of) login.
  if (
    pathname === '/manifest.webmanifest' ||
    pathname === '/apple-touch-icon.png' ||
    pathname === '/favicon.png' ||
    pathname.startsWith('/icons/') ||
    // The Android app's ownership check (Digital Asset Links) is fetched by
    // Chrome with no session, the same as the manifest above.
    pathname.startsWith('/.well-known/')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;
  if (!token || !(await verifyAuthToken(token))) {
    // An expired session used to send a fetch to the login *page*, which came
    // back as HTML with a 200 and blew up in JSON.parse — so a lapsed session
    // showed up on the shop floor as an unexplained error rather than a login
    // screen. Data routes get a 401 they can act on; the browser navigating to
    // a page still gets sent to the login screen.
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
