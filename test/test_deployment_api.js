async function testDeploymentApi() {
  console.log('🔧 Testing Deployed Test API...\n')
  
  const testUrl = 'https://onedesigner.app/api/test-match'
  
  console.log('🌐 Testing URL:', testUrl)
  console.log('')
  
  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('📊 Response status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('📊 Response data:')
      console.log(JSON.stringify(data, null, 2))
      
      if (data.success && data.debug) {
        console.log('')
        console.log('✅ **AVATAR DEBUG INFO:**')
        console.log('- Designer Name:', data.debug.designerName)
        console.log('- Avatar URL:', data.debug.avatarUrl)
        console.log('- Portfolio Count:', data.debug.portfolioCount)
        console.log('- Portfolio URLs:', data.debug.portfolioImages)
      }
    } else {
      const errorText = await response.text()
      console.log('❌ Response error:')
      console.log(errorText)
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message)
  }
  
  console.log('')
  console.log('🎯 **WHAT THIS TELLS US:**')
  console.log('- If this API works, the database access is fine')
  console.log('- If avatarUrl is NULL, that\'s why images don\'t load')
  console.log('- If avatarUrl has a value, the issue is in the frontend')
}

testDeploymentApi().catch(console.error)