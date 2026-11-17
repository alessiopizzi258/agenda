import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Elite Agenda | Taccuino Personale',
  description: 'Agenda giornaliera, mensile e annuale con memoria fissa.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Elite Agenda',
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
      <body className="antialiased selection:bg-[#c5a059]/30 selection:text-[#1a2a44]">
        {children}
      </body>
    </html>
  );
}