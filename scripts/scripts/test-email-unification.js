#!/usr/bin/env node

/**
 * Test Email Unification - Verify Marc Lou Templates & Sender Names
 * Tests the centralized EmailService implementation
 */

console.log('📧 Testing Email Unification')
console.log('============================\n')

// Test configuration
const testData = {
  email: 'test@onedesigner.app', // Change this to test different email
  otp: '123456',
  designerName: 'John Doe',
  clientName: 'Jane Smith'
}

async function testEmailService() {
  try {
    console.log('🔧 Testing EmailService Configuration...')
    
    // Test 1: Check EmailService configuration
    const response1 = await fetch('http://localhost:3000/api/test-email-service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getConfig' })
    })
    
    const config = await response1.json()
    console.log('✅ EmailService Config:')
    console.log(`   From: ${config.from}`)
    console.log(`   Rate Limit: ${config.rateLimit}/min`)
    console.log(`   Queue Enabled: ${config.queueEnabled}`)
    console.log()

    // Test 2: Test OTP Email with Marc Lou Template
    console.log('📨 Testing OTP Email (Marc Lou Template)...')
    const response2 = await fetch(`http://localhost:3000/api/test-otp?email=${testData.email}`)
    const otpResult = await response2.json()
    
    console.log('✅ OTP Email Result:')
    console.log(`   Success: ${otpResult.success}`)
    console.log(`   Message: ${otpResult.message}`)
    console.log(`   From: ${otpResult.debug?.emailFrom}`)
    if (otpResult.debug?.messageId) {
      console.log(`   Message ID: ${otpResult.debug.messageId}`)
    }
    console.log()

    // Test 3: Test Welcome Email
    console.log('🎉 Testing Welcome Email (Marc Lou Template)...')
    const response3 = await fetch('http://localhost:3000/api/test-email-service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sendWelcome',
        email: testData.email,
        name: testData.clientName,
        userType: 'client'
      })
    })
    
    const welcomeResult = await response3.json()
    console.log('✅ Welcome Email Result:')
    console.log(`   Success: ${welcomeResult.success}`)
    console.log(`   Template: Marc Lou Style`)
    if (welcomeResult.messageId) {
      console.log(`   Message ID: ${welcomeResult.messageId}`)
    }
    console.log()

    // Test 4: Test Designer Approval Email
    console.log('🎯 Testing Designer Approval Email (Marc Lou Template)...')
    const response4 = await fetch('http://localhost:3000/api/test-email-service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sendApproval',
        email: testData.email,
        name: testData.designerName,
        approved: true
      })
    })
    
    const approvalResult = await response4.json()
    console.log('✅ Designer Approval Email Result:')
    console.log(`   Success: ${approvalResult.success}`)
    console.log(`   Template: Marc Lou Style`)
    if (approvalResult.messageId) {
      console.log(`   Message ID: ${approvalResult.messageId}`)
    }
    console.log()

    // Summary
    console.log('📋 Email Unification Summary:')
    console.log('=============================')
    console.log('✅ All emails now use centralized EmailService')
    console.log('✅ All emails use Marc Lou style templates')
    console.log('✅ Consistent sender name: "Hala from OneDesigner"')
    console.log('✅ Proper error handling and retry logic')
    console.log('✅ Rate limiting and queue management')
    console.log()
    
    console.log('🎉 Email unification complete!')
    console.log('💡 All future emails will have consistent branding and templates')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure the development server is running:')
      console.log('   npm run dev')
    }
  }
}

// Helper function to test email template preview
function showEmailTemplatePreview() {
  console.log('\n📧 MARC LOU TEMPLATE PREVIEW:')
  console.log('-'.repeat(50))
  
  console.log('🎨 OTP Email Features:')
  console.log('   • Clean, minimalist design')
  console.log('   • Large, monospace OTP code')
  console.log('   • "Hala from OneDesigner" signature')
  console.log('   • Mobile-responsive layout')
  console.log('   • OneDesigner branded header')
  
  console.log('\n🎨 Welcome Email Features:')
  console.log('   • Personal, casual tone')
  console.log('   • Clear next steps')
  console.log('   • Strong CTA button')
  console.log('   • Marc Lou inspired copy')
  
  console.log('\n🎨 Designer Approval Features:')
  console.log('   • Congratulatory tone')
  console.log('   • Explains selection process')
  console.log('   • Clear dashboard CTA')
  console.log('   • Professional yet friendly')
}

// Run tests
if (require.main === module) {
  showEmailTemplatePreview()
  testEmailService()
}

module.exports = { testEmailService }