'use client'

import { getTheme } from '@/lib/design-system'

export default function DesignerApplyPage() {
  const theme = getTheme(true)
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: theme.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: theme.text.primary, fontSize: '2rem', marginBottom: '1rem' }}>
          Designer Applications
        </h1>
        <p style={{ color: theme.text.secondary }}>
          Applications are temporarily closed. Please check back later.
        </p>
      </div>
    </div>
  )
}