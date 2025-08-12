async function getPaulRPortfolio() {
  console.log('🔍 Getting Portfolio URLs for Paul R...\n')
  
  // From the screenshot, we can see Paul R. is 7+ years, Mid Graphic Design Designer, Dubai
  // Let's check our database for Paul R.
  
  const { createClient } = require('@supabase/supabase-js')
  
  const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8'
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  console.log('📋 **STEP 1: Find Paul R. in database**')
  
  // Search for Paul R. - Mid Graphic Design Designer from Dubai
  const { data: designers, error } = await supabase
    .from('designers')
    .select('*')
    .ilike('first_name', 'Paul')
    .ilike('city', 'Dubai')
    .limit(3)
  
  console.log('Paul R. search results:', { designers, error })
  
  if (designers && designers.length > 0) {
    const paul = designers[0] // Take first Paul from Dubai
    console.log('\n✅ **FOUND PAUL R.**')
    console.log(`- ID: ${paul.id}`)
    console.log(`- Name: ${paul.first_name} ${paul.last_initial}`)
    console.log(`- Title: ${paul.title}`)
    console.log(`- City: ${paul.city}`)
    console.log(`- Avatar URL: ${paul.avatar_url}`)
    
    console.log('\n🎨 **PORTFOLIO URLS FOR PAUL R:**')
    
    // Generate the portfolio URLs for Paul based on his title/category
    const category = paul.title?.includes('Graphic') ? 'abstract' :
                    paul.title?.includes('Web') ? 'tech' :
                    paul.title?.includes('UI/UX') ? 'app' :
                    paul.title?.includes('Product') ? 'product' :
                    paul.title?.includes('Motion') ? 'motion' : 'design'
    
    const portfolioUrls = [
      `https://picsum.photos/seed/${category}1-${paul.id}/800/600`,
      `https://picsum.photos/seed/${category}2-${paul.id}/800/600`,
      `https://picsum.photos/seed/${category}3-${paul.id}/800/600`
    ]
    
    console.log('\n**AVATAR URL:**')
    console.log(paul.avatar_url)
    
    console.log('\n**PORTFOLIO URLS:**')
    portfolioUrls.forEach((url, index) => {
      console.log(`Image ${index + 1}: ${url}`)
    })
    
    return { paul, portfolioUrls }
  } else {
    console.log('\n❌ **PAUL R. NOT FOUND**')
    console.log('Could not find Paul R. in database')
    return null
  }
}

getPaulRPortfolio().catch(console.error)