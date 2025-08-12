const { createClient } = require('@supabase/supabase-js')

async function checkPortfolioImages() {
  console.log('🔍 Checking Portfolio Images for Muhammad G...\n')
  
  const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8'
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  const designerId = 'c2a4bbe1-58d7-41ea-ac2d-1b46af219bed' // Muhammad G's ID
  
  console.log('📋 **STEP 1: Check portfolio images table**')
  
  // Check if this designer has any portfolio images
  const { data: portfolioImages, error: portfolioError } = await supabase
    .from('designer_portfolio_images')
    .select('*')
    .eq('designer_id', designerId)
    .order('display_order', { ascending: true })
  
  console.log('Portfolio images query result:', { portfolioImages, portfolioError })
  
  if (portfolioImages && portfolioImages.length > 0) {
    console.log('\n✅ **PORTFOLIO IMAGES FOUND:**')
    portfolioImages.forEach((image, index) => {
      console.log(`${index + 1}. ${image.project_title || 'Untitled'}`)
      console.log(`   URL: ${image.image_url}`)
      console.log(`   Description: ${image.project_description || 'No description'}`)
      console.log(`   Display Order: ${image.display_order}`)
      console.log('')
    })
  } else {
    console.log('\n❌ **NO PORTFOLIO IMAGES FOUND**')
    console.log('This designer has no portfolio images in the database')
    console.log('The frontend will fall back to generated Picsum images')
  }
  
  console.log('\n📋 **STEP 2: Check what the direct DB API returns**')
  
  // Test our direct DB API
  try {
    const response = await fetch('https://onedesigner.app/api/test-direct-db')
    const data = await response.json()
    
    if (data.success && data.match && data.match.designer) {
      console.log('✅ **API RESPONSE FOR PORTFOLIO:**')
      const designer = data.match.designer
      console.log('Designer ID:', designer.id)
      console.log('Portfolio images in API response:', designer.portfolioImages || 'Not included in response')
    }
  } catch (error) {
    console.log('❌ Error testing API:', error.message)
  }
  
  console.log('\n🎯 **PORTFOLIO IMAGES STATUS:**')
  
  if (!portfolioImages || portfolioImages.length === 0) {
    console.log('1. ❌ No actual portfolio images in database for this designer')
    console.log('2. 🔧 Frontend will show generated Picsum placeholder images')
    console.log('3. 🔧 Generated images use pattern: https://picsum.photos/seed/{category}{index}-{designerId}/800/600')
    console.log('4. 💡 To test real portfolio images, we need to add some to the database')
  } else {
    console.log('1. ✅ Real portfolio images exist in database')
    console.log('2. 🔍 Check if API includes them in the response')
    console.log('3. 🔍 Check if frontend displays them correctly')
  }
}

checkPortfolioImages().catch(console.error)