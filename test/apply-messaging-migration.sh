#!/bin/bash

echo "🚀 Applying messaging system migration..."

# Database connection string
DB_URL="postgresql://postgres.frwchtwxpnrlpzksupgm:onedesigner2025!@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

# Apply the migration
psql "$DB_URL" < /Users/osamakhalil/OneDesigner/migrations/012_messaging_system.sql

if [ $? -eq 0 ]; then
    echo "✅ Messaging migration applied successfully!"
else
    echo "❌ Failed to apply messaging migration"
    exit 1
fi

# Verify tables were created
echo "📊 Verifying tables..."
psql "$DB_URL" -c "SELECT table_name FROM information_schema.tables WHERE table_name IN ('conversations', 'messages', 'match_requests') ORDER BY table_name;"