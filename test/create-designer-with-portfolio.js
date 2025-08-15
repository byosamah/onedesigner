const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createDesignerWithPortfolio() {
  console.log('🎨 Creating designer with portfolio images...\n');
  
  // Generate test base64 images (small colored squares)
  const redSquare = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz8DAwMDAxAACACFDAQEST5jQAAAAAElFTkSuQmCC';
  const greenSquare = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz8DAwMDAxAACACENAQGOAG8dAAAAAElFTkSuQmCC';
  const blueSquare = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNkYPhfz8DAwMDAxAACACFNAQG+AG8dAAAAAElFTkSuQmCC';
  
  const portfolioImages = [redSquare, greenSquare, blueSquare];
  
  const testDesigner = {
    email: 'portfolio-demo-' + Date.now() + '@example.com',
    first_name: 'John',
    last_name: 'Designer',
    last_initial: 'D',
    title: 'Senior UI/UX Designer',
    country: 'United States',
    city: 'San Francisco',
    availability: 'immediate',
    bio: 'I am a passionate UI/UX designer with over 10 years of experience creating beautiful and functional digital experiences. My expertise spans across web and mobile design, with a strong focus on user-centered design principles. I have worked with startups and Fortune 500 companies, helping them transform their digital presence. My design philosophy centers on simplicity, usability, and creating delightful user experiences that drive business results.',
    avatar_url: redSquare,
    portfolio_url: 'https://johndesigner.com',
    website_url: 'https://johndesigner.com',
    dribbble_url: 'https://dribbble.com/johndesigner',
    behance_url: 'https://behance.net/johndesigner',
    linkedin_url: 'https://linkedin.com/in/johndesigner',
    is_approved: false,
    is_verified: true,
    years_experience: 10,
    rating: 4.9,
    total_projects: 50,
    // Store portfolio images in tools array field
    tools: portfolioImages,
    created_at: new Date().toISOString()
  };
  
  console.log('Creating designer with portfolio images...');
  
  const { data, error } = await supabase
    .from('designers')
    .insert(testDesigner)
    .select()
    .single();
    
  if (error) {
    console.error('❌ Failed to create designer:', error);
    return;
  }
  
  console.log('✅ Successfully created designer!');
  console.log('   ID:', data.id);
  console.log('   Email:', data.email);
  console.log('   Name:', data.first_name, data.last_name);
  console.log('   Title:', data.title);
  
  // Verify the portfolio images
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
  
  if (Array.isArray(verify.tools) && verify.tools.length > 0) {
    console.log('✅ Portfolio images stored successfully!');
    console.log('   Number of images:', verify.tools.length);
    verify.tools.forEach((img, index) => {
      console.log(`   Image ${index + 1}: ${img.substring(0, 50)}...`);
    });
  } else {
    console.log('❌ No portfolio images found');
  }
  
  console.log('\n📝 Next steps:');
  console.log('   1. Go to the admin dashboard');
  console.log('   2. Look for designer: John Designer');
  console.log('   3. Click on the designer to open the modal');
  console.log('   4. Portfolio images should now be visible!');
  console.log('\n   Designer Email:', data.email);
  console.log('   Designer ID:', data.id);
}

createDesignerWithPortfolio();