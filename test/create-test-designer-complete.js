const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestDesigner() {
  // Create a complete test designer with all fields from centralized config
  const testDesigner = {
    email: `test-designer-${Date.now()}@example.com`,
    first_name: 'Alex',
    last_name: 'TestDesigner',
    last_initial: 'T',
    title: 'Senior Product Designer',
    bio: "I am a passionate product designer with over 8 years of experience creating user-centered digital experiences. My expertise spans UX research, interaction design, and visual design. I've worked with startups and Fortune 500 companies to deliver innovative solutions that drive business results. My design philosophy centers on simplicity, accessibility, and delight. I believe great design should be invisible - it should just work. When I'm not designing, you can find me exploring new design tools, contributing to open source projects, or mentoring junior designers.",
    country: 'United States',
    city: 'San Francisco',
    availability: 'immediate',
    years_experience: 8,
    portfolio_url: 'https://alexdesigner.com',
    website_url: 'https://alexblog.com', 
    dribbble_url: 'https://dribbble.com/alexdesigner',
    behance_url: 'https://behance.net/alexdesigner',
    linkedin_url: 'https://linkedin.com/in/alexdesigner',
    avatar_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjNEY0NkU1Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iODAiIGZpbGw9IndoaXRlIj5BVDwvdGV4dD4KPC9zdmc+',
    is_approved: false,
    is_verified: true,
    rating: 0,
    total_projects: 0,
    created_at: new Date().toISOString(),
    
    // Add a rejection for testing
    rejection_reason: 'Your portfolio looks great! However, we need to see more examples of mobile app design work to better match you with our clients. Please add 2-3 mobile app case studies to your portfolio.'
  };

  console.log('Creating test designer with email:', testDesigner.email);

  const { data, error } = await supabase
    .from('designers')
    .insert(testDesigner)
    .select()
    .single();

  if (error) {
    console.error('Error creating designer:', error);
    return;
  }

  console.log('✅ Test designer created successfully!');
  console.log('Designer ID:', data.id);
  console.log('Email:', data.email);
  console.log('Status: Rejected (for testing)');
  console.log('');
  console.log('You can now test the profile page by:');
  console.log('1. Going to http://localhost:3001/designer/login');
  console.log('2. Enter email:', data.email);
  console.log('3. Use OTP: 123456 (test mode)');
  console.log('4. You should be redirected to the dashboard showing rejection feedback');
  console.log('5. Then navigate to Profile to see the centralized field system in action');
  
  return data;
}

createTestDesigner();