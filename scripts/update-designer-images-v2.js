const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Professional headshot-style avatar using UI Avatars
function generateProfessionalAvatar(firstName, lastName) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  const name = `${firstName}+${lastName}`
  
  // Generate consistent color based on name
  const colors = [
    '264653', '2a9d8f', 'e76f51', 'f4a261', 'e9c46a',
    '457b9d', '1d3557', 'a8dadc', '06ffa5', 'ffbe0b',
    '8338ec', 'fb5607', '3a86ff', 'ff006e', '6930c3'
  ]
  
  const colorIndex = Math.abs(hashCode(`${firstName}${lastName}`)) % colors.length
  const bgColor = colors[colorIndex]
  
  // UI Avatars generates nice initial-based avatars
  return `https://ui-avatars.com/api/?name=${name}&size=400&background=${bgColor}&color=fff&bold=true&format=svg`
}

// Generate realistic portfolio images using various services
function generateRealisticPortfolioImages(designerId, categories = [], styles = []) {
  const images = []
  
  // Design-related search terms for better portfolio images
  const designTerms = {
    'Web & Mobile Design': ['web-design', 'app-interface', 'dashboard', 'website'],
    'Branding & Logo Design': ['logo', 'brand-identity', 'branding', 'corporate-design'],
    'Social Media Graphics': ['social-media', 'instagram-post', 'marketing', 'advertising'],
    'Motion Graphics': ['animation', 'motion-design', '3d-render', 'video'],
    'Photography & Video': ['photography', 'photoshoot', 'camera', 'studio'],
    'Presentations': ['presentation', 'slides', 'keynote', 'powerpoint']
  }
  
  // Map designer categories to search terms
  let searchTerms = []
  categories.forEach(cat => {
    if (designTerms[cat]) {
      searchTerms = [...searchTerms, ...designTerms[cat]]
    }
  })
  
  // Add style-based terms
  const styleTerms = {
    'Minimalist': 'minimal-design',
    'Modern': 'modern-design',
    'Classic': 'classic-design',
    'Bold': 'bold-design',
    'Playful': 'colorful-design',
    'Corporate': 'business-design',
    'Elegant': 'elegant-design',
    'Vintage': 'vintage-design',
    'Futuristic': 'futuristic-design'
  }
  
  styles.forEach(style => {
    if (styleTerms[style]) {
      searchTerms.push(styleTerms[style])
    }
  })
  
  // Default terms if none found
  if (searchTerms.length === 0) {
    searchTerms = ['design-portfolio', 'creative-work', 'graphic-design']
  }
  
  // Generate 3 unique portfolio images
  for (let i = 0; i < 3; i++) {
    const term = searchTerms[i % searchTerms.length]
    const seed = parseInt(designerId.replace(/-/g, '').substring(0, 8), 16) + i
    
    // Using Lorem Picsum with seed for consistency
    const imageUrl = `https://picsum.photos/seed/${seed}/1200/900`
    images.push(imageUrl)
  }
  
  return images
}

