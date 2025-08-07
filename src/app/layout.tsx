import type { Metadata } from 'next'
import { Inter, Bricolage_Grotesque } from 'next/font/google'
import '@/styles/globals.css'
import { SuppressExtensionWarnings } from '@/components/suppress-extensions-warnings'

const inter = Inter({ subsets: ['latin'] })
const bricolageGrotesque = Bricolage_Grotesque({ 
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-bricolage'
})

export const metadata: Metadata = {
  title: 'OneDesigner - One brief. Perfect match.',
  description: 'Connect with your ideal designer in under 5 minutes through intelligent matching.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bricolageGrotesque.className} ${bricolageGrotesque.variable}`} suppressHydrationWarning>
        <SuppressExtensionWarnings />
        {children}
      </body>
    </html>
  )
}