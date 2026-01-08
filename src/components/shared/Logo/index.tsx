import { memo } from 'react'
import Link from 'next/link'

interface LogoProps {
  theme: {
    text: {
      primary: string
    }
    accent: string
  }
  title?: string
  size?: 'small' | 'medium' | 'large'
}

const LogoComponent = ({ theme, title, size = 'medium' }: LogoProps) => {
  const sizeClasses = {
    small: 'text-lg gap-2',
    medium: 'text-xl gap-2', 
    large: 'text-2xl gap-3'
  }
  
  const iconSizes = {
    small: { width: 20, height: 20 },
    medium: { width: 24, height: 24 },
    large: { width: 32, height: 32 }
  }
  
  return (
    <Link href="/" className={`flex items-center ${sizeClasses[size]} font-bold transition-colors duration-300`} style={{ color: theme.text.primary }}>
      <svg xmlns="http://www.w3.org/2000/svg" {...iconSizes[size]} viewBox="0 0 24 24" fill={theme.accent} stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1"/>
        <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
        <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>
      </svg>
      {title || 'OneDesigner'}
    </Link>
  )
}

export const Logo = memo(LogoComponent)
Logo.displayName = 'Logo'