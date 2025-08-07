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

async function testMatchDetailed() {
  console.log('\n=== Detailed Match Test ===\n')

  const briefId = '9a48ee32-88fb-4c6e-be95-1de8728bd05a'

  // Step 1: Check if brief exists
  console.log('1. Checking brief...')
  const { data: brief, error: briefError } = await supabase
    .from('briefs')
    .select('*')
    .eq('id', briefId)
    .single()

  if (briefError || !brief) {
    console.error('Brief not found:', briefError)
    return
  }
  console.log('✓ Brief found:', {
    id: brief.id,
    project_type: brief.project_type,
    industry: brief.industry,
    styles: brief.styles
  })

  // Step 2: Check designers
  console.log('\n2. Checking designers...')
  const { data: designers, error: designersError } = await supabase
    .from('designers')
    .select('*')
    .eq('is_verified', true)
    .in('availability', ['available', 'busy'])
    .limit(5)

  if (designersError || !designers || designers.length === 0) {
    console.error('No designers found:', designersError)
    return
  }
  console.log(`✓ Found ${designers.length} designers`)

  // Step 3: Test AI matching locally
  console.log('\n3. Testing AI provider...')
  try {
    // Import and test the AI provider
    const { createAIProvider } = await import('../src/lib/ai/index.js')
    const aiProvider = createAIProvider()
    console.log('✓ AI provider created successfully')
    
    // Test with first designer
    const testDesigner = designers[0]
    console.log(`\nTesting with designer: ${testDesigner.first_name} ${testDesigner.last_name}`)
    
    try {
      const result = await aiProvider.analyzeMatch(testDesigner, brief)
      console.log('✓ AI match result:', {
        score: result.score,
        reasons: result.reasons.slice(0, 2),
        personalizedReasons: result.personalizedReasons.slice(0, 2)
      })
    } catch (aiError) {
      console.error('✗ AI matching failed:', aiError.message)
    }
  } catch (error) {
    console.error('✗ Failed to create AI provider:', error.message)
  }

  // Step 4: Test the actual API
  console.log('\n4. Testing match API...')
  try {
    const response = await fetch('http://localhost:3000/api/match/find', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ briefId })
    })
    
    const text = await response.text()
    console.log('Response status:', response.status)
    
    if (!response.ok) {
      console.error('✗ API failed:', text)
      
      // Try with fallback mode
      console.log('\n5. Setting fallback mode and retrying...')
      process.env.USE_FALLBACK_AI = 'true'
      
      const response2 = await fetch('http://localhost:3000/api/match/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefId })
      })
      
      const text2 = await response2.text()
      if (response2.ok) {
        console.log('✓ API works with fallback mode!')
      } else {
        console.error('✗ Still failing with fallback:', text2)
      }
    } else {
      const data = JSON.parse(text)
      console.log('✓ Match found!')
      console.log('Designer:', data.match.designer.firstName, data.match.designer.lastInitial)
      console.log('Score:', data.match.score)
    }
  } catch (error) {
    console.error('✗ Network error:', error.message)
  }
}

testMatchDetailed().catch(console.error)