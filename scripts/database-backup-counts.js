#!/usr/bin/env node

/**
 * Database Backup - Count Records Before Cleanup
 * Creates a snapshot of record counts for backup purposes
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBackupSnapshot() {
    console.log('📊 Creating database backup snapshot...');
    console.log('Timestamp:', new Date().toISOString());
    console.log('=====================================');

    const tables = [
        'clients',
        'designers',
        'briefs',
        'matches',
        'project_requests',
        'client_designers',
        'designer_embeddings',
        'auth_tokens',
        'match_cache',
        'admins'
    ];

    const snapshot = {
        timestamp: new Date().toISOString(),
        counts: {}
    };

    for (const table of tables) {
        try {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (!error) {
                snapshot.counts[table] = count;
                console.log(`📋 ${table}: ${count} records`);
            } else {
                snapshot.counts[table] = `Error: ${error.message}`;
                console.log(`❌ ${table}: Error - ${error.message}`);
            }
        } catch (e) {
            snapshot.counts[table] = `Exception: ${e.message}`;
            console.log(`⚠️  ${table}: Exception - ${e.message}`);
        }
    }

    // Check for admin user specifically
    try {
        console.log('\n🔍 Checking admin user...');

        const { data: adminInClients } = await supabase
            .from('clients')
            .select('email, user_type, created_at')
            .eq('email', 'osamah96@gmail.com');

        const { data: adminInAdmins } = await supabase
            .from('admins')
            .select('email, created_at')
            .eq('email', 'osamah96@gmail.com');

        if (adminInClients && adminInClients.length > 0) {
            console.log('✅ Admin found in clients table:', adminInClients[0]);
            snapshot.adminLocation = 'clients';
        }

        if (adminInAdmins && adminInAdmins.length > 0) {
            console.log('✅ Admin found in admins table:', adminInAdmins[0]);
            snapshot.adminLocation = snapshot.adminLocation ? 'both' : 'admins';
        }

        if (!adminInClients?.length && !adminInAdmins?.length) {
            console.log('❌ Admin user not found in either table!');
            snapshot.adminLocation = 'not_found';
        }

    } catch (e) {
        console.log('⚠️  Error checking admin user:', e.message);
        snapshot.adminCheck = `Error: ${e.message}`;
    }

    console.log('\n📄 Backup snapshot created');

    // Save snapshot to file
    const fs = require('fs');
    const backupFile = `/Users/osamakhalil/OneDesigner/scripts/database-backup-${Date.now()}.json`;
    fs.writeFileSync(backupFile, JSON.stringify(snapshot, null, 2));
    console.log(`💾 Backup saved to: ${backupFile}`);

    return snapshot;
}

createBackupSnapshot();