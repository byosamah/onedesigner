#!/usr/bin/env node

/**
 * Database Cleanup Script - Final Version
 * Preserves only the admin user (osamah96@gmail.com) and removes all other data
 * Uses proper deletion approach for all tables
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
    console.log('🧹 Starting final database cleanup...');
    console.log('🔒 Preserving admin user: osamah96@gmail.com');

    try {
        // Get admin user ID for reference
        const { data: adminUser, error: adminError } = await supabase
            .from('clients')
            .select('id, email')
            .eq('email', 'osamah96@gmail.com')
            .single();

        if (adminError || !adminUser) {
            console.error('❌ Admin user not found! Cannot proceed.');
            process.exit(1);
        }

        console.log('✅ Admin user found:', adminUser);
        const adminId = adminUser.id;

        // Step 1: Delete all project_requests
        console.log('\n1. Cleaning up project_requests...');
        const { data: allProjectRequests } = await supabase
            .from('project_requests')
            .select('id');

        if (allProjectRequests && allProjectRequests.length > 0) {
            for (const req of allProjectRequests) {
                await supabase.from('project_requests').delete().eq('id', req.id);
            }
            console.log(`✅ Deleted ${allProjectRequests.length} project_requests`);
        } else {
            console.log('✅ No project_requests to delete');
        }

        // Step 2: Delete all matches
        console.log('\n2. Cleaning up matches...');
        const { data: allMatches } = await supabase
            .from('matches')
            .select('id');

        if (allMatches && allMatches.length > 0) {
            for (const match of allMatches) {
                await supabase.from('matches').delete().eq('id', match.id);
            }
            console.log(`✅ Deleted ${allMatches.length} matches`);
        } else {
            console.log('✅ No matches to delete');
        }

        // Step 3: Delete all client_designers relationships
        console.log('\n3. Cleaning up client_designers...');
        const { data: allClientDesigners } = await supabase
            .from('client_designers')
            .select('id');

        if (allClientDesigners && allClientDesigners.length > 0) {
            for (const rel of allClientDesigners) {
                await supabase.from('client_designers').delete().eq('id', rel.id);
            }
            console.log(`✅ Deleted ${allClientDesigners.length} client_designers relationships`);
        } else {
            console.log('✅ No client_designers to delete');
        }

        // Step 4: Delete all briefs
        console.log('\n4. Cleaning up briefs...');
        const { data: allBriefs } = await supabase
            .from('briefs')
            .select('id');

        if (allBriefs && allBriefs.length > 0) {
            for (const brief of allBriefs) {
                await supabase.from('briefs').delete().eq('id', brief.id);
            }
            console.log(`✅ Deleted ${allBriefs.length} briefs`);
        } else {
            console.log('✅ No briefs to delete');
        }

        // Step 5: Delete all designers
        console.log('\n5. Cleaning up designers...');
        const { data: allDesigners } = await supabase
            .from('designers')
            .select('id');

        if (allDesigners && allDesigners.length > 0) {
            for (const designer of allDesigners) {
                await supabase.from('designers').delete().eq('id', designer.id);
            }
            console.log(`✅ Deleted ${allDesigners.length} designers`);
        } else {
            console.log('✅ No designers to delete');
        }

        // Step 6: Delete non-admin clients
        console.log('\n6. Cleaning up non-admin clients...');
        const { data: allClients } = await supabase
            .from('clients')
            .select('id, email')
            .neq('email', 'osamah96@gmail.com');

        if (allClients && allClients.length > 0) {
            for (const client of allClients) {
                await supabase.from('clients').delete().eq('id', client.id);
            }
            console.log(`✅ Deleted ${allClients.length} non-admin clients`);
        } else {
            console.log('✅ No non-admin clients to delete');
        }

        // Step 7: Clean up cache and auxiliary tables
        console.log('\n7. Cleaning up cache tables...');

        // Designer embeddings
        try {
            const { data: embeddings } = await supabase
                .from('designer_embeddings')
                .select('id');

            if (embeddings && embeddings.length > 0) {
                for (const embedding of embeddings) {
                    await supabase.from('designer_embeddings').delete().eq('id', embedding.id);
                }
                console.log(`✅ Deleted ${embeddings.length} designer_embeddings`);
            }
        } catch (e) {
            console.log('ℹ️  designer_embeddings table not found or empty');
        }

        // Match cache
        try {
            const { data: cache } = await supabase
                .from('match_cache')
                .select('id');

            if (cache && cache.length > 0) {
                for (const item of cache) {
                    await supabase.from('match_cache').delete().eq('id', item.id);
                }
                console.log(`✅ Deleted ${cache.length} match_cache entries`);
            }
        } catch (e) {
            console.log('ℹ️  match_cache table not found or empty');
        }

        // Auth tokens (keep admin's tokens)
        try {
            const { data: tokens } = await supabase
                .from('auth_tokens')
                .select('id, email')
                .neq('email', 'osamah96@gmail.com');

            if (tokens && tokens.length > 0) {
                for (const token of tokens) {
                    await supabase.from('auth_tokens').delete().eq('id', token.id);
                }
                console.log(`✅ Deleted ${tokens.length} non-admin auth_tokens`);
            }
        } catch (e) {
            console.log('ℹ️  auth_tokens table not found or empty');
        }

        // Step 8: Final verification
        console.log('\n8. Final verification...');

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
        const { data: finalAdminCheck } = await supabase
            .from('clients')
            .select('email, match_credits')
            .eq('email', 'osamah96@gmail.com')
            .single();

        if (finalAdminCheck) {
            console.log('✅ Admin user preserved:', finalAdminCheck);
        } else {
            console.log('⚠️  Admin user verification failed');
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