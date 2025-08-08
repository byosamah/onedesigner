// Script to create test designers for the client journey
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('Please set SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestDesigners() {
  console.log('Creating test designers...');

  const designers = [
    {
      email: 'sarah.designer@test.com',
      first_name: 'Sarah',
      last_name: 'Johnson',
      title: 'Senior UI/UX Designer',
      city: 'San Francisco',
      country: 'USA',
      years_experience: 7,
      design_philosophy: 'I believe in creating intuitive, user-centered designs that balance aesthetics with functionality.',
      is_verified: true,
      is_approved: true,
      primary_categories: ['web-mobile', 'branding-logo'],
      secondary_categories: ['presentations'],
      style_keywords: ['minimal', 'modern', 'clean', 'user-friendly'],
      preferred_industries: ['tech', 'e-commerce', 'fashion', 'health'],
      preferred_project_sizes: ['small', 'medium', 'large'],
      turnaround_times: { 'web-mobile': 14, 'branding-logo': 7 },
      collaboration_style: 'milestone-based',
      current_availability: 'available',
      portfolio_projects: [
        { title: 'E-commerce Platform', category: 'web-mobile', url: 'portfolio.com/ecommerce' },
        { title: 'Fashion Brand Identity', category: 'branding-logo', url: 'portfolio.com/fashion' }
      ]
    },
    {
      email: 'mike.creative@test.com',
      first_name: 'Mike',
      last_name: 'Chen',
      title: 'Creative Director',
      city: 'New York',
      country: 'USA',
      years_experience: 10,
      design_philosophy: 'Great design tells a story and creates emotional connections with users.',
      is_verified: true,
      is_approved: true,
      primary_categories: ['branding-logo', 'motion-graphics'],
      secondary_categories: ['web-mobile', 'social-media'],
      style_keywords: ['bold', 'creative', 'storytelling', 'impactful'],
      preferred_industries: ['retail', 'entertainment', 'food', 'lifestyle'],
      preferred_project_sizes: ['medium', 'large'],
      turnaround_times: { 'branding-logo': 10, 'motion-graphics': 21 },
      collaboration_style: 'high-touch',
      current_availability: 'available',
      portfolio_projects: [
        { title: 'Restaurant Brand Overhaul', category: 'branding-logo', url: 'portfolio.com/restaurant' },
        { title: 'Product Launch Video', category: 'motion-graphics', url: 'portfolio.com/launch' }
      ]
    },
    {
      email: 'emma.digital@test.com',
      first_name: 'Emma',
      last_name: 'Williams',
      title: 'Digital Product Designer',
      city: 'London',
      country: 'UK',
      years_experience: 5,
      design_philosophy: 'Design should be accessible, inclusive, and solve real user problems.',
      is_verified: true,
      is_approved: true,
      primary_categories: ['web-mobile'],
      secondary_categories: ['presentations', 'social-media'],
      style_keywords: ['accessible', 'functional', 'responsive', 'innovative'],
      preferred_industries: ['fintech', 'education', 'healthcare', 'non-profit'],
      preferred_project_sizes: ['small', 'medium'],
      turnaround_times: { 'web-mobile': 21 },
      collaboration_style: 'independent',
      current_availability: 'available',
      portfolio_projects: [
        { title: 'Banking App Redesign', category: 'web-mobile', url: 'portfolio.com/banking' },
        { title: 'Education Platform', category: 'web-mobile', url: 'portfolio.com/education' }
      ]
    }
  ];

  try {
    for (const designer of designers) {
      const { data, error } = await supabase
        .from('designers')
        .insert(designer)
        .select()
        .single();

      if (error) {
        console.error(`Error creating designer ${designer.email}:`, error);
      } else {
        console.log(`✅ Created designer: ${designer.first_name} ${designer.last_name}`);
      }
    }

    console.log('\n✅ Test designers created successfully!');
  } catch (error) {
    console.error('Error creating test designers:', error);
  }
}

createTestDesigners();