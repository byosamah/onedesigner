const { createClient } = require('@supabase/supabase-js')

async function checkDesignerFields() {
  console.log('🔍 Checking Designer Database Fields...\n')
  
  const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8'
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Get Paul R's data to see what fields we actually have
  const { data: paul, error } = await supabase
    .from('designers')
    .select('*')
    .eq('id', '4ce071e8-e7a1-46df-bc97-3d9840d9f2fd')
    .single()
  
  if (error) {
    console.log('❌ Error:', error)
    return
  }
  
  console.log('✅ **PAUL R\'S ACTUAL DATABASE FIELDS:**')
  
  const relevantFields = [
    'portfolio_image_1',
    'portfolio_image_2', 
    'portfolio_image_3',
    'portfolio_projects',
    'portfolioImages',
    'avatar_url'
  ]
  
  console.log('\n📋 **PORTFOLIO-RELATED FIELDS:**')
  relevantFields.forEach(field => {
    const value = paul[field]
    console.log(`${field}: ${value || 'NULL/undefined'}`)
  })
  
  console.log('\n📋 **ALL FIELD NAMES:**')
  Object.keys(paul).forEach(key => {
    if (key.includes('portfolio') || key.includes('image') || key.includes('avatar')) {
      console.log(`🎯 ${key}: ${paul[key]}`)
    }
  })
  
  console.log('\n🔧 **PORTFOLIO IMAGE GENERATION NEEDED:**')
  console.log('Since no portfolio fields exist, we need to generate Picsum URLs')
  console.log('Based on Paul\'s info:')
  console.log(`- ID: ${paul.id}`)
  console.log(`- Title: ${paul.title}`)
  console.log(`- Category: ${paul.title.includes('Graphic') ? 'abstract' : 'design'}`)
  
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
  
  console.log('\n🎨 **GENERATED PORTFOLIO URLS:**')
  portfolioUrls.forEach((url, index) => {
    console.log(`Image ${index + 1}: ${url}`)
  })
  
  return portfolioUrls
}

checkDesignerFields().catch(console.error)