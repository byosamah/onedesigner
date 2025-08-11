const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testImageUpdate() {
  console.log('🧪 Testing image update with 5 designers...\n')
  
  try {
    // Fetch just 5 designers for testing
    const { data: designers, error } = await supabase
      .from('designers')
      .select('id, first_name, last_name, title, styles, industries')
      .limit(5)
    
    if (error) {
      console.error('❌ Error fetching designers:', error)
      return
    }
    
    console.log('📋 Test designers:')
    designers.forEach(d => {
      console.log(`   - ${d.first_name} ${d.last_name} (${d.title || 'Designer'})`)
    })
    console.log('')
    
    // Test image generation for each
    for (const designer of designers) {
      console.log(`\n🎨 Generating images for ${designer.first_name} ${designer.last_name}:`)
      
      // Avatar URL (initials)
      const initials = `${designer.first_name.charAt(0)}${designer.last_name.charAt(0)}`.toUpperCase()
      const avatarUrl = `https://ui-avatars.com/api/?name=${designer.first_name}+${designer.last_name}&size=400&background=f0ad4e&color=fff&bold=true`
      console.log(`   ✓ Avatar: ${avatarUrl}`)
      
      // Portfolio images
      const seed1 = Math.abs(designer.id.charCodeAt(0) * 1000)
      const seed2 = Math.abs(designer.id.charCodeAt(1) * 1000) 
      const seed3 = Math.abs(designer.id.charCodeAt(2) * 1000)
      
      const portfolio1 = `https://picsum.photos/seed/${seed1}/1200/900`
      const portfolio2 = `https://picsum.photos/seed/${seed2}/1200/900`
      const portfolio3 = `https://picsum.photos/seed/${seed3}/1200/900`
      
      console.log(`   ✓ Portfolio 1: ${portfolio1}`)
      console.log(`   ✓ Portfolio 2: ${portfolio2}`)
      console.log(`   ✓ Portfolio 3: ${portfolio3}`)
      
      // Update the designer
      const { error: updateError } = await supabase
        .from('designers')
        .update({
          avatar_url: avatarUrl,
          portfolio_image_1: portfolio1,
          portfolio_image_2: portfolio2,
          portfolio_image_3: portfolio3,
          updated_at: new Date().toISOString()
        })
        .eq('id', designer.id)
      
      if (updateError) {
        console.error(`   ❌ Update failed:`, updateError.message)
      } else {
        console.log(`   ✅ Successfully updated!`)
      }
    }
    
    console.log('\n✨ Test completed!')
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

// Run test
testImageUpdate()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })