import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Elite Agenda | High-Ticket Productivity',
  description: 'Sistema di archiviazione appunti e scheduling a latenza zero.',
  manifest: '/manifest.json', // Predisposizione per installazione su Telefono (PWA)
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className="h-screen w-screen flex antialiased">{children}</body>
    </html>
  )
}