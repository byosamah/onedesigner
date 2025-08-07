import { config } from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env.local') })

console.log('Environment Variables Check:')
console.log('LEMONSQUEEZY_API_KEY exists:', !!process.env.LEMONSQUEEZY_API_KEY)
console.log('LEMONSQUEEZY_STORE_ID:', process.env.LEMONSQUEEZY_STORE_ID)
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL)

if (process.env.LEMONSQUEEZY_API_KEY) {
  console.log('API Key length:', process.env.LEMONSQUEEZY_API_KEY.length)
  console.log('API Key starts with:', process.env.LEMONSQUEEZY_API_KEY.substring(0, 20) + '...')
}