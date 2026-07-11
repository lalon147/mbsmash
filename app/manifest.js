// Web App Manifest — makes the app installable to the iOS/Android home screen
// so it launches standalone (no browser chrome) with its own icon and splash.
// Next.js serves this at /manifest.webmanifest automatically.
export default function manifest() {
  return {
    name: 'MB Smash Repair',
    short_name: 'MB Smash',
    description: 'Parts management system for MB Smash Repair',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#090612',
    theme_color: '#090612',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
