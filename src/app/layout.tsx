import type { Metadata } from 'next'
import './globals.css'
import { AgenationProvider } from '@/components/AgenationProvider'

export const metadata: Metadata = {
  title: 'DealRadar — Riga Property Intelligence',
  description: 'Find underpriced properties in Riga before anyone else.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <AgenationProvider />
      </body>
    </html>
  )
}
