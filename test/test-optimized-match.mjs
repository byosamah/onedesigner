import { config } from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env.local') })

async function testOptimizedMatch() {
  console.log('\n=== Testing Optimized Match API ===\n')

  const briefId = '9a48ee32-88fb-4c6e-be95-1de8728bd05a'
  
  console.log('Testing match API with brief:', briefId)
  console.log('Expected behavior:')
  console.log('- Pre-filters designers to top 5 most relevant')
  console.log('- Uses smart relevance scoring')
  console.log('- Implements request queue with rate limiting')
  console.log('- Falls back to gemini-2.0-flash-lite if needed')
  console.log('- Caches results to avoid duplicate API calls')
  console.log('\n')
  
  const startTime = Date.now()
  
  try {
    const response = await fetch('http://localhost:3000/api/match/find', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ briefId })
    })
    
    const elapsed = Date.now() - startTime
    console.log(`Response received in ${elapsed}ms`)
    console.log('Response status:', response.status)
    
    const data = await response.json()
    
    if (!response.ok) {
      console.log('\n❌ API returned error:')
      console.log('Error:', data.error)
      console.log('Message:', data.message)
      
      if (data.error === 'AI_QUOTA_EXCEEDED') {
        console.log('\n⚠️  AI quota exceeded - this should only happen after daily limit')
        console.log('The optimized system should handle rate limits better')
      }
    } else {
      console.log('\n✅ Match found successfully!')
      console.log('Designer:', data.match.designer.firstName, data.match.designer.lastInitial)
      console.log('Score:', data.match.score)
      console.log('Reasons:', data.match.reasons)
      console.log('\nPersonalized Reasons:')
      data.match.personalizedReasons.forEach((reason, i) => {
        console.log(`${i + 1}. ${reason}`)
      })
      
      // Test caching by making another request
      console.log('\n\nTesting cache (second request)...')
      const startTime2 = Date.now()
      const response2 = await fetch('http://localhost:3000/api/match/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefId })
      })
      const elapsed2 = Date.now() - startTime2
      console.log(`Second request completed in ${elapsed2}ms (should be faster due to caching)`)
    }
  } catch (error) {
    console.error('\n❌ Network error:', error.message)
  }
}

testOptimizedMatch().catch(console.error)