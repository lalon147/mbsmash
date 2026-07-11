import './globals.css';

export const metadata = {
  title: 'MB Smash Repair',
  description: 'Parts ordering system',
  // Home-screen app identity (iOS "Add to Home Screen" launches standalone).
  applicationName: 'MB Smash',
  appleWebApp: {
    capable: true,
    title: 'MB Smash',
    // Content extends under the status bar; the header pads for it via safe-area insets.
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  // Fill the whole screen (behind the notch / Dynamic Island / home indicator) and
  // expose env(safe-area-inset-*) so the UI can pad around them. Zoom stays enabled
  // for accessibility — input auto-zoom is prevented via 16px font sizes, not by locking scale.
  viewportFit: 'cover',
  themeColor: '#090612',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#090612', color: '#e8edf7', colorScheme: 'dark' }}>{children}</body>
    </html>
  );
}
