import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/index.css'
import { ClientAuthProvider } from '@/components/ClientAuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MovieMind - AI-Powered Movie Recommendations',
  description: 'Discover your next favorite movie with AI-powered recommendations',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientAuthProvider>
          {children}
        </ClientAuthProvider>
      </body>
    </html>
  )
} 