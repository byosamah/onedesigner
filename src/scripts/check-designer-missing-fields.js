const { createClient } = require('@supabase/supabase-js')

// Load environment variables - NO FALLBACK SECRETS for security
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERROR: Missing required environment variables')
  console.error('   Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  console.error('   Example: SUPABASE_SERVICE_ROLE_KEY=your_key node src/scripts/check-designer-missing-fields.js')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Required fields from the application form
const REQUIRED_FIELDS = [
  'first_name',
  'last_name', 
  'email',
  'title',
  'years_experience',
  'website_url',
  'project_price_from',
  'project_price_to',
  'city',
  'country',
  'timezone',
  'availability',
  'bio',
  'project_preferences',
  'working_style',
  'communication_style',
  'remote_experience'
]

async function checkDesignerMissingFields() {
  console.log('Checking designers for missing required fields...\n')
  
  try {
    // Get all designers
    const { data: designers, error } = await supabase
      .from('designers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching designers:', error)
      return
    }
    
    console.log(`Total designers: ${designers.length}\n`)
    
    // Check each designer for missing fields
    const designersWithMissingFields = []
    
    for (const designer of designers) {
      const missingFields = []
      
      for (const field of REQUIRED_FIELDS) {
        if (!designer[field] || designer[field] === '') {
          missingFields.push(field)
        }
      }
      
      if (missingFields.length > 0) {
        designersWithMissingFields.push({
          id: designer.id,
          name: `${designer.first_name || 'Unknown'} ${designer.last_name || 'User'}`,
          email: designer.email,
          isApproved: designer.is_approved,
          createdAt: designer.created_at,
          missingFields: missingFields,
          missingCount: missingFields.length
        })
      }
    }
    
    // Sort by number of missing fields
    designersWithMissingFields.sort((a, b) => b.missingCount - a.missingCount)
    
    console.log(`\nDesigners with missing required fields: ${designersWithMissingFields.length}`)
    console.log('=' .repeat(80))
    
    // Display results
    for (const designer of designersWithMissingFields) {
      console.log(`\nDesigner: ${designer.name} (${designer.email})`)
      console.log(`Status: ${designer.isApproved ? 'Approved' : 'Not Approved'}`)
      console.log(`Created: ${new Date(designer.createdAt).toLocaleDateString()}`)
      console.log(`Missing ${designer.missingCount} required fields:`)
      designer.missingFields.forEach(field => {
        console.log(`  - ${field}`)
      })
    }
    
    // Check related tables
    console.log('\n' + '=' .repeat(80))
    console.log('Checking related tables for designers...\n')
    
    for (const designer of designersWithMissingFields.slice(0, 5)) { // Check first 5
      const [styles, projectTypes, industries, softwareSkills] = await Promise.all([
        supabase.from('designer_styles').select('style').eq('designer_id', designer.id),
        supabase.from('designer_project_types').select('project_type').eq('designer_id', designer.id),
        supabase.from('designer_industries').select('industry').eq('designer_id', designer.id),
        supabase.from('designer_software_skills').select('software').eq('designer_id', designer.id)
      ])
      
      console.log(`\n${designer.name}:`)
      console.log(`  - Styles: ${styles.data?.length || 0}`)
      console.log(`  - Project Types: ${projectTypes.data?.length || 0}`)
      console.log(`  - Industries: ${industries.data?.length || 0}`)
      console.log(`  - Software Skills: ${softwareSkills.data?.length || 0}`)
    }
    
    // Summary
    console.log('\n' + '=' .repeat(80))
    console.log('SUMMARY:')
    console.log(`- Total designers: ${designers.length}`)
    console.log(`- Designers with complete profiles: ${designers.length - designersWithMissingFields.length}`)
    console.log(`- Designers with missing fields: ${designersWithMissingFields.length}`)
    
    // Most common missing fields
    const fieldCounts = {}
    designersWithMissingFields.forEach(d => {
      d.missingFields.forEach(field => {
        fieldCounts[field] = (fieldCounts[field] || 0) + 1
      })
    })
    
    console.log('\nMost commonly missing fields:')
    Object.entries(fieldCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([field, count]) => {
        console.log(`  - ${field}: ${count} designers`)
      })
    
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

checkDesignerMissingFields()