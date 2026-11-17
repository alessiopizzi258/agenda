import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Elite Agenda | Taccuino Personale',
  description: 'Agenda giornaliera, mensile e annuale con memoria fissa.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Elite Agenda',
    // Forza iOS a disattivare lo zoom e a trattarla come app nativa
    startupImage: [
      '/icon-512.png'
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#141413',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased selection:bg-[#c5a059]/30 selection:text-[#1a2a44]">
        {children}
      </body>
    </html>
  );
}