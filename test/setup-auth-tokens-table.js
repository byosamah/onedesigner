const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupAuthTokensTable() {
  console.log('🔧 Setting up auth_tokens table...\n');

  try {
    // First, check if the table exists
    const { data: tables, error: tablesError } = await supabase
      .from('auth_tokens')
      .select('*')
      .limit(1);

    if (tablesError && tablesError.message.includes('relation') && tablesError.message.includes('does not exist')) {
      console.log('❌ Table auth_tokens does not exist');
      console.log('Creating auth_tokens table...\n');
      
      // Create the table using raw SQL
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS auth_tokens (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            code VARCHAR(10) NOT NULL,
            type VARCHAR(50),
            purpose VARCHAR(50),
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_auth_tokens_email ON auth_tokens(email);
          CREATE INDEX IF NOT EXISTS idx_auth_tokens_code ON auth_tokens(code);
          CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at ON auth_tokens(expires_at);
        `
      });

      if (createError) {
        console.log('❌ Failed to create table via RPC');
        console.log('Please create the table manually with this SQL:\n');
        console.log(`
CREATE TABLE auth_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL,
  type VARCHAR(50),
  purpose VARCHAR(50),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_auth_tokens_email ON auth_tokens(email);
CREATE INDEX idx_auth_tokens_code ON auth_tokens(code);
CREATE INDEX idx_auth_tokens_expires_at ON auth_tokens(expires_at);
        `);
      } else {
        console.log('✅ Table created successfully!');
      }
    } else if (tablesError) {
      console.log('❌ Error checking table:', tablesError.message);
    } else {
      console.log('✅ Table auth_tokens already exists');
      
      // Clean up expired tokens
      const { error: cleanupError } = await supabase
        .from('auth_tokens')
        .delete()
        .lt('expires_at', new Date().toISOString());
      
      if (!cleanupError) {
        console.log('🧹 Cleaned up expired tokens');
      }
    }

    // Test inserting a token
    console.log('\n📝 Testing token insertion...');
    const testToken = {
      email: 'test@example.com',
      code: '123456',
      type: 'test',
      purpose: 'test',
      expires_at: new Date(Date.now() + 60000).toISOString() // 1 minute from now
    };

    const { error: insertError } = await supabase
      .from('auth_tokens')
      .insert(testToken);

    if (insertError) {
      console.log('❌ Failed to insert test token:', insertError.message);
      
      // Try to understand the error
      if (insertError.message.includes('permission')) {
        console.log('\n⚠️ Permission issue detected. The table might need RLS policies.');
      }
    } else {
      console.log('✅ Test token inserted successfully');
      
      // Clean up test token
      await supabase
        .from('auth_tokens')
        .delete()
        .eq('email', 'test@example.com');
      
      console.log('🧹 Cleaned up test token');
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

setupAuthTokensTable();