const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Color palette for avatars
const colors = [
  '264653', '2a9d8f', 'e76f51', 'f4a261', 'e9c46a',
  '457b9d', '1d3557', 'a8dadc', '06ffa5', 'ffbe0b',
  '8338ec', 'fb5607', '3a86ff', 'ff006e', '6930c3',
  '5390d9', '4ea8de', '48bfe3', '56cfe1', '64dfdf',
  '72efdd', '80ffdb', 'ff4b4b', 'fe6b6b', 'ff8e8e'
]

function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

async function updateAllDesigners() {
  console.log('🎨 Starting comprehensive designer image update...')
  console.log('================================================\n')
  
  try {
    // First, check if columns exist
    const { data: testDesigner } = await supabase
      .from('designers')
      .select('id, avatar_url')
      .limit(1)
      .single()
    
    const hasAvatarColumn = testDesigner && 'avatar_url' in testDesigner
    
    if (!hasAvatarColumn) {
      console.log('⚠️  Warning: avatar_url column not found. Using fallback approach.')
    }
    
    // Fetch all designers
    const { data: designers, error: fetchError } = await supabase
      .from('designers')
      .select('id, first_name, last_name, title, styles, industries')
      .order('created_at', { ascending: true })
    
    if (fetchError) {
      console.error('❌ Error fetching designers:', fetchError)
      return
    }
    
    console.log(`📊 Found ${designers.length} designers to update`)
    console.log('⏳ Estimated time: ~' + Math.ceil(designers.length / 20) + ' minutes\n')
    
    let successCount = 0
    let errorCount = 0
    
    // Process in batches
    const batchSize = 10
    for (let i = 0; i < designers.length; i += batchSize) {
      const batch = designers.slice(i, Math.min(i + batchSize, designers.length))
      
      const updatePromises = batch.map(async (designer) => {
        try {
          const firstName = designer.first_name || 'Designer'
          const lastName = designer.last_name || 'User'
          
          // Generate avatar URL with varied colors
          const colorIndex = hashCode(`${firstName}${lastName}`) % colors.length
          const bgColor = colors[colorIndex]
          const avatarUrl = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&size=400&background=${bgColor}&color=fff&bold=true&format=svg`
          
          // Generate unique portfolio images using designer ID as seed
          const idNum = hashCode(designer.id)
          const portfolio1 = `https://picsum.photos/seed/${idNum}/1200/900`
          const portfolio2 = `https://picsum.photos/seed/${idNum + 1000}/1200/900`
          const portfolio3 = `https://picsum.photos/seed/${idNum + 2000}/1200/900`
          
          // Prepare update data - only include fields that exist
          const updateData = {
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
          }
          
          // Try to add portfolio images if columns exist
          try {
            const fullUpdateData = {
              ...updateData,
              portfolio_image_1: portfolio1,
              portfolio_image_2: portfolio2,
              portfolio_image_3: portfolio3
            }
            
            const { error: updateError } = await supabase
              .from('designers')
              .update(fullUpdateData)
              .eq('id', designer.id)
            
            if (updateError) {
              // If portfolio columns don't exist, try with just avatar
              if (updateError.message.includes('portfolio_image')) {
                const { error: avatarOnlyError } = await supabase
                  .from('designers')
                  .update(updateData)
                  .eq('id', designer.id)
                
                if (avatarOnlyError) {
                  throw avatarOnlyError
                }
              } else {
                throw updateError
              }
            }
          } catch (err) {
            // Fallback: just update avatar
            const { error: avatarError } = await supabase
              .from('designers')
              .update(updateData)
              .eq('id', designer.id)
            
            if (avatarError) {
              throw avatarError
            }
          }
          
          successCount++
          const progress = Math.round((successCount / designers.length) * 100)
          
          // Show progress every 10 designers
          if (successCount % 10 === 0 || successCount === designers.length) {
            console.log(`✅ Progress: ${progress}% (${successCount}/${designers.length}) - Latest: ${firstName} ${lastName}`)
          }
          
        } catch (err) {
          console.error(`❌ Failed: ${designer.first_name} ${designer.last_name} - ${err.message}`)
          errorCount++
        }
      })
      
      // Wait for batch
      await Promise.all(updatePromises)
      
      // Small delay between batches
      if (i + batchSize < designers.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50))
    console.log('🎉 UPDATE COMPLETE!')
    console.log('='.repeat(50))
    console.log(`✅ Successfully updated: ${successCount} designers`)
    if (errorCount > 0) {
      console.log(`❌ Failed: ${errorCount} designers`)
    }
    console.log('='.repeat(50))
    
    // Show sample URLs
    console.log('\n📸 Sample image URLs generated:')
    const sampleDesigner = designers[0]
    if (sampleDesigner) {
      const colorIndex = hashCode(`${sampleDesigner.first_name}${sampleDesigner.last_name}`) % colors.length
      const bgColor = colors[colorIndex]
      console.log(`Avatar: https://ui-avatars.com/api/?name=${sampleDesigner.first_name}+${sampleDesigner.last_name}&size=400&background=${bgColor}&color=fff&bold=true&format=svg`)
      
      const idNum = hashCode(sampleDesigner.id)
      console.log(`Portfolio 1: https://picsum.photos/seed/${idNum}/1200/900`)
      console.log(`Portfolio 2: https://picsum.photos/seed/${idNum + 1000}/1200/900`)
      console.log(`Portfolio 3: https://picsum.photos/seed/${idNum + 2000}/1200/900`)
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error)
  }
}

// Run
console.log('🚀 OneDesigner - Bulk Designer Image Update')
console.log('============================================')
console.log('This will update all designers with:')
console.log('  • Avatar images (initials with varied colors)')
console.log('  • Portfolio images (3 unique images per designer)')
console.log('')

updateAllDesigners()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch(err => {
    console.error('\n💥 Error:', err)
    process.exit(1)
  })