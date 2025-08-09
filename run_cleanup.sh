#!/bin/bash

# OneDesigner Database Cleanup Script
echo "🧹 Starting OneDesigner database cleanup..."
echo "⚠️  WARNING: This will delete ALL client and designer data!"
echo ""

# Read the SQL file
SQL_CONTENT=$(<clean-all-data.sql)

# Execute via Supabase CLI
echo "Executing cleanup commands..."
supabase db execute --sql "$SQL_CONTENT"

if [ $? -eq 0 ]; then
    echo "✅ Database cleanup completed successfully!"
else
    echo "❌ Error during database cleanup"
    exit 1
fi