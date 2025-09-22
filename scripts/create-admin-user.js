#!/usr/bin/env node

/**
 * Create Admin User Script
 * Creates the admin user (osamah96@gmail.com) in the clients table
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
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
            .eq('email', 'osamah96@gmail.com')
            .single();

        if (existingAdmin) {
            console.log('✅ Admin user already exists in clients table');
            return;
        }

        // Create admin user in clients table
        const { data: newAdmin, error: createError } = await supabase
            .from('clients')
            .insert({
                email: 'osamah96@gmail.com',
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