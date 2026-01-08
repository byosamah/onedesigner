#!/usr/bin/env node

/**
 * Database Schema Checker
 * Examines the actual database structure
 */

const { createClient } = require('@supabase/supabase-js');

// Load from environment variables - NO HARDCODED SECRETS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Required environment variables missing');
    console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
    console.log('🔍 Checking database schema...');

    try {
        // Check clients table structure by selecting all columns
        console.log('\n📋 Checking clients table...');
        const { data: clientsData, error: clientsError } = await supabase
            .from('clients')
            .select('*')
            .limit(1);

        if (clientsError) {
            console.error('❌ Error accessing clients table:', clientsError);
        } else if (clientsData && clientsData.length > 0) {
            console.log('✅ Clients table columns:', Object.keys(clientsData[0]));
            console.log('Sample record:', clientsData[0]);
        } else {
            console.log('⚠️  Clients table is empty, trying to get structure differently...');

            // Try to insert a dummy record to see the schema error
            const { error: insertError } = await supabase
                .from('clients')
                .insert({ email: 'test@example.com' })
                .select();

            if (insertError) {
                console.log('Schema info from insert error:', insertError);
            }
        }

        // Check other tables
        const tables = ['designers', 'briefs', 'matches', 'project_requests'];

        for (const table of tables) {
            console.log(`\n📋 Checking ${table} table...`);
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);

            if (error) {
                console.error(`❌ Error accessing ${table}:`, error);
            } else if (data && data.length > 0) {
                console.log(`✅ ${table} columns:`, Object.keys(data[0]));
            } else {
                console.log(`⚠️  ${table} table is empty`);
            }
        }

        // Check for admin user in clients with actual columns
        console.log('\n🔍 Searching for admin user...');
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) {
            console.log('⚠️ ADMIN_EMAIL not set, skipping admin user check');
        }
        const { data: allClients, error: allClientsError } = await supabase
            .from('clients')
            .select('*')
            .eq('email', adminEmail || 'admin@example.com');

        if (!allClientsError && allClients) {
            console.log('Admin search result:', allClients);
        }

    } catch (error) {
        console.error('❌ Error during schema check:', error);
    }
}

checkSchema();