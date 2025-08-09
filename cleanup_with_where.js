const https = require('https');

const SUPABASE_URL = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  process.exit(1);
}

// Tables that exist based on the error messages
const tables = [
  'designer_requests',
  'designer_embeddings',
  'designer_quick_stats',
  'matches',
  'briefs',
  'payments',
  'auth_tokens',
  'designers',
  'clients',
  'match_cache'
];

async function deleteFromTable(tableName) {
  return new Promise((resolve, reject) => {
    const deleteUrl = `/rest/v1/${tableName}?id=gte.0`; // Delete all records where id >= 0
    
    const options = {
      hostname: 'frwchtwxpnrlpzksupgm.supabase.co',
      path: deleteUrl,
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ Cleaned table: ${tableName}`);
          resolve();
        } else {
          console.error(`❌ Error cleaning ${tableName}: ${res.statusCode} - ${data}`);
          // Try with created_at column if id doesn't work
          deleteWithCreatedAt(tableName).then(resolve).catch(reject);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ Error cleaning ${tableName}:`, e);
      reject(e);
    });

    req.end();
  });
}

async function deleteWithCreatedAt(tableName) {
  return new Promise((resolve, reject) => {
    const deleteUrl = `/rest/v1/${tableName}?created_at=gte.2000-01-01`; // Delete all records
    
    const options = {
      hostname: 'frwchtwxpnrlpzksupgm.supabase.co',
      path: deleteUrl,
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ Cleaned table: ${tableName} (using created_at)`);
          resolve();
        } else {
          console.error(`❌ Could not clean ${tableName}: ${res.statusCode}`);
          resolve(); // Continue anyway
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ Error cleaning ${tableName}:`, e);
      resolve(); // Continue anyway
    });

    req.end();
  });
}

async function getTableCount(tableName) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'frwchtwxpnrlpzksupgm.supabase.co',
      path: `/rest/v1/${tableName}?select=count`,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'count=exact'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const count = res.headers['content-range'] ? 
          res.headers['content-range'].split('/')[1] : '?';
        console.log(`  ${tableName}: ${count} records`);
        resolve();
      });
    });

    req.on('error', () => {
      console.log(`  ${tableName}: Error getting count`);
      resolve();
    });

    req.end();
  });
}

async function cleanDatabase() {
  console.log('🧹 Starting OneDesigner database cleanup...');
  console.log('⚠️  WARNING: This will delete ALL client and designer data!');
  console.log('');

  console.log('📊 Records before cleanup:');
  for (const table of tables) {
    await getTableCount(table);
  }

  console.log('\n🗑️  Cleaning tables...\n');

  for (const table of tables) {
    try {
      await deleteFromTable(table);
    } catch (error) {
      console.error(`Failed to clean ${table}, continuing...`);
    }
  }

  console.log('\n📊 Records after cleanup:');
  for (const table of tables) {
    await getTableCount(table);
  }

  console.log('\n✅ Database cleanup completed!');
}

cleanDatabase().catch(console.error);