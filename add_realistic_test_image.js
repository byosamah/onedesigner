// Add a more realistic test profile picture
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addRealisticImage() {
  console.log('🎨 Adding realistic profile picture...')
  
  // Using a small avatar from a public API
  const avatarUrl = 'https://i.pravatar.cc/150?img=68'
  
  try {
    const { data, error } = await supabase
      .from('designers')
      .update({ 
        avatar_url: avatarUrl  // Using a real image URL instead of base64
      })
      .eq('email', 'designbattlefield@gmail.com')
      .select()
      .single()
    
    if (error) {
      console.log('❌ Update failed:', error.message)
      return
    }
    
    console.log('✅ Successfully added realistic profile picture!')
    console.log('Image URL:', avatarUrl)
    console.log('Updated designer:', data.first_name, data.last_name)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

addRealisticImage()