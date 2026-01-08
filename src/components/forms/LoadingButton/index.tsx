import { memo, ButtonHTMLAttributes } from 'react'
import { ANIMATIONS } from '@/lib/constants'

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  theme: {
    accent: string
    text: {
      primary: string
    }
    border: string
  }
}

const LoadingButtonComponent = ({ 
  loading = false,
  loadingText,
  children,
  variant = 'primary',
  size = 'md',
  theme,
  className = '',
  disabled,
  ...props
}: LoadingButtonProps) => {
  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-4 px-12 text-base',
    lg: 'py-5 px-16 text-lg'
  }

  const variantStyles = {
    primary: {
      backgroundColor: theme.accent,
      color: '#000',
      border: 'none'
    },
    secondary: {
      backgroundColor: 'transparent',
      color: theme.text.primary,
      border: `2px solid ${theme.border}`
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.text.primary,
      border: 'none'
    }
  }

  const baseClasses = `font-bold rounded-xl transition-all duration-300 ${ANIMATIONS.scale} disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${className}`

  return (
    <button
      className={baseClasses}
      style={variantStyles[variant]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className={ANIMATIONS.spin}>⚡</span>
          {loadingText || 'Loading...'}
        </span>
      ) : (
        children
      )}
    </button>
  )
}

export const LoadingButton = memo(LoadingButtonComponent)
LoadingButton.displayName = 'LoadingButton'