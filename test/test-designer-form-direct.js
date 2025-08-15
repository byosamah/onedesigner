// Test the designer form by directly using the service
const { designerService } = require('../src/lib/database/designer-service.ts')

async function testDesignerForm() {
  const testEmail = `testdesigner-${Date.now()}@example.com`
  
  console.log('Testing designer form with email:', testEmail)
  
  const formData = {
    firstName: 'John',
    lastName: 'Doe',
    email: testEmail,
    phone: '+1234567890',
    profilePicture: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    title: 'Senior UX Designer',
    portfolioUrl: 'johndoe.com', // Test without https://
    dribbbleUrl: 'dribbble.com/johndoe',
    behanceUrl: null,
    linkedinUrl: 'linkedin.com/in/johndoe',
    country: 'United States',
    city: 'New York',
    availability: 'immediate',
    bio: 'I am a passionate UX designer with over 5 years of experience creating beautiful and functional digital experiences. My expertise spans across mobile and web applications, with a focus on user-centered design principles. I have worked with startups and Fortune 500 companies alike, helping them transform their digital presence. My design philosophy centers around simplicity, accessibility, and creating delightful user experiences that drive business results. I specialize in design systems, prototyping, and user research.',
    portfolioImages: []
  }
  
  // Test the service directly
  const result = await designerService.upsertDesignerFromForm(testEmail, formData)
  
  console.log('Service result:', result)
  
  if (result.success) {
    console.log('✅ Designer created/updated successfully:', {
      id: result.data.id,
      name: `${result.data.firstName} ${result.data.lastName}`,
      portfolioUrl: result.data.portfolioUrl,
      isUpdate: result.isUpdate
    })
    
    // Verify URLs were auto-prefixed
    const designer = await designerService.getDesignerByEmail(testEmail)
    console.log('URLs after save:', {
      portfolio: designer.portfolioUrl,
      dribbble: designer.dribbbleUrl,
      linkedin: designer.linkedinUrl
    })
    
    // Clean up test data
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      'https://frwchtwxpnrlpzksupgm.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8'
    )
    
    await supabase.from('designers').delete().eq('id', result.data.id)
    console.log('Test data cleaned up')
  } else {
    console.error('❌ Failed to save designer:', result.error)
  }
}

testDesignerForm().catch(console.error)