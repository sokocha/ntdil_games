import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'

export const metadata: Metadata = {
  title: 'PlayDay',
  description: 'Daily games to challenge your brain',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PlayDay',
  },
}

export const viewport: Viewport = {
  themeColor: '#030712',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body className="antialiased min-h-screen bg-gray-950 text-white">
        <ServiceWorkerRegistration />
        <Navbar />
        {children}
      </body>
    </html>
  )
}
