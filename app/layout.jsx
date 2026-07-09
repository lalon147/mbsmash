import './globals.css';

export const metadata = {
  title: 'MB Smash Repair',
  description: 'Parts ordering system',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#090612', color: '#e8edf7', colorScheme: 'dark' }}>{children}</body>
    </html>
  );
}
