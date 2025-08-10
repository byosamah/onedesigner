/**
 * Verify the seeded designers distribution
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verifyDesigners() {
  console.log('📊 Verifying Seeded Designers Distribution\n')
  console.log('=' . repeat(50))
  
  // Count total designers
  const { count: totalCount } = await supabase
    .from('designers')
    .select('*', { count: 'exact', head: true })
    .eq('is_approved', true)
  
  console.log(`\n✅ Total Approved Designers: ${totalCount}`)
  
  // Check by experience levels (years_experience is now an integer)
  console.log('\n📈 Experience Distribution:')
  const experienceRanges = [
    { label: '0-2 years', min: 0, max: 2 },
    { label: '3-5 years', min: 3, max: 5 },
    { label: '6-10 years', min: 6, max: 10 },
    { label: '10+ years', min: 11, max: 100 }
  ]
  
  for (const range of experienceRanges) {
    const { count } = await supabase
      .from('designers')
      .select('*', { count: 'exact', head: true })
      .gte('years_experience', range.min)
      .lte('years_experience', range.max)
      .eq('is_approved', true)
    
    const percentage = ((count / totalCount) * 100).toFixed(1)
    console.log(`  ${range.label}: ${count} designers (${percentage}%)`)
  }
  
  // Check by countries
  console.log('\n🌍 Geographic Distribution (Top 10):')
  const { data: countries } = await supabase
    .from('designers')
    .select('country')
    .eq('is_approved', true)
  
  const countryCount = {}
  countries.forEach(d => {
    countryCount[d.country] = (countryCount[d.country] || 0) + 1
  })
  
  const sortedCountries = Object.entries(countryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  
  sortedCountries.forEach(([country, count]) => {
    const percentage = ((count / totalCount) * 100).toFixed(1)
    console.log(`  ${country}: ${count} designers (${percentage}%)`)
  })
  
  // Check by styles
  console.log('\n🎨 Popular Design Styles:')
  const { data: designers } = await supabase
    .from('designers')
    .select('styles')
    .eq('is_approved', true)
  
  const styleCount = {}
  designers.forEach(d => {
    if (d.styles && Array.isArray(d.styles)) {
      d.styles.forEach(style => {
        styleCount[style] = (styleCount[style] || 0) + 1
      })
    }
  })
  
  const sortedStyles = Object.entries(styleCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  
  sortedStyles.forEach(([style, count]) => {
    const percentage = ((count / totalCount) * 100).toFixed(1)
    console.log(`  ${style}: ${count} designers (${percentage}%)`)
  })
  
  // Check by industries
  console.log('\n🏢 Industry Coverage:')
  const industryCount = {}
  designers.forEach(d => {
    if (d.industries && Array.isArray(d.industries)) {
      d.industries.forEach(industry => {
        industryCount[industry] = (industryCount[industry] || 0) + 1
      })
    }
  })
  
  const sortedIndustries = Object.entries(industryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  
  sortedIndustries.forEach(([industry, count]) => {
    const percentage = ((count / totalCount) * 100).toFixed(1)
    console.log(`  ${industry}: ${count} designers (${percentage}%)`)
  })
  
  // Check availability
  console.log('\n⏰ Availability Status:')
  const availabilities = ['immediate', '1_week', '2_weeks', '1_month', 'busy']
  for (const status of availabilities) {
    const { count } = await supabase
      .from('designers')
      .select('*', { count: 'exact', head: true })
      .eq('availability', status)
      .eq('is_approved', true)
    
    if (count > 0) {
      const percentage = ((count / totalCount) * 100).toFixed(1)
      console.log(`  ${status}: ${count} designers (${percentage}%)`)
    }
  }
  
  // Sample some designers to show quality
  console.log('\n👤 Sample Designer Profiles:')
  const { data: sampleDesigners } = await supabase
    .from('designers')
    .select('first_name, last_name, title, city, country, years_experience, bio, styles, industries')
    .eq('is_approved', true)
    .limit(3)
  
  sampleDesigners.forEach((designer, i) => {
    console.log(`\n  Designer ${i + 1}: ${designer.first_name} ${designer.last_name}`)
    console.log(`  Title: ${designer.title}`)
    console.log(`  Location: ${designer.city}, ${designer.country}`)
    console.log(`  Experience: ${designer.years_experience} years`)
    console.log(`  Styles: ${designer.styles.join(', ')}`)
    console.log(`  Industries: ${designer.industries.join(', ')}`)
    console.log(`  Bio: ${designer.bio.substring(0, 150)}...`)
  })
  
  console.log('\n' + '=' . repeat(50))
  console.log('✨ Verification complete!')
}

verifyDesigners().catch(console.error)