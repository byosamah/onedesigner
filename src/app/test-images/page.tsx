'use client'

import { useState } from 'react'
import { getTheme } from '@/lib/design-system'

// Test page to verify avatar and portfolio image functionality
export default function TestImagesPage() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const theme = getTheme(isDarkMode)

  // Sample designer data
  const sampleDesigner = {
    id: "c915ab9a-7a38-42e9-85e4-8ebaf2fbbecb",
    firstName: "Mark",
    lastName: "Kowalski", 
    title: "Senior Motion Design Designer",
    avatar_url: "https://ui-avatars.com/api/?name=Mark+Kowalski&background=e9c46a&color=fff&size=200&bold=true"
  }

  // Avatar component with fallback
  const DesignerAvatar = ({ designer, size = 80, className = "" }: { designer: any, size?: number, className?: string }) => {
    const [imageError, setImageError] = useState(false)
    
    const getInitials = () => {
      return `${designer.firstName?.[0] || ''}${designer.lastName?.[0] || ''}`
    }
    
    if (imageError || !designer.avatar_url) {
      return (
        <div 
          className={`flex items-center justify-center rounded-full font-bold text-white ${className}`}
          style={{ 
            width: size, 
            height: size,
            backgroundColor: theme.accent,
            fontSize: size / 3
          }}
        >
          {getInitials()}
        </div>
      )
    }
    
    return (
      <img
        src={designer.avatar_url}
        alt={`${designer.firstName} ${designer.lastName}`}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
        onError={() => setImageError(true)}
      />
    )
  }

  // Portfolio Image component with error handling
  const PortfolioImage = ({ src, alt, index }: { src: string, alt: string, index: number }) => {
    const [imageError, setImageError] = useState(false)
    
    if (imageError) {
      return (
        <div 
          className="aspect-square bg-gray-200 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: theme.border }}
        >
          <span style={{ color: theme.text.muted }}>Image {index + 1}</span>
        </div>
      )
    }
    
    return (
      <img
        src={src}
        alt={alt}
        className="aspect-square object-cover rounded-xl"
        onError={() => setImageError(true)}
      />
    )
  }

  return (
    <main className="min-h-screen transition-colors duration-300 p-8" style={{ backgroundColor: theme.bg }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 transition-colors duration-300" style={{ color: theme.text.primary }}>
          Image Display Test
        </h1>

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="mb-8 px-4 py-2 rounded-lg font-medium transition-colors duration-300"
          style={{ backgroundColor: theme.accent, color: '#000' }}
        >
          Toggle {isDarkMode ? 'Light' : 'Dark'} Mode
        </button>

        {/* Avatar Test */}
        <div className="rounded-2xl p-6 mb-6" 
          style={{ 
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.border}`
          }}>
          <h2 className="text-xl font-bold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Avatar Test
          </h2>
          <div className="flex items-center gap-4">
            <DesignerAvatar designer={sampleDesigner} size={80} />
            <div>
              <p style={{ color: theme.text.primary }}>{sampleDesigner.firstName} {sampleDesigner.lastName}</p>
              <p style={{ color: theme.text.secondary }}>{sampleDesigner.title}</p>
              <p className="text-sm mt-2" style={{ color: theme.text.muted }}>
                Avatar URL: <code>{sampleDesigner.avatar_url}</code>
              </p>
            </div>
          </div>
        </div>

        {/* Blurred Avatar Test */}
        <div className="rounded-2xl p-6 mb-6" 
          style={{ 
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.border}`
          }}>
          <h2 className="text-xl font-bold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Blurred Avatar Test (Locked State)
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <DesignerAvatar designer={sampleDesigner} size={80} className="blur-sm" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">
                  🔒
                </div>
              </div>
            </div>
            <div>
              <p style={{ color: theme.text.primary }}>Designer {sampleDesigner.firstName}***</p>
              <p style={{ color: theme.text.secondary }}>{sampleDesigner.title}</p>
            </div>
          </div>
        </div>

        {/* Portfolio Images Test */}
        <div className="rounded-2xl p-6 mb-6" 
          style={{ 
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.border}`
          }}>
          <h2 className="text-xl font-bold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Portfolio Images Test
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((index) => {
              // Generate portfolio image based on designer's category
              const category = sampleDesigner.title?.includes('Motion') ? 'motion' : 'design'
              const portfolioImageUrl = `https://picsum.photos/seed/${category}${index}-${sampleDesigner.id}/800/600`
              
              return (
                <div key={index}>
                  <h3 className="text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                    Portfolio Image {index}
                  </h3>
                  <PortfolioImage 
                    src={portfolioImageUrl} 
                    alt={`Portfolio ${index}`} 
                    index={index - 1}
                  />
                  <p className="text-xs mt-2 break-all" style={{ color: theme.text.muted }}>
                    {portfolioImageUrl}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Blurred Portfolio Test */}
        <div className="rounded-2xl p-6" 
          style={{ 
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.border}`
          }}>
          <h2 className="text-xl font-bold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
            Blurred Portfolio Test (Locked State)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((index) => {
              const category = 'motion'
              const portfolioImageUrl = `https://picsum.photos/seed/${category}${index}-${sampleDesigner.id}/800/600`
              
              return (
                <div key={index} className="relative group">
                  <PortfolioImage 
                    src={portfolioImageUrl} 
                    alt={`Portfolio ${index}`} 
                    index={index - 1}
                  />
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <div className="bg-black/50 text-white text-xs px-3 py-2 rounded-lg">
                      🔒 Unlock to view
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}