#!/usr/bin/env node

/**
 * Create Admin User Script
 * Creates the admin user in the clients table
 * Uses ADMIN_EMAIL environment variable
 */

const { createClient } = require('@supabase/supabase-js');

// Load from environment variables - NO HARDCODED SECRETS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;

if (!supabaseUrl || !supabaseServiceKey || !adminEmail) {
    console.error('Error: Required environment variables missing');
    console.error('  - NEXT_PUBLIC_SUPABASE_URL');
    console.error('  - SUPABASE_SERVICE_ROLE_KEY');
    console.error('  - ADMIN_EMAIL');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
    console.log('👤 Creating admin user...');

    try {
        // Check if admin already exists
        const { data: existingAdmin, error: checkError } = await supabase
            .from('clients')
            .select('email')
            .eq('email', adminEmail)
            .single();

        if (existingAdmin) {
            console.log('✅ Admin user already exists in clients table');
            return;
        }

        // Create admin user in clients table
        const { data: newAdmin, error: createError } = await supabase
            .from('clients')
            .insert({
                email: adminEmail,
                user_type: 'admin',
                match_credits: 999, // Give admin plenty of credits
                is_verified: true,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (createError) {
            console.error('❌ Error creating admin user:', createError);
            process.exit(1);
        }

        console.log('✅ Admin user created successfully:', newAdmin);

    } catch (error) {
        console.error('❌ Error during admin user creation:', error);
        process.exit(1);
    }
}

createAdminUser();