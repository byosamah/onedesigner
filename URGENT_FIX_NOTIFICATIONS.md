# 🚨 URGENT: Fix Contact Designer & Unlock Notifications

## Problem Summary
1. **Contact Designer messages are not being stored** - The `project_requests` table is missing
2. **Designers don't get notified when unlocked** - No notification system in place
3. **Designers don't see messages in dashboard** - The table doesn't exist to fetch from

## Quick Fix Instructions

### Step 1: Run SQL in Supabase
1. Go to: https://app.supabase.com/project/frwchtwxpnrlpzksupgm/sql
2. Copy the SQL from `/test/fix-contact-and-notifications.sql`
3. Paste it in the SQL editor
4. Click "Run"

This will:
- ✅ Create the `project_requests` table for storing contact messages
- ✅ Create the `designer_notifications` table for notifications
- ✅ Set up automatic triggers for notifications
- ✅ Enable Row Level Security (RLS)

### Step 2: Deploy the Code Updates
The code has been updated to:
- Show project requests in designer dashboard (already deployed)
- Create notifications API endpoint
- Properly send emails when contact happens

Run these commands:
```bash
git add -A
git commit -m "fix: Add missing tables and notifications for contact/unlock system"
git push origin main
vercel --prod
```

### Step 3: Test the Flow
1. **Test Contact Flow:**
   - Go to client dashboard
   - Click "Contact Designer" on an unlocked match
   - Send a message
   - Check designer dashboard - should see the message

2. **Test Unlock Notification:**
   - Unlock a designer from client dashboard
   - Check designer dashboard - should see notification

## What Was Missing

### 1. Database Tables
```sql
-- project_requests table (stores contact messages)
-- designer_notifications table (stores all notifications)
```

### 2. Automatic Triggers
```sql
-- Trigger to notify designer when unlocked
-- Trigger to notify designer when contacted
```

### 3. Email Notifications
The email service was already configured but the table was missing so messages couldn't be stored.

## Files Modified
- `/src/app/api/designer/notifications/route.ts` - New API for notifications
- `/test/fix-contact-and-notifications.sql` - SQL to create missing tables
- `/test/test-contact-flow.js` - Test script to verify the fix

## Verification
After running the SQL and deploying:
1. Check that tables exist in Supabase
2. Test contact flow end-to-end
3. Verify designers receive notifications

## Emergency Rollback
If something goes wrong:
```sql
-- Remove the tables (only if needed)
DROP TABLE IF EXISTS public.project_requests CASCADE;
DROP TABLE IF EXISTS public.designer_notifications CASCADE;
```

---
**Created**: Aug 16, 2025
**Priority**: CRITICAL - Users can't communicate
**Status**: Ready to Deploy