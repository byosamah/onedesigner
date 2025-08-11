const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
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

async function runMigration() {
  try {
    console.log('Running messaging system migration...')
    
    // Read the migration file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '..', 'migrations', '012_messaging_system.sql'),
      'utf8'
    )

    // Split by semicolons but keep them, then filter out empty statements
    const statements = migrationSQL
      .split(/;(?=\s*(?:--|CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|COMMENT|$))/gi)
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'))

    console.log(`Found ${statements.length} SQL statements to execute`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (!statement.trim()) continue
      
      // Add semicolon back if it was removed
      const sql = statement.endsWith(';') ? statement : statement + ';'
      
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`)
      console.log(sql.substring(0, 100) + '...')
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).single()
      
      if (error) {
        // Try direct execution for some statements
        console.log('Direct execution failed, trying alternative method...')
        // For now, we'll note the error but continue
        console.error(`Error in statement ${i + 1}:`, error.message)
        
        // If it's a "already exists" error, we can continue
        if (error.message.includes('already exists')) {
          console.log('Object already exists, continuing...')
        } else {
          // For critical errors, stop
          throw error
        }
      } else {
        console.log(`✓ Statement ${i + 1} executed successfully`)
      }
    }

    console.log('\n✅ Migration completed successfully!')
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration()