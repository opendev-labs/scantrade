import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'ScanTrade | Simple Market Screeners',
  description: 'Lightweight trading screener system with smart alerts. Built for traders, not institutions.',
  keywords: ['trading', 'algorithmic trading', 'fintech', 'governance', 'market scanners'],
  metadataBase: new URL('https://governed-trading-system.vercel.app'),
  openGraph: {
    title: 'ScanTrade | Simple Market Screeners',
    description: 'Lightweight trading screener system with smart alerts.',
    url: 'https://governed-trading-system.vercel.app',
    siteName: 'ScanTrade',
    images: [
      {
        url: '/icon.svg',
        width: 800,
        height: 600,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ScanTrade',
    description: 'Lightweight trading screener system.',
    images: ['/icon.svg'],
  },
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/icon.svg',
  },
}

import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
