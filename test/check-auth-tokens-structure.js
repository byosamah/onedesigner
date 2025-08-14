const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkStructure() {
  console.log('🔍 Checking auth_tokens table structure...\n');

  try {
    // Try to get one row to see the columns
    const { data, error } = await supabase
      .from('auth_tokens')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('Table columns found:');
      Object.keys(data[0]).forEach(col => {
        console.log(`  - ${col}: ${typeof data[0][col]}`);
      });
    } else {
      console.log('Table exists but is empty. Trying to insert a test row...');
      
      // Try different column names
      const attempts = [
        {
          email: 'test@test.com',
          otp: '123456',
          purpose: 'test',
          expires_at: new Date(Date.now() + 60000).toISOString()
        },
        {
          email: 'test@test.com',
          token: '123456',
          purpose: 'test',
          expires_at: new Date(Date.now() + 60000).toISOString()
        },
        {
          user_email: 'test@test.com',
          otp_code: '123456',
          purpose: 'test',
          expiry: new Date(Date.now() + 60000).toISOString()
        }
      ];

      for (let i = 0; i < attempts.length; i++) {
        console.log(`\nAttempt ${i + 1}:`, Object.keys(attempts[i]).join(', '));
        const { error: insertError } = await supabase
          .from('auth_tokens')
          .insert(attempts[i]);
        
        if (!insertError) {
          console.log('✅ Success with columns:', Object.keys(attempts[i]).join(', '));
          
          // Clean up
          await supabase
            .from('auth_tokens')
            .delete()
            .eq('email', 'test@test.com');
          break;
        } else {
          console.log('❌ Failed:', insertError.message);
        }
      }
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkStructure();