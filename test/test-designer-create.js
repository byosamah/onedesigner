const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDesignerCreate() {
  console.log('Testing designer creation...')
  
  const testEmail = `test-${Date.now()}@example.com`
  
  try {
    // Try to create a designer with minimal fields
    const { data, error } = await supabase
      .from('designers')
      .insert({
        email: testEmail,
        is_verified: true,
        is_approved: false,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()
    
    if (error) {
      console.error('Error creating designer:', JSON.stringify(error, null, 2))
      
      // Try to identify missing required fields
      if (error.message?.includes('null value')) {
        console.log('\nMissing required fields detected!')
        console.log('Error details:', error.details)
      }
    } else {
      console.log('✅ Designer created successfully:', data)
      
      // Clean up test record
      await supabase
        .from('designers')
        .delete()
        .eq('id', data.id)
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

testDesignerCreate()