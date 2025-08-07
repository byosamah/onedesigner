import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: join(__dirname, '..', '.env.local') })

const API_KEY = process.env.GOOGLE_AI_API_KEY

async function testGoogleAI() {
  console.log('\n=== Testing Google AI ===\n')

  // Test 1: Using SDK with different models
  console.log('1. Testing with SDK...')
  const genAI = new GoogleGenerativeAI(API_KEY)
  
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro']
  
  for (const modelName of models) {
    console.log(`\nTrying model: ${modelName}`)
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent('Say "Hello" in JSON format')
      const response = await result.response
      const text = response.text()
      console.log(`✓ ${modelName} works! Response:`, text.substring(0, 100))
    } catch (error) {
      console.log(`✗ ${modelName} failed:`, error.message)
    }
  }

  // Test 2: Using REST API directly
  console.log('\n\n2. Testing with REST API...')
  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Say "Hello" in JSON format'
            }]
          }]
        })
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.log('✗ REST API failed:', response.status, error)
    } else {
      const data = await response.json()
      console.log('✓ REST API works! Response:', JSON.stringify(data).substring(0, 200))
    }
  } catch (error) {
    console.log('✗ REST API error:', error.message)
  }
}

testGoogleAI().catch(console.error)