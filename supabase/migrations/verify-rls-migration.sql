-- Verification script for RLS migration
-- Run this after applying the migration to confirm everything is working

-- 1. Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'designers';

-- 2. List all policies on designers table
SELECT pol.polname, pol.polcmd, pol.polroles, pol.polqual, pol.polwithcheck
FROM pg_policy pol
JOIN pg_class pc ON pol.polrelid = pc.oid
WHERE pc.relname = 'designers';

-- 3. Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'designers' AND schemaname = 'public';

-- 4. Test queries (adjust designer ID as needed)
-- This should return only approved designers when not authenticated
SELECT id, first_name, last_name, is_approved 
FROM public.designers 
LIMIT 5;

-- 5. Count approved vs total designers
SELECT 
    COUNT(*) as total_designers,
    COUNT(CASE WHEN is_approved = true THEN 1 END) as approved_designers
FROM public.designers;