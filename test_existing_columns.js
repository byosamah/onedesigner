const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testColumns() {
  console.log('🔍 Testing different column combinations...')
  
  try {
    // Test basic columns first
    const { data: basic, error: basicError } = await supabase
      .from('designers')
      .select('id, first_name, last_name, email')
      .limit(1)
    
    if (basicError) {
      console.log('❌ Basic columns error:', basicError.message)
      return
    }
    
    console.log('✅ Basic columns work')
    
    // Test avatar-related columns
    const columns = [
      'avatar',
      'avatar_url', 
      'profile_image',
      'profile_picture_url',
      'portfolio_images'
    ]
    
    for (const col of columns) {
      try {
        const { data, error } = await supabase
          .from('designers')
          .select(`id, ${col}`)
          .limit(1)
        
        if (!error) {
          console.log(`✅ Column '${col}' exists`)
        } else {
          console.log(`❌ Column '${col}' does not exist:`, error.message)
        }
      } catch (e) {
        console.log(`❌ Column '${col}' test failed:`, e.message)
      }
    }
    
  } catch (error) {
    console.error('❌ General error:', error.message)
  }
}

testColumns()