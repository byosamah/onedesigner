const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addPortfolioImageColumns() {
  console.log('🔧 Adding portfolio image columns to designers table...\n');
  
  try {
    // Add portfolio_image_1 column
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE designers ADD COLUMN IF NOT EXISTS portfolio_image_1 TEXT;`
    }).single();
    
    if (error1) {
      // Try alternative approach using direct SQL
      const { data, error } = await supabase
        .from('designers')
        .select('portfolio_image_1')
        .limit(1);
      
      if (error && error.code === '42703') {
        console.log('❌ Cannot add portfolio_image_1 column via RPC');
        console.log('   You may need to add it manually in Supabase dashboard');
      } else {
        console.log('✅ Column portfolio_image_1 might already exist');
      }
    } else {
      console.log('✅ Added portfolio_image_1 column');
    }
    
    // Add portfolio_image_2 column
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE designers ADD COLUMN IF NOT EXISTS portfolio_image_2 TEXT;`
    }).single();
    
    if (error2) {
      const { data, error } = await supabase
        .from('designers')
        .select('portfolio_image_2')
        .limit(1);
      
      if (error && error.code === '42703') {
        console.log('❌ Cannot add portfolio_image_2 column via RPC');
        console.log('   You may need to add it manually in Supabase dashboard');
      } else {
        console.log('✅ Column portfolio_image_2 might already exist');
      }
    } else {
      console.log('✅ Added portfolio_image_2 column');
    }
    
    // Add portfolio_image_3 column
    const { error: error3 } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE designers ADD COLUMN IF NOT EXISTS portfolio_image_3 TEXT;`
    }).single();
    
    if (error3) {
      const { data, error } = await supabase
        .from('designers')
        .select('portfolio_image_3')
        .limit(1);
      
      if (error && error.code === '42703') {
        console.log('❌ Cannot add portfolio_image_3 column via RPC');
        console.log('   You may need to add it manually in Supabase dashboard');
      } else {
        console.log('✅ Column portfolio_image_3 might already exist');
      }
    } else {
      console.log('✅ Added portfolio_image_3 column');
    }
    
    console.log('\n📝 SQL to run manually if needed:');
    console.log('=====================================');
    console.log('ALTER TABLE designers ADD COLUMN IF NOT EXISTS portfolio_image_1 TEXT;');
    console.log('ALTER TABLE designers ADD COLUMN IF NOT EXISTS portfolio_image_2 TEXT;');
    console.log('ALTER TABLE designers ADD COLUMN IF NOT EXISTS portfolio_image_3 TEXT;');
    console.log('\nRun these in Supabase SQL Editor at:');
    console.log('https://supabase.com/dashboard/project/frwchtwxpnrlpzksupgm/sql/new');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

addPortfolioImageColumns();