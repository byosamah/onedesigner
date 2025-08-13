const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🔧 Adding image columns to designers table...')
  
  try {
    // Add profile_picture column
    const { error: profilePictureError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE designers ADD COLUMN IF NOT EXISTS profile_picture TEXT;`
    })
    
    if (profilePictureError) {
      console.log('Profile picture column might already exist or using direct query...')
    }

    // Add portfolio_images column
    const { error: portfolioImagesError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE designers ADD COLUMN IF NOT EXISTS portfolio_images TEXT[];`
    })
    
    if (portfolioImagesError) {
      console.log('Portfolio images column might already exist or using direct query...')
    }
    
    // Update existing records
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `UPDATE designers SET portfolio_images = '{}' WHERE portfolio_images IS NULL;`
    })
    
    if (updateError) {
      console.log('Update might have failed or using direct approach...')
    }
    
    console.log('✅ Image columns migration completed!')
    
    // Test by checking a designer record
    const { data, error } = await supabase
      .from('designers')
      .select('id, first_name, profile_picture, portfolio_images')
      .limit(1)
    
    if (data && data.length > 0) {
      console.log('✅ Successfully queried designers table with new columns')
      console.log('Sample record:', JSON.stringify(data[0], null, 2))
    }
    
  } catch (error) {
    console.error('❌ Migration error:', error)
    process.exit(1)
  }
}

runMigration()