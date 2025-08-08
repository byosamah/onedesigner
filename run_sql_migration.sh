#!/bin/bash

# Script to apply RLS migration to Supabase
# This uses the Supabase CLI to run the migration

echo "Applying RLS migration to designers table..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI not found. Installing..."
    brew install supabase/tap/supabase
fi

# Navigate to project directory
cd /Users/osamakhalil/OneDesigner

# Run the migration
supabase db push --include-migrations

echo "Migration applied. Verifying RLS status..."

# You can also apply directly using the Supabase project URL
# Uncomment and update with your credentials if needed:
# SUPABASE_DB_URL="postgresql://postgres:[YOUR-PASSWORD]@db.frwchtwxpnrlpzksupgm.supabase.co:5432/postgres"
# psql $SUPABASE_DB_URL < supabase/migrations/009_enable_rls_designers_table.sql

echo "Done! Check Supabase dashboard to confirm RLS is enabled."