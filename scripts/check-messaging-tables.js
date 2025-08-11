const { createClient } = require('@supabase/supabase-js')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTables() {
  try {
    console.log('Checking messaging system tables...\n')
    
    // Check conversations table
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .limit(1)
    
    if (convError) {
      if (convError.message.includes('does not exist')) {
        console.log('❌ conversations table does not exist')
      } else {
        console.log('⚠️ conversations table error:', convError.message)
      }
    } else {
      console.log('✅ conversations table exists')
    }
    
    // Check messages table
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .limit(1)
    
    if (msgError) {
      if (msgError.message.includes('does not exist')) {
        console.log('❌ messages table does not exist')
      } else {
        console.log('⚠️ messages table error:', msgError.message)
      }
    } else {
      console.log('✅ messages table exists')
    }
    
    // Check match_requests table
    const { data: matchRequests, error: reqError } = await supabase
      .from('match_requests')
      .select('*')
      .limit(1)
    
    if (reqError) {
      if (reqError.message.includes('does not exist')) {
        console.log('❌ match_requests table does not exist')
      } else {
        console.log('⚠️ match_requests table error:', reqError.message)
      }
    } else {
      console.log('✅ match_requests table exists')
    }
    
    // Check if matches table has new columns
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select('has_conversation, conversation_started_at')
      .limit(1)
    
    if (matchError) {
      if (matchError.message.includes('column')) {
        console.log('❌ matches table missing new columns')
      } else {
        console.log('⚠️ matches table error:', matchError.message)
      }
    } else {
      console.log('✅ matches table has new columns')
    }
    
    console.log('\nTable check complete!')
    
  } catch (error) {
    console.error('Check failed:', error)
    process.exit(1)
  }
}

checkTables()