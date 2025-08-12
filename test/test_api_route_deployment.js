async function testApiRouteDeployment() {
  console.log('🔧 Testing API Route Deployment...\n')
  
  const baseUrl = 'https://onedesigner2-k2le3nk9f-onedesigners-projects.vercel.app'
  const matchId = 'd4a262ed-7dff-47e0-92ba-7a3be2cd8236'
  const apiUrl = `${baseUrl}/api/client/matches/${matchId}`
  
  console.log('🌐 Testing API URL:', apiUrl)
  console.log('')
  
  try {
    console.log('📡 Making direct API request...')
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('📊 Response status:', response.status)
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()))
    
    const responseText = await response.text()
    console.log('📊 Response body:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''))
    
    if (response.status === 404) {
      console.log('')
      console.log('❌ **API ROUTE NOT FOUND - POSSIBLE ISSUES:**')
      console.log('1. Route file not properly deployed to Vercel')
      console.log('2. File structure issue in deployment')
      console.log('3. Next.js dynamic route not working')
      console.log('4. Build/deployment error')
    }
    
    if (response.status === 401) {
      console.log('')
      console.log('🔐 **AUTHENTICATION ISSUE:**')
      console.log('1. Need to be logged in as client')
      console.log('2. Missing or invalid session cookie')
      console.log('3. This is actually expected without login')
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message)
  }
  
  console.log('')
  console.log('🔍 **NEXT DEBUGGING STEPS:**')
  console.log('1. Check Vercel deployment logs')
  console.log('2. Check if all API routes are properly built')
  console.log('3. Test with authentication cookies')
  console.log('4. Try a simpler API route first')
  
  // Test a simpler API route
  console.log('')
  console.log('🧪 **Testing simpler API route:**')
  const healthUrl = `${baseUrl}/api/health`
  console.log('Testing:', healthUrl)
  
  try {
    const healthResponse = await fetch(healthUrl)
    console.log('Health API status:', healthResponse.status)
    const healthText = await healthResponse.text()
    console.log('Health API response:', healthText.substring(0, 200))
  } catch (error) {
    console.error('Health API error:', error.message)
  }
}

testApiRouteDeployment().catch(console.error)