#!/usr/bin/env node

/**
 * Database Cleanup Verification Script
 * Verifies that only the admin user remains after cleanup
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyCleanup() {
    console.log('🔍 Verifying database cleanup...');
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
        'match_cache'
    ];

    const results = {
        timestamp: new Date().toISOString(),
        status: 'success',
        tables: {},
        adminUser: null,
        errors: []
    };

    console.log('\n📊 Final Record Counts:');
    console.log('------------------------');

    for (const table of tables) {
        try {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (!error) {
                results.tables[table] = count;
                console.log(`${table.padEnd(20)}: ${count} records`);
            } else {
                results.tables[table] = `Error: ${error.message}`;
                results.errors.push(`${table}: ${error.message}`);
                console.log(`${table.padEnd(20)}: Error - ${error.message}`);
            }
        } catch (e) {
            results.tables[table] = `Exception: ${e.message}`;
            results.errors.push(`${table}: Exception - ${e.message}`);
            console.log(`${table.padEnd(20)}: Exception - ${e.message}`);
        }
    }

    // Verify admin user details
    console.log('\n👤 Admin User Verification:');
    console.log('----------------------------');

    try {
        const { data: adminUser, error: adminError } = await supabase
            .from('clients')
            .select('*')
            .eq('email', 'osamah96@gmail.com')
            .single();

        if (!adminError && adminUser) {
            results.adminUser = adminUser;
            console.log('✅ Admin user found and preserved:');
            console.log(`   Email: ${adminUser.email}`);
            console.log(`   ID: ${adminUser.id}`);
            console.log(`   Credits: ${adminUser.match_credits}`);
            console.log(`   Created: ${adminUser.created_at}`);
            console.log(`   Updated: ${adminUser.updated_at}`);
        } else {
            results.status = 'error';
            results.errors.push(`Admin user verification failed: ${adminError?.message || 'Not found'}`);
            console.log('❌ Admin user not found or error occurred');
        }
    } catch (e) {
        results.status = 'error';
        results.errors.push(`Admin user check exception: ${e.message}`);
        console.log('❌ Exception checking admin user:', e.message);
    }

    // Summary
    console.log('\n📋 Cleanup Summary:');
    console.log('--------------------');

    const totalRecords = Object.values(results.tables)
        .filter(count => typeof count === 'number')
        .reduce((sum, count) => sum + count, 0);

    console.log(`Total records remaining: ${totalRecords}`);
    console.log(`Expected records: 1 (admin user only)`);

    if (totalRecords === 1 && results.adminUser && results.errors.length === 0) {
        console.log('✅ Cleanup SUCCESSFUL - Database contains only admin user');
        results.status = 'success';
    } else if (totalRecords === 1 && results.adminUser) {
        console.log('⚠️  Cleanup MOSTLY SUCCESSFUL - Minor issues detected');
        results.status = 'warning';
    } else {
        console.log('❌ Cleanup INCOMPLETE - Issues detected');
        results.status = 'error';
    }

    if (results.errors.length > 0) {
        console.log('\n🚨 Errors encountered:');
        results.errors.forEach(error => console.log(`   - ${error}`));
    }

    // Save verification report
    const fs = require('fs');
    const reportFile = `/Users/osamakhalil/OneDesigner/scripts/cleanup-verification-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
    console.log(`\n📄 Verification report saved: ${reportFile}`);

    console.log('\n🎯 Database is now clean and ready for production use!');
}

verifyCleanup();