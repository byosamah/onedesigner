import { cookies } from 'next/headers'
import { apiResponse, handleApiError } from '@/lib/api/responses'
import { AUTH_COOKIES } from '@/lib/constants'

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get(AUTH_COOKIES.ADMIN)
    
    if (!sessionCookie) {
      return apiResponse.unauthorized('No session found')
    }

    let session
    try {
      session = JSON.parse(sessionCookie.value)
    } catch {
      return apiResponse.unauthorized('Invalid session')
    }

    return apiResponse.success({
      admin: session,
      authenticated: true
    })
  } catch (error) {
    return handleApiError(error, 'admin/auth/session')
  }
}