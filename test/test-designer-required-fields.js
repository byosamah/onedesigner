const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function findRequiredFields() {
  console.log('Finding all required fields for designers table...\n')
  
  const testEmail = `test-${Date.now()}@example.com`
  const requiredFields = {}
  
  // Start with minimal fields
  let testData = {
    email: testEmail,
    first_name: '',
    last_name: '',
    last_initial: '',
    is_verified: true,
    is_approved: false,
    created_at: new Date().toISOString()
  }
  
  // Try to create with current fields
  while (true) {
    const { data, error } = await supabase
      .from('designers')
      .insert(testData)
      .select('id')
      .single()
    
    if (error) {
      if (error.message?.includes('null value in column')) {
        // Extract the field name from error message
        const match = error.message.match(/null value in column "([^"]+)"/)
        if (match) {
          const fieldName = match[1]
          console.log(`Found required field: ${fieldName}`)
          
          // Add a default value for this field
          if (fieldName.includes('_at')) {
            testData[fieldName] = new Date().toISOString()
          } else if (fieldName.includes('is_') || fieldName.includes('has_')) {
            testData[fieldName] = false
          } else if (fieldName.includes('rating') || fieldName.includes('score')) {
            testData[fieldName] = 0
          } else {
            testData[fieldName] = ''
          }
          
          requiredFields[fieldName] = testData[fieldName]
        } else {
          console.error('Could not parse field from error:', error.message)
          break
        }
      } else {
        console.error('Unexpected error:', error.message)
        break
      }
    } else {
      console.log('\n✅ Successfully created designer with all required fields!')
      console.log('\nRequired fields for designer creation:')
      console.log(JSON.stringify(testData, null, 2))
      
      // Clean up
      if (data?.id) {
        await supabase.from('designers').delete().eq('id', data.id)
      }
      break
    }
  }
}

findRequiredFields()