'use client';

import { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageUrl: string, croppedBlob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
  theme: any;
}

export function ImageCropper({ 
  imageSrc, 
  onCropComplete, 
  onCancel, 
  aspectRatio: initialAspectRatio = 16/9, // Default to 16:9 for blog covers
  theme 
}: ImageCropperProps) {
  const [aspectRatio, setAspectRatio] = useState(initialAspectRatio);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 50,
    x: 5,
    y: 25
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize crop with aspect ratio
  useEffect(() => {
    if (imgRef.current && aspectRatio) {
      const { width, height } = imgRef.current;
      const imageAspect = width / height;
      
      let cropWidth = 90;
      let cropHeight = cropWidth / aspectRatio;
      
      // Adjust if crop height would exceed image bounds
      if (cropHeight > 90) {
        cropHeight = 90;
        cropWidth = cropHeight * aspectRatio;
      }
      
      // Ensure crop fits within image bounds considering aspect ratio
      if (imageAspect > aspectRatio) {
        // Image is wider than desired aspect ratio
        cropHeight = 70;
        cropWidth = (cropHeight * aspectRatio * height) / width * 100;
      } else {
        // Image is taller than desired aspect ratio
        cropWidth = 90;
        cropHeight = (cropWidth / aspectRatio * width) / height * 100;
      }
      
      setCrop({
        unit: '%',
        width: Math.min(cropWidth, 100),
        height: Math.min(cropHeight, 100),
        x: (100 - Math.min(cropWidth, 100)) / 2,
        y: (100 - Math.min(cropHeight, 100)) / 2
      });
    }
  }, [aspectRatio]);

  const getCroppedImg = async (): Promise<{ url: string; blob: Blob } | null> => {
    if (!completedCrop || !imgRef.current) return null;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas size to the actual crop size
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    // Draw the cropped image
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        const url = URL.createObjectURL(blob);
        resolve({ url, blob });
      }, 'image/jpeg', 0.95);
    });
  };

  const handleCropComplete = async () => {
    setLoading(true);
    try {
      const result = await getCroppedImg();
      if (result) {
        onCropComplete(result.url, result.blob);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" 
         style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div className="max-w-4xl w-full rounded-xl p-6" 
           style={{ backgroundColor: theme.cardBg }}>
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2" style={{ color: theme.text.primary }}>
            ✂️ Crop Your Image
          </h3>
          <p className="text-sm" style={{ color: theme.text.secondary }}>
            Adjust the crop area to select the perfect cover image for your blog post
          </p>
        </div>

        <div className="mb-4 max-h-[60vh] overflow-auto rounded-lg" 
             style={{ backgroundColor: theme.nestedBg }}>
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            className="max-w-full"
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              className="max-w-full h-auto"
              style={{ maxHeight: '60vh' }}
            />
          </ReactCrop>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setAspectRatio(16/9)}
              className="px-3 py-1 rounded-lg text-sm transition-all duration-200"
              style={{ 
                backgroundColor: aspectRatio === 16/9 ? theme.accent : theme.nestedBg,
                color: aspectRatio === 16/9 ? 'white' : theme.text.primary,
                border: `1px solid ${theme.border}`
              }}
            >
              16:9
            </button>
            <button
              onClick={() => setAspectRatio(4/3)}
              className="px-3 py-1 rounded-lg text-sm transition-all duration-200"
              style={{ 
                backgroundColor: aspectRatio === 4/3 ? theme.accent : theme.nestedBg,
                color: aspectRatio === 4/3 ? 'white' : theme.text.primary,
                border: `1px solid ${theme.border}`
              }}
            >
              4:3
            </button>
            <button
              onClick={() => setAspectRatio(1)}
              className="px-3 py-1 rounded-lg text-sm transition-all duration-200"
              style={{ 
                backgroundColor: aspectRatio === 1 ? theme.accent : theme.nestedBg,
                color: aspectRatio === 1 ? 'white' : theme.text.primary,
                border: `1px solid ${theme.border}`
              }}
            >
              1:1
            </button>
            <button
              onClick={() => setAspectRatio(undefined as any)}
              className="px-3 py-1 rounded-lg text-sm transition-all duration-200"
              style={{ 
                backgroundColor: !aspectRatio ? theme.accent : theme.nestedBg,
                color: !aspectRatio ? 'white' : theme.text.primary,
                border: `1px solid ${theme.border}`
              }}
            >
              Free
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: theme.nestedBg,
                color: theme.text.primary,
                border: `1px solid ${theme.border}`
              }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleCropComplete}
              className="px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: theme.accent,
                color: 'white'
              }}
              disabled={loading}
            >
              {loading ? '✂️ Cropping...' : '✅ Apply Crop'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}