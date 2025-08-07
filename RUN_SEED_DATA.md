# Run Designer Seed Data

To populate your database with sample designers, run this SQL in your Supabase SQL Editor:

1. Go to [SQL Editor](https://supabase.com/dashboard/project/frwchtwxpnrlpzksupgm/sql/new)
2. Copy the entire contents of `/supabase/seeds/designers.sql`
3. Paste and run it

This will create 5 sample designers with different specialties:
- Sarah Chen - Brand Identity (San Francisco)
- Michael Rodriguez - UI/UX (New York)
- Emma Thompson - Product Design (London)
- David Kim - Visual Design (Seoul)
- Lisa Martinez - Web Design (Barcelona)

After running the seed data, test the full flow:
1. Go to http://localhost:3000
2. Click "I need a designer"
3. Fill out the brief
4. Enter your email
5. Get OTP from console
6. See your matched designer!