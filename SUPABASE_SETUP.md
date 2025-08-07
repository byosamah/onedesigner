# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click "New Project"
3. Fill in:
   - Project name: `onedesigner`
   - Database password: (save this securely!)
   - Region: Choose closest to your users
4. Click "Create new project" and wait for setup

## 2. Get Your API Keys

After project creation:
1. Go to Settings → API
2. Copy these values to your `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   ```

## 3. Get Database URL

1. Go to Settings → Database
2. Copy the "Connection string" → "URI"
3. Add to `.env.local`:
   ```
   DATABASE_URL=<your-database-url>
   ```

## 4. Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended)
1. Go to SQL Editor in Supabase Dashboard
2. Copy and paste each migration file in order:
   - First: `supabase/migrations/001_initial_schema.sql`
   - Then: `supabase/migrations/002_rls_policies.sql`
3. Click "Run" for each

### Option B: Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref <your-project-ref>

# Run migrations
supabase db push
```

## 5. Configure Email Settings (Optional for Development)

For production email sending:
1. Get a Resend API key from [resend.com](https://resend.com)
2. Add to `.env.local`:
   ```
   RESEND_API_KEY=<your-resend-api-key>
   ```

For development, OTPs will be logged to the console.

## 6. Test Your Setup

1. Restart your Next.js dev server:
   ```bash
   npm run dev
   ```

2. Visit http://localhost:3000
3. Try the client flow:
   - Click "I need a designer"
   - Fill out the brief
   - Enter your email
   - Check console for OTP (in development)
   - Enter the OTP

## 7. Common Issues

### "Failed to send OTP" error
- Check your Supabase credentials in `.env.local`
- Ensure tables are created (run migrations)

### "Invalid or expired code" error
- OTPs expire after 10 minutes
- Check console for the correct OTP
- Make sure you're using the latest code

### Database connection errors
- Verify your DATABASE_URL is correct
- Check if your Supabase project is active
- Ensure your IP is allowed (check Database Settings → Connection Pooling)

## 8. Next Steps

1. Set up Lemon Squeezy for payments
2. Configure OpenAI for AI matching
3. Set up Resend for production emails
4. Deploy to Vercel

## Development Tips

- OTPs are logged to console in development (when RESEND_API_KEY is not set)
- Use `npx prisma studio` to view your database
- Check Supabase Dashboard → Table Editor to see your data
- Monitor API usage in Supabase Dashboard → Usage