import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NTDIL Games',
  description: 'Daily games to challenge your brain',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  )
}
