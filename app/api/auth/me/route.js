import { NextResponse } from 'next/server';
import { getSessionUser, unauthorized } from '@/lib/session';

export async function GET(request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();
  return NextResponse.json({ username: user.username, name: user.name });
}
