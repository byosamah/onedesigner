#!/usr/bin/env node

/**
 * Production Environment Variables Checker
 * Run this script to verify all required environment variables are set
 */

const requiredEnvVars = {
  // Domain & App
  'NEXT_PUBLIC_APP_URL': 'https://onedesigner.app',
  'NEXTAUTH_URL': 'https://onedesigner.app',
  
  // Security
  'NEXTAUTH_SECRET': 'Should be 64 characters long',
  'CRON_SECRET': 'Should be 64 characters long',
  
  // Supabase
  'NEXT_PUBLIC_SUPABASE_URL': 'Should start with https://...supabase.co',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Should be a long string starting with eyJ',
  'SUPABASE_SERVICE_ROLE_KEY': 'Should be a long string starting with eyJ',
  
  // AI
  'DEEPSEEK_API_KEY': 'Should start with sk-',
  
  // Email
  'EMAIL_FROM': 'magic@onedesigner.app',
  'RESEND_API_KEY': 'Should start with re_',
  
  // Payment
  'LEMONSQUEEZY_API_KEY': 'LemonSqueezy API key',
  'LEMONSQUEEZY_WEBHOOK_SECRET': 'LemonSqueezy webhook secret',
  'LEMONSQUEEZY_STORE_ID': 'Numeric store ID',
  
  // Environment
  'NODE_ENV': 'production'
}

console.log('🔍 Checking Production Environment Variables...\n')

let missingVars = []
let invalidVars = []

for (const [key, description] of Object.entries(requiredEnvVars)) {
  const value = process.env[key]
  
  if (!value) {
    missingVars.push(`❌ ${key}: ${description}`)
    continue
  }
  
  // Validate specific formats
  let isValid = true
  let issue = ''
  
  switch (key) {
    case 'NEXTAUTH_SECRET':
    case 'CRON_SECRET':
      if (value.length !== 64) {
        isValid = false
        issue = `Length: ${value.length}, expected: 64`
      }
      break
      
    case 'NEXT_PUBLIC_SUPABASE_URL':
      if (!value.includes('supabase.co')) {
        isValid = false
        issue = 'Should contain supabase.co'
      }
      break
      
    case 'NEXT_PUBLIC_SUPABASE_ANON_KEY':
    case 'SUPABASE_SERVICE_ROLE_KEY':
      if (!value.startsWith('eyJ')) {
        isValid = false
        issue = 'Should start with eyJ'
      }
      break
      
    case 'DEEPSEEK_API_KEY':
      if (!value.startsWith('sk-')) {
        isValid = false
        issue = 'Should start with sk-'
      }
      break
      
    case 'RESEND_API_KEY':
      if (!value.startsWith('re_')) {
        isValid = false
        issue = 'Should start with re_'
      }
      break
      
    case 'NODE_ENV':
      if (value !== 'production') {
        isValid = false
        issue = `Found: ${value}, expected: production`
      }
      break
  }
  
  if (isValid) {
    console.log(`✅ ${key}: Set correctly`)
  } else {
    invalidVars.push(`⚠️  ${key}: ${issue}`)
  }
}

console.log('\n📊 Summary:')
console.log(`✅ Valid variables: ${Object.keys(requiredEnvVars).length - missingVars.length - invalidVars.length}`)
console.log(`❌ Missing variables: ${missingVars.length}`)
console.log(`⚠️  Invalid variables: ${invalidVars.length}`)

if (missingVars.length > 0) {
  console.log('\n🚨 Missing Variables:')
  missingVars.forEach(v => console.log(v))
}

if (invalidVars.length > 0) {
  console.log('\n⚠️  Invalid Variables:')
  invalidVars.forEach(v => console.log(v))
}

if (missingVars.length === 0 && invalidVars.length === 0) {
  console.log('\n🎉 All environment variables are set correctly!')
  console.log('✅ Ready for production deployment!')
} else {
  console.log('\n🔧 Please fix the issues above before deploying to production.')
  console.log('📖 See VERCEL_ENV_SETUP.md for detailed instructions.')
}

console.log('\n💡 To test this locally, create a .env.local file with these variables.')