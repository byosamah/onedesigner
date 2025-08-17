const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyProfileData() {
  console.log('🔍 Verifying Designer Profile Data\n');
  console.log('=' .repeat(60));

  // Get Osama's designer profile
  const { data: designer, error } = await supabase
    .from('designers')
    .select('*')
    .eq('email', 'osama@osamakhalil.com')
    .single();

  if (error) {
    console.log('❌ Error fetching designer:', error);
    return;
  }

  console.log('\n✅ Designer Found: ', designer.id);
  console.log('\n📋 Profile Data:');
  console.log('=' .repeat(60));
  
  // Personal Information
  console.log('\n👤 PERSONAL INFORMATION:');
  console.log('  - First Name:', designer.first_name || '❌ EMPTY');
  console.log('  - Last Name:', designer.last_name || '❌ EMPTY');
  console.log('  - Email:', designer.email);
  console.log('  - Phone:', designer.phone || '❌ EMPTY');
  console.log('  - Avatar URL:', designer.avatar_url ? '✅ Present' : '❌ EMPTY');
  
  // Location
  console.log('\n📍 LOCATION:');
  console.log('  - Country:', designer.country || '❌ EMPTY');
  console.log('  - City:', designer.city || '❌ EMPTY');
  console.log('  - Timezone:', designer.timezone || '❌ EMPTY');
  
  // Professional Info
  console.log('\n💼 PROFESSIONAL:');
  console.log('  - Title:', designer.title || '❌ EMPTY');
  console.log('  - Years Experience:', designer.years_experience || '❌ EMPTY');
  console.log('  - Availability:', designer.availability || '❌ EMPTY');
  console.log('  - Bio:', designer.bio ? `✅ ${designer.bio.substring(0, 50)}...` : '❌ EMPTY');
  
  // Portfolio Links
  console.log('\n🔗 PORTFOLIO LINKS:');
  console.log('  - Website:', designer.website_url || '❌ EMPTY');
  console.log('  - Portfolio:', designer.portfolio_url || '❌ EMPTY');
  console.log('  - Dribbble:', designer.dribbble_url || '❌ EMPTY');
  console.log('  - Behance:', designer.behance_url || '❌ EMPTY');
  console.log('  - LinkedIn:', designer.linkedin_url || '❌ EMPTY');
  
  // Portfolio Images
  console.log('\n🖼️ PORTFOLIO IMAGES:');
  console.log('  - Image 1:', designer.portfolio_image_1 ? '✅ Present' : '❌ EMPTY');
  console.log('  - Image 2:', designer.portfolio_image_2 ? '✅ Present' : '❌ EMPTY');
  console.log('  - Image 3:', designer.portfolio_image_3 ? '✅ Present' : '❌ EMPTY');
  
  // Arrays
  console.log('\n📊 SPECIALIZATIONS:');
  console.log('  - Styles:', designer.styles?.length > 0 ? designer.styles.join(', ') : '❌ EMPTY');
  console.log('  - Industries:', designer.industries?.length > 0 ? designer.industries.join(', ') : '❌ EMPTY');
  
  // Status
  console.log('\n✅ STATUS:');
  console.log('  - Is Approved:', designer.is_approved ? '✅ YES' : '❌ NO');
  console.log('  - Is Verified:', designer.is_verified ? '✅ YES' : '❌ NO');
  console.log('  - Edited After Approval:', designer.edited_after_approval ? '⚠️ YES' : '✅ NO');
  console.log('  - Rejection Reason:', designer.rejection_reason || 'None');
  
  // Check related tables
  console.log('\n🔍 CHECKING RELATED TABLES...');
  
  const { data: styles } = await supabase
    .from('designer_styles')
    .select('*')
    .eq('designer_id', designer.id);
  console.log('  - Designer Styles:', styles?.length || 0, 'records');
  
  const { data: projectTypes } = await supabase
    .from('designer_project_types')
    .select('*')
    .eq('designer_id', designer.id);
  console.log('  - Project Types:', projectTypes?.length || 0, 'records');
  
  const { data: industries } = await supabase
    .from('designer_industries')
    .select('*')
    .eq('designer_id', designer.id);
  console.log('  - Industries:', industries?.length || 0, 'records');
  
  const { data: software } = await supabase
    .from('designer_software_skills')
    .select('*')
    .eq('designer_id', designer.id);
  console.log('  - Software Skills:', software?.length || 0, 'records');
  
  const { data: specializations } = await supabase
    .from('designer_specializations')
    .select('*')
    .eq('designer_id', designer.id);
  console.log('  - Specializations:', specializations?.length || 0, 'records');
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ Verification Complete!\n');
  
  // Summary
  const emptyFields = [];
  if (!designer.first_name) emptyFields.push('first_name');
  if (!designer.last_name) emptyFields.push('last_name');
  if (!designer.country) emptyFields.push('country');
  if (!designer.city) emptyFields.push('city');
  if (!designer.avatar_url) emptyFields.push('avatar_url');
  if (!designer.portfolio_image_1) emptyFields.push('portfolio_image_1');
  if (!designer.portfolio_image_2) emptyFields.push('portfolio_image_2');
  if (!designer.portfolio_image_3) emptyFields.push('portfolio_image_3');
  
  if (emptyFields.length > 0) {
    console.log('⚠️ EMPTY FIELDS THAT NEED DATA:');
    emptyFields.forEach(field => console.log('  -', field));
  } else {
    console.log('🎉 All critical fields have data!');
  }
}

verifyProfileData();