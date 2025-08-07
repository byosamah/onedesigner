import { Bricolage_Grotesque } from 'next/font/google'
import { Metadata } from 'next'

const bricolageGrotesque = Bricolage_Grotesque({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage'
})

export const metadata: Metadata = {
  title: 'Perfect Match Found - OneDesigner',
  description: 'We found the perfect designer for your project',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function MatchRedesignLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${bricolageGrotesque.variable} font-sans`}>
      {children}
    </div>
  )
}