#!/bin/bash

# Migration script to add profile edit tracking

echo "Running profile edit tracking migration..."

# Create SQL file with migration
cat > profile_edit_migration.sql << 'EOF'
-- Add fields to track profile edits after approval
ALTER TABLE designers 
ADD COLUMN IF NOT EXISTS last_approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS edited_after_approval BOOLEAN DEFAULT FALSE;

-- Update existing approved designers to have last_approved_at
UPDATE designers 
SET last_approved_at = updated_at 
WHERE is_approved = true AND last_approved_at IS NULL;

-- Show results
SELECT 
  first_name, 
  last_name, 
  is_approved, 
  edited_after_approval,
  last_approved_at
FROM designers 
WHERE is_approved = false 
LIMIT 10;
EOF

# Run the migration using the Supabase API
echo "Executing migration via Supabase..."

# Note: This would normally be run via psql or Supabase dashboard
echo "Migration SQL has been created in profile_edit_migration.sql"
echo "Please run this in your Supabase SQL editor or via psql"

chmod +x run_profile_edit_migration.sh