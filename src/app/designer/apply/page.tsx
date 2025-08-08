'use client'

export default function DesignerApplyPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#212121',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#cfcfcf', fontSize: '2rem', marginBottom: '1rem' }}>
          Designer Applications
        </h1>
        <p style={{ color: '#9CA3AF', marginBottom: '2rem' }}>
          We're currently updating our application process to better match designers with clients.
        </p>
        <p style={{ color: '#9CA3AF' }}>
          Please check back soon or contact us at hello@onedesigner.app
        </p>
      </div>
    </div>
  )
}