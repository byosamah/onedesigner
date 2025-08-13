// Test script to verify image upload functionality
// This simulates what happens when a designer uploads a profile picture

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testImageUpload() {
  console.log('🧪 Testing image upload functionality...')
  
  try {
    // Create a sample base64 image (small test image)
    const sampleBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAFw0i6L1wAAAABJRU5ErkJggg=='
    
    // Check if the designbattlefield@gmail.com designer exists
    const { data: existingDesigner, error: findError } = await supabase
      .from('designers')
      .select('id, email, avatar_url, first_name, last_name')
      .eq('email', 'designbattlefield@gmail.com')
      .single()
    
    if (findError) {
      console.log('❌ Designer not found:', findError.message)
      return
    }
    
    console.log('✅ Found designer:', existingDesigner)
    console.log('Current avatar_url:', existingDesigner.avatar_url ? 'Has image' : 'No image')
    
    // Update this designer with a test profile picture
    console.log('📸 Adding test profile picture...')
    const { data: updatedDesigner, error: updateError } = await supabase
      .from('designers')
      .update({ 
        avatar_url: sampleBase64Image 
      })
      .eq('id', existingDesigner.id)
      .select()
      .single()
    
    if (updateError) {
      console.log('❌ Failed to update:', updateError.message)
      return
    }
    
    console.log('✅ Successfully updated designer with test image!')
    console.log('Updated record:', {
      id: updatedDesigner.id,
      email: updatedDesigner.email,
      hasImage: !!updatedDesigner.avatar_url
    })
    
    // Now test fetching through admin API
    console.log('🔍 Testing admin API...')
    const adminResponse = await fetch('http://localhost:3001/api/admin/designers')
    
    if (adminResponse.ok) {
      const adminData = await adminResponse.json()
      const testDesigner = adminData.designers.find(d => d.email === 'designbattlefield@gmail.com')
      
      if (testDesigner) {
        console.log('✅ Admin API test:')
        console.log('- Email:', testDesigner.email)
        console.log('- Has avatar:', !!testDesigner.avatar)
        console.log('- Avatar preview:', testDesigner.avatar ? testDesigner.avatar.substring(0, 50) + '...' : 'None')
      } else {
        console.log('❌ Designer not found in admin API response')
      }
    } else {
      console.log('❌ Admin API request failed')
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

testImageUpload()