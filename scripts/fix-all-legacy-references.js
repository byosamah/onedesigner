#!/usr/bin/env node

/**
 * Fix All Legacy References Script
 * Automatically updates all legacy table references to use centralized systems
 */

const fs = require('fs');
const path = require('path');

// Mapping of legacy tables to their replacements
const TABLE_REPLACEMENTS = {
  'custom_otps': 'auth_tokens',
  'match_unlocks': 'client_designers', // Note: Logic change needed
  'designer_requests': 'project_requests',
  'credit_purchases': 'payments',
  'match_analytics': 'audit_logs', // Analytics moved to centralized logging
  'activity_log': 'audit_logs',
  'conversations': 'project_requests', // Conceptual replacement
  'messages': 'project_requests', // Messages replaced by working requests
  'admin_users': 'HARDCODED', // Special case - use hardcoded admin
  'blog_posts': 'REMOVE' // Blog feature to be removed
};

// Files to skip (already updated or need manual review)
const SKIP_FILES = [
  'scripts/',
  'node_modules/',
  '.git/',
  'test/',
  'cypress/'
];

console.log('🔧 OneDesigner Legacy Reference Auto-Fix');
console.log('=========================================');

function shouldSkipFile(filePath) {
  return SKIP_FILES.some(skip => filePath.includes(skip));
}

function fixLegacyTableReferences(content, filePath) {
  let updatedContent = content;
  let changesMade = [];

  // Fix table references in .from() calls
  Object.entries(TABLE_REPLACEMENTS).forEach(([legacyTable, replacement]) => {
    // Pattern: .from('legacy_table') or from('legacy_table')
    const patterns = [
      new RegExp(`\\.from\\(['"\`]${legacyTable}['"\`]\\)`, 'g'),
      new RegExp(`from\\(['"\`]${legacyTable}['"\`]\\)`, 'g')
    ];

    patterns.forEach(pattern => {
      const matches = updatedContent.match(pattern);
      if (matches) {
        if (replacement === 'HARDCODED') {
          // Special case for admin_users - needs manual review
          changesMade.push(`${legacyTable} → NEEDS MANUAL REVIEW (admin hardcode)`);
        } else if (replacement === 'REMOVE') {
          // Special case for blog_posts - add comment
          changesMade.push(`${legacyTable} → MARKED FOR REMOVAL`);
          updatedContent = updatedContent.replace(pattern, `// FIXME: Remove blog functionality - from('${legacyTable}')`);
        } else {
          // Standard replacement
          changesMade.push(`${legacyTable} → ${replacement}`);
          updatedContent = updatedContent.replace(pattern, pattern.source.replace(legacyTable, replacement));
        }
      }
    });
  });

  // Fix interface/type references
  if (updatedContent.includes('messages_count')) {
    updatedContent = updatedContent.replace(/messages_count/g, 'request_count');
    changesMade.push('messages_count → request_count');
  }

  if (updatedContent.includes('getConversationCount')) {
    updatedContent = updatedContent.replace(/getConversationCount/g, 'getProjectRequestCount');
    changesMade.push('getConversationCount → getProjectRequestCount');
  }

  return { updatedContent, changesMade };
}

function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { updatedContent, changesMade } = fixLegacyTableReferences(content, filePath);

    if (changesMade.length > 0) {
      // Create backup
      const backupPath = filePath + '.backup';
      if (!fs.existsSync(backupPath)) {
        fs.writeFileSync(backupPath, content);
      }

      // Write updated content
      fs.writeFileSync(filePath, updatedContent);

      console.log(`✅ Fixed ${filePath}`);
      changesMade.forEach(change => console.log(`   - ${change}`));
      console.log();

      return { fixed: true, changes: changesMade.length };
    }

    return { fixed: false, changes: 0 };
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return { fixed: false, changes: 0 };
  }
}

function fixDirectory(dir) {
  let totalFixed = 0;
  let totalChanges = 0;

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);

      if (shouldSkipFile(fullPath)) {
        return;
      }

      if (entry.isDirectory()) {
        const { fixed, changes } = fixDirectory(fullPath);
        totalFixed += fixed;
        totalChanges += changes;
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        const { fixed, changes } = fixFile(fullPath);
        if (fixed) totalFixed++;
        totalChanges += changes;
      }
    });
  } catch (error) {
    console.error(`❌ Error scanning directory ${dir}:`, error.message);
  }

  return { fixed: totalFixed, changes: totalChanges };
}

function createFinalReport(stats) {
  const report = `
# Legacy Reference Fix Report

## Summary
- **Files Updated**: ${stats.fixed}
- **Total Changes**: ${stats.changes}
- **Date**: ${new Date().toISOString()}

## Changes Made
1. **Table Replacements**:
   - \`custom_otps\` → \`auth_tokens\` (OTPService Phase 7)
   - \`match_unlocks\` → \`client_designers\` (Logic consolidation)
   - \`designer_requests\` → \`project_requests\` (Working Request System)
   - \`credit_purchases\` → \`payments\` (Payment consolidation)
   - \`match_analytics\` → \`audit_logs\` (Centralized logging)
   - \`activity_log\` → \`audit_logs\` (Centralized logging)
   - \`conversations\` → \`project_requests\` (Working Request System)
   - \`messages\` → \`project_requests\` (Working Request System)

2. **Interface Updates**:
   - \`messages_count\` → \`request_count\`
   - \`getConversationCount\` → \`getProjectRequestCount\`

3. **Manual Review Required**:
   - \`admin_users\` references (use hardcoded admin check)
   - \`blog_posts\` references (remove if unused)

## Backup Files
All modified files have been backed up with \`.backup\` extension.
To restore: \`mv file.ts.backup file.ts\`

## Next Steps
1. Test the application thoroughly
2. Run the legacy analysis script again
3. Proceed with database cleanup when analysis shows "READY"
4. Remove backup files when confident in changes

## Rollback Instructions
If issues occur:
\`\`\`bash
find src -name "*.backup" -exec sh -c 'mv "$1" "\${1%.backup}"' _ {} \\;
\`\`\`
`;

  fs.writeFileSync('./scripts/LEGACY_FIX_REPORT.md', report);
  console.log('📋 Fix report created: ./scripts/LEGACY_FIX_REPORT.md');
}

// Main execution
console.log('Starting automatic legacy reference fixes...\n');

const stats = fixDirectory('./src');

console.log('🎉 AUTO-FIX COMPLETE!');
console.log('=====================');
console.log(`✅ Files Updated: ${stats.fixed}`);
console.log(`✅ Total Changes: ${stats.changes}`);
console.log('✅ Backups Created: All modified files backed up');

createFinalReport(stats);

console.log('\n🔍 NEXT STEPS:');
console.log('===============');
console.log('1. Review the fix report: ./scripts/LEGACY_FIX_REPORT.md');
console.log('2. Test the application functionality');
console.log('3. Run analysis script: node scripts/cleanup-legacy-code-references.js');
console.log('4. Proceed with database cleanup when analysis shows "READY"');
console.log('\n🚀 Auto-fix complete!');