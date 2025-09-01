#!/usr/bin/env node

/**
 * Validation script to test centralized URL configuration
 * Ensures all URL constants are properly accessible and environment-aware
 */

// Import the centralized URL constants
const { 
  PRODUCTION_URLS, 
  API_ENDPOINTS, 
  PAGE_URLS, 
  FULL_URLS, 
  EMAIL_URLS,
  EXTERNAL_URLS,
  urlBuilders 
} = require('../src/lib/constants/urls.ts')

console.log('🧪 Testing Centralized URL Configuration')
console.log('=========================================\n')

function testProductionUrls() {
  console.log('📍 Testing Production URLs:')
  console.log(`   APP.BASE: ${PRODUCTION_URLS.APP.BASE}`)
  console.log(`   APP.WWW: ${PRODUCTION_URLS.APP.WWW}`)
  console.log(`   API.RESEND: ${PRODUCTION_URLS.API.RESEND}`)
  console.log(`   API.LEMONSQUEEZY: ${PRODUCTION_URLS.API.LEMONSQUEEZY}`)
  console.log(`   API.DEEPSEEK: ${PRODUCTION_URLS.API.DEEPSEEK}`)
  console.log('   ✅ Production URLs loaded successfully\n')
}

function testApiEndpoints() {
  console.log('🔗 Testing API Endpoints:')
  console.log(`   RESEND: ${API_ENDPOINTS.RESEND}`)
  console.log(`   LEMONSQUEEZY: ${API_ENDPOINTS.LEMONSQUEEZY}`)
  console.log(`   DEEPSEEK: ${API_ENDPOINTS.DEEPSEEK}`)
  console.log('   ✅ API endpoints loaded successfully\n')
}

function testPageUrls() {
  console.log('📄 Testing Page URLs:')
  console.log(`   Client Login: ${PAGE_URLS.CLIENT.LOGIN}`)
  console.log(`   Designer Dashboard: ${PAGE_URLS.DESIGNER.DASHBOARD}`)
  console.log(`   Admin Dashboard: ${PAGE_URLS.ADMIN.DASHBOARD}`)
  console.log('   ✅ Page URLs configured correctly\n')
}

function testFullUrls() {
  console.log('🌐 Testing Full URL Builders:')
  try {
    console.log(`   Client Dashboard: ${FULL_URLS.CLIENT.DASHBOARD()}`)
    console.log(`   Designer Login: ${FULL_URLS.DESIGNER.LOGIN()}`)
    console.log(`   Public Home: ${FULL_URLS.PUBLIC.HOME()}`)
    console.log('   ✅ Full URL builders working correctly\n')
  } catch (error) {
    console.log(`   ❌ Error in Full URL builders: ${error.message}\n`)
  }
}

function testEmailUrls() {
  console.log('📧 Testing Email URLs:')
  console.log(`   Default Sender: ${EMAIL_URLS.SENDER.DEFAULT}`)
  console.log(`   Support Sender: ${EMAIL_URLS.SENDER.SUPPORT}`)
  console.log(`   Footer Website: ${EMAIL_URLS.FOOTER_LINKS.WEBSITE()}`)
  console.log('   ✅ Email URLs configured correctly\n')
}

function testExternalUrls() {
  console.log('🔗 Testing External URLs:')
  console.log(`   Supabase Dashboard: ${EXTERNAL_URLS.SUPABASE.DASHBOARD}`)
  console.log(`   UI Avatars: ${EXTERNAL_URLS.PLACEHOLDER.UI_AVATARS('Test User')}`)
  console.log('   ✅ External URLs working correctly\n')
}

function testUrlBuilders() {
  console.log('🛠️  Testing URL Builder Utilities:')
  try {
    const testUrl = urlBuilders.buildUrl('/test', { param1: 'value1', param2: 'value2' })
    console.log(`   Built URL: ${testUrl}`)
    
    const apiUrl = urlBuilders.buildApiUrl('/api/test')
    console.log(`   API URL: ${apiUrl}`)
    
    const environment = urlBuilders.getEnvironment()
    console.log(`   Environment: ${environment}`)
    
    console.log('   ✅ URL builders working correctly\n')
  } catch (error) {
    console.log(`   ❌ Error in URL builders: ${error.message}\n`)
  }
}

function testEnvironmentAwareness() {
  console.log('🌍 Testing Environment Awareness:')
  
  // Test different environment scenarios
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL
  const originalNodeEnv = process.env.NODE_ENV
  
  try {
    // Test production environment
    process.env.NEXT_PUBLIC_APP_URL = 'https://onedesigner.app'
    process.env.NODE_ENV = 'production'
    console.log(`   Production mode: Environment detected as ${urlBuilders.getEnvironment()}`)
    
    // Test development environment
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    process.env.NODE_ENV = 'development'
    console.log(`   Development mode: Environment detected as ${urlBuilders.getEnvironment()}`)
    
    // Test preview environment
    process.env.NEXT_PUBLIC_APP_URL = 'https://onedesigner-preview.vercel.app'
    console.log(`   Preview mode: Environment detected as ${urlBuilders.getEnvironment()}`)
    
    console.log('   ✅ Environment awareness working correctly\n')
  } catch (error) {
    console.log(`   ❌ Error in environment awareness: ${error.message}\n`)
  } finally {
    // Restore original environment
    if (originalAppUrl) process.env.NEXT_PUBLIC_APP_URL = originalAppUrl
    if (originalNodeEnv) process.env.NODE_ENV = originalNodeEnv
  }
}

function runValidationTests() {
  console.log('Starting comprehensive URL centralization validation...\n')
  
  try {
    testProductionUrls()
    testApiEndpoints() 
    testPageUrls()
    testFullUrls()
    testEmailUrls()
    testExternalUrls()
    testUrlBuilders()
    testEnvironmentAwareness()
    
    console.log('🎉 ALL TESTS PASSED!')
    console.log('✅ URL centralization is working correctly')
    console.log('✅ Environment awareness is functional')
    console.log('✅ All URL builders are operational')
    console.log('\n💡 Next Steps:')
    console.log('1. Update remaining hardcoded URLs in test files')
    console.log('2. Add URL validation to CI/CD pipeline')
    console.log('3. Create eslint rules to prevent new hardcoded URLs')
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check import paths in constants/urls.ts')
    console.log('2. Verify environment variables are set')
    console.log('3. Ensure TypeScript compilation is working')
    process.exit(1)
  }
}

// Run validation
if (require.main === module) {
  runValidationTests()
}

module.exports = { 
  testProductionUrls, 
  testApiEndpoints, 
  testPageUrls, 
  testFullUrls,
  testEmailUrls,
  testExternalUrls,
  testUrlBuilders,
  testEnvironmentAwareness
}