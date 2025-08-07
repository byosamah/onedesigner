# Production CRON_SECRET Configuration

## Overview
The CRON_SECRET is used to secure the embedding precomputation endpoint that runs hourly to optimize match performance.

## Generated Production CRON_SECRET
```
xdPY7WE2iyI0kRGALWCbVx/rK09M4KHt1ni1b5tv6wo=
```

## Setup Instructions

### 1. For Vercel Deployment

Add the CRON_SECRET to your Vercel environment variables:

```bash
# Using Vercel CLI
vercel env add CRON_SECRET production

# Then paste the secret when prompted:
# xdPY7WE2iyI0kRGALWCbVx/rK09M4KHt1ni1b5tv6wo=
```

Or via Vercel Dashboard:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add new variable:
   - Name: `CRON_SECRET`
   - Value: `xdPY7WE2iyI0kRGALWCbVx/rK09M4KHt1ni1b5tv6wo=`
   - Environment: Production

### 2. For Other Deployments

Add to your production environment:

```bash
# .env.production
CRON_SECRET="xdPY7WE2iyI0kRGALWCbVx/rK09M4KHt1ni1b5tv6wo="
```

### 3. Verify Cron Job Setup

The cron job is already configured in `vercel.json`:
- Runs hourly at minute 0
- Endpoint: `/api/cron/embeddings`
- Max duration: 300 seconds (5 minutes)

### 4. Test the Cron Endpoint

After deployment, test the endpoint:

```bash
curl -X GET https://your-domain.vercel.app/api/cron/embeddings \
  -H "x-cron-secret: xdPY7WE2iyI0kRGALWCbVx/rK09M4KHt1ni1b5tv6wo="
```

Expected response:
```json
{
  "success": true,
  "processed": 10,
  "cached": 5,
  "duration": "2.5s"
}
```

### 5. Monitor Cron Execution

Check cron job execution in Vercel:
1. Go to Functions tab in Vercel dashboard
2. Look for `/api/cron/embeddings` executions
3. Verify hourly runs are successful

## Security Notes

- **NEVER** commit this secret to version control
- **NEVER** share this secret publicly
- Rotate the secret if compromised
- The secret is only used for cron job authentication

## What This Enables

With the CRON_SECRET configured:
- Designer embeddings are precomputed hourly
- Match results appear in <50ms (instant)
- Progressive enhancement provides refined results
- Better user experience with no waiting

## Troubleshooting

If cron jobs aren't running:
1. Check Vercel logs for errors
2. Verify CRON_SECRET is set correctly
3. Ensure the endpoint returns 200 status
4. Check that database has write permissions

## Alternative: Manual Trigger

For immediate embedding computation:

```bash
# Replace with your actual domain
curl -X GET https://onedesigner.vercel.app/api/cron/embeddings \
  -H "x-cron-secret: xdPY7WE2iyI0kRGALWCbVx/rK09M4KHt1ni1b5tv6wo="
```

---

**Important**: Save this secret securely. You'll need it for production deployment!