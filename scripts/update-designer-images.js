const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Avatar services that provide consistent avatars based on seed
const avatarServices = [
  (seed) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
  (seed) => `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}`,
  (seed) => `https://api.dicebear.com/7.x/personas/svg?seed=${seed}`,
  (seed) => `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`,
  (seed) => `https://api.dicebear.com/7.x/big-smile/svg?seed=${seed}`,
]

// Portfolio image services (using Unsplash for high-quality design portfolios)
const portfolioCategories = [
  'web-design',
  'mobile-app',
  'branding',
  'graphic-design',
  'ui-design',
  'ux-design',
  'logo-design',
  'illustration',
  'typography',
  'packaging-design',
  'poster-design',
  'book-cover',
  'magazine-layout',
  'business-card',
  'social-media-design',
  'dashboard-design',
  'website-mockup',
  'app-interface',
  'design-portfolio',
  'creative-design'
]

// Generate portfolio images based on designer's specialties
function generatePortfolioImages(designerId, categories = []) {
  const images = []
  
  // Use designer's categories or random ones
  const relevantCategories = categories.length > 0 
    ? categories 
    : [portfolioCategories[Math.floor(Math.random() * portfolioCategories.length)]]
  
  // Generate 3 portfolio images
  for (let i = 0; i < 3; i++) {
    const category = relevantCategories[i % relevantCategories.length]
    const seed = `${designerId}-portfolio-${i}-${Date.now()}`
    
    // Using Unsplash Source API for high-quality images
    // Format: https://source.unsplash.com/800x600/?{keyword}
    const imageUrl = `https://source.unsplash.com/800x600/?${category},${seed}`
    images.push(imageUrl)
  }
  
  return images
}

// Generate avatar based on designer name and ID
function generateAvatar(designerId, firstName, lastName) {
  const seed = `${firstName}-${lastName}-${designerId}`.toLowerCase()
  const serviceIndex = Math.abs(hashCode(seed)) % avatarServices.length
  return avatarServices[serviceIndex](seed)
}

// Simple hash function for consistent avatar selection
function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash
}

async function updateDesignerImages() {
  console.log('🎨 Starting designer image update...')
  
  try {
    // Fetch all designers
    const { data: designers, error: fetchError } = await supabase
      .from('designers')
      .select('id, first_name, last_name, categories, styles, industries')
      .order('created_at', { ascending: true })
    
    if (fetchError) {
      console.error('❌ Error fetching designers:', fetchError)
      return
    }
    
    console.log(`📊 Found ${designers.length} designers to update`)
    
    let successCount = 0
    let errorCount = 0
    
    // Process designers in batches of 10
    const batchSize = 10
    for (let i = 0; i < designers.length; i += batchSize) {
      const batch = designers.slice(i, Math.min(i + batchSize, designers.length))
      
      const updatePromises = batch.map(async (designer) => {
        try {
          // Generate avatar URL
          const avatarUrl = generateAvatar(
            designer.id, 
            designer.first_name || 'Designer',
            designer.last_name || 'User'
          )
          
          // Generate portfolio images based on designer's categories/styles
          const designCategories = [
            ...(designer.categories || []),
            ...(designer.styles || []),
            ...(designer.industries || [])
          ].filter(Boolean).slice(0, 3)
          
          const portfolioImages = generatePortfolioImages(designer.id, designCategories)
          
          // Update designer record
          const { error: updateError } = await supabase
            .from('designers')
            .update({
              avatar_url: avatarUrl,
              portfolio_image_1: portfolioImages[0],
              portfolio_image_2: portfolioImages[1],
              portfolio_image_3: portfolioImages[2],
              updated_at: new Date().toISOString()
            })
            .eq('id', designer.id)
          
          if (updateError) {
            console.error(`❌ Error updating designer ${designer.id}:`, updateError)
            errorCount++
          } else {
            successCount++
            console.log(`✅ Updated designer ${designer.first_name} ${designer.last_name} (${successCount}/${designers.length})`)
          }
        } catch (err) {
          console.error(`❌ Error processing designer ${designer.id}:`, err)
          errorCount++
        }
      })
      
      // Wait for batch to complete
      await Promise.all(updatePromises)
      
      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < designers.length) {
        console.log(`⏳ Processed batch ${Math.floor(i/batchSize) + 1}, waiting 1 second...`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    console.log('\n🎉 Update complete!')
    console.log(`✅ Successfully updated: ${successCount} designers`)
    console.log(`❌ Failed updates: ${errorCount} designers`)
    
  } catch (error) {
    console.error('❌ Fatal error:', error)
  }
}

// Alternative: Use Lorem Picsum for portfolio images (more reliable)
function generatePortfolioImagesAlternative(designerId) {
  const images = []
  
  // Generate 3 portfolio images with consistent but unique IDs
  for (let i = 0; i < 3; i++) {
    // Use designer ID and index to create consistent image IDs
    const imageId = (parseInt(designerId.substring(0, 8), 16) % 1000) + i * 100
    const imageUrl = `https://picsum.photos/seed/${imageId}/800/600`
    images.push(imageUrl)
  }
  
  return images
}

// Run the update
console.log('🚀 Starting designer image update script...')
console.log('📝 This will update all designers with:')
console.log('   - Avatar pictures (using DiceBear avatars)')
console.log('   - Portfolio images (using Unsplash/Lorem Picsum)')
console.log('')

// Add command line argument to use alternative image source
const useAlternative = process.argv.includes('--alternative')
if (useAlternative) {
  console.log('📸 Using Lorem Picsum for portfolio images (more reliable)')
  // Override the generatePortfolioImages function
  generatePortfolioImages = generatePortfolioImagesAlternative
}

updateDesignerImages()
  .then(() => {
    console.log('✨ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })