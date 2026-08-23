import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Status Now',
  description: 'מה קורה עכשיו, בדיוק איפה שזה קורה',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
