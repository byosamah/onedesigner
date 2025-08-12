-- OneDesigner Database Cleanup Script
-- This script removes all client and designer data

BEGIN;

-- Delete all related data first (foreign key constraints)
DELETE FROM project_requests;
DELETE FROM client_designers;
DELETE FROM matches;
DELETE FROM briefs;
DELETE FROM designer_quick_stats;
DELETE FROM designer_embeddings;
DELETE FROM match_cache;
DELETE FROM auth_tokens;

-- Delete main tables
DELETE FROM clients;
DELETE FROM designers;

-- Reset any sequences if needed
-- ALTER SEQUENCE clients_id_seq RESTART WITH 1;
-- ALTER SEQUENCE designers_id_seq RESTART WITH 1;

COMMIT;

-- Verify cleanup
SELECT 'Clients remaining: ' || COUNT(*) FROM clients
UNION ALL
SELECT 'Designers remaining: ' || COUNT(*) FROM designers
UNION ALL
SELECT 'Briefs remaining: ' || COUNT(*) FROM briefs
UNION ALL
SELECT 'Matches remaining: ' || COUNT(*) FROM matches
UNION ALL
SELECT 'Project requests remaining: ' || COUNT(*) FROM project_requests
UNION ALL
SELECT 'Client-Designer links remaining: ' || COUNT(*) FROM client_designers;