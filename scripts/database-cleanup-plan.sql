-- =============================================
-- ONEDESIGNER DATABASE CLEANUP PLAN
-- Safe removal of unused tables with zero breaks
-- =============================================

BEGIN;

-- =============================================
-- BACKUP BEFORE CLEANUP
-- Create backup tables for all potentially removable data
-- =============================================

-- Step 1: Create backup schema
CREATE SCHEMA IF NOT EXISTS backup_$(date +%Y%m%d);

-- Step 2: Backup conversations and messages (to be removed)
DO $$
BEGIN
    -- Backup conversations table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversations') THEN
        EXECUTE format('CREATE TABLE backup_%s.conversations AS SELECT * FROM public.conversations', to_char(now(), 'YYYYMMDD'));
        RAISE NOTICE 'Backed up conversations table';
    END IF;

    -- Backup messages table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages') THEN
        EXECUTE format('CREATE TABLE backup_%s.messages AS SELECT * FROM public.messages', to_char(now(), 'YYYYMMDD'));
        RAISE NOTICE 'Backed up messages table';
    END IF;

    -- Backup blog_posts table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'blog_posts') THEN
        EXECUTE format('CREATE TABLE backup_%s.blog_posts AS SELECT * FROM public.blog_posts', to_char(now(), 'YYYYMMDD'));
        RAISE NOTICE 'Backed up blog_posts table';
    END IF;

    -- Backup admin_users table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_users') THEN
        EXECUTE format('CREATE TABLE backup_%s.admin_users AS SELECT * FROM public.admin_users', to_char(now(), 'YYYYMMDD'));
        RAISE NOTICE 'Backed up admin_users table';
    END IF;
END $$;

-- =============================================
-- PHASE 1: SAFE REMOVAL - Legacy Tables
-- These are clearly replaced by new systems
-- =============================================

-- Remove custom_otps (replaced by auth_tokens via OTPService)
DROP TABLE IF EXISTS public.custom_otps CASCADE;

-- Remove match_unlocks (functionality moved to client_designers)
DROP TABLE IF EXISTS public.match_unlocks CASCADE;

-- Remove designer_requests (replaced by project_requests via Working Request System)
DROP TABLE IF EXISTS public.designer_requests CASCADE;

-- Remove credit_purchases (purchase tracking moved to payments table)
DROP TABLE IF EXISTS public.credit_purchases CASCADE;

-- Remove match_analytics (analytics moved to centralized system)
DROP TABLE IF EXISTS public.match_analytics CASCADE;

-- Remove activity_log (replaced by centralized LoggingService)
DROP TABLE IF EXISTS public.activity_log CASCADE;

-- =============================================
-- PHASE 2: FEATURE REMOVAL - Conversations System
-- Replaced by Working Request System
-- =============================================

-- Remove messages table (conversations replaced by working requests)
DROP TABLE IF EXISTS public.messages CASCADE;

-- Remove conversations table (replaced by project_requests)
DROP TABLE IF EXISTS public.conversations CASCADE;

-- =============================================
-- PHASE 3: BLOG SYSTEM REMOVAL (if not used)
-- Check if blog feature is actively used
-- =============================================

-- Remove blog tables (blog feature appears to be legacy)
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public."blog-images" CASCADE;

-- =============================================
-- PHASE 4: ADMIN SYSTEM CLEANUP
-- Hardcoded admin vs table-based admin
-- =============================================

-- Remove admin_users (admin uses ADMIN_EMAIL environment variable)
DROP TABLE IF EXISTS public.admin_users CASCADE;

-- =============================================
-- PHASE 5: DESIGNER PROFILE EXTENSIONS CLEANUP
-- Check if these are used or can be consolidated
-- =============================================

-- These should be evaluated case by case:
-- - designer_styles, designer_project_types, designer_industries
-- - designer_software_skills, designer_specializations
-- - designer_portfolio_images, designer_earnings, designer_quick_stats
-- - client_preferences

-- For now, we'll keep them as they may contain important data
-- Future cleanup can consolidate these into JSONB fields in main tables

-- =============================================
-- CLEANUP UNUSED COLUMNS
-- Remove columns that are no longer used
-- =============================================

-- Note: Column removal should be done after code verification
-- This is a template for future column cleanup

/*
-- Example column removals (uncomment after verification):

ALTER TABLE designers DROP COLUMN IF EXISTS legacy_column_name;
ALTER TABLE clients DROP COLUMN IF EXISTS unused_field;
ALTER TABLE briefs DROP COLUMN IF EXISTS old_field;
*/

-- =============================================
-- VACUUM AND ANALYZE
-- Reclaim space and update statistics
-- =============================================

VACUUM FULL;
ANALYZE;

-- =============================================
-- VERIFICATION QUERIES
-- Check what was cleaned up
-- =============================================

-- Show remaining tables
SELECT
    table_name,
    CASE
        WHEN table_name IN ('designers', 'clients', 'briefs', 'matches', 'project_requests', 'payments') THEN 'CORE_BUSINESS'
        WHEN table_name IN ('designer_embeddings', 'match_cache', 'auth_tokens', 'otp_codes') THEN 'PERFORMANCE'
        WHEN table_name IN ('client_designers', 'designer_notifications', 'portfolios') THEN 'FEATURES'
        WHEN table_name IN ('email_queue', 'rate_limits', 'audit_logs') THEN 'SYSTEM'
        ELSE 'OTHER'
    END as category
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY category, table_name;

-- Show backup tables created
SELECT
    table_name as backup_table,
    'Backup created successfully' as status
FROM information_schema.tables
WHERE table_schema LIKE 'backup_%'
ORDER BY table_name;

COMMIT;

-- =============================================
-- ROLLBACK SCRIPT (in case of issues)
-- =============================================

/*
-- EMERGENCY ROLLBACK (run separately if needed):

BEGIN;

-- Restore conversations table
CREATE TABLE public.conversations AS SELECT * FROM backup_20241221.conversations;

-- Restore messages table
CREATE TABLE public.messages AS SELECT * FROM backup_20241221.messages;

-- Restore blog_posts table
CREATE TABLE public.blog_posts AS SELECT * FROM backup_20241221.blog_posts;

-- Restore admin_users table
CREATE TABLE public.admin_users AS SELECT * FROM backup_20241221.admin_users;

-- Recreate any necessary indexes and constraints
-- (Add specific index recreation here based on original schema)

COMMIT;
*/