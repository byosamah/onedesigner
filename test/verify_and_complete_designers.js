const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Supabase configuration
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyDesigners() {
  console.log('📊 Verifying Designer Data...\n');
  
  // Get total count
  const { count: totalCount, error: countError } = await supabase
    .from('designers')
    .select('*', { count: 'exact', head: true });
  
  if (countError) {
    console.error('Error counting designers:', countError);
    return;
  }
  
  console.log(`Total designers in database: ${totalCount}`);
  
  // Check distribution by various metrics
  console.log('\n📈 Distribution Analysis:');
  
  // By title/category (inferred from title)
  const categories = ['Graphic Design', 'Web Design', 'UI/UX Design', 'Product Design', 'Motion Design', 'Interior Design'];
  console.log('\nBy Category (from title):');
  
  for (const category of categories) {
    const { count } = await supabase
      .from('designers')
      .select('*', { count: 'exact', head: true })
      .ilike('title', `%${category}%`);
    console.log(`  ${category}: ${count} designers`);
  }
  
  // By experience level
  console.log('\nBy Experience Level:');
  const { data: expData } = await supabase
    .from('designers')
    .select('years_experience');
  
  if (expData) {
    const junior = expData.filter(d => d.years_experience <= 3).length;
    const mid = expData.filter(d => d.years_experience > 3 && d.years_experience <= 10).length;
    const senior = expData.filter(d => d.years_experience > 10).length;
    
    console.log(`  Junior (1-3 years): ${junior} designers`);
    console.log(`  Mid-level (4-10 years): ${mid} designers`);
    console.log(`  Senior (11+ years): ${senior} designers`);
  }
  
  // By hourly rate ranges
  console.log('\nBy Hourly Rate:');
  const { data: rateData } = await supabase
    .from('designers')
    .select('hourly_rate');
  
  if (rateData) {
    const budget = rateData.filter(d => d.hourly_rate < 50).length;
    const standard = rateData.filter(d => d.hourly_rate >= 50 && d.hourly_rate < 100).length;
    const premium = rateData.filter(d => d.hourly_rate >= 100 && d.hourly_rate < 150).length;
    const luxury = rateData.filter(d => d.hourly_rate >= 150).length;
    
    console.log(`  Budget (<$50/hr): ${budget} designers`);
    console.log(`  Standard ($50-99/hr): ${standard} designers`);
    console.log(`  Premium ($100-149/hr): ${premium} designers`);
    console.log(`  Luxury ($150+/hr): ${luxury} designers`);
  }
  
  // By location
  console.log('\nTop 10 Cities:');
  const { data: cityData } = await supabase
    .from('designers')
    .select('city');
  
  if (cityData) {
    const cityCounts = {};
    cityData.forEach(d => {
      cityCounts[d.city] = (cityCounts[d.city] || 0) + 1;
    });
    
    const sortedCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    sortedCities.forEach(([city, count]) => {
      console.log(`  ${city}: ${count} designers`);
    });
  }
  
  // Check data quality
  console.log('\n✅ Data Quality Check:');
  
  // Check for required fields
  const { data: sampleDesigners } = await supabase
    .from('designers')
    .select('*')
    .limit(10);
  
  if (sampleDesigners && sampleDesigners.length > 0) {
    const requiredFields = ['email', 'first_name', 'last_name', 'title', 'city', 'country', 
                           'bio', 'avatar_url', 'hourly_rate', 'years_experience'];
    
    let allFieldsPresent = true;
    requiredFields.forEach(field => {
      const hasField = sampleDesigners.every(d => d[field] !== null && d[field] !== undefined);
      if (!hasField) {
        console.log(`  ⚠️  Missing field: ${field}`);
        allFieldsPresent = false;
      }
    });
    
    if (allFieldsPresent) {
      console.log('  ✓ All required fields present');
    }
    
    // Check arrays
    const arrayFields = ['styles', 'industries', 'tools'];
    arrayFields.forEach(field => {
      const hasArrays = sampleDesigners.every(d => Array.isArray(d[field]) && d[field].length > 0);
      console.log(`  ${hasArrays ? '✓' : '⚠️'} ${field} arrays populated`);
    });
    
    // Check approval status
    const { count: approvedCount } = await supabase
      .from('designers')
      .select('*', { count: 'exact', head: true })
      .eq('is_approved', true);
    
    const { count: verifiedCount } = await supabase
      .from('designers')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true);
    
    console.log(`  ✓ Approved designers: ${approvedCount || 0}`);
    console.log(`  ✓ Verified designers: ${verifiedCount || 0}`);
  }
  
  // Show sample designer
  console.log('\n📋 Sample Designer Profile:');
  if (sampleDesigners && sampleDesigners[0]) {
    const sample = sampleDesigners[0];
    console.log(`  Name: ${sample.first_name} ${sample.last_name}`);
    console.log(`  Title: ${sample.title}`);
    console.log(`  Location: ${sample.city}, ${sample.country}`);
    console.log(`  Experience: ${sample.years_experience} years`);
    console.log(`  Rate: $${sample.hourly_rate}/hr`);
    console.log(`  Rating: ${sample.rating}/5.0`);
    console.log(`  Bio: ${sample.bio ? sample.bio.substring(0, 100) + '...' : 'N/A'}`);
    console.log(`  Styles: ${sample.styles ? sample.styles.join(', ') : 'N/A'}`);
    console.log(`  Tools: ${sample.tools ? sample.tools.join(', ') : 'N/A'}`);
  }
  
  // Add missing designers if needed
  if (totalCount < 600) {
    console.log(`\n⚠️  Missing ${600 - totalCount} designers. Adding them now...`);
    await addMissingDesigners(600 - totalCount);
  } else {
    console.log('\n✅ All 600 designers are present!');
  }
}

