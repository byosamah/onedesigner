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
),
(
  'Marcus', 'J', 'Johnson', 'Marcus Johnson', 'Creative Director',
  'marcus.j@example.com', '+1-555-0125',
  'Los Angeles', 'USA', 12,
  'Award-winning creative director specializing in brand campaigns and visual storytelling.',
  ARRAY['Bold', 'Cinematic', 'Innovative'],
  ARRAY['Entertainment', 'Fashion', 'Advertising'],
  250, 'available', 'America/Los_Angeles', 'https://marcusjohnson.studio',
  true, 'free', 4.9, 89
),
(
  'Yuki', 'T', 'Tanaka', 'Yuki Tanaka', 'Mobile App Designer',
  'yuki.tanaka@example.com', '+81-3-1234-5678',
  'Tokyo', 'Japan', 5,
  'Crafting delightful mobile experiences with attention to micro-interactions and animations.',
  ARRAY['Minimal', 'Playful', 'Japanese-inspired'],
  ARRAY['Mobile Apps', 'Gaming', 'Social Media'],
  100, 'available', 'Asia/Tokyo', 'https://yukitanaka.jp',
  true, 'free', 4.6, 28
),
(
  'Sophie', 'L', 'Laurent', 'Sophie Laurent', 'Web Designer',
  'sophie.laurent@example.com', '+33-1-2345-6789',
  'Paris', 'France', 7,
  'Specializing in elegant web designs for luxury brands and high-end e-commerce.',
  ARRAY['Elegant', 'Sophisticated', 'French Chic'],
  ARRAY['Luxury', 'Fashion', 'Beauty'],
  140, 'available', 'Europe/Paris', 'https://sophielaurent.fr',
  true, 'free', 4.8, 41
),
(
  'Diego', 'R', 'Rodriguez', 'Diego Rodriguez', 'UX Researcher & Designer',
  'diego.rodriguez@example.com', '+52-55-1234-5678',
  'Mexico City', 'Mexico', 9,
  'Data-driven designer with expertise in user research and information architecture.',
  ARRAY['Research-based', 'Systematic', 'User-focused'],
  ARRAY['Enterprise', 'B2B', 'Analytics'],
  130, 'available', 'America/Mexico_City', 'https://diegorodriguez.mx',
  true, 'free', 4.7, 53
),
(
  'Olivia', 'P', 'Patel', 'Olivia Patel', 'Illustration & Brand Designer',
  'olivia.patel@example.com', '+91-22-1234-5678',
  'Mumbai', 'India', 4,
  'Bringing brands to life through custom illustrations and unique visual identities.',
  ARRAY['Illustrative', 'Colorful', 'Whimsical'],
  ARRAY['Children''s Products', 'Publishing', 'Non-profit'],
  80, 'available', 'Asia/Kolkata', 'https://oliviapatel.in',
  true, 'free', 4.5, 22
);