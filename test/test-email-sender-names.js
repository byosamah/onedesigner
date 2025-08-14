/**
 * Test script to verify email sender names are configured correctly
 * 
 * Expected behavior:
 * - OTP emails: "OneDesigner <noreply@onedesigner.app>"
 * - All other emails: "Zain from OneDesigner <noreply@onedesigner.app>"
 */

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Mock Resend API to capture the sender names without actually sending emails
const mockResendCalls = []

// Override fetch to capture Resend API calls
const originalFetch = global.fetch
global.fetch = async function(url, options) {
  if (url && url.includes('resend.com')) {
    const body = JSON.parse(options.body)
    mockResendCalls.push({
      from: body.from,
      subject: body.subject,
      to: body.to
    })
    // Return mock successful response
    return {
      ok: true,
      json: async () => ({ id: 'mock-email-id', object: 'email' })
    }
  }
  return originalFetch(url, options)
}

async function testEmailSenderNames() {
  console.log('🧪 Testing Email Sender Names Configuration')
  console.log('=' .repeat(60))
  
  const testEmail = 'test@example.com'
  const results = []
  
  try {
    // Test 1: OTP Email
    console.log('\n📧 Test 1: OTP Email')
    const otpResponse = await fetch('http://localhost:3001/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        type: 'client',
        purpose: 'login'
      })
    })
    
    const lastOTPCall = mockResendCalls[mockResendCalls.length - 1]
    const otpSenderMatch = lastOTPCall?.from === 'OneDesigner <noreply@onedesigner.app>'
    
    results.push({
      test: 'OTP Email',
      expected: 'OneDesigner <noreply@onedesigner.app>',
      actual: lastOTPCall?.from || 'No email sent',
      passed: otpSenderMatch
    })
    
    // Test 2: Designer Approval Email
    console.log('\n📧 Test 2: Designer Approval Email')
    const approvalResponse = await fetch('http://localhost:3001/api/test-email-service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template: 'designer-approved',
        to: testEmail,
        variables: {
          name: 'Test Designer',
          dashboardUrl: 'https://onedesigner.app/designer/dashboard'
        }
      })
    })
    
    const lastApprovalCall = mockResendCalls[mockResendCalls.length - 1]
    const approvalSenderMatch = lastApprovalCall?.from === 'Zain from OneDesigner <noreply@onedesigner.app>'
    
    results.push({
      test: 'Designer Approval',
      expected: 'Zain from OneDesigner <noreply@onedesigner.app>',
      actual: lastApprovalCall?.from || 'No email sent',
      passed: approvalSenderMatch
    })
    
    // Test 3: Designer Rejection Email
    console.log('\n📧 Test 3: Designer Rejection Email')
    const rejectionResponse = await fetch('http://localhost:3001/api/test-email-service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template: 'designer-rejected',
        to: testEmail,
        variables: {
          name: 'Test Designer',
          reason: 'Portfolio needs improvement'
        }
      })
    })
    
    const lastRejectionCall = mockResendCalls[mockResendCalls.length - 1]
    const rejectionSenderMatch = lastRejectionCall?.from === 'Zain from OneDesigner <noreply@onedesigner.app>'
    
    results.push({
      test: 'Designer Rejection',
      expected: 'Zain from OneDesigner <noreply@onedesigner.app>',
      actual: lastRejectionCall?.from || 'No email sent',
      passed: rejectionSenderMatch
    })
    
    // Test 4: Welcome Email
    console.log('\n📧 Test 4: Welcome Email')
    const welcomeResponse = await fetch('http://localhost:3001/api/test-email-service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template: 'welcome',
        to: testEmail,
        variables: {
          name: 'Test User',
          dashboardUrl: 'https://onedesigner.app/dashboard'
        }
      })
    })
    
    const lastWelcomeCall = mockResendCalls[mockResendCalls.length - 1]
    const welcomeSenderMatch = lastWelcomeCall?.from === 'Zain from OneDesigner <noreply@onedesigner.app>'
    
    results.push({
      test: 'Welcome Email',
      expected: 'Zain from OneDesigner <noreply@onedesigner.app>',
      actual: lastWelcomeCall?.from || 'No email sent',
      passed: welcomeSenderMatch
    })
    
    // Test 5: Project Request Email
    console.log('\n📧 Test 5: Project Request Email')
    const projectRequestResponse = await fetch('http://localhost:3001/api/test-email-service', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template: 'designer-request',
        to: testEmail,
        variables: {
          designerName: 'Test Designer',
          projectType: 'Logo Design',
          budget: '$1000-$5000',
          timeline: '2 weeks',
          requestUrl: 'https://onedesigner.app/designer/requests'
        }
      })
    })
    
    const lastProjectCall = mockResendCalls[mockResendCalls.length - 1]
    const projectSenderMatch = lastProjectCall?.from === 'Zain from OneDesigner <noreply@onedesigner.app>'
    
    results.push({
      test: 'Project Request',
      expected: 'Zain from OneDesigner <noreply@onedesigner.app>',
      actual: lastProjectCall?.from || 'No email sent',
      passed: projectSenderMatch
    })
    
  } catch (error) {
    console.error('❌ Test error:', error)
  }
  
  // Print results summary
  console.log('\n' + '=' .repeat(60))
  console.log('📊 TEST RESULTS SUMMARY')
  console.log('=' .repeat(60))
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌'
    console.log(`\n${icon} ${result.test}`)
    console.log(`   Expected: ${result.expected}`)
    console.log(`   Actual:   ${result.actual}`)
  })
  
  const passedCount = results.filter(r => r.passed).length
  const totalCount = results.length
  const allPassed = passedCount === totalCount
  
  console.log('\n' + '=' .repeat(60))
  console.log(`Overall: ${passedCount}/${totalCount} tests passed`)
  
  if (allPassed) {
    console.log('✅ All email sender names are configured correctly!')
  } else {
    console.log('❌ Some email sender names are incorrect. Please review the configuration.')
  }
  
  // Restore original fetch
  global.fetch = originalFetch
  
  process.exit(allPassed ? 0 : 1)
}

// Run the test
testEmailSenderNames()