#!/bin/bash

echo "🔄 Running project price migration..."
echo "This will add project_price_from and project_price_to columns to the designers table"
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    source .env.local
fi

# Use Supabase CLI to run the migration
supabase db execute --sql "$(cat test/add_project_price_columns.sql)"

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "The designers table now has:"
    echo "- project_price_from: Minimum project price"
    echo "- project_price_to: Maximum project price"
    echo ""
    echo "The old hourly_rate column is preserved for now."
else
    echo "❌ Migration failed!"
    exit 1
fi