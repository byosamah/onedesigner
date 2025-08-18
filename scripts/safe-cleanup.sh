#!/bin/bash

echo "🧹 OneDesigner Data Cleanup Tool"
echo "================================="
echo ""
echo "⚠️  WARNING: This will DELETE ALL designers and clients data!"
echo "This includes:"
echo "  - All designer profiles and applications"
echo "  - All client accounts and briefs"
echo "  - All matches and project requests"
echo "  - All related authentication tokens"
echo "  - All portfolio images"
echo ""
echo "This action CANNOT be undone!"
echo ""

# Check if SUPABASE_SERVICE_ROLE_KEY is set
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set."
    echo "Please set it before running this script."
    exit 1
fi

# First confirmation
read -p "Are you absolutely sure you want to proceed? (type 'yes' to continue): " confirm1
if [ "$confirm1" != "yes" ]; then
    echo "❌ Cleanup cancelled."
    exit 0
fi

# Second confirmation
echo ""
echo "⚠️  FINAL WARNING: All production data will be lost!"
read -p "Type 'DELETE ALL DATA' to confirm: " confirm2
if [ "$confirm2" != "DELETE ALL DATA" ]; then
    echo "❌ Cleanup cancelled."
    exit 0
fi

echo ""
echo "🚀 Starting cleanup process..."
echo ""

# Run the cleanup script with confirmation
CONFIRM_CLEANUP=yes node scripts/cleanup-all-data.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Cleanup completed successfully!"
    echo "The database has been reset to a clean state."
else
    echo ""
    echo "❌ Cleanup failed. Please check the error messages above."
    exit 1
fi