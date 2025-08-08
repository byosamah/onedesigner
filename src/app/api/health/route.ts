import { apiResponse } from '@/lib/api/responses'

export async function GET() {
  return apiResponse.success({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'OneDesigner API is running'
  })
}