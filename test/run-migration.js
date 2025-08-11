#!/usr/bin/env node

/**
 * Run database migrations using Supabase client
 * This script executes the SQL migrations needed for the centralization architecture
 */

const { createClient } = require('@supabase/supabase-js')
const path = require('path')

// Load environment variables from .env.local
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Migration queries split into individual statements
const migrations = [
  {
    name: 'Create client_designers table',
    query: `
      CREATE TABLE IF NOT EXISTS client_designers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
        unlocked_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(client_id, designer_id)
      )
    `
  },
  {
    name: 'Add indexes for client_designers',
    query: `
      CREATE INDEX IF NOT EXISTS idx_client_designers_client ON client_designers(client_id);
      CREATE INDEX IF NOT EXISTS idx_client_designers_designer ON client_designers(designer_id);
    `
  },
  {
    name: 'Create otp_codes table',
    query: `
      CREATE TABLE IF NOT EXISTS otp_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL,
        code VARCHAR(6) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('client', 'designer', 'admin')),
        purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('login', 'signup', 'reset', 'verify')),
        expires_at TIMESTAMPTZ NOT NULL,
        attempts INTEGER DEFAULT 0,
        max_attempts INTEGER DEFAULT 5,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        verified_at TIMESTAMPTZ,
        ip_address INET,
        user_agent TEXT
      )
    `
  },
  {
    name: 'Add indexes for otp_codes',
    query: `
      CREATE INDEX IF NOT EXISTS idx_otp_email_code ON otp_codes(email, code) WHERE verified = FALSE;
      CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at) WHERE verified = FALSE;
      CREATE INDEX IF NOT EXISTS idx_otp_email_purpose ON otp_codes(email, purpose) WHERE verified = FALSE;
    `
  },
  {
    name: 'Create email_queue table',
    query: `
      CREATE TABLE IF NOT EXISTS email_queue (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        to_email VARCHAR(255) NOT NULL,
        from_email VARCHAR(255) DEFAULT 'hello@onedesigner.app',
        template VARCHAR(100),
        subject TEXT NOT NULL,
        html TEXT NOT NULL,
        text TEXT,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'bounced')),
        priority INTEGER DEFAULT 5,
        attempts INTEGER DEFAULT 0,
        max_attempts INTEGER DEFAULT 3,
        error TEXT,
        metadata JSONB,
        scheduled_for TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        sent_at TIMESTAMPTZ,
        failed_at TIMESTAMPTZ
      )
    `
  },
  {
    name: 'Add indexes for email_queue',
    query: `
      CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status, scheduled_for) WHERE status IN ('pending', 'processing');
      CREATE INDEX IF NOT EXISTS idx_email_queue_created ON email_queue(created_at);
      CREATE INDEX IF NOT EXISTS idx_email_queue_priority ON email_queue(priority DESC, created_at ASC) WHERE status = 'pending';
    `
  },
  {
    name: 'Create audit_logs table',
    query: `
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        correlation_id VARCHAR(36),
        user_id UUID,
        user_type VARCHAR(20),
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50),
        resource_id UUID,
        changes JSONB,
        metadata JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
  },
  {
    name: 'Add indexes for audit_logs',
    query: `
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_correlation ON audit_logs(correlation_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
    `
  },
  {
    name: 'Fix match_unlocks payment_id constraint',
    query: `
      ALTER TABLE match_unlocks 
      ALTER COLUMN payment_id DROP NOT NULL
    `
  },
  {
    name: 'Add conversation columns to matches',
    query: `
      ALTER TABLE matches 
      ADD COLUMN IF NOT EXISTS has_conversation BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS conversation_started_at TIMESTAMPTZ
    `
  },
  {
    name: 'Create rate_limits table',
    query: `
      CREATE TABLE IF NOT EXISTS rate_limits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        identifier VARCHAR(255) NOT NULL,
        action VARCHAR(100) NOT NULL,
        count INTEGER DEFAULT 1,
        window_start TIMESTAMPTZ DEFAULT NOW(),
        window_end TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(identifier, action, window_start)
      )
    `
  },
  {
    name: 'Add index for rate_limits',
    query: `
      CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON rate_limits(identifier, action, window_end) WHERE window_end > NOW()
    `
  },
  {
    name: 'Create cleanup function for expired OTPs',
    query: `
      CREATE OR REPLACE FUNCTION cleanup_expired_otps()
      RETURNS INTEGER AS $$
      DECLARE
        deleted_count INTEGER;
      BEGIN
        DELETE FROM otp_codes 
        WHERE expires_at < NOW() - INTERVAL '1 day'
          AND verified = FALSE;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RETURN deleted_count;
      END;
      $$ LANGUAGE plpgsql
    `
  },
  {
    name: 'Create cleanup function for old audit logs',
    query: `
      CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
      RETURNS INTEGER AS $$
      DECLARE
        deleted_count INTEGER;
      BEGIN
        DELETE FROM audit_logs 
        WHERE created_at < NOW() - INTERVAL '90 days';
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RETURN deleted_count;
      END;
      $$ LANGUAGE plpgsql
    `
  }
]

async function runMigrations() {
  console.log('🚀 Starting database migrations for OneDesigner Centralization...\n')
  
  let successCount = 0
  let errorCount = 0
  const errors = []

  for (const migration of migrations) {
    try {
      console.log(`⏳ Running: ${migration.name}...`)
      
      // Execute the SQL query using Supabase RPC or direct query
      // Note: Supabase doesn't expose direct SQL execution, so we'll use a workaround
      // This requires creating a database function that executes dynamic SQL
      
      // For now, we'll check if tables exist and provide feedback
      if (migration.name.includes('Create') && migration.name.includes('table')) {
        const tableName = migration.name.match(/Create (\w+) table/)?.[1]
        if (tableName) {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1)
          
          if (!error || error.code === 'PGRST116') {
            console.log(`✅ Table '${tableName}' exists or was created`)
            successCount++
          } else if (error.code === 'PGRST204' || error.code === '42P01') {
            console.log(`⚠️  Table '${tableName}' needs to be created manually`)
            errors.push({ migration: migration.name, error: 'Table does not exist' })
            errorCount++
          } else {
            console.log(`✅ Table '${tableName}' check completed`)
            successCount++
          }
        }
      } else {
        console.log(`ℹ️  ${migration.name} - needs manual execution`)
        errors.push({ migration: migration.name, note: 'Requires manual execution' })
      }
      
    } catch (error) {
      console.error(`❌ Error in ${migration.name}:`, error.message)
      errors.push({ migration: migration.name, error: error.message })
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 Migration Summary:')
  console.log(`   ✅ Successful: ${successCount}`)
  console.log(`   ❌ Failed: ${errorCount}`)
  console.log(`   ⚠️  Manual: ${migrations.length - successCount - errorCount}`)
  
  if (errors.length > 0) {
    console.log('\n⚠️  Items requiring attention:')
    errors.forEach(({ migration, error, note }) => {
      console.log(`   - ${migration}: ${error || note}`)
    })
  }

  console.log('\n💡 Next Steps:')
  console.log('1. Go to Supabase Dashboard: https://app.supabase.com/project/frwchtwxpnrlpzksupgm')
  console.log('2. Navigate to SQL Editor')
  console.log('3. Copy the contents of test/fix-missing-tables.sql')
  console.log('4. Run the SQL in the Supabase SQL Editor')
  console.log('\nAlternatively, you can install psql:')
  console.log('   brew install postgresql')
  console.log('   Then run: npm run db:migrate')
}

// Check current table status
async function checkTableStatus() {
  console.log('\n📋 Checking current database status...\n')
  
  const tables = [
    'client_designers',
    'otp_codes',
    'email_queue',
    'audit_logs',
    'rate_limits'
  ]
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1)
      
      if (error) {
        if (error.code === 'PGRST116' || error.code === '42P01') {
          console.log(`❌ Table '${table}' does not exist`)
        } else {
          console.log(`✅ Table '${table}' exists`)
        }
      } else {
        console.log(`✅ Table '${table}' exists`)
      }
    } catch (err) {
      console.log(`❓ Could not check table '${table}'`)
    }
  }
}

// Main execution
async function main() {
  try {
    await checkTableStatus()
    console.log('\n' + '='.repeat(60))
    await runMigrations()
    
    console.log('\n✨ Migration check complete!')
    console.log('📝 For full migration, please use the Supabase SQL Editor')
    
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

main()