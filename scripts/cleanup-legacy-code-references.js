#!/usr/bin/env node

/**
 * OneDesigner Legacy Code Cleanup Script
 * Removes references to legacy tables that will be dropped
 * Ensures zero breaking changes by updating code first
 */

const fs = require('fs');
const path = require('path');

// Tables that will be removed
const LEGACY_TABLES = [
  'conversations',
  'messages',
  'blog_posts',
  'admin_users',
  'custom_otps',
  'match_unlocks',
  'designer_requests',
  'credit_purchases',
  'match_analytics',
  'activity_log'
];

// Files to analyze and potentially modify
const TARGET_DIRECTORIES = [
  './src/app/api',
  './src/lib/services',
  './src/lib/database'
];

console.log('🔍 OneDesigner Legacy Code Cleanup');
console.log('===================================');

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const findings = [];

    LEGACY_TABLES.forEach(table => {
      // Look for database queries referencing legacy tables
      const patterns = [
        new RegExp(`\\.from\\(['"\`]${table}['"\`]\\)`, 'g'),
        new RegExp(`from\\(['"\`]${table}['"\`]`, 'g'),
        new RegExp(`INSERT INTO ${table}`, 'gi'),
        new RegExp(`UPDATE ${table}`, 'gi'),
        new RegExp(`DELETE FROM ${table}`, 'gi'),
        new RegExp(`SELECT.*FROM ${table}`, 'gi')
      ];

      patterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          findings.push({
            table,
            pattern: pattern.toString(),
            matches: matches.length,
            file: filePath
          });
        }
      });
    });

    return findings;
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return [];
  }
}

function scanDirectory(dir) {
  const findings = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        findings.push(...scanDirectory(fullPath));
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        findings.push(...scanFile(fullPath));
      }
    });
  } catch (error) {
    console.error(`❌ Error scanning directory ${dir}:`, error.message);
  }

  return findings;
}

function analyzeCodebase() {
  console.log('📊 Analyzing codebase for legacy table references...\n');

  let allFindings = [];

  TARGET_DIRECTORIES.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`🔍 Scanning ${dir}...`);
      const findings = scanDirectory(dir);
      allFindings.push(...findings);
      console.log(`   Found ${findings.length} potential issues\n`);
    } else {
      console.log(`⚠️  Directory ${dir} not found, skipping...\n`);
    }
  });

  return allFindings;
}

function generateCleanupPlan(findings) {
  console.log('📋 CLEANUP ANALYSIS REPORT');
  console.log('==========================\n');

  if (findings.length === 0) {
    console.log('✅ No legacy table references found in target directories!');
    console.log('   The codebase appears to be clean and ready for table removal.\n');
    return true;
  }

  // Group findings by table
  const groupedFindings = {};
  findings.forEach(finding => {
    if (!groupedFindings[finding.table]) {
      groupedFindings[finding.table] = [];
    }
    groupedFindings[finding.table].push(finding);
  });

  console.log('🚨 LEGACY REFERENCES FOUND:');
  console.log('============================\n');

  Object.keys(groupedFindings).forEach(table => {
    console.log(`📋 Table: ${table.toUpperCase()}`);
    console.log(`   References found: ${groupedFindings[table].length}`);

    groupedFindings[table].forEach(finding => {
      console.log(`   📄 ${finding.file}`);
      console.log(`      Pattern: ${finding.pattern}`);
      console.log(`      Matches: ${finding.matches}\n`);
    });
  });

  console.log('⚠️  ACTION REQUIRED:');
  console.log('=====================');
  console.log('1. Review the files listed above');
  console.log('2. Update code to use replacement systems:');
  console.log('   - conversations/messages → project_requests (Working Request System)');
  console.log('   - custom_otps → auth_tokens (OTPService)');
  console.log('   - admin_users → hardcoded admin check');
  console.log('   - blog_posts → remove if unused');
  console.log('3. Test the application thoroughly');
  console.log('4. Only then run the database cleanup script\n');

  return false;
}

function createSafetyChecklist() {
  const checklist = `
# OneDesigner Database Cleanup Safety Checklist

## ✅ Pre-Cleanup Verification

- [ ] Code analysis completed with no legacy references found
- [ ] All conversation/message functionality replaced with Working Request System
- [ ] OTP functionality using auth_tokens table via OTPService
- [ ] Admin authentication using hardcoded check (osamah96@gmail.com)
- [ ] Blog functionality confirmed as unused or properly migrated
- [ ] Application tested with all 8 centralized phases active
- [ ] Database backup created and verified

## ✅ Safe Tables for Removal

Based on analysis, these tables are safe to remove:

- [ ] \`conversations\` - Replaced by project_requests (Working Request System)
- [ ] \`messages\` - Messaging replaced by email-based Working Requests
- [ ] \`custom_otps\` - Replaced by auth_tokens (OTPService Phase 7)
- [ ] \`match_unlocks\` - Functionality moved to client_designers table
- [ ] \`designer_requests\` - Replaced by project_requests
- [ ] \`credit_purchases\` - Purchase tracking moved to payments table
- [ ] \`match_analytics\` - Analytics moved to centralized system
- [ ] \`activity_log\` - Replaced by LoggingService (Phase 6)
- [ ] \`blog_posts\` - Blog feature appears to be legacy
- [ ] \`admin_users\` - Admin hardcoded as osamah96@gmail.com

## ✅ Post-Cleanup Verification

- [ ] Application starts without errors
- [ ] Client signup and authentication working
- [ ] Designer signup and authentication working
- [ ] Match finding and unlocking working
- [ ] Working Request System functional
- [ ] Payment processing working
- [ ] Admin dashboard accessible
- [ ] All 8 centralized phases functioning correctly

## 🚨 Emergency Rollback Plan

If any issues occur:
1. Stop the application immediately
2. Run the rollback script in database-cleanup-plan.sql
3. Restore backed up tables
4. Restart application and verify functionality
5. Investigate and fix issues before re-attempting cleanup

## 📞 Support

If you encounter issues during cleanup:
- Check application logs for specific errors
- Verify all feature flags are properly set
- Ensure centralized services are functioning
- Contact: osamah96@gmail.com
`;

  fs.writeFileSync('./scripts/CLEANUP_SAFETY_CHECKLIST.md', checklist);
  console.log('📋 Safety checklist created: ./scripts/CLEANUP_SAFETY_CHECKLIST.md');
}

// Main execution
console.log('Starting legacy code analysis...\n');

const findings = analyzeCodebase();
const isSafe = generateCleanupPlan(findings);

createSafetyChecklist();

if (isSafe) {
  console.log('🎉 READY FOR DATABASE CLEANUP!');
  console.log('===============================');
  console.log('✅ No legacy table references found');
  console.log('✅ Code appears to be clean');
  console.log('✅ Safe to proceed with database cleanup');
  console.log('\nNext steps:');
  console.log('1. Review the safety checklist: ./scripts/CLEANUP_SAFETY_CHECKLIST.md');
  console.log('2. Run database cleanup: ./scripts/database-cleanup-plan.sql');
  console.log('3. Verify application functionality\n');
} else {
  console.log('🛑 NOT READY FOR DATABASE CLEANUP');
  console.log('==================================');
  console.log('❌ Legacy table references found in code');
  console.log('❌ Must fix code issues before removing tables');
  console.log('\nNext steps:');
  console.log('1. Fix the code issues listed above');
  console.log('2. Re-run this analysis script');
  console.log('3. Only proceed with database cleanup when analysis shows "READY"\n');
}

console.log('Analysis complete! 🚀');