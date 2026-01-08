import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { validateSession } from '@/lib/auth/session-handlers'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { logger } from '@/lib/core/logging-service'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes
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
    
    const file = formData.get('avatar') as File | null

    if (!file) {
      return apiResponse.error('No avatar file provided')
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return apiResponse.error('Avatar image must be less than 10MB')
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return apiResponse.error('Avatar must be JPEG, PNG, or WebP format')
    }

    const supabase = createServiceClient()

    // Create unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `avatar_${designerId}_${Date.now()}.${fileExtension}`

    // Upload to Supabase Storage (using designer-portfolios bucket for consistency)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('designer-portfolios')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      logger.error('Error uploading avatar:', uploadError)
      return apiResponse.serverError('Failed to upload avatar')
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('designer-portfolios')
      .getPublicUrl(uploadData.path)

    // Update designer record with new avatar URL
    const { error: updateError } = await supabase
      .from('designers')
      .update({ avatar_url: publicUrl })
      .eq('id', designerId)

    if (updateError) {
      logger.error('Error updating designer avatar:', updateError)
      return apiResponse.serverError('Failed to save avatar')
    }

    logger.info(`Avatar uploaded successfully for designer ${designerId}`)

    return apiResponse.success({
      message: 'Avatar uploaded successfully',
      avatarUrl: publicUrl
    })

  } catch (error) {
    logger.error('Avatar upload error:', error)
    return handleApiError(error, 'designer/avatar/upload')
  }
}