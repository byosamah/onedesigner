async function testCheckout() {
  console.log('\n=== Testing Checkout API ===\n')
  
  // First, let's test with a simple request to see the error
  try {
    const response = await fetch('http://localhost:3000/api/checkout/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productKey: 'STARTER_PACK',
        matchId: 'test-match-id'
      })
    })
    
    console.log('Response status:', response.status)
    const data = await response.json()
    console.log('Response data:', data)
    
    if (!response.ok) {
      console.log('❌ Checkout failed as expected (no session)')
    } else {
      console.log('✅ Checkout succeeded')
    }
  } catch (error) {
    console.error('❌ Network error:', error.message)
  }
}

testCheckout().catch(console.error)