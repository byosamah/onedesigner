import type { Metadata } from 'next'
import { Inter, Bricolage_Grotesque } from 'next/font/google'
import Script from 'next/script'
import '@/styles/globals.css'
import { SuppressExtensionWarnings } from '@/components/suppress-extensions-warnings'
import { ThemeProvider } from '@/lib/contexts/theme-context'

const inter = Inter({ subsets: ['latin'] })
const bricolageGrotesque = Bricolage_Grotesque({ 
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-bricolage',
  adjustFontFallback: false // Disable font fallback calculations to remove warning
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
      <Script
        data-website-id="68d10d1c0d0e4deea4a69fcb"
        data-domain="onedesigner.app"
        src="https://datafa.st/js/script.js"
        strategy="afterInteractive"
      />
      <body className={`${bricolageGrotesque.className} ${bricolageGrotesque.variable}`} suppressHydrationWarning>
        <SuppressExtensionWarnings />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}