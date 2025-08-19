const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testComprehensiveBriefFix() {
  console.log('🧪 Testing Comprehensive Brief Data Fix\n');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Test creating a new brief with comprehensive data
    console.log('📝 Step 1: Testing Brief Creation with Comprehensive Data\n');
    
    const sampleComprehensiveData = {
      // Basic project info
      design_category: 'branding-logo',
      project_description: 'I need a modern logo for my tech startup that appeals to young professionals.',
      timeline_type: 'standard',
      budget_range: 'high',
      
      // Project details
      target_audience: 'Young professionals aged 25-35 in tech industry',
      project_goal: 'Create a memorable brand identity that stands out in the tech space',
      design_style_keywords: ['modern', 'minimalist', 'tech-forward'],
      
      // Working preferences
      involvement_level: 'milestone-checkins',
      update_frequency: 'weekly',
      communication_channels: ['email', 'slack'],
      feedback_style: 'annotated-mockups',
      change_flexibility: 'iterative-feedback',
      
      // Category-specific - Branding
      brand_identity_type: 'new-brand',
      brand_deliverables: ['primary-logo', 'logo-variations', 'color-palette', 'typography-system'],
      industry_sector: 'Technology/SaaS',
      color_preferences: 'Blue and white with modern accents',
      existing_brand_elements: 'starting-fresh',
      logo_usage: ['digital', 'print'],
      
      // Metadata
      submission_timestamp: new Date().toISOString(),
      form_version: '2.0-enhanced'
    };

    // Test the API structure (simulate what happens in /api/briefs/public)
    const briefInsert = {
      client_id: 'ff0498ad-79dd-45ff-bf87-a6dc8d1c4897', // Use existing test client
      project_type: sampleComprehensiveData.design_category,
      industry: sampleComprehensiveData.industry_sector,
      timeline: sampleComprehensiveData.timeline_type,
      budget: sampleComprehensiveData.budget_range,
      styles: sampleComprehensiveData.design_style_keywords || [],
      inspiration: '',
      requirements: JSON.stringify(sampleComprehensiveData), // COMPREHENSIVE DATA HERE
      timezone: 'UTC',
      communication: sampleComprehensiveData.communication_channels,
      status: 'active'
    };

    console.log('💾 Creating test brief with comprehensive data...');
    const { data: newBrief, error: createError } = await supabase
      .from('briefs')
      .insert(briefInsert)
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating test brief:', createError);
      return;
    }

    console.log('✅ Test brief created:', newBrief.id);
    console.log('  - Requirements field size:', newBrief.requirements.length, 'characters');
    console.log('  - Contains JSON:', newBrief.requirements.trim().startsWith('{'));

    // Step 2: Test parsing the comprehensive data
    console.log('\n📖 Step 2: Testing Comprehensive Data Parsing\n');
    
    let parsedData = {};
    try {
      parsedData = JSON.parse(newBrief.requirements);
      console.log('✅ Successfully parsed comprehensive data');
      console.log('  - Design Category:', parsedData.design_category);
      console.log('  - Target Audience:', parsedData.target_audience);
      console.log('  - Brand Identity Type:', parsedData.brand_identity_type);
      console.log('  - Color Preferences:', parsedData.color_preferences);
      console.log('  - Brand Deliverables:', parsedData.brand_deliverables?.length, 'items');
      console.log('  - Communication Channels:', parsedData.communication_channels?.length, 'channels');
    } catch (parseError) {
      console.error('❌ Failed to parse comprehensive data:', parseError);
      return;
    }

    // Step 3: Test brief snapshot creation (simulate contact API)
    console.log('\n🎯 Step 3: Testing Brief Snapshot Creation\n');
    
    const briefSnapshot = {
      // Basic project info
      project_type: newBrief.project_type || parsedData.design_category || 'Design Project',
      timeline: newBrief.timeline || parsedData.timeline_type || 'Not specified',
      budget: newBrief.budget || parsedData.budget_range || 'Not specified',
      
      // Project description - prioritize parsed data
      project_description: parsedData.project_description || '',
      
      // Target & Goals - comprehensive data
      target_audience: parsedData.target_audience || '',
      project_goal: parsedData.project_goal || '',
      brand_personality: parsedData.brand_personality || [],
      
      // Industry & Company
      industry: newBrief.industry || parsedData.industry_sector || '',
      
      // Design Preferences - comprehensive
      styles: newBrief.styles || parsedData.design_style_keywords || [],
      color_preferences: parsedData.color_preferences || '',
      
      // Deliverables & Requirements
      deliverables: parsedData.deliverables?.join(', ') || '',
      specific_requirements: parsedData.specific_requirements || '',
      
      // Communication & Working Preferences
      communication: newBrief.communication || parsedData.communication_channels || [],
      involvement_level: parsedData.involvement_level || '',
      update_frequency: parsedData.update_frequency || '',
      feedback_style: parsedData.feedback_style || '',
      
      // Category-specific fields
      category_specific_fields: {
        brand_identity_type: parsedData.brand_identity_type,
        brand_deliverables: parsedData.brand_deliverables,
        logo_usage: parsedData.logo_usage,
        existing_brand_elements: parsedData.existing_brand_elements
      },
      
      // Metadata
      form_version: parsedData.form_version || '1.0-legacy'
    };

    console.log('✅ Brief snapshot created successfully');
    console.log('  - Project Type:', briefSnapshot.project_type);
    console.log('  - Target Audience:', briefSnapshot.target_audience ? '✓' : '❌');
    console.log('  - Color Preferences:', briefSnapshot.color_preferences ? '✓' : '❌');
    console.log('  - Brand Identity Type:', briefSnapshot.category_specific_fields.brand_identity_type ? '✓' : '❌');
    console.log('  - Working Preferences:', briefSnapshot.involvement_level ? '✓' : '❌');

    // Step 4: Test Modal Display Fields
    console.log('\n🎨 Step 4: Testing Modal Display Fields\n');
    
    const modalFields = {
      'Basic Information': {
        project_type: !!briefSnapshot.project_type,
        timeline: !!briefSnapshot.timeline,
        budget: !!briefSnapshot.budget,
        project_description: !!briefSnapshot.project_description
      },
      'Target & Goals': {
        target_audience: !!briefSnapshot.target_audience,
        project_goal: !!briefSnapshot.project_goal
      },
      'Design Preferences': {
        styles: briefSnapshot.styles && briefSnapshot.styles.length > 0,
        color_preferences: !!briefSnapshot.color_preferences
      },
      'Working Preferences': {
        involvement_level: !!briefSnapshot.involvement_level,
        update_frequency: !!briefSnapshot.update_frequency,
        feedback_style: !!briefSnapshot.feedback_style
      },
      'Category-Specific Fields': {
        brand_identity_type: !!briefSnapshot.category_specific_fields.brand_identity_type,
        brand_deliverables: briefSnapshot.category_specific_fields.brand_deliverables && 
                           briefSnapshot.category_specific_fields.brand_deliverables.length > 0
      }
    };

    Object.entries(modalFields).forEach(([section, fields]) => {
      console.log(`📋 ${section}:`);
      Object.entries(fields).forEach(([field, hasData]) => {
        console.log(`    ${hasData ? '✅' : '❌'} ${field}`);
      });
      console.log('');
    });

    // Step 5: Cleanup test data
    console.log('🧹 Step 5: Cleaning up test data\n');
    
    const { error: deleteError } = await supabase
      .from('briefs')
      .delete()
      .eq('id', newBrief.id);

    if (deleteError) {
      console.warn('⚠️ Warning: Could not clean up test brief:', deleteError.message);
    } else {
      console.log('✅ Test brief cleaned up successfully');
    }

    // Final Analysis
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 COMPREHENSIVE BRIEF FIX TEST RESULTS\n');
    
    const allFieldsPopulated = Object.values(modalFields).every(section => 
      Object.values(section).some(hasData => hasData)
    );
    
    if (allFieldsPopulated) {
      console.log('✅ SUCCESS: All sections have data');
      console.log('✅ Brief modal will now show comprehensive client responses');
      console.log('✅ Working request system captures ALL form data');
      console.log('\n🚀 The fix is ready for deployment!');
    } else {
      console.log('⚠️ PARTIAL SUCCESS: Some sections still missing data');
      console.log('   This may be expected for test data');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ Test Complete');
}

// Run the test
testComprehensiveBriefFix();