// Generate profile picture using realistic avatar service
function generateProfilePicture(designerId, firstName, lastName, gender = null) {
  // Using randomuser.me style avatars (stored locally or using a service)
  // For now, using a combination of services
  
  const seed = `${firstName}-${lastName}-${designerId}`.toLowerCase()
  
  // Options for realistic avatars:
  // 1. Avataaars with more realistic settings
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=gradientLinear`
  
  return avatarUrl
}

// Simple hash function for consistent selection
function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash
}

async function updateDesignerImages() {
  console.log('🎨 Starting comprehensive designer image update...')
  console.log('📸 This will add:')
  console.log('   - Professional avatar pictures')
  console.log('   - Profile pictures')
  console.log('   - Portfolio images (3 per designer)')
  console.log('')
  
  try {
    // Fetch all designers with their details
    const { data: designers, error: fetchError } = await supabase
      .from('designers')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (fetchError) {
      console.error('❌ Error fetching designers:', fetchError)
      return
    }
    
    console.log(`📊 Found ${designers.length} designers to update`)
    console.log('⏳ This will take approximately', Math.ceil(designers.length / 10), 'minutes...\n')
    
    let successCount = 0
    let errorCount = 0
    let skipCount = 0
    
    // Process designers in batches
    const batchSize = 5
    for (let i = 0; i < designers.length; i += batchSize) {
      const batch = designers.slice(i, Math.min(i + batchSize, designers.length))
      
      const updatePromises = batch.map(async (designer) => {
        try {
          // Skip if already has images (optional)
          if (designer.avatar_url && designer.portfolio_image_1 && process.argv.includes('--skip-existing')) {
            skipCount++
            console.log(`⏭️  Skipping ${designer.first_name} ${designer.last_name} (already has images)`)
            return
          }
          
          // Generate professional avatar
          const avatarUrl = generateProfessionalAvatar(
            designer.first_name || 'Designer',
            designer.last_name || 'User'
          )
          
          // Generate profile picture
          const profilePicture = generateProfilePicture(
            designer.id,
            designer.first_name || 'Designer',
            designer.last_name || 'User'
          )
          
          // Generate portfolio images based on designer's specialties
          const portfolioImages = generateRealisticPortfolioImages(
            designer.id,
            designer.categories || [],
            designer.styles || []
          )
          
          // Prepare update data
          const updateData = {
            avatar_url: avatarUrl,
            profile_picture: profilePicture,
            portfolio_image_1: portfolioImages[0],
            portfolio_image_2: portfolioImages[1],
            portfolio_image_3: portfolioImages[2],
            portfolio_images: portfolioImages, // Store as array too
            updated_at: new Date().toISOString()
          }
          
          // Update designer record
          const { error: updateError } = await supabase
            .from('designers')
            .update(updateData)
            .eq('id', designer.id)
          
          if (updateError) {
            console.error(`❌ Error updating ${designer.first_name} ${designer.last_name}:`, updateError.message)
            errorCount++
          } else {
            successCount++
            const progress = Math.round((successCount / designers.length) * 100)
            console.log(`✅ [${progress}%] Updated ${designer.first_name} ${designer.last_name} (${designer.title || 'Designer'})`)
          }
        } catch (err) {
          console.error(`❌ Error processing designer ${designer.id}:`, err.message)
          errorCount++
        }
      })
      
      // Wait for batch to complete
      await Promise.all(updatePromises)
      
      // Progress update
      if (i + batchSize < designers.length) {
        const completed = Math.min(i + batchSize, designers.length)
        console.log(`\n📊 Progress: ${completed}/${designers.length} designers processed`)
        console.log(`⏳ Waiting 2 seconds before next batch...\n`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    // Final summary
    console.log('\n' + '='.repeat(50))
    console.log('🎉 UPDATE COMPLETE!')
    console.log('='.repeat(50))
    console.log(`✅ Successfully updated: ${successCount} designers`)
    if (skipCount > 0) {
      console.log(`⏭️  Skipped (existing): ${skipCount} designers`)
    }
    if (errorCount > 0) {
      console.log(`❌ Failed updates: ${errorCount} designers`)
    }
    console.log(`📊 Total processed: ${designers.length} designers`)
    console.log('='.repeat(50))
    
  } catch (error) {
    console.error('💥 Fatal error:', error)
  }
}

// Command line interface
console.log('🚀 OneDesigner - Bulk Image Update Tool')
console.log('=====================================\n')

const args = process.argv.slice(2)
if (args.includes('--help')) {
  console.log('Usage: node update-designer-images-v2.js [options]')
  console.log('\nOptions:')
  console.log('  --skip-existing    Skip designers that already have images')
  console.log('  --help            Show this help message')
  console.log('')
  process.exit(0)
}

// Run the update
updateDesignerImages()
  .then(() => {
    console.log('\n✨ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error)
    process.exit(1)
  })