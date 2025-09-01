#!/usr/bin/env node

/**
 * Script to find and optionally replace hardcoded URLs in test files
 * This helps identify remaining hardcoded values after centralization
 */

const fs = require('fs')
const path = require('path')
const { glob } = require('glob')

// Common hardcoded URLs to find and their replacements
const URL_PATTERNS = {
  // Production URLs
  'https://onedesigner.app': 'PRODUCTION_URLS.APP.BASE',
  'https://www.onedesigner.app': 'PRODUCTION_URLS.APP.WWW',
  'http://localhost:3000': 'DEV_URLS.LOCAL.BASE',
  'http://localhost:3001': 'DEV_URLS.LOCAL.ALT_PORT',
  
  // API URLs
  'https://api.resend.com/emails': 'API_ENDPOINTS.RESEND',
  'https://api.lemonsqueezy.com/v1': 'API_ENDPOINTS.LEMONSQUEEZY',
  'https://api.deepseek.com/v1': 'API_ENDPOINTS.DEEPSEEK',
  
  // Vercel deployment patterns
  'https://onedesigner2-': 'DEV_URLS.VERCEL_DEPLOYMENTS.PREVIEW',
  
  // External services
  'https://supabase.com/dashboard/project/': 'EXTERNAL_URLS.SUPABASE.DASHBOARD',
  'https://ui-avatars.com/api/': 'EXTERNAL_URLS.PLACEHOLDER.UI_AVATARS',
  'https://images.unsplash.com/': 'EXTERNAL_URLS.PLACEHOLDER.UNSPLASH_*',
  
  // Email senders
  'Hala from OneDesigner <team@onedesigner.app>': 'EMAIL_URLS.SENDER.DEFAULT',
  'OneDesigner <noreply@onedesigner.app>': 'EMAIL_URLS.SENDER.NOREPLY',
  'OneDesigner Support <support@onedesigner.app>': 'EMAIL_URLS.SENDER.SUPPORT'
}

// File patterns to exclude from analysis
const EXCLUDE_PATTERNS = [
  'node_modules/**',
  '.git/**',
  'dist/**',
  'build/**',
  '.next/**',
  '**/*.log',
  '**/package-lock.json',
  '**/yarn.lock'
]

async function findHardcodedUrls() {
  console.log('🔍 Scanning for hardcoded URLs...\n')
  
  // Find all relevant files
  const files = await glob('**/*.{js,ts,tsx,jsx,md,json}', {
    ignore: EXCLUDE_PATTERNS,
    cwd: process.cwd()
  })
  
  const results = {}
  let totalOccurrences = 0
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    const fileResults = []
    
    // Check each URL pattern
    Object.keys(URL_PATTERNS).forEach(pattern => {
      const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\\]\\]/g, '\\\\$&'), 'gi')
      const matches = [...content.matchAll(regex)]
      
      matches.forEach(match => {
        const lineNumber = content.substring(0, match.index).split('\\n').length
        fileResults.push({
          pattern,
          replacement: URL_PATTERNS[pattern],
          line: lineNumber,
          context: getLineContext(content, match.index)
        })
        totalOccurrences++
      })
    })
    
    if (fileResults.length > 0) {
      results[file] = fileResults
    }
  }
  
  return { results, totalOccurrences }
}

function getLineContext(content, index) {
  const lines = content.split('\\n')
  const lineNumber = content.substring(0, index).split('\\n').length
  const line = lines[lineNumber - 1]
  return line ? line.trim() : ''
}

function categorizeFiles(results) {
  const categories = {
    critical: [], // Core application files
    test: [],    // Test files
    config: [],  // Configuration files
    docs: []     // Documentation files
  }
  
  Object.keys(results).forEach(file => {
    if (file.includes('/test/') || file.endsWith('.test.') || file.endsWith('.spec.')) {
      categories.test.push(file)
    } else if (file.includes('config') || file.endsWith('.config.') || file.includes('.env')) {
      categories.config.push(file)
    } else if (file.endsWith('.md') || file.includes('README')) {
      categories.docs.push(file)
    } else {
      categories.critical.push(file)
    }
  })
  
  return categories
}

