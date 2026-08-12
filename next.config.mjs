/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ];
  },
};
export default nextConfig;
