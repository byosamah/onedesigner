'use client'

import { Bricolage_Grotesque } from 'next/font/google'
import './globals.css'

const bricolageGrotesque = Bricolage_Grotesque({ 
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-bricolage'
})

// Metadata must be defined in a separate server component or page.tsx

export default function TestRedesignLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${bricolageGrotesque.className} ${bricolageGrotesque.variable}`}>
      {children}
    </div>
  )
}