function generateReport(results, totalOccurrences) {
  const categories = categorizeFiles(results)
  
  console.log('📊 HARDCODED URL ANALYSIS REPORT')
  console.log('=' * 50)
  console.log(`Total hardcoded URLs found: ${totalOccurrences}`)
  console.log(`Files affected: ${Object.keys(results).length}`)
  console.log()
  
  // Priority analysis
  console.log('🚨 PRIORITY BREAKDOWN:')
  console.log()
  
  if (categories.critical.length > 0) {
    console.log(`❌ CRITICAL (${categories.critical.length} files) - Core application code:`)
    categories.critical.forEach(file => {
      console.log(`   ${file} (${results[file].length} occurrences)`)
      results[file].slice(0, 2).forEach(issue => {
        console.log(`     Line ${issue.line}: ${issue.pattern} → ${issue.replacement}`)
      })
      if (results[file].length > 2) {
        console.log(`     ... and ${results[file].length - 2} more`)
      }
      console.log()
    })
  }
  
  if (categories.config.length > 0) {
    console.log(`⚠️  CONFIG (${categories.config.length} files) - Configuration files:`)
    categories.config.forEach(file => {
      console.log(`   ${file} (${results[file].length} occurrences)`)
    })
    console.log()
  }
  
  if (categories.test.length > 0) {
    console.log(`🧪 TEST (${categories.test.length} files) - Test files:`)
    categories.test.forEach(file => {
      console.log(`   ${file} (${results[file].length} occurrences)`)
    })
    console.log()
  }
  
  if (categories.docs.length > 0) {
    console.log(`📖 DOCS (${categories.docs.length} files) - Documentation:`)
    categories.docs.forEach(file => {
      console.log(`   ${file} (${results[file].length} occurrences)`)
    })
    console.log()
  }
  
  // Recommendations
  console.log('💡 RECOMMENDATIONS:')
  console.log()
  
  if (categories.critical.length > 0) {
    console.log('1. 🚨 IMMEDIATE: Fix critical files - these affect production')
    console.log('   Import { PRODUCTION_URLS, API_ENDPOINTS } from "@/lib/constants"')
    console.log()
  }
  
  if (categories.test.length > 0) {
    console.log('2. 🧪 MEDIUM: Update test files to use centralized URLs')
    console.log('   Consider creating test-specific URL helpers')
    console.log()
  }
  
  if (categories.config.length > 0) {
    console.log('3. ⚙️  LOW: Update configuration files')
    console.log('   These may be intentionally hardcoded for environment setup')
    console.log()
  }
  
  console.log('🛠️  NEXT STEPS:')
  console.log('1. Run: npm run lint:urls (if implemented)')
  console.log('2. Update critical files first')
  console.log('3. Create URL validation tests')
  console.log('4. Add pre-commit hooks to prevent new hardcoded URLs')
}

async function main() {
  console.log('🚀 OneDesigner Hardcoded URL Cleanup Tool')
  console.log('==========================================\\n')
  
  try {
    const { results, totalOccurrences } = await findHardcodedUrls()
    
    if (totalOccurrences === 0) {
      console.log('✅ No hardcoded URLs found! Your codebase is clean.')
      return
    }
    
    generateReport(results, totalOccurrences)
    
    // Save detailed results to file
    const reportFile = 'hardcoded-urls-report.json'
    fs.writeFileSync(reportFile, JSON.stringify(results, null, 2))
    console.log(`\\n📄 Detailed report saved to: ${reportFile}`)
    
  } catch (error) {
    console.error('❌ Error during analysis:', error.message)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = { findHardcodedUrls, URL_PATTERNS }