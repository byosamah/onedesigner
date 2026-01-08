import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { validateSession } from '@/lib/auth/session-handlers'
import { logger } from '@/lib/core/logging-service'

export async function POST(request: NextRequest) {
  try {
    // Validate designer session
    const { valid, session } = await validateSession('DESIGNER')
    if (!valid || !session?.designerId) {
      return apiResponse.unauthorized('Please log in as a designer')
    }

    const formData = await request.formData()
    const files = formData.getAll('images') as File[]
    const titles = formData.getAll('titles') as string[]
    const descriptions = formData.getAll('descriptions') as string[]
    const categories = formData.getAll('categories') as string[]

    if (files.length === 0) {
      return apiResponse.validationError('At least one image is required')
    }

    if (files.length > 3) {
      return apiResponse.validationError('Maximum 3 images allowed')
    }

    logger.info(`Uploading ${files.length} portfolio images for designer ${session.designerId}`)

    const supabase = createServiceClient()
    const uploadedImages = []

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const title = titles[i] || `Portfolio Image ${i + 1}`
      const description = descriptions[i] || ''
      const category = categories[i] || ''

      // Validate file
      if (!file.type.startsWith('image/')) {
        return apiResponse.validationError(`File ${file.name} is not an image`)
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return apiResponse.validationError(`File ${file.name} is too large (max 5MB)`)
      }

      try {
        // Convert file to base64 for storage (in a real app, use cloud storage)
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = buffer.toString('base64')
        const dataUrl = `data:${file.type};base64,${base64}`

        // Store portfolio image record
        const { data: imageRecord, error: imageError } = await supabase
          .from('designer_portfolio_images')
          .insert({
            designer_id: session.designerId,
            image_url: dataUrl, // In production, this would be a cloud storage URL
            image_key: `portfolio/${session.designerId}/${Date.now()}_${i}`, 
            project_title: title,
            project_description: description,
            category: category,
            display_order: i + 1
          })
          .select()
          .single()

        if (imageError) {
          logger.error('Error saving portfolio image:', imageError)
          continue
        }

        uploadedImages.push({
          id: imageRecord.id,
          url: imageRecord.image_url,
          title: imageRecord.project_title,
          description: imageRecord.project_description,
          category: imageRecord.category,
          displayOrder: imageRecord.display_order
        })

        logger.info(`✅ Uploaded portfolio image ${i + 1}:`, title)

      } catch (uploadError) {
        logger.error(`Error uploading file ${file.name}:`, uploadError)
        continue
      }
    }

    if (uploadedImages.length === 0) {
      return apiResponse.serverError('Failed to upload any images')
    }

    // Update designer's portfolio projects field for backward compatibility
    const portfolioProjects = uploadedImages.map(img => ({
      title: img.title,
      description: img.description,
      category: img.category,
      image_url: img.url
    }))

    await supabase
      .from('designers')
      .update({ 
        portfolio_projects: portfolioProjects,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.designerId)

    logger.info(`✅ Uploaded ${uploadedImages.length} portfolio images`)

    return apiResponse.success({
      images: uploadedImages,
      message: `Successfully uploaded ${uploadedImages.length} portfolio images`
    })

  } catch (error) {
    return handleApiError(error, 'designer/portfolio/upload')
  }
}

export async function GET(request: NextRequest) {
  try {
    // Validate designer session
    const { valid, session } = await validateSession('DESIGNER')
    if (!valid || !session?.designerId) {
      return apiResponse.unauthorized('Please log in as a designer')
    }

    const supabase = createServiceClient()

    // Get designer's portfolio images
    const { data: portfolioImages, error } = await supabase
      .from('designer_portfolio_images')
      .select('*')
      .eq('designer_id', session.designerId)
      .order('display_order', { ascending: true })

    if (error) {
      logger.error('Error fetching portfolio images:', error)
      return apiResponse.serverError('Failed to fetch portfolio images', error)
    }

    return apiResponse.success({
      images: portfolioImages?.map(img => ({
        id: img.id,
        url: img.image_url,
        title: img.project_title,
        description: img.project_description,
        category: img.category,
        displayOrder: img.display_order,
        createdAt: img.created_at
      })) || []
    })

  } catch (error) {
    return handleApiError(error, 'designer/portfolio/upload GET')
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Validate designer session
    const { valid, session } = await validateSession('DESIGNER')
    if (!valid || !session?.designerId) {
      return apiResponse.unauthorized('Please log in as a designer')
    }

    const { imageId } = await request.json()
    if (!imageId) {
      return apiResponse.validationError('Image ID is required')
    }

    const supabase = createServiceClient()

    // Delete the portfolio image
    const { error } = await supabase
      .from('designer_portfolio_images')
      .delete()
      .eq('id', imageId)
      .eq('designer_id', session.designerId) // Ensure designer can only delete their own images

    if (error) {
      logger.error('Error deleting portfolio image:', error)
      return apiResponse.serverError('Failed to delete image', error)
    }

    logger.info(`✅ Deleted portfolio image: ${imageId}`)

    return apiResponse.success({
      message: 'Portfolio image deleted successfully'
    })

  } catch (error) {
    return handleApiError(error, 'designer/portfolio/upload DELETE')
  }
}