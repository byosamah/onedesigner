const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8'
)

async function testForm() {
  // Test the complete flow
  const testEmail = `testdesigner-${Date.now()}@example.com`
  
  console.log('Testing designer form with email:', testEmail)
  
  // 1. Simulate form submission
  const formData = {
    firstName: 'John',
    lastName: 'Doe',
    email: testEmail,
    phone: '+1234567890',
    profilePicture: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    title: 'Senior UX Designer',
    portfolioUrl: 'https://johndoe.com',
    dribbbleUrl: 'https://dribbble.com/johndoe',
    behanceUrl: null,
    linkedinUrl: 'https://linkedin.com/in/johndoe',
    country: 'United States',
    city: 'New York',
    availability: 'immediate',
    bio: 'I am a passionate UX designer with over 5 years of experience creating beautiful and functional digital experiences. My expertise spans across mobile and web applications, with a focus on user-centered design principles. I have worked with startups and Fortune 500 companies alike, helping them transform their digital presence. My design philosophy centers around simplicity, accessibility, and creating delightful user experiences that drive business results. I specialize in design systems, prototyping, and user research.',
    portfolioImages: []
  }
  
  // 2. Submit to API endpoint
  const response = await fetch('http://localhost:3001/api/designer/apply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Simulate authenticated session
      'Cookie': 'next-auth.session-token=test-token'
    },
    body: JSON.stringify(formData)
  })
  
  const result = await response.json()
  console.log('API Response:', response.status, result)
  
  // 3. Check if designer was created in database
  const { data: designer, error } = await supabase
    .from('designers')
    .select('*')
    .eq('email', testEmail)
    .single()
    
  if (error) {
    console.error('Failed to find designer in database:', error)
  } else {
    console.log('Designer created successfully:', {
      id: designer.id,
      name: `${designer.first_name} ${designer.last_name}`,
      email: designer.email,
      is_approved: designer.is_approved,
      portfolio_url: designer.portfolio_url
    })
    
    // Clean up test data
    const { error: deleteError } = await supabase
      .from('designers')
      .delete()
      .eq('id', designer.id)
      
    if (!deleteError) {
      console.log('Test data cleaned up')
    }
  }
}

testForm().catch(console.error)