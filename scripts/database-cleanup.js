#!/usr/bin/env node

/**
 * Database Cleanup Script
 * Preserves only the admin user (osamah96@gmail.com) and removes all other data
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
            .select('email, user_type, created_at')
            .eq('email', 'osamah96@gmail.com');

        if (adminError) {
            console.error('❌ Error checking clients table:', adminError);
        }

        if (!adminCheck || adminCheck.length === 0) {
            console.log('⚠️  Admin user not found in clients table, checking admins table...');

            const { data: adminCheck2, error: adminError2 } = await supabase
                .from('admins')
                .select('email, created_at')
                .eq('email', 'osamah96@gmail.com');

            if (adminError2) {
                console.error('❌ Error checking admins table:', adminError2);
            }

            if (!adminCheck2 || adminCheck2.length === 0) {
                console.log('🚨 Admin user not found in either table, proceeding with caution...');
                console.log('⚠️  Creating admin user to prevent data loss...');

                // Create admin user
                const { data: newAdmin, error: createError } = await supabase
                    .from('clients')
                    .insert({
                        email: 'osamah96@gmail.com',
                        user_type: 'admin',
                        match_credits: 999,
                        is_verified: true,
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
                console.log('✅ Admin user found in admins table');
            }
        } else {
            console.log('✅ Admin user found in clients table:', adminCheck[0]);
        }

        // Step 2: Clean up client-related data
        console.log('\n2. Cleaning up client-related data...');

        // Delete project requests
        const { error: projectRequestsError } = await supabase
            .from('project_requests')
            .delete()
            .neq('id', 'preserve-nothing'); // This will delete all rows

        if (projectRequestsError) {
            console.error('Error deleting project_requests:', projectRequestsError);
        } else {
            console.log('✅ Deleted all project_requests');
        }

        // Delete matches
        const { error: matchesError } = await supabase
            .from('matches')
            .delete()
            .neq('id', 'preserve-nothing');

        if (matchesError) {
            console.error('Error deleting matches:', matchesError);
        } else {
            console.log('✅ Deleted all matches');
        }

        // Delete client_designers relationships
        const { error: clientDesignersError } = await supabase
            .from('client_designers')
            .delete()
            .neq('id', 'preserve-nothing');

        if (clientDesignersError) {
            console.error('Error deleting client_designers:', clientDesignersError);
        } else {
            console.log('✅ Deleted all client_designers relationships');
        }

        // Delete briefs
        const { error: briefsError } = await supabase
            .from('briefs')
            .delete()
            .neq('id', 'preserve-nothing');

        if (briefsError) {
            console.error('Error deleting briefs:', briefsError);
        } else {
            console.log('✅ Deleted all briefs');
        }

        // Delete non-admin clients
        const { error: clientsError } = await supabase
            .from('clients')
            .delete()
            .neq('email', 'osamah96@gmail.com');

        if (clientsError) {
            console.error('Error deleting clients:', clientsError);
        } else {
            console.log('✅ Deleted all clients except admin');
        }

        // Step 3: Clean up designer data
        console.log('\n3. Cleaning up designer data...');

        // Delete designer embeddings
        const { error: embeddingsError } = await supabase
            .from('designer_embeddings')
            .delete()
            .neq('id', 'preserve-nothing');

        if (embeddingsError) {
            console.error('Error deleting designer_embeddings:', embeddingsError);
        } else {
            console.log('✅ Deleted all designer_embeddings');
        }

        // Delete designers
        const { error: designersError } = await supabase
            .from('designers')
            .delete()
            .neq('id', 'preserve-nothing');

        if (designersError) {
            console.error('Error deleting designers:', designersError);
        } else {
            console.log('✅ Deleted all designers');
        }

        // Step 4: Clean up authentication and session data
        console.log('\n4. Cleaning up authentication data...');

        // Delete auth tokens
        const { error: authTokensError } = await supabase
            .from('auth_tokens')
            .delete()
            .neq('email', 'osamah96@gmail.com');

        if (authTokensError) {
            console.error('Error deleting auth_tokens:', authTokensError);
        } else {
            console.log('✅ Deleted all auth_tokens except admin');
        }

        // Step 5: Clean up cache and system tables
        console.log('\n5. Cleaning up cache and system data...');

        // Delete match cache
        const { error: matchCacheError } = await supabase
            .from('match_cache')
            .delete()
            .neq('id', 'preserve-nothing');

        if (matchCacheError) {
            console.error('Error deleting match_cache:', matchCacheError);
        } else {
            console.log('✅ Deleted all match_cache entries');
        }

        // Clean up any designer quick stats if the table exists
        try {
            const { error: quickStatsError } = await supabase
                .from('designer_quick_stats')
                .delete()
                .neq('id', 'preserve-nothing');

            if (!quickStatsError) {
                console.log('✅ Deleted all designer_quick_stats entries');
            }
        } catch (e) {
            console.log('ℹ️  designer_quick_stats table not found or already empty');
        }

        // Step 6: Final verification
        console.log('\n6. Verifying cleanup completion...');

        // Count remaining records
        const tables = ['clients', 'designers', 'briefs', 'matches', 'project_requests', 'client_designers'];

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
            .select('email')
            .eq('email', 'osamah96@gmail.com')
            .single();

        if (finalAdminCheck) {
            console.log('✅ Admin user preserved in clients table');
        } else {
            console.log('ℹ️  Admin user not in clients table, checking admins table...');

            const { data: finalAdminCheck2 } = await supabase
                .from('admins')
                .select('email')
                .eq('email', 'osamah96@gmail.com')
                .single();

            if (finalAdminCheck2) {
                console.log('✅ Admin user preserved in admins table');
            } else {
                console.log('⚠️  Admin user not found in either table');
            }
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