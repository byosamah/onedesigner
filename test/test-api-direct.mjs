async function testAPIDirect() {
  console.log('\n=== Testing API Directly ===\n')

  // Test with a known good brief ID
  const briefId = '9a48ee32-88fb-4c6e-be95-1de8728bd05a'
  
  console.log(`Testing with brief ID: ${briefId}`)
  
  try {
    const response = await fetch('http://localhost:3000/api/match/find', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ briefId })
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    const text = await response.text()
    console.log('Response body:', text)
    
    if (response.ok) {
      const data = JSON.parse(text)
      console.log('\n✅ Success! Match found:')
      console.log('Designer:', data.match.designer.firstName, data.match.designer.lastInitial)
      console.log('Score:', data.match.score)
    } else {
      console.log('\n❌ Error:', text)
    }
  } catch (error) {
    console.error('\n❌ Network error:', error)
  }
}

testAPIDirect()