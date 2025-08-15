const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPortfolioImages() {
  console.log('🔍 Checking for designers with portfolio images...\n');
  
  // Get all designers and check their portfolio images
  const { data: designers, error } = await supabase
    .from('designers')
    .select('id, email, first_name, last_name, portfolio_image_1, portfolio_image_2, portfolio_image_3')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (error) {
    console.error('Error fetching designers:', error);
    return;
  }
  
  console.log(`Found ${designers.length} recent designers\n`);
  
  let hasImagesCount = 0;
  designers.forEach(designer => {
    const hasImages = designer.portfolio_image_1 || designer.portfolio_image_2 || designer.portfolio_image_3;
    
    if (hasImages) {
      hasImagesCount++;
      console.log(`✅ ${designer.first_name} ${designer.last_name} (${designer.email})`);
      console.log(`   - Image 1: ${designer.portfolio_image_1 ? '✓ ' + designer.portfolio_image_1.substring(0, 50) + '...' : '✗'}`);
      console.log(`   - Image 2: ${designer.portfolio_image_2 ? '✓ ' + designer.portfolio_image_2.substring(0, 50) + '...' : '✗'}`);
      console.log(`   - Image 3: ${designer.portfolio_image_3 ? '✓ ' + designer.portfolio_image_3.substring(0, 50) + '...' : '✗'}\n`);
    } else {
      console.log(`❌ ${designer.first_name} ${designer.last_name} (${designer.email}) - No portfolio images`);
    }
  });
  
  console.log(`\n📊 Summary: ${hasImagesCount} out of ${designers.length} designers have portfolio images`);
}

checkPortfolioImages();