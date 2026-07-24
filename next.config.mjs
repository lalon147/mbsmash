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
};
export default nextConfig;
