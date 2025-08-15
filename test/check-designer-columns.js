const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkColumns() {
  console.log('🔍 Checking designer table columns...\n');
  
  // Get one designer to see all columns
  const { data, error } = await supabase
    .from('designers')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  if (data && data.length > 0) {
    const columns = Object.keys(data[0]);
    console.log('Available columns in designers table:');
    console.log('=====================================');
    
    columns.forEach(col => {
      // Highlight portfolio/image related columns
      if (col.toLowerCase().includes('portfolio') || col.toLowerCase().includes('image')) {
        console.log(`✨ ${col} (PORTFOLIO/IMAGE RELATED)`);
      } else {
        console.log(`   ${col}`);
      }
    });
    
    console.log('\n📊 Total columns:', columns.length);
    
    // Check specifically for portfolio columns
    const portfolioColumns = columns.filter(col => 
      col.toLowerCase().includes('portfolio') || 
      col.toLowerCase().includes('image')
    );
    
    if (portfolioColumns.length > 0) {
      console.log('\n✅ Found portfolio-related columns:', portfolioColumns);
    } else {
      console.log('\n❌ No portfolio or image columns found in the table');
      console.log('   Need to add: portfolio_image_1, portfolio_image_2, portfolio_image_3');
    }
  } else {
    console.log('No designers found in the database');
  }
}

checkColumns();