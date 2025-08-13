// Add portfolio images for testing
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addPortfolioImages() {
  console.log('🎨 Adding portfolio images...')
  
  // Sample portfolio images (using placeholder service)
  const portfolioImages = [
    'https://picsum.photos/seed/portfolio1/400/400',
    'https://picsum.photos/seed/portfolio2/400/400', 
    'https://picsum.photos/seed/portfolio3/400/400'
  ]
  
  try {
    // First, check if columns exist
    const { data: checkData, error: checkError } = await supabase
      .from('designers')
      .select('id, email, portfolio_image_1, portfolio_image_2, portfolio_image_3')
      .eq('email', 'designbattlefield@gmail.com')
      .single()
    
    if (checkError && checkError.message.includes('portfolio_image')) {
      console.log('❌ Portfolio image columns do not exist')
      console.log('🔧 Attempting to use alternative storage...')
      
      // Try storing in a JSON column or other text field
      // For now, let's try to store them in a way that works with existing schema
      const { data, error } = await supabase
        .from('designers')
        .update({ 
          // Store portfolio URLs in existing text columns if available
          dribbble_url: portfolioImages[0],
          behance_url: portfolioImages[1],
          linkedin_url: portfolioImages[2]
        })
        .eq('email', 'designbattlefield@gmail.com')
        .select()
        .single()
      
      if (error) {
        console.log('❌ Alternative update failed:', error.message)
        return
      }
      
      console.log('✅ Stored portfolio images in alternative fields')
      console.log('Note: These are temporarily stored in social media URL fields for testing')
      return
    }
    
    // If columns exist, update them
    const { data, error } = await supabase
      .from('designers')
      .update({ 
        portfolio_image_1: portfolioImages[0],
        portfolio_image_2: portfolioImages[1],
        portfolio_image_3: portfolioImages[2]
      })
      .eq('email', 'designbattlefield@gmail.com')
      .select()
      .single()
    
    if (error) {
      console.log('❌ Update failed:', error.message)
      return
    }
    
    console.log('✅ Successfully added portfolio images!')
    console.log('Images:', portfolioImages)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

addPortfolioImages()