# Speed Optimization Migration Guide

## Step 1: Run the Database Migration

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `/supabase/migrations/007_speed_optimization_tables.sql`
4. Run the migration

This will create:
- `designer_embeddings` table
- `match_cache` table
- `designer_quick_stats` materialized view
- Performance indexes

## Step 2: Verify Migration

Run this query to verify the tables were created:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('designer_embeddings', 'match_cache');

-- Check materialized view
SELECT matviewname 
FROM pg_matviews 
WHERE schemaname = 'public' 
AND matviewname = 'designer_quick_stats';

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW designer_quick_stats;
```

## Step 3: Initial Data Population

```sql
-- Populate quick stats for existing designers
REFRESH MATERIALIZED VIEW CONCURRENTLY designer_quick_stats;

-- Clean any expired cache entries
SELECT clean_expired_cache();
```