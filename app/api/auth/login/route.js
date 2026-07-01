import { NextResponse } from 'next/server';
import { createAuthToken } from '@/lib/auth';

export async function POST(request) {
  const { password } = await request.json();

  if (!password || password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const token = await createAuthToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
  return response;
}
