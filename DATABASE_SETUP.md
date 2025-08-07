# Database Setup Instructions

## Running Migrations

You need to run the database migrations in Supabase SQL Editor in order:

### 1. Initial Schema (Already run)
- `/supabase/migrations/001_initial_schema.sql`
- Creates core tables: clients, designers, briefs, matches

### 2. Designer Requests (Already run)
- `/supabase/migrations/002_designer_requests.sql`
- Creates designer_requests and match_unlocks tables

### 3. Payments and Credits (NEEDS TO BE RUN)
- `/supabase/migrations/003_payments_and_credits.sql`
- Adds match_credits to clients table
- Creates payments table for Lemon Squeezy integration

To run the payments migration:
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy the contents of `/supabase/migrations/003_payments_and_credits.sql`
4. Paste and run the SQL

## Seeding Test Data

After running migrations, you should seed some test designers:

```sql
-- Insert test designers
INSERT INTO designers (
  first_name, last_initial, last_name, name, title, email, phone,
  city, country, years_experience, bio, styles, industries,
  hourly_rate, availability, timezone, website_url,
  is_verified, subscription_tier, rating, total_projects
) VALUES
(
  'Sarah', 'M', 'Mitchell', 'Sarah Mitchell', 'Senior UI/UX Designer',
  'sarah.mitchell@example.com', '+1-555-0123',
  'San Francisco', 'USA', 8,
  'Passionate about creating intuitive and beautiful digital experiences. Specialized in SaaS and mobile app design.',
  ARRAY['Minimalist', 'Modern', 'Clean'],
  ARRAY['Technology', 'SaaS', 'Mobile Apps'],
  150, 'available', 'America/Los_Angeles', 'https://sarahmitchell.design',
  true, 'free', 4.8, 47
),
(
  'Alex', 'C', 'Chen', 'Alex Chen', 'Brand Identity Designer',
  'alex.chen@example.com', '+1-555-0124',
  'New York', 'USA', 6,
  'Creating memorable brand identities that tell your story. From logos to complete brand systems.',
  ARRAY['Bold', 'Playful', 'Contemporary'],
  ARRAY['Startups', 'E-commerce', 'Food & Beverage'],
  120, 'available', 'America/New_York', 'https://alexchen.co',
  true, 'free', 4.7, 35
),
(
  'Emma', 'T', 'Thompson', 'Emma Thompson', 'Product Designer',
  'emma.thompson@example.com', '+44-20-1234-5678',
  'London', 'UK', 10,
  'Full-stack product designer with a focus on user research and data-driven design decisions.',
  ARRAY['Functional', 'User-Centered', 'Accessible'],
  ARRAY['FinTech', 'Healthcare', 'Education'],
  180, 'busy', 'Europe/London', 'https://emmathompson.uk',
  true, 'free', 4.9, 62
);
```

## Environment Variables

Make sure your `.env.local` has all required variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# AI
AI_PROVIDER=google
GOOGLE_AI_API_KEY=your-google-ai-key

# Lemon Squeezy
LEMONSQUEEZY_API_KEY=your-api-key
LEMONSQUEEZY_STORE_ID=your-store-id
LEMONSQUEEZY_STORE_URL=your-store-url
LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Optional - Email provider
# RESEND_API_KEY=your-resend-key
```

## Testing the Flow

1. Start the dev server: `npm run dev`
2. Go to http://localhost:3000
3. Sign up as a client with your email
4. Create a project brief
5. Get matched with a designer
6. Purchase credits to unlock contact
7. Check designer dashboard at /designer/auth
8. Accept/decline the match request

## Webhook Setup

For production, configure Lemon Squeezy webhook:
- URL: `https://yourdomain.com/api/webhooks/lemonsqueezy`
- Events: order_created, order_refunded
- Add signing secret to `.env.local`