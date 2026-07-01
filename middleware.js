import { NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;
  if (!token || !(await verifyAuthToken(token))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
