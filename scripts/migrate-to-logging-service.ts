#!/usr/bin/env tsx
/**
 * Migration script to replace console.log statements with LoggingService
 * Phase 6: Centralized Logging Service Migration
 * 
 * This script will:
 * 1. Find all console.log, console.error, console.warn statements
 * 2. Replace them with appropriate logger calls
 * 3. Add import statements for the logger
 * 4. Preserve the original functionality
 */

import * as fs from 'fs'
import * as path from 'path'
import { glob } from 'glob'

interface MigrationStats {
  filesProcessed: number
  consoleLogsReplaced: number
  consoleErrorsReplaced: number
  consoleWarnsReplaced: number
  filesSkipped: number
  errors: string[]
}

const stats: MigrationStats = {
  filesProcessed: 0,
  consoleLogsReplaced: 0,
  consoleErrorsReplaced: 0,
  consoleWarnsReplaced: 0,
  filesSkipped: 0,
  errors: []
}

// Files to skip
const SKIP_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/public/**',
  '**/*.test.ts',
  '**/*.spec.ts',
  '**/logging-service.ts', // Don't modify the logging service itself
  '**/migrate-to-logging-service.ts' // Don't modify this script
]

// Patterns to match console statements
const CONSOLE_LOG_PATTERN = /console\.(log|info)\s*\(/g
const CONSOLE_ERROR_PATTERN = /console\.error\s*\(/g
const CONSOLE_WARN_PATTERN = /console\.warn\s*\(/g
const CONSOLE_DEBUG_PATTERN = /console\.debug\s*\(/g

/**
 * Check if file should be processed
 */
function shouldProcessFile(filePath: string): boolean {
  // Skip non-TypeScript/JavaScript files
  if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) {
    return false
  }

  // Skip test files
  if (filePath.includes('.test.') || filePath.includes('.spec.')) {
    return false
  }

  // Skip specific directories
  if (filePath.includes('/test/') || filePath.includes('/__tests__/')) {
    return false
  }

  // Skip migration scripts
  if (filePath.includes('/scripts/')) {
    return false
  }

  return true
}

/**
 * Add logger import to file if not present
 */
function addLoggerImport(content: string): string {
  // Check if logger is already imported
  if (content.includes("from '@/lib/core/logging-service'") || 
      content.includes('from "@/lib/core/logging-service"')) {
    return content
  }

  // Find the best place to add import
  const importRegex = /^import\s+.*$/gm
  const imports = content.match(importRegex)
  
  if (imports && imports.length > 0) {
    // Add after the last import
    const lastImport = imports[imports.length - 1]
    const lastImportIndex = content.lastIndexOf(lastImport)
    const insertPosition = lastImportIndex + lastImport.length
    
    const loggerImport = "\nimport { logger } from '@/lib/core/logging-service'"
    return content.slice(0, insertPosition) + loggerImport + content.slice(insertPosition)
  } else {
    // Add at the beginning of the file
    return "import { logger } from '@/lib/core/logging-service'\n\n" + content
  }
}

/**
 * Determine appropriate log level based on context
 */
function determineLogLevel(statement: string, previousLine?: string): string {
  const lowerStatement = statement.toLowerCase()
  
  // Error indicators
  if (lowerStatement.includes('error') || 
      lowerStatement.includes('fail') || 
      lowerStatement.includes('exception') ||
      lowerStatement.includes('critical')) {
    return 'error'
  }
  
  // Warning indicators
  if (lowerStatement.includes('warn') || 
      lowerStatement.includes('caution') || 
      lowerStatement.includes('deprecated')) {
    return 'warn'
  }
  
  // Debug indicators
  if (lowerStatement.includes('debug') || 
      lowerStatement.includes('trace') || 
      lowerStatement.includes('verbose')) {
    return 'debug'
  }
  
  // Info indicators (success, completed, etc.)
  if (lowerStatement.includes('success') || 
      lowerStatement.includes('complete') || 
      lowerStatement.includes('start') ||
      lowerStatement.includes('finish') ||
      lowerStatement.includes('✅') ||
      lowerStatement.includes('✨')) {
    return 'info'
  }
  
  // Default to info for general logging
  return 'info'
}

/**
 * Convert console.log arguments to logger format
 */
function convertArguments(args: string): { message: string; context?: string } {
  // Handle simple string
  if (args.startsWith("'") || args.startsWith('"') || args.startsWith('`')) {
    return { message: args }
  }
  
  // Handle multiple arguments
  const parts = args.split(',').map(p => p.trim())
  
  if (parts.length === 1) {
    return { message: parts[0] }
  }
  
  // First argument is message, rest is context
  const message = parts[0]
  const contextParts = parts.slice(1)
  
  // Build context object
  if (contextParts.length === 1) {
    return { 
      message, 
      context: contextParts[0]
    }
  } else {
    return {
      message,
      context: `{ data: [${contextParts.join(', ')}] }`
    }
  }
}

/**
 * Replace console statements in content
 */
function replaceConsoleStatements(content: string, filePath: string): string {
  let modifiedContent = content
  let needsImport = false

  // Replace console.log and console.info
  modifiedContent = modifiedContent.replace(CONSOLE_LOG_PATTERN, (match, method) => {
    const level = determineLogLevel(match)
    stats.consoleLogsReplaced++
    needsImport = true
    return `logger.${level}(`
  })

  // Replace console.error
  modifiedContent = modifiedContent.replace(CONSOLE_ERROR_PATTERN, (match) => {
    stats.consoleErrorsReplaced++
    needsImport = true
    return 'logger.error('
  })

  // Replace console.warn
  modifiedContent = modifiedContent.replace(CONSOLE_WARN_PATTERN, (match) => {
    stats.consoleWarnsReplaced++
    needsImport = true
    return 'logger.warn('
  })

  // Replace console.debug
  modifiedContent = modifiedContent.replace(CONSOLE_DEBUG_PATTERN, (match) => {
    stats.consoleLogsReplaced++
    needsImport = true
    return 'logger.debug('
  })

  // Add import if needed
  if (needsImport) {
    modifiedContent = addLoggerImport(modifiedContent)
  }

  return modifiedContent
}

/**
 * Process a single file
 */
async function processFile(filePath: string): Promise<void> {
  try {
    if (!shouldProcessFile(filePath)) {
      stats.filesSkipped++
      return
    }

    const content = fs.readFileSync(filePath, 'utf8')
    
    // Check if file has console statements
    if (!content.match(/console\.(log|error|warn|debug|info)/)) {
      stats.filesSkipped++
      return
    }

    // Replace console statements
    const modifiedContent = replaceConsoleStatements(content, filePath)
    
    // Only write if content changed
    if (modifiedContent !== content) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8')
      stats.filesProcessed++
      console.log(`✅ Processed: ${filePath}`)
    } else {
      stats.filesSkipped++
    }
  } catch (error) {
    stats.errors.push(`Error processing ${filePath}: ${error}`)
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting LoggingService Migration (Phase 6)')
  console.log('===============================================')
  
  // Find all TypeScript/JavaScript files
  const files = await glob('src/**/*.{ts,tsx,js,jsx}', {
    ignore: SKIP_PATTERNS,
    absolute: false
  })

  console.log(`Found ${files.length} files to analyze`)
  console.log()

  // Process files
  for (const file of files) {
    await processFile(file)
  }

  // Print statistics
  console.log()
  console.log('📊 Migration Statistics')
  console.log('========================')
  console.log(`Files processed: ${stats.filesProcessed}`)
  console.log(`Files skipped: ${stats.filesSkipped}`)
  console.log(`console.log replaced: ${stats.consoleLogsReplaced}`)
  console.log(`console.error replaced: ${stats.consoleErrorsReplaced}`)
  console.log(`console.warn replaced: ${stats.consoleWarnsReplaced}`)
  console.log(`Total replacements: ${stats.consoleLogsReplaced + stats.consoleErrorsReplaced + stats.consoleWarnsReplaced}`)
  
  if (stats.errors.length > 0) {
    console.log()
    console.log('❌ Errors encountered:')
    stats.errors.forEach(error => console.log(`  - ${error}`))
  }

  console.log()
  console.log('✨ Migration complete!')
  console.log()
  console.log('Next steps:')
  console.log('1. Review the changes with: git diff')
  console.log('2. Test the application: npm run dev')
  console.log('3. Enable centralized logging: export USE_CENTRALIZED_LOGGING=true')
  console.log('4. Commit the changes: git commit -am "Migrate to centralized LoggingService"')
}

// Run migration if called directly
if (require.main === module) {
  migrate().catch(error => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
}

export { migrate, processFile, stats }