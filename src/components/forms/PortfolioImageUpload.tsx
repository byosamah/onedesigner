'use client'

import { useState, useRef } from 'react'
import { getTheme } from '@/lib/design-system'
import { logger } from '@/lib/core/logging-service'

interface PortfolioImageUploadProps {
  isDarkMode: boolean
  images: (string | null)[]
  onImagesChange: (images: (string | null)[]) => void
  disabled?: boolean // For profile edit mode control
}

export function PortfolioImageUpload({ isDarkMode, images, onImagesChange, disabled = false }: PortfolioImageUploadProps) {
  const theme = getTheme(isDarkMode)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

  const handleFileSelect = async (index: number, file: File | null) => {
    if (!file) return

    // Validate file size (20MB)
    const maxSize = 20 * 1024 * 1024
    if (file.size > maxSize) {
      alert('Image must be less than 20MB')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a JPEG, PNG, or WebP image')
      return
    }

    setUploadingIndex(index)

    try {
      const formData = new FormData()
      formData.append(`image${index + 1}`, file)

      const response = await fetch('/api/designer/portfolio/images', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      
      // Update images array
      const newImages = [...images]
      newImages[index] = result.images[0] // The API returns the uploaded URL
      onImagesChange(newImages)

    } catch (error) {
      logger.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploadingIndex(null)
    }
  }

  const handleRemoveImage = async (index: number) => {
    setUploadingIndex(index)

    try {
      const response = await fetch(`/api/designer/portfolio/images?index=${index + 1}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Remove failed')
      }

      // Update images array
      const newImages = [...images]
      newImages[index] = null
      onImagesChange(newImages)

    } catch (error) {
      logger.error('Remove error:', error)
      alert(error instanceof Error ? error.message : 'Remove failed')
    } finally {
      setUploadingIndex(null)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-lg font-semibold mb-2" style={{ color: theme.text.primary }}>
          Portfolio Images
        </label>
        <p className="text-sm mb-6" style={{ color: theme.text.secondary }}>
          Upload up to 3 high-quality images of your work (max 20MB each). These will be shown to potential clients.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map((index) => (
          <div key={index} className="space-y-3">
            <div 
              className={`aspect-square rounded-2xl border-2 border-dashed transition-colors duration-300 relative overflow-hidden group ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
              style={{ 
                borderColor: images[index] ? theme.accent : theme.border,
                backgroundColor: theme.nestedBg,
                opacity: disabled ? 0.7 : 1
              }}
              onClick={() => !disabled && !images[index] && fileInputRefs[index].current?.click()}
            >
              {images[index] ? (
                <div className="relative w-full h-full">
                  <img 
                    src={images[index]!} 
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                    <div className={`transition-opacity duration-300 space-y-2 ${disabled ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                      {!disabled && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              fileInputRefs[index].current?.click()
                            }}
                            className="block w-full px-4 py-2 rounded-xl font-medium text-sm"
                            style={{
                              backgroundColor: theme.accent,
                              color: '#000'
                            }}
                          >
                            Replace
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveImage(index)
                            }}
                            className="block w-full px-4 py-2 rounded-xl font-medium text-sm"
                            style={{
                              backgroundColor: theme.error,
                              color: '#fff'
                            }}
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {uploadingIndex === index && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin text-2xl">⚡</div>
                        <span className="text-white text-sm">Processing...</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                  {uploadingIndex === index ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin text-3xl" style={{ color: theme.accent }}>⚡</div>
                      <span className="text-sm font-medium" style={{ color: theme.text.primary }}>
                        Uploading...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="text-4xl mb-3" style={{ color: theme.accent }}>
                        📸
                      </div>
                      <p className="text-sm font-medium mb-1" style={{ color: theme.text.primary }}>
                        {disabled ? `Image ${index + 1} Slot` : `Add Image ${index + 1}`}
                      </p>
                      <p className="text-xs" style={{ color: theme.text.secondary }}>
                        {disabled ? 'Enable edit mode to upload' : 'Click to upload'}
                      </p>
                      {!disabled && (
                        <p className="text-xs mt-2" style={{ color: theme.text.muted }}>
                          JPEG, PNG, WebP • Max 20MB
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              <input
                ref={fileInputRefs[index]}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileSelect(index, file)
                  }
                }}
                className="hidden"
              />
            </div>
            
            <div className="text-center">
              <p className="text-xs font-medium" style={{ color: theme.text.secondary }}>
                Image {index + 1}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div 
        className="p-4 rounded-2xl"
        style={{ backgroundColor: theme.accent + '10', border: `1px solid ${theme.accent}40` }}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <h4 className="font-medium mb-1" style={{ color: theme.text.primary }}>
              Portfolio Tips
            </h4>
            <ul className="text-sm space-y-1" style={{ color: theme.text.secondary }}>
              <li>• Upload your best work that represents your style and expertise</li>
              <li>• Use high-resolution images (at least 1200px width recommended)</li>
              <li>• Show variety in your portfolio - different projects and styles</li>
              <li>• Keep file sizes under 20MB for faster loading</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}