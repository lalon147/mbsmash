/** @type {import('next').NextConfig} */

// Content-Security-Policy. Written out here rather than inline so the reasoning
// for each source stays next to it.
//
// 'unsafe-inline' for styles is unavoidable: the whole UI is styled with React
// `style={{…}}` props, which become inline style attributes. It is the weakest
// line here and it is still worth having the rest.
//
// 'unsafe-inline' for scripts is what Next's own bootstrap needs on the App
// Router without wiring a per-request nonce through every response. 'unsafe-
// eval' is deliberately NOT granted — nothing in this app evaluates strings.
//
// data: appears in img-src because every photo in this app is a data URL, and
// in font-src because nothing loads a font at all (it is there to make the
// absence explicit rather than fall through to default-src).
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  // Nothing is ever embedded, and this app must never be embedded either —
  // frame-ancestors is the header that actually stops clickjacking in modern
  // browsers, with X-Frame-Options below covering anything older.
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // The PDF export and photo processing both build blob: URLs and open them.
  "worker-src 'self' blob:",
  'upgrade-insecure-requests',
].join('; ');

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Suppliers get sent links and PDFs; don't leak which vehicle page someone
  // was on when they followed one out.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // The camera is used for accident and invoice photos. Everything else this
  // app has no business asking for.
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
  // Vercel already sends HSTS; stated here so it survives a move off Vercel.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig = {
  // The version banner is free reconnaissance — it names the exact framework
  // build to look up advisories against.
  poweredByHeader: false,

  async rewrites() {
    return [
      // Digital Asset Links — the file Android fetches to confirm this site owns
      // the app and to drop the in-app browser URL bar. Served from a route so
      // the signing-key fingerprint can come from an env var (set once, after
      // the first APK build) rather than being hard-coded. It must live at this
      // exact well-known path for Chrome to find it.
      { source: '/.well-known/assetlinks.json', destination: '/api/assetlinks' },
    ];
  },

  async headers() {
    return [
      {
        // Nothing under /api may be held anywhere between the database and the
        // browser. A route handler that sets no Cache-Control of its own goes
        // out as `public, max-age=0, must-revalidate`, and Vercel's edge cache
        // is entitled to serve that as a HIT — /api/dashboard was coming back
        // minutes old. Clearing a part from the chase list wrote the change,
        // re-read the list, got the cached copy with the part still on it, and
        // put the row straight back: the tap looked like it had done nothing.
        //
        // `public` is wrong on its own terms too. These responses are read
        // against the caller's session, and a shared cache with no Vary on the
        // cookie can hand one person's /api/auth/me to the next.
        //
        // Set here rather than route by route so a new endpoint is never one
        // forgotten header away from the same bug.
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
      {
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
    ];
  },
};
export default nextConfig;
