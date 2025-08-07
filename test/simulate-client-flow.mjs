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

async function simulateClientFlow() {
  console.log('\n=== Simulating Client Flow ===\n')
  
  const testEmail = 'test@example.com'
  
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
  
  // Step 4: Create brief
  console.log('\n3. Creating brief...')
  const briefData = {
    projectType: 'Mobile App',
    industry: 'Technology',
    timeline: '2-3 months',
    budget: '$5000-10000',
    styles: ['Modern', 'Minimalist'],
    inspiration: 'Like Airbnb and Linear',
    requirements: 'Need a clean mobile app design'
  }
  
  const createBriefResponse = await fetch(`${API_BASE}/api/briefs/create`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': `client-session=${sessionCookie}`
    },
    body: JSON.stringify(briefData)
  })
  
  if (!createBriefResponse.ok) {
    console.error('Failed to create brief:', await createBriefResponse.text())
    return
  }
  
  const { brief } = await createBriefResponse.json()
  console.log('✓ Brief created:', brief.id)
  
  // Step 5: Find match
  console.log('\n4. Finding match...')
  const matchResponse = await fetch(`${API_BASE}/api/match/find`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': `client-session=${sessionCookie}`
    },
    body: JSON.stringify({ briefId: brief.id })
  })
  
  if (!matchResponse.ok) {
    console.error('Failed to find match:', await matchResponse.text())
    return
  }
  
  const matchData = await matchResponse.json()
  console.log('✓ Match found!')
  console.log('Designer:', matchData.match.designer.firstName, matchData.match.designer.lastInitial)
  console.log('Score:', matchData.match.score)
  console.log('Reasons:', matchData.match.reasons)
  
  console.log('\n✅ Client flow completed successfully!')
}

simulateClientFlow().catch(console.error)