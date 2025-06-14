import type { Metadata } from 'next'
import './globals.css'
import { metadata } from './metadata'
import { ClientAuthProvider } from '@/components/ClientAuthProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <ClientAuthProvider>
          {children}
        </ClientAuthProvider>
      </body>
    </html>
  )
} 