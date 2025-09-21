-- =============================================
-- ONEDESIGNER DATABASE CLEANUP VERIFICATION
-- Check which tables actually exist vs. code references
-- =============================================

-- Step 1: List all existing tables in public schema
SELECT
    'EXISTING TABLE' as status,
    table_name,
    CASE
        WHEN table_name IN ('designers', 'clients', 'briefs', 'matches', 'project_requests', 'payments') THEN 'CORE_BUSINESS'
        WHEN table_name IN ('designer_embeddings', 'match_cache', 'auth_tokens', 'otp_codes') THEN 'PERFORMANCE'
        WHEN table_name IN ('client_designers', 'designer_notifications', 'portfolios') THEN 'FEATURES'
        WHEN table_name IN ('email_queue', 'rate_limits', 'audit_logs') THEN 'SYSTEM'
        ELSE 'UNKNOWN_PURPOSE'
    END as category
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY category, table_name;

-- Step 2: Check table sizes and usage patterns
SELECT
    schemaname,
    tablename,
    attname as column_name,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
    AND tablename IN (
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
    )
ORDER BY tablename, attname;

-- Step 3: Check for empty or near-empty tables
SELECT
    schemaname,
    tablename,
    n_tup_ins as total_inserts,
    n_tup_upd as total_updates,
    n_tup_del as total_deletes,
    n_live_tup as current_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup ASC;

-- Step 4: Identify potential cleanup candidates
WITH table_analysis AS (
    SELECT
        tablename,
        n_live_tup as row_count,
        CASE
            WHEN n_live_tup = 0 THEN 'EMPTY_TABLE'
            WHEN n_live_tup < 10 THEN 'NEARLY_EMPTY'
            WHEN n_live_tup < 100 THEN 'LOW_USAGE'
            ELSE 'ACTIVE_TABLE'
        END as usage_status
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
)
SELECT
    'CLEANUP_CANDIDATE' as analysis_type,
    tablename,
    row_count,
    usage_status,
    CASE
        WHEN tablename IN ('custom_otps', 'match_unlocks', 'designer_requests') THEN 'PHASE_1_SAFE_REMOVAL'
        WHEN tablename IN ('blog_posts', 'activity_log', 'match_analytics', 'credit_purchases') THEN 'PHASE_2_VERIFY_FIRST'
        WHEN tablename IN ('conversations', 'messages', 'admin_users') THEN 'PHASE_3_CODE_CLEANUP_NEEDED'
        WHEN tablename LIKE 'designer_%' AND tablename NOT IN ('designers', 'designer_embeddings', 'designer_notifications') THEN 'PHASE_4_DATA_MIGRATION_NEEDED'
        ELSE 'CORE_TABLE_KEEP'
    END as cleanup_phase
FROM table_analysis
ORDER BY
    CASE cleanup_phase
        WHEN 'PHASE_1_SAFE_REMOVAL' THEN 1
        WHEN 'PHASE_2_VERIFY_FIRST' THEN 2
        WHEN 'PHASE_3_CODE_CLEANUP_NEEDED' THEN 3
        WHEN 'PHASE_4_DATA_MIGRATION_NEEDED' THEN 4
        ELSE 5
    END,
    tablename;

-- Step 5: Check for unused columns in core tables
SELECT
    'COLUMN_ANALYSIS' as type,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('designers', 'clients', 'briefs', 'matches', 'project_requests')
ORDER BY table_name, ordinal_position;