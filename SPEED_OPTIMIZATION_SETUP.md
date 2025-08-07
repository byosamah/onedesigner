# Speed Optimization Setup Guide

This guide will help you set up and test the optimized matching system with <50ms initial results.

## Overview

The optimized matching system uses a three-phase progressive enhancement approach:
1. **Instant Match** (<50ms) - Local scoring + embeddings
2. **Refined Match** (~500ms) - Quick AI scoring
3. **Final Match** (~2s) - Deep AI analysis

## Setup Steps

### 1. Run Database Migration

First, run the speed optimization migration to create necessary tables and indexes:

```bash
# Connect to your Supabase database
psql $DATABASE_URL < supabase/migrations/007_speed_optimization_tables.sql
```

This creates:
- `designer_embeddings` table for pre-computed embeddings
- `match_cache` table for caching match results
- `designer_quick_stats` materialized view for fast lookups
- Performance indexes on all tables

### 2. Configure Environment Variables

Add the following to your `.env.local`:

```bash
# Cron job secret for securing embedding endpoints
CRON_SECRET="your-secure-random-string"

# Ensure DeepSeek API key is set
DEEPSEEK_API_KEY="sk-your-api-key"
```

### 3. Set Up Cron Jobs

#### Option A: Vercel Cron (Recommended for Production)

The `vercel.json` is already configured. Deploy to Vercel:

```bash
vercel deploy --prod
```

Vercel will automatically run the embedding cron job hourly.

#### Option B: External Cron Service

Use a service like cron-job.org or GitHub Actions:

```bash
# Example curl command for manual testing
curl -X GET https://your-domain.com/api/cron/embeddings \
  -H "x-cron-secret: your-secure-random-string"
```

#### Option C: Local Development

For local testing, manually trigger the cron job:

```bash
# Create a test script
node -e "
  fetch('http://localhost:3000/api/cron/embeddings', {
    headers: { 'x-cron-secret': process.env.CRON_SECRET }
  }).then(r => r.json()).then(console.log)
"
```

### 4. Test the Optimized Matching

1. **Enable Optimized Matching**
   
   The system automatically uses optimized matching on the `/match` page.

2. **Monitor Performance**
   
   Visit the performance dashboard:
   ```
   http://localhost:3000/admin/performance
   ```

3. **Test Progressive Enhancement**
   
   Create a new match and watch the phases:
   - Instant result appears immediately
   - Score refines after ~500ms
   - Final analysis completes in ~2s

### 5. Performance Monitoring

The system tracks performance metrics automatically:

- **Instant Match Target**: <50ms
- **Refined Match Target**: <500ms  
- **Final Match Target**: <2s

View real-time metrics at `/admin/performance`

## Testing Checklist

- [ ] Database migration completed successfully
- [ ] Environment variables configured
- [ ] Cron job tested (embeddings pre-computed)
- [ ] Create a new brief and see instant match (<50ms)
- [ ] Watch progressive enhancement (instant → refined → final)
- [ ] Check performance dashboard shows metrics
- [ ] Verify match quality improves with each phase

## Troubleshooting

### Slow Initial Matches
1. Check if embeddings are pre-computed: 
   ```sql
   SELECT COUNT(*) FROM designer_embeddings;
   ```
2. Refresh materialized view:
   ```sql
   SELECT refresh_designer_quick_stats();
   ```

### No Streaming Updates
1. Check browser console for EventSource errors
2. Verify `/api/match/find-optimized` returns SSE headers
3. Try the fallback POST endpoint

### High Database Query Time
1. Check indexes are created:
   ```sql
   \di designer*
   ```
2. Analyze slow queries:
   ```sql
   EXPLAIN ANALYZE SELECT * FROM designers WHERE is_approved = true;
   ```

## Production Deployment

1. **Set Production CRON_SECRET**
   ```bash
   vercel env add CRON_SECRET production
   ```

2. **Configure Monitoring**
   - Set up alerts for P95 > 100ms on instant matches
   - Monitor cache hit rate (target >60%)
   - Track AI success rate (target >95%)

3. **Scale Considerations**
   - Increase `maxDuration` in vercel.json if needed
   - Consider Redis for distributed caching
   - Use CDN for static designer data

## Next Steps

After setup:
1. Monitor performance metrics for a week
2. Tune scoring weights based on match feedback
3. Adjust cache TTLs based on usage patterns
4. Consider adding more materialized views for common queries