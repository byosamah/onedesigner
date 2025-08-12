async function testDirectDbEndpoint() {
  console.log('🔧 Testing Direct Database Endpoint...\n')
  
  const testUrl = 'https://onedesigner.app/api/test-direct-db'
  
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
        console.log('✅ **AVATAR DEBUG INFO FOUND!**')
        console.log('- Designer Name:', data.debug.designerName)
        console.log('- Avatar URL:', data.debug.avatarUrl)
        console.log('- Avatar Accessible:', data.debug.avatarAccessible)
        console.log('- Database Working:', data.debug.databaseConnectionWorking)
        console.log('')
        
        if (data.debug.avatarUrl && data.debug.avatarAccessible) {
          console.log('🎯 **ROOT CAUSE IDENTIFIED:**')
          console.log('✅ Database has correct avatar URL')
          console.log('✅ Avatar URL is accessible (returns 200)')
          console.log('❌ The issue is in the frontend component logic')
          console.log('')
          
          console.log('🔍 **THE ACTUAL AVATAR URL TO TEST:**')
          console.log(data.debug.avatarUrl)
        }
      }
    } else {
      const errorText = await response.text()
      console.log('❌ Response error:')
      console.log(errorText)
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message)
  }
}

testDirectDbEndpoint().catch(console.error)