async function testProductionDomain() {
  console.log('🌐 Testing Production Domain...\n')
  
  // Try the actual production domain instead of preview URLs
  const productionUrls = [
    'https://onedesigner.app',
    'https://www.onedesigner.app',
    'https://onedesigner2.vercel.app'
  ]
  
  const matchId = 'd4a262ed-7dff-47e0-92ba-7a3be2cd8236'
  
  for (const baseUrl of productionUrls) {
    console.log(`🧪 Testing: ${baseUrl}`)
    
    try {
      // Test homepage first
      const homeResponse = await fetch(baseUrl)
      console.log(`   Homepage: ${homeResponse.status} ${homeResponse.statusText}`)
      
      if (homeResponse.status === 200) {
        // Test the match page
        const matchUrl = `${baseUrl}/client/match/${matchId}`
        console.log(`   Match URL: ${matchUrl}`)
        
        // Test API endpoint
        const apiUrl = `${baseUrl}/api/client/matches/${matchId}`
        const apiResponse = await fetch(apiUrl)
        console.log(`   API Status: ${apiResponse.status} ${apiResponse.statusText}`)
        
        if (apiResponse.status === 401) {
          console.log('   ✅ API working (401 = needs auth, which is expected)')
        }
        
        console.log(`   👉 **TRY THIS URL: ${matchUrl}**`)
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`)
    }
    
    console.log('')
  }
  
  console.log('🎯 **RECOMMENDED APPROACH:**')
  console.log('1. Try the production URLs above instead of preview URLs')
  console.log('2. Production domains should not have Vercel auth protection')
  console.log('3. Look for a URL that gives 401 (auth needed) not "Authentication Required" page')
}

testProductionDomain().catch(console.error)