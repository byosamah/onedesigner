#!/bin/bash

echo "🔄 Running working preferences migration..."
echo "This will add update_frequency, feedback_style, and change_flexibility columns to the briefs table"
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    source .env.local
fi

# Use Supabase CLI to run the migration
supabase db execute --sql "$(cat supabase/migrations/009_add_working_preference_fields.sql)"

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "The briefs table now has:"
    echo "- update_frequency: How often the client wants updates"
    echo "- feedback_style: Client's preferred feedback style"
    echo "- change_flexibility: How flexible the client is with changes"
    echo ""
    echo "These fields are now stored as columns for better querying performance."
else
    echo "❌ Migration failed!"
    exit 1
fi