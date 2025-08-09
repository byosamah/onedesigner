-- OneDesigner Database Cleanup Script
-- This script removes all client and designer data while preserving table structure
-- WARNING: This will permanently delete all data!

-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Clean up dependent tables first (in order of dependencies)

-- 1. Clean designer-related tables
DELETE FROM designer_requests;
DELETE FROM designer_portfolios;
DELETE FROM designer_embeddings;
DELETE FROM designer_quick_stats;

-- 2. Clean client-related tables
DELETE FROM client_designers;
DELETE FROM matches;
DELETE FROM briefs;

-- 3. Clean payment/transaction tables
DELETE FROM payments;
DELETE FROM transactions;

-- 4. Clean auth-related tables
DELETE FROM auth_tokens;
DELETE FROM admin_sessions;
DELETE FROM designer_sessions;
DELETE FROM client_sessions;

-- 5. Clean main tables
DELETE FROM designers;
DELETE FROM clients;

-- 6. Clean cache tables
DELETE FROM match_cache;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Reset sequences to start from 1 (optional)
-- Uncomment if you want IDs to start from 1 again
/*
ALTER SEQUENCE designers_id_seq RESTART WITH 1;
ALTER SEQUENCE clients_id_seq RESTART WITH 1;
ALTER SEQUENCE briefs_id_seq RESTART WITH 1;
ALTER SEQUENCE matches_id_seq RESTART WITH 1;
ALTER SEQUENCE designer_requests_id_seq RESTART WITH 1;
ALTER SEQUENCE designer_portfolios_id_seq RESTART WITH 1;
ALTER SEQUENCE payments_id_seq RESTART WITH 1;
ALTER SEQUENCE transactions_id_seq RESTART WITH 1;
*/

-- Verify cleanup
SELECT 
    'designers' as table_name, COUNT(*) as record_count FROM designers
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'briefs', COUNT(*) FROM briefs
UNION ALL
SELECT 'matches', COUNT(*) FROM matches
UNION ALL
SELECT 'designer_requests', COUNT(*) FROM designer_requests
UNION ALL
SELECT 'client_designers', COUNT(*) FROM client_designers
UNION ALL
SELECT 'designer_portfolios', COUNT(*) FROM designer_portfolios
UNION ALL
SELECT 'designer_embeddings', COUNT(*) FROM designer_embeddings
UNION ALL
SELECT 'match_cache', COUNT(*) FROM match_cache
ORDER BY table_name;