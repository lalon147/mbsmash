import { NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';

// Every mutating route resolves the user from the cookie itself rather than
// trusting a header set upstream — an unsigned header would let a caller claim
// to be anyone, and the whole point of the audit trail is that it can't.
export async function getSessionUser(request) {
  return verifyAuthToken(request.cookies.get('auth_token')?.value);
}

export function unauthorized() {
  return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
}
