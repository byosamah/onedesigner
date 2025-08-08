import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { validateSession } from '@/lib/auth/session-handlers'
import { apiResponse, handleApiError } from '@/lib/api/responses'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB in bytes
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  try {
    // Validate designer session
    const sessionResult = await validateSession('DESIGNER')
    if (!sessionResult.success) {
      return apiResponse.unauthorized(sessionResult.error)
    }

    const designerId = sessionResult.session.designerId
    const formData = await request.formData()
    
    const files = [
      formData.get('image1') as File | null,
      formData.get('image2') as File | null, 
      formData.get('image3') as File | null,
    ]

    const supabase = createServiceClient()
    const uploadedUrls: (string | null)[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      if (!file) {
        uploadedUrls.push(null)
        continue
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return apiResponse.error(`Image ${i + 1} exceeds 20MB limit`)
      }

      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return apiResponse.error(`Image ${i + 1} must be JPEG, PNG, or WebP format`)
      }

      // Create unique filename
      const fileExtension = file.name.split('.').pop()
      const fileName = `portfolio_${designerId}_${i + 1}_${Date.now()}.${fileExtension}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('designer-portfolios')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error(`Error uploading image ${i + 1}:`, uploadError)
        return apiResponse.serverError(`Failed to upload image ${i + 1}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('designer-portfolios')
        .getPublicUrl(uploadData.path)

      uploadedUrls.push(publicUrl)
    }

    // Update designer record with portfolio images
    const updateData: any = {}
    if (uploadedUrls[0]) updateData.portfolio_image_1 = uploadedUrls[0]
    if (uploadedUrls[1]) updateData.portfolio_image_2 = uploadedUrls[1]
    if (uploadedUrls[2]) updateData.portfolio_image_3 = uploadedUrls[2]

    const { error: updateError } = await supabase
      .from('designers')
      .update(updateData)
      .eq('id', designerId)

    if (updateError) {
      console.error('Error updating designer portfolio:', updateError)
      return apiResponse.serverError('Failed to save portfolio images')
    }

    return apiResponse.success({
      message: 'Portfolio images uploaded successfully',
      images: uploadedUrls.filter(Boolean)
    })

  } catch (error) {
    console.error('Portfolio upload error:', error)
    return handleApiError(error, 'designer/portfolio/images')
  }
}

export async function GET(request: NextRequest) {
  try {
    // Validate designer session
    const sessionResult = await validateSession('DESIGNER')
    if (!sessionResult.success) {
      return apiResponse.unauthorized(sessionResult.error)
    }

    const designerId = sessionResult.session.designerId
    const supabase = createServiceClient()

    // Get current portfolio images
    const { data: designer, error } = await supabase
      .from('designers')
      .select('portfolio_image_1, portfolio_image_2, portfolio_image_3')
      .eq('id', designerId)
      .single()

    if (error) {
      console.error('Error fetching portfolio images:', error)
      return apiResponse.serverError('Failed to fetch portfolio images')
    }

    return apiResponse.success({
      images: [
        designer.portfolio_image_1,
        designer.portfolio_image_2,
        designer.portfolio_image_3
      ].filter(Boolean)
    })

  } catch (error) {
    console.error('Portfolio fetch error:', error)
    return handleApiError(error, 'designer/portfolio/images')
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Validate designer session
    const sessionResult = await validateSession('DESIGNER')
    if (!sessionResult.success) {
      return apiResponse.unauthorized(sessionResult.error)
    }

    const designerId = sessionResult.session.designerId
    const { searchParams } = new URL(request.url)
    const imageIndex = parseInt(searchParams.get('index') || '0')

    if (imageIndex < 1 || imageIndex > 3) {
      return apiResponse.error('Image index must be 1, 2, or 3')
    }

    const supabase = createServiceClient()
    const columnName = `portfolio_image_${imageIndex}`

    // Remove image from designer record
    const { error: updateError } = await supabase
      .from('designers')
      .update({ [columnName]: null })
      .eq('id', designerId)

    if (updateError) {
      console.error('Error removing portfolio image:', updateError)
      return apiResponse.serverError('Failed to remove portfolio image')
    }

    return apiResponse.success({
      message: `Portfolio image ${imageIndex} removed successfully`
    })

  } catch (error) {
    console.error('Portfolio delete error:', error)
    return handleApiError(error, 'designer/portfolio/images')
  }
}