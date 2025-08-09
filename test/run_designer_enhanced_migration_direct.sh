#!/bin/bash

echo "🔄 Running designer enhanced fields migration..."
echo "This will add missing columns and create new tables for designer attributes"
echo ""

# Database connection details
DB_HOST="db.frwchtwxpnrlpzksupgm.supabase.co"
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="onedesigner2025!"

# Run the migration using psql
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f supabase/migrations/010_add_designer_enhanced_fields.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "The following have been created/updated:"
    echo "- Added enhanced fields to designers table (portfolio URLs, preferences, etc.)"
    echo "- Created designer_styles table"
    echo "- Created designer_project_types table"
    echo "- Created designer_industries table"
    echo "- Created designer_specializations table"
    echo "- Created designer_software_skills table"
    echo "- Added indexes for better performance"
    echo ""
    echo "The designer application flow is now ready to use!"
else
    echo "❌ Migration failed!"
    exit 1
fi