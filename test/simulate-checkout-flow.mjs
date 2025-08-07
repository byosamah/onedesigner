import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const API_BASE = 'http://localhost:3000'

async function simulateCheckoutFlow() {
  console.log('\n=== Simulating Checkout Flow ===\n')
  
  const testEmail = 'checkout-test@example.com'
  
  // Step 1: Send OTP
  console.log('1. Sending OTP...')
  const sendOtpResponse = await fetch(`${API_BASE}/api/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail })
  })
  
  if (!sendOtpResponse.ok) {
    console.error('Failed to send OTP:', await sendOtpResponse.text())
    return
  }
  console.log('✓ OTP sent successfully')
  
  // Step 2: Get the OTP from database
  const { data: authToken } = await supabase
    .from('auth_tokens')
    .select('token')
    .eq('email', testEmail)
    .eq('type', 'otp')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
    
  if (!authToken) {
    console.error('No OTP found in database')
    return
  }
  console.log(`✓ Found OTP: ${authToken.token}`)
  
  // Step 3: Verify OTP
  console.log('\n2. Verifying OTP...')
  const verifyResponse = await fetch(`${API_BASE}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email: testEmail,
      token: authToken.token 
    })
  })
  
  if (!verifyResponse.ok) {
    console.error('Failed to verify OTP:', await verifyResponse.text())
    return
  }
  
  const verifyData = await verifyResponse.json()
  const setCookieHeader = verifyResponse.headers.get('set-cookie')
  console.log('✓ OTP verified successfully')
  console.log('Client ID:', verifyData.client?.id)
  
  // Extract session cookie
  const cookieMatch = setCookieHeader?.match(/client-session=([^;]+)/)
  const sessionCookie = cookieMatch ? cookieMatch[1] : null
  
  if (!sessionCookie) {
    console.error('No session cookie received')
    return
  }
  
  console.log('✓ Session cookie extracted')
  
  // Step 4: Test checkout
  console.log('\n3. Testing checkout...')
  const checkoutResponse = await fetch(`${API_BASE}/api/checkout/create`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': `client-session=${sessionCookie}`
    },
    body: JSON.stringify({
      productKey: 'STARTER_PACK',
      matchId: 'test-match-id'
    })
  })
  
  console.log('Checkout response status:', checkoutResponse.status)
  
  if (!checkoutResponse.ok) {
    const errorText = await checkoutResponse.text()
    console.error('✗ Checkout failed:', errorText)
    
    // Check if it's HTML (server error) or JSON
    try {
      const errorData = JSON.parse(errorText)
      console.log('Error details:', errorData)
    } catch {
      console.log('Server returned HTML error page')
    }
  } else {
    const data = await checkoutResponse.json()
    console.log('✓ Checkout created successfully!')
    console.log('Checkout URL:', data.checkoutUrl)
  }
}

simulateCheckoutFlow().catch(console.error)