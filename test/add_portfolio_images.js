const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addPortfolioImages() {
  console.log('🎨 Adding Portfolio Images to Test Designer...\n');
  
  // Get the Muhammad Garcia designer from our previous test
  const { data: designers, error: designerError } = await supabase
    .from('designers')
    .select('id, first_name, last_name, title')
    .eq('first_name', 'Muhammad')
    .eq('last_name', 'Garcia')
    .limit(1);
  
  if (designerError || !designers || designers.length === 0) {
    console.error('❌ Could not find Muhammad Garcia designer');
    return;
  }
  
  const designer = designers[0];
  console.log(`✅ Found designer: ${designer.first_name} ${designer.last_name} (${designer.title})`);
  
  // Create portfolio images with actual image URLs (using Picsum for now as sample content)
  const portfolioImages = [
    {
      designer_id: designer.id,
      image_url: 'https://picsum.photos/seed/muhammad-portfolio1/800/600',
      image_key: `portfolio/${designer.id}/${Date.now()}_1`,
      project_title: 'Corporate Brand Identity',
      project_description: 'Complete brand identity design for a Fortune 500 company including logo, business cards, and marketing materials.',
      category: 'Branding',
      display_order: 1
    },
    {
      designer_id: designer.id,
      image_url: 'https://picsum.photos/seed/muhammad-portfolio2/800/600',
      image_key: `portfolio/${designer.id}/${Date.now()}_2`,
      project_title: 'Modern Website Redesign',
      project_description: 'Full website redesign for a tech startup, focusing on user experience and conversion optimization.',
      category: 'Web Design',
      display_order: 2
    },
    {
      designer_id: designer.id,
      image_url: 'https://picsum.photos/seed/muhammad-portfolio3/800/600',
      image_key: `portfolio/${designer.id}/${Date.now()}_3`,
      project_title: 'Mobile App UI Design',
      project_description: 'User interface design for a fitness tracking mobile application with emphasis on clean, intuitive design.',
      category: 'UI/UX',
      display_order: 3
    }
  ];
  
  // Insert portfolio images
  for (const image of portfolioImages) {
    const { data, error } = await supabase
      .from('designer_portfolio_images')
      .insert(image)
      .select();
    
    if (error) {
      console.error(`❌ Error adding ${image.project_title}:`, error.message);
    } else {
      console.log(`✅ Added portfolio image: ${image.project_title}`);
    }
  }
  
  // Update the designer's portfolio_projects field for backward compatibility
  const portfolioProjects = portfolioImages.map(img => ({
    title: img.project_title,
    description: img.project_description,
    category: img.category,
    image_url: img.image_url
  }));
  
  const { error: updateError } = await supabase
    .from('designers')
    .update({ 
      portfolio_projects: portfolioProjects,
      updated_at: new Date().toISOString()
    })
    .eq('id', designer.id);
  
  if (updateError) {
    console.error('❌ Error updating designer portfolio_projects:', updateError.message);
  } else {
    console.log('✅ Updated designer portfolio_projects field');
  }
  
  console.log('\n🎯 Portfolio Images Added Successfully!');
  console.log(`Designer: ${designer.first_name} ${designer.last_name} now has 3 portfolio images`);
  console.log('\n🌐 Test the match page again to see real portfolio images instead of "Portfolio Coming" placeholders');
}

addPortfolioImages().catch(console.error);