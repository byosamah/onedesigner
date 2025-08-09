const https = require('https');

const SUPABASE_URL = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  process.exit(1);
}

const tables = [
  'designer_requests',
  'designer_portfolios', 
  'designer_embeddings',
  'designer_quick_stats',
  'client_designers',
  'matches',
  'briefs',
  'payments',
  'transactions',
  'auth_tokens',
  'admin_sessions',
  'designer_sessions',
  'client_sessions',
  'designers',
  'clients',
  'match_cache'
];

async function deleteFromTable(tableName) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'frwchtwxpnrlpzksupgm.supabase.co',
      path: `/rest/v1/${tableName}`,
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
          reject(new Error(`Failed to clean ${tableName}`));
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

async function cleanDatabase() {
  console.log('🧹 Starting OneDesigner database cleanup...');
  console.log('⚠️  WARNING: This will delete ALL client and designer data!');
  console.log('');

  for (const table of tables) {
    try {
      await deleteFromTable(table);
    } catch (error) {
      console.error(`Failed to clean ${table}, continuing...`);
    }
  }

  console.log('');
  console.log('✅ Database cleanup completed!');
}

cleanDatabase().catch(console.error);