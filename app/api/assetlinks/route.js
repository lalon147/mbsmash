import { NextResponse } from 'next/server';

// Android Digital Asset Links, served at /.well-known/assetlinks.json (via the
// rewrite in next.config.mjs). When ASSETLINKS_SHA256 is set — the SHA-256
// fingerprint of the APK's signing key, as printed by the Android build — the
// Trusted Web Activity verifies it owns this domain and launches with no
// browser address bar. Until then this returns an empty list: valid JSON, so
// the check simply stays unverified and the app still runs (with a URL bar).
//
// Set more than one fingerprint (e.g. a local key and Play App Signing) by
// separating them with commas.
export const dynamic = 'force-dynamic';

const PACKAGE_NAME = process.env.ANDROID_PACKAGE_NAME || 'app.mbsmash.twa';

export function GET() {
  const fingerprints = (process.env.ASSETLINKS_SHA256 || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const statements = fingerprints.length
    ? [{
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: PACKAGE_NAME,
          sha256_cert_fingerprints: fingerprints,
        },
      }]
    : [];

  return NextResponse.json(statements);
}
