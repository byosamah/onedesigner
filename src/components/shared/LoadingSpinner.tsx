import React from 'react'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
}

export function LoadingSpinner({ 
  size = 'medium',
  color
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8', 
    large: 'h-12 w-12'
  }

  return (
    <div
      className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]}`}
      style={{ 
        borderColor: color || 'currentColor' 
      }}
    />
  )
}