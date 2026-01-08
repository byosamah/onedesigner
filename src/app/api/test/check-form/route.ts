import { NextRequest } from 'next/server'
import { apiResponse } from '@/lib/api/responses'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    console.log('Received form data:', {
      design_category: data.design_category,
      hasCategory: !!data.design_category,
      categoryType: typeof data.design_category,
      allFields: Object.keys(data)
    })

    return apiResponse.success({
      received: data,
      category: data.design_category,
      message: `Category ${data.design_category} received successfully`
    })

  } catch (error) {
    return apiResponse.serverError('Failed to process form data')
  }
}