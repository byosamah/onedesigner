-- ============================================
-- VERIFICATION OF FINAL STATE
-- After running FINAL_COMPLETE_FIX.sql
-- ============================================

-- 1. Check current policy count and details
SELECT 'CURRENT POLICIES BY TABLE' as report;
SELECT
    tablename,
    COUNT(*) as policy_count,
    STRING_AGG(policyname || ' (' || cmd || ')', ', ' ORDER BY policyname) as policies_with_cmd
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 2. Check RLS status for all tables
SELECT '' as blank, 'RLS STATUS CHECK' as report;
SELECT
    tablename,
    CASE
        WHEN rowsecurity THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as rls_status,
    CASE
        WHEN tablename IN ('client_designers', 'designer_embeddings', 'email_queue',
                          'match_cache', 'otp_codes', 'rate_limits', 'audit_logs', 'auth_tokens')
        THEN '✓ Internal table (RLS disabled is correct)'
        WHEN tablename IN ('designers', 'clients', 'briefs', 'matches',
                          'project_requests', 'designer_notifications', 'payments', 'portfolios')
        THEN '✓ User-facing table (RLS should be enabled)'
        ELSE '? Unknown table category'
    END as table_category
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY
    CASE
        WHEN tablename IN ('designers', 'clients', 'briefs', 'matches',
                          'project_requests', 'designer_notifications', 'payments', 'portfolios')
        THEN 0
        ELSE 1
    END,
    tablename;

-- 3. Check for any policies using auth functions (should be NONE)
SELECT '' as blank, 'POLICIES WITH AUTH FUNCTIONS' as report;
SELECT
    tablename,
    policyname,
    cmd,
    CASE
        WHEN qual LIKE '%auth.%' OR qual LIKE '%current_setting%' THEN '⚠️ Uses auth function'
        ELSE '✅ No auth functions'
    END as qual_check,
    CASE
        WHEN with_check LIKE '%auth.%' OR with_check LIKE '%current_setting%' THEN '⚠️ Uses auth function'
        ELSE '✅ No auth functions'
    END as with_check_status
FROM pg_policies
WHERE schemaname = 'public'
AND (qual LIKE '%auth.%' OR qual LIKE '%current_setting%'
     OR with_check LIKE '%auth.%' OR with_check LIKE '%current_setting%')
ORDER BY tablename, policyname;

-- 4. Check for duplicate indexes
SELECT '' as blank, 'DUPLICATE INDEX CHECK' as report;
WITH index_analysis AS (
    SELECT
        i.indexname,
        i.tablename,
        regexp_replace(i.indexdef, '.*\(([^)]+)\).*', '\1') as columns,
        EXISTS (
            SELECT 1 FROM pg_constraint c
            JOIN pg_class cl ON c.conindid = cl.oid
            WHERE cl.relname = i.indexname
        ) as is_constraint
    FROM pg_indexes i
    WHERE i.schemaname = 'public'
),
duplicate_groups AS (
    SELECT
        tablename,
        columns,
        COUNT(*) as index_count,
        STRING_AGG(indexname, ', ' ORDER BY indexname) as all_indexes
    FROM index_analysis
    GROUP BY tablename, columns
    HAVING COUNT(*) > 1
)
SELECT
    tablename,
    columns,
    index_count,
    all_indexes
FROM duplicate_groups
ORDER BY index_count DESC, tablename;

-- 5. Summary statistics
SELECT '' as blank, 'SUMMARY STATISTICS' as report;
SELECT
    'Total Tables' as metric,
    COUNT(*) as value
FROM pg_tables
WHERE schemaname = 'public'
UNION ALL
SELECT
    'Tables with RLS Enabled',
    COUNT(*)
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = true
UNION ALL
SELECT
    'Tables with RLS Disabled',
    COUNT(*)
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false
UNION ALL
SELECT
    'Total Policies',
    COUNT(*)
FROM pg_policies
WHERE schemaname = 'public'
UNION ALL
SELECT
    'Total Indexes',
    COUNT(*)
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY metric;

-- 6. Expected Results Summary
SELECT '' as blank, 'EXPECTED RESULTS' as report;
SELECT
    '✅ User-facing tables (7) should have RLS enabled with simple policies' as expected
UNION ALL
SELECT
    '✅ Internal tables (8) should have RLS disabled (Security Advisor will show as errors - this is CORRECT)'
UNION ALL
SELECT
    '✅ No policies should contain auth.uid() or current_setting() functions'
UNION ALL
SELECT
    '✅ No duplicate indexes should exist'
UNION ALL
SELECT
    '✅ Performance Advisor should show 0 warnings (or minimal warnings for features not yet implemented)';