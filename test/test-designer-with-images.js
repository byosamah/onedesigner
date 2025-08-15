const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestDesignerWithImages() {
  console.log('🎨 Creating test designer with portfolio images...\n');
  
  // Generate test base64 images (small 1x1 pixel images)
  const testImage1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='; // Red pixel
  const testImage2 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='; // Green pixel
  const testImage3 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPjfBwAChAGA60MJkgAAAABJRU5ErkJggg=='; // Blue pixel
  
  const portfolioImages = [testImage1, testImage2, testImage3];
  
  const testDesigner = {
    email: 'portfolio-test-' + Date.now() + '@example.com',
    first_name: 'Portfolio',
    last_name: 'Tester',
    last_initial: 'T',
    title: 'UI/UX Designer with Portfolio',
    country: 'USA',
    city: 'San Francisco',
    availability: 'immediate',
    bio: 'A talented designer with an amazing portfolio. ' + 'x'.repeat(450), // 500 chars
    avatar_url: testImage1,
    portfolio_url: 'https://portfolio-test.com',
    website_url: 'https://portfolio-test.com',
    is_approved: false,
    is_verified: true,
    years_experience: 5,
    rating: 4.8,
    total_projects: 10,
    // Store portfolio images as JSON in tools field
    tools: JSON.stringify(portfolioImages),
    created_at: new Date().toISOString()
  };
  
  console.log('Creating designer with portfolio images stored in tools field...');
  
  const { data, error } = await supabase
    .from('designers')
    .insert(testDesigner)
    .select()
    .single();
    
  if (error) {
    console.error('❌ Failed to create designer:', error);
    return;
  }
  
  console.log('✅ Successfully created designer with ID:', data.id);
  console.log('   Email:', data.email);
  console.log('   Name:', data.first_name, data.last_name);
  
  // Verify the portfolio images are stored
  console.log('\n🔍 Verifying portfolio images...');
  const { data: verify, error: verifyError } = await supabase
    .from('designers')
    .select('email, tools')
    .eq('id', data.id)
    .single();
    
  if (verifyError) {
    console.error('❌ Failed to verify:', verifyError);
    return;
  }
  
  if (verify.tools) {
    try {
      const images = JSON.parse(verify.tools);
      console.log('✅ Portfolio images stored successfully!');
      console.log('   Number of images:', images.length);
      console.log('   Image 1 preview:', images[0]?.substring(0, 50) + '...');
      console.log('   Image 2 preview:', images[1]?.substring(0, 50) + '...');
      console.log('   Image 3 preview:', images[2]?.substring(0, 50) + '...');
    } catch (e) {
      console.error('❌ Failed to parse portfolio images:', e);
    }
  } else {
    console.log('❌ No portfolio images found in tools field');
  }
  
  console.log('\n📝 Test designer created. You can now:');
  console.log('   1. Go to the admin dashboard to see this designer');
  console.log('   2. Click on the designer to view their modal');
  console.log('   3. Check if portfolio images are displayed');
  console.log('\n   Designer ID:', data.id);
}

createTestDesignerWithImages();