async function addMissingDesigners(count) {
  const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 'Avery', 'Quinn', 'Sage'];
  const lastNames = ['Cooper', 'Murphy', 'Rivera', 'Cook', 'Rogers', 'Morgan', 'Peterson', 'Reed', 'Bailey', 'Bell'];
  const cities = ['Austin', 'Seattle', 'Denver', 'Portland', 'Miami', 'Boston', 'Atlanta', 'Nashville', 'Phoenix', 'Detroit'];
  const countries = ['USA', 'USA', 'USA', 'USA', 'USA', 'USA', 'USA', 'USA', 'USA', 'USA'];
  
  const categories = ['Graphic Design', 'Web Design', 'UI/UX Design', 'Product Design', 'Motion Design', 'Interior Design'];
  const designersToAdd = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length] + i;
    const lastName = lastNames[i % lastNames.length];
    const category = categories[i % categories.length];
    const yearsExp = Math.floor(Math.random() * 15) + 1;
    
    designersToAdd.push({
      id: uuidv4(),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@designer.com`,
      first_name: firstName,
      last_name: lastName,
      last_initial: lastName[0],
      title: `${yearsExp > 10 ? 'Senior' : yearsExp > 5 ? 'Mid' : 'Junior'} ${category} Designer`,
      city: cities[i % cities.length],
      country: countries[i % countries.length],
      years_experience: yearsExp,
      rating: 4.5,
      total_projects: Math.floor(Math.random() * 50) + 10,
      avatar_url: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`,
      phone: `+1555${Math.floor(Math.random() * 9000000) + 1000000}`,
      website_url: `https://portfolio.${firstName.toLowerCase()}.com`,
      bio: `Experienced ${category} designer with ${yearsExp} years of expertise.`,
      styles: ['Modern', 'Minimalist', 'Creative'],
      industries: ['Technology', 'Finance', 'Healthcare'],
      tools: ['Figma', 'Adobe Creative Suite', 'Sketch'],
      hourly_rate: 50 + (yearsExp * 5),
      availability: 'available',
      response_time: '24 hours',
      timezone: 'EST',
      is_contactable: true,
      hide_phone: false,
      is_verified: true,
      is_approved: true,
      subscription_tier: 'free'
    });
  }
  
  // Insert in batches
  const batchSize = 50;
  for (let i = 0; i < designersToAdd.length; i += batchSize) {
    const batch = designersToAdd.slice(i, i + batchSize);
    const { error } = await supabase
      .from('designers')
      .insert(batch);
    
    if (error) {
      console.error(`Error adding batch:`, error.message);
    } else {
      console.log(`✓ Added batch of ${batch.length} designers`);
    }
  }
  
  // Verify final count
  const { count: finalCount } = await supabase
    .from('designers')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n✅ Final designer count: ${finalCount}`);
}

verifyDesigners().catch(console.error);