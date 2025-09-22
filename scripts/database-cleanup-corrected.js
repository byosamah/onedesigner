#!/usr/bin/env node

/**
 * Database Cleanup Script - Corrected Version
 * Preserves only the admin user (osamah96@gmail.com) and removes all other data
 * Based on actual database schema
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupDatabase() {
    console.log('🧹 Starting database cleanup...');
    console.log('🔒 Preserving admin user: osamah96@gmail.com');

    try {
        // Step 1: Verify admin user exists
        console.log('\n1. Verifying admin user exists...');
        const { data: adminCheck, error: adminError } = await supabase
            .from('clients')
            .select('*')
            .eq('email', 'osamah96@gmail.com');

        if (adminError) {
            console.error('❌ Error checking clients table:', adminError);
            process.exit(1);
        }

        if (!adminCheck || adminCheck.length === 0) {
            console.error('❌ Admin user not found! Creating admin user first...');

            const { data: newAdmin, error: createError } = await supabase
                .from('clients')
                .insert({
                    email: 'osamah96@gmail.com',
                    match_credits: 999,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (createError) {
                console.error('❌ Failed to create admin user:', createError);
                process.exit(1);
            } else {
                console.log('✅ Admin user created successfully');
            }
        } else {
            console.log('✅ Admin user found:', adminCheck[0]);
        }

        // Step 2: Clean up project requests
        console.log('\n2. Cleaning up project requests...');
        const { error: projectRequestsError } = await supabase
            .from('project_requests')
            .delete()
            .neq('id', 'preserve-nothing'); // This will delete all rows

        if (projectRequestsError) {
            console.error('Error deleting project_requests:', projectRequestsError);
        } else {
            console.log('✅ Deleted all project_requests');
        }

        // Step 3: Clean up matches
        console.log('\n3. Cleaning up matches...');
        const { error: matchesError } = await supabase
            .from('matches')
            .delete()
            .neq('id', 'preserve-nothing');

        if (matchesError) {
            console.error('Error deleting matches:', matchesError);
        } else {
            console.log('✅ Deleted all matches');
        }

        // Step 4: Clean up client_designers relationships
        console.log('\n4. Cleaning up client_designers relationships...');
        const { error: clientDesignersError } = await supabase
            .from('client_designers')
            .delete()
            .neq('id', 'preserve-nothing');

        if (clientDesignersError) {
            console.error('Error deleting client_designers:', clientDesignersError);
        } else {
            console.log('✅ Deleted all client_designers relationships');
        }

        // Step 5: Clean up briefs
        console.log('\n5. Cleaning up briefs...');
        const { error: briefsError } = await supabase
            .from('briefs')
            .delete()
            .neq('id', 'preserve-nothing');

        if (briefsError) {
            console.error('Error deleting briefs:', briefsError);
        } else {
            console.log('✅ Deleted all briefs');
        }

        // Step 6: Clean up designers
        console.log('\n6. Cleaning up designers...');
        const { error: designersError } = await supabase
            .from('designers')
            .delete()
            .neq('id', 'preserve-nothing');

        if (designersError) {
            console.error('Error deleting designers:', designersError);
        } else {
            console.log('✅ Deleted all designers');
        }

        // Step 7: Clean up designer embeddings
        console.log('\n7. Cleaning up designer embeddings...');
        const { error: embeddingsError } = await supabase
            .from('designer_embeddings')
            .delete()
            .neq('id', 'preserve-nothing');

        if (embeddingsError && embeddingsError.code !== 'PGRST205') {
            console.error('Error deleting designer_embeddings:', embeddingsError);
        } else {
            console.log('✅ Deleted all designer_embeddings');
        }

        // Step 8: Clean up non-admin clients
        console.log('\n8. Cleaning up non-admin clients...');
        const { error: clientsError } = await supabase
            .from('clients')
            .delete()
            .neq('email', 'osamah96@gmail.com');

        if (clientsError) {
            console.error('Error deleting clients:', clientsError);
        } else {
            console.log('✅ Deleted all clients except admin');
        }

        // Step 9: Clean up authentication tokens
        console.log('\n9. Cleaning up authentication tokens...');
        const { error: authTokensError } = await supabase
            .from('auth_tokens')
            .delete()
            .neq('email', 'osamah96@gmail.com');

        if (authTokensError && authTokensError.code !== 'PGRST205') {
            console.error('Error deleting auth_tokens:', authTokensError);
        } else {
            console.log('✅ Deleted all auth_tokens except admin');
        }

        // Step 10: Clean up cache tables
        console.log('\n10. Cleaning up cache tables...');
        const { error: matchCacheError } = await supabase
            .from('match_cache')
            .delete()
            .neq('id', 'preserve-nothing');

        if (matchCacheError && matchCacheError.code !== 'PGRST205') {
            console.error('Error deleting match_cache:', matchCacheError);
        } else {
            console.log('✅ Deleted all match_cache entries');
        }

        // Step 11: Final verification
        console.log('\n11. Final verification...');

        // Count remaining records
        const tables = ['clients', 'designers', 'briefs', 'matches', 'project_requests'];

        for (const table of tables) {
            try {
                const { count, error } = await supabase
                    .from(table)
                    .select('*', { count: 'exact', head: true });

                if (!error) {
                    console.log(`📊 ${table}: ${count} records remaining`);
                }
            } catch (e) {
                console.log(`⚠️  Could not count ${table}: ${e.message}`);
            }
        }

        // Verify admin user still exists
        const { data: finalAdminCheck, error: finalAdminError } = await supabase
            .from('clients')
            .select('email, match_credits')
            .eq('email', 'osamah96@gmail.com')
            .single();

        if (finalAdminCheck) {
            console.log('✅ Admin user preserved:', finalAdminCheck);
        } else {
            console.log('⚠️  Admin user verification failed:', finalAdminError);
        }

        console.log('\n🎉 Database cleanup completed successfully!');
        console.log('🔒 Admin user (osamah96@gmail.com) preserved');
        console.log('🧹 All other user data removed');

    } catch (error) {
        console.error('❌ Error during database cleanup:', error);
        process.exit(1);
    }
}

// Run the cleanup
cleanupDatabase();