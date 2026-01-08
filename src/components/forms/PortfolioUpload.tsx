'use client'

import { useState } from 'react'
import { getTheme } from '@/lib/design-system'
import { LoadingButton } from '@/components/shared'
import { logger } from '@/lib/core/logging-service'

interface PortfolioImage {
  id?: string
  url: string
  file?: File
  title: string
  description: string
  category?: string
}

interface PortfolioUploadProps {
  onUpload: (images: PortfolioImage[]) => Promise<void>
  maxFiles?: number
  isDarkMode: boolean
  initialImages?: PortfolioImage[]
  error?: string
}

export function PortfolioUpload({ 
  onUpload, 
  maxFiles = 3, 
  isDarkMode, 
  initialImages = [],
  error 
}: PortfolioUploadProps) {
  const theme = getTheme(isDarkMode)
  const [uploadedImages, setUploadedImages] = useState<PortfolioImage[]>(initialImages)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = (file: File, index: number) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const newImages = [...uploadedImages]
      newImages[index] = {
        url: e.target?.result as string,
        file: file,
        title: '',
        description: '',
        category: ''
      }
      setUploadedImages(newImages)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file, index)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file, index)
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...uploadedImages]
    newImages[index] = { url: '', title: '', description: '' }
    setUploadedImages(newImages)
  }

  const updateImageDetails = (index: number, field: keyof PortfolioImage, value: string) => {
    const newImages = [...uploadedImages]
    if (newImages[index]) {
      newImages[index] = { ...newImages[index], [field]: value }
      setUploadedImages(newImages)
    }
  }

  const handleSubmit = async () => {
    const validImages = uploadedImages.filter(img => img.url && img.title)
    if (validImages.length === 0) return

    setIsUploading(true)
    try {
      await onUpload(validImages)
    } catch (error) {
      logger.error('Failed to upload portfolio:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-2" style={{ color: theme.text.primary }}>
          Upload Your 3 Best Works
        </h3>
        <p style={{ color: theme.text.secondary }}>
          Showcase your best work to help clients understand your style and expertise.
        </p>
      </div>
      
      {/* Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: maxFiles }).map((_, index) => (
          <UploadSlot
            key={index}
            index={index}
            theme={theme}
            uploadedImage={uploadedImages[index]}
            onFileUpload={(file) => handleFileUpload(file, index)}
            onDrop={(e) => handleDrop(e, index)}
            onRemove={() => removeImage(index)}
            onUpdateDetails={(field, value) => updateImageDetails(index, field, value)}
          />
        ))}
      </div>

      {/* Upload Guidelines */}
      <div 
        className="p-4 rounded-2xl"
        style={{ backgroundColor: theme.nestedBg, border: `1px solid ${theme.border}` }}
      >
        <h4 className="font-medium mb-2" style={{ color: theme.text.primary }}>
          Upload Guidelines:
        </h4>
        <ul className="text-sm space-y-1" style={{ color: theme.text.secondary }}>
          <li>• JPG, PNG, or WebP format</li>
          <li>• Maximum 5MB per image</li>
          <li>• High resolution (1200px+ width recommended)</li>
          <li>• Showcase your best work in different categories</li>
          <li>• Add titles and descriptions to help explain your work</li>
        </ul>
      </div>

      {error && (
        <p className="text-sm animate-slideUp" style={{ color: theme.error }}>
          {error}
        </p>
      )}

      {/* Submit Button */}
      <LoadingButton
        onClick={handleSubmit}
        loading={isUploading}
        disabled={uploadedImages.filter(img => img.url && img.title).length === 0}
        className="w-full py-3 rounded-2xl font-bold"
        style={{
          backgroundColor: theme.accent,
          color: '#000'
        }}
      >
        Save Portfolio Images
      </LoadingButton>
    </div>
  )
}

interface UploadSlotProps {
  index: number
  theme: any
  uploadedImage?: PortfolioImage
  onFileUpload: (file: File) => void
  onDrop: (e: React.DragEvent) => void
  onRemove: () => void
  onUpdateDetails: (field: keyof PortfolioImage, value: string) => void
}

function UploadSlot({ 
  index, 
  theme, 
  uploadedImage, 
  onFileUpload, 
  onDrop, 
  onRemove, 
  onUpdateDetails 
}: UploadSlotProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        className={`relative aspect-square rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
          isDragOver ? 'animate-pulse' : ''
        }`}
        style={{
          borderColor: uploadedImage?.url ? theme.accent : theme.border,
          backgroundColor: uploadedImage?.url ? 'transparent' : theme.nestedBg
        }}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => { onDrop(e); setIsDragOver(false) }}
        onClick={() => document.getElementById(`file-input-${index}`)?.click()}
      >
        <input
          id={`file-input-${index}`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onFileUpload(file)
          }}
        />

        {uploadedImage?.url ? (
          <div className="relative w-full h-full">
            <img 
              src={uploadedImage.url} 
              alt={uploadedImage.title || 'Portfolio image'}
              className="w-full h-full object-cover rounded-3xl"
            />
            <div className="absolute inset-0 bg-black/50 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button
                className="p-2 rounded-full hover:scale-110 transition-transform duration-200"
                style={{ backgroundColor: theme.accent, color: '#000' }}
                onClick={(e) => { e.stopPropagation(); onRemove() }}
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.accent + '20', color: theme.accent }}
            >
              📸
            </div>
            <div className="text-center">
              <p className="font-medium" style={{ color: theme.text.primary }}>
                Upload Work #{index + 1}
              </p>
              <p className="text-sm" style={{ color: theme.text.secondary }}>
                Drag & drop or click to browse
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Details Form */}
      {uploadedImage?.url && (
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Project title"
            value={uploadedImage.title || ''}
            onChange={(e) => onUpdateDetails('title', e.target.value)}
            className="w-full p-3 rounded-2xl border-2 transition-all duration-300 focus:outline-none"
            style={{
              backgroundColor: theme.nestedBg,
              borderColor: theme.border,
              color: theme.text.primary
            }}
          />
          <textarea
            placeholder="Brief description of the project..."
            value={uploadedImage.description || ''}
            onChange={(e) => onUpdateDetails('description', e.target.value)}
            rows={2}
            className="w-full p-3 rounded-2xl border-2 transition-all duration-300 focus:outline-none"
            style={{
              backgroundColor: theme.nestedBg,
              borderColor: theme.border,
              color: theme.text.primary
            }}
          />
        </div>
      )}
    </div>
  )
}