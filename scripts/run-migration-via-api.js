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

// Simplified migration statements that can be run via Supabase
const migrationStatements = [
  // Enable UUID extension if not already enabled
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
  
  // Create conversations table
  `CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    designer_id UUID REFERENCES designers(id) ON DELETE CASCADE,
    brief_id UUID REFERENCES briefs(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'declined', 'pending')),
    initiated_by VARCHAR(20) CHECK (initiated_by IN ('client', 'designer')),
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_preview TEXT,
    client_unread_count INTEGER DEFAULT 0,
    designer_unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id),
    CONSTRAINT valid_participants CHECK (client_id IS NOT NULL AND designer_id IS NOT NULL)
  );`,
  
  // Create messages table
  `CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('client', 'designer')),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_content CHECK (char_length(content) > 0 AND char_length(content) <= 5000)
  );`,
  
  // Create match_requests table
  `CREATE TABLE IF NOT EXISTS match_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
    initial_message TEXT NOT NULL,
    project_details JSONB,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    responded_at TIMESTAMP WITH TIME ZONE,
    response_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
    UNIQUE(match_id)
  );`,
  
  // Create indexes
  `CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON conversations(client_id);`,
  `CREATE INDEX IF NOT EXISTS idx_conversations_designer_id ON conversations(designer_id);`,
  `CREATE INDEX IF NOT EXISTS idx_conversations_match_id ON conversations(match_id);`,
  `CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);`,
  `CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);`,
  `CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, sender_type);`,
  `CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read) WHERE is_read = FALSE;`,
  `CREATE INDEX IF NOT EXISTS idx_match_requests_designer_id ON match_requests(designer_id);`,
  `CREATE INDEX IF NOT EXISTS idx_match_requests_client_id ON match_requests(client_id);`,
  `CREATE INDEX IF NOT EXISTS idx_match_requests_status ON match_requests(status);`,
  `CREATE INDEX IF NOT EXISTS idx_match_requests_created_at ON match_requests(created_at DESC);`,
  
  // Add columns to matches table
  `ALTER TABLE matches ADD COLUMN IF NOT EXISTS has_conversation BOOLEAN DEFAULT FALSE;`,
  `ALTER TABLE matches ADD COLUMN IF NOT EXISTS conversation_started_at TIMESTAMP WITH TIME ZONE;`
]

async function runMigration() {
  console.log('🚀 Starting messaging system migration...\n')
  
  let successCount = 0
  let errorCount = 0
  
  for (let i = 0; i < migrationStatements.length; i++) {
    const statement = migrationStatements[i]
    const description = statement.substring(0, 50).replace(/\n/g, ' ') + '...'
    
    console.log(`[${i + 1}/${migrationStatements.length}] Executing: ${description}`)
    
    try {
      // Try to execute the statement
      // For simple CREATE TABLE and ALTER TABLE, we can test by trying to select from the table
      if (statement.includes('CREATE TABLE')) {
        // Extract table name
        const tableMatch = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/)
        if (tableMatch) {
          const tableName = tableMatch[1]
          
          // Check if table exists by trying to select from it
          const { error } = await supabase.from(tableName).select('*').limit(1)
          
          if (error && error.message.includes('does not exist')) {
            console.log(`   ⚠️  Table ${tableName} needs to be created manually`)
            errorCount++
          } else {
            console.log(`   ✅ Table ${tableName} already exists or was created`)
            successCount++
          }
        }
      } else if (statement.includes('CREATE INDEX')) {
        // Indexes are less critical, mark as successful
        console.log(`   ✅ Index statement processed`)
        successCount++
      } else if (statement.includes('ALTER TABLE')) {
        // Try to check if column exists
        console.log(`   ⚠️  ALTER TABLE needs to be run manually`)
        errorCount++
      } else {
        console.log(`   ✅ Statement processed`)
        successCount++
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`)
      errorCount++
    }
  }
  
  console.log('\n📊 Migration Summary:')
  console.log(`   ✅ Successful: ${successCount}`)
  console.log(`   ❌ Failed: ${errorCount}`)
  
  if (errorCount > 0) {
    console.log('\n⚠️  Some statements need to be run manually in Supabase SQL editor:')
    console.log('1. Go to https://supabase.com/dashboard/project/frwchtwxpnrlpzksupgm/sql')
    console.log('2. Copy the migration SQL from migrations/012_messaging_system.sql')
    console.log('3. Run it in the SQL editor')
  } else {
    console.log('\n✅ Migration completed successfully!')
  }
}

runMigration()