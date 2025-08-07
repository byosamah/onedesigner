#!/usr/bin/env node

// Check LemonSqueezy configuration
console.log('🍋 LemonSqueezy Configuration Check')
console.log('=====================================')

// Load environment variables (if using .env file)
try {
  require('dotenv').config()
} catch (e) {
  // dotenv not installed, that's ok
}

const config = {
  'LEMONSQUEEZY_API_KEY': process.env.LEMONSQUEEZY_API_KEY,
  'LEMONSQUEEZY_STORE_ID': process.env.LEMONSQUEEZY_STORE_ID,
  'LEMONSQUEEZY_WEBHOOK_SECRET': process.env.LEMONSQUEEZY_WEBHOOK_SECRET
}

console.log('\n📋 Environment Variables:')
Object.entries(config).forEach(([key, value]) => {
  if (value) {
    console.log(`✅ ${key}: ${value.substring(0, 10)}...`)
  } else {
    console.log(`❌ ${key}: NOT SET`)
  }
})

// Check if all required variables are set
const required = ['LEMONSQUEEZY_API_KEY', 'LEMONSQUEEZY_STORE_ID']
const missing = required.filter(key => !config[key])

if (missing.length > 0) {
  console.log('\n❌ Missing required variables:', missing.join(', '))
  console.log('\n🔧 To fix:')
  console.log('1. Create/update your .env.local file')
  console.log('2. Add the missing variables from your LemonSqueezy dashboard')
  console.log('3. Restart your Next.js server')
} else {
  console.log('\n✅ All required LemonSqueezy variables are set!')
}

console.log('\n🔍 Next steps:')
console.log('1. Run: npm run dev')
console.log('2. Try the payment flow again')
console.log('3. Check terminal for detailed error logs')