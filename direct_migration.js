const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: {
    schema: 'public'
  }
})

async function addImageColumns() {
  console.log('🔧 Checking designers table schema...')
  
  try {
    // Test if we can query designers and see current structure
    const { data, error } = await supabase
      .from('designers')
      .select('id, first_name, last_name, email, profile_picture, portfolio_images')
      .limit(1)
    
    if (error) {
      console.log('❌ Error querying designers:', error.message)
      if (error.message.includes('profile_picture') || error.message.includes('portfolio_images')) {
        console.log('📝 Columns need to be added. Let me try a different approach...')
        
        // Try direct SQL execution via REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({
            sql: 'SELECT column_name FROM information_schema.columns WHERE table_name = \'designers\' AND table_schema = \'public\';'
          })
        })
        
        if (response.ok) {
          const result = await response.json()
          console.log('Current columns in designers table:', result)
        } else {
          console.log('Cannot execute SQL directly. Columns might already exist.')
        }
        
        return
      }
    }
    
    if (data) {
      console.log('✅ Successfully queried designers table!')
      console.log('Sample record structure:', Object.keys(data[0] || {}))
      
      // Check if profile_picture and portfolio_images exist
      if (data[0] && typeof data[0].profile_picture !== 'undefined') {
        console.log('✅ profile_picture column exists')
      } else {
        console.log('❓ profile_picture column missing')
      }
      
      if (data[0] && typeof data[0].portfolio_images !== 'undefined') {
        console.log('✅ portfolio_images column exists')
      } else {
        console.log('❓ portfolio_images column missing')
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

addImageColumns()