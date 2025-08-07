import { config } from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env.local') })

async function testAIError() {
  console.log('\n=== Testing AI Error Handling ===\n')

  const briefId = '9a48ee32-88fb-4c6e-be95-1de8728bd05a'
  
  console.log('Testing match API with brief:', briefId)
  
  try {
    const response = await fetch('http://localhost:3000/api/match/find', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ briefId })
    })
    
    console.log('Response status:', response.status)
    
    const data = await response.json()
    
    if (!response.ok) {
      console.log('\n❌ API returned error:')
      console.log('Error code:', data.error)
      console.log('Message:', data.message)
      console.log('User message:', data.userMessage)
      
      if (data.error === 'AI_QUOTA_EXCEEDED') {
        console.log('\n✅ AI quota error is properly handled!')
        console.log('User will see:', data.userMessage)
      }
    } else {
      console.log('\n✅ Match found successfully!')
      console.log('Designer:', data.match.designer.firstName, data.match.designer.lastInitial)
      console.log('Score:', data.match.score)
    }
  } catch (error) {
    console.error('\n❌ Network error:', error.message)
  }
}

testAIError().catch(console.error)