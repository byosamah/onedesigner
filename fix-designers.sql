-- First delete any existing test data
DELETE FROM designers WHERE email LIKE '%@example.com';

-- Insert test designers with both is_verified and is_approved set to true
INSERT INTO designers (
  first_name, last_initial, last_name, name, title, email, phone,
  city, country, years_experience, bio, styles, industries,
  hourly_rate, availability, timezone, website_url,
  is_verified, is_approved, subscription_tier, rating, total_projects,
  categories, design_philosophy
) VALUES
(
  'Sarah', 'M', 'Mitchell', 'Sarah Mitchell', 'Senior UI/UX Designer',
  'sarah.mitchell@example.com', '+1-555-0123',
  'San Francisco', 'USA', 8,
  'Passionate about creating intuitive and beautiful digital experiences. Specialized in SaaS and mobile app design.',
  ARRAY['Minimalist', 'Modern', 'Clean'],
  ARRAY['Technology', 'SaaS', 'Mobile Apps'],
  150, 'available', 'America/Los_Angeles', 'https://sarahmitchell.design',
  true, true, 'free', 4.8, 47,
  ARRAY['web-mobile-design', 'branding-logo-design'],
  'User-centered design that balances functionality with aesthetics'
),
(
  'Alex', 'C', 'Chen', 'Alex Chen', 'Brand Identity Designer',
  'alex.chen@example.com', '+1-555-0124',
  'New York', 'USA', 6,
  'Creating memorable brand identities that tell your story. From logos to complete brand systems.',
  ARRAY['Bold', 'Playful', 'Contemporary'],
  ARRAY['Startups', 'E-commerce', 'Food & Beverage'],
  120, 'available', 'America/New_York', 'https://alexchen.co',
  true, true, 'free', 4.7, 35,
  ARRAY['branding-logo-design', 'social-media-graphics'],
  'Every brand has a unique story - I help tell it visually'
),
(
  'Emma', 'T', 'Thompson', 'Emma Thompson', 'Product Designer',
  'emma.thompson@example.com', '+44-20-1234-5678',
  'London', 'UK', 10,
  'Full-stack product designer with a focus on user research and data-driven design decisions.',
  ARRAY['Functional', 'User-Centered', 'Accessible'],
  ARRAY['FinTech', 'Healthcare', 'Education'],
  180, 'available', 'Europe/London', 'https://emmathompson.uk',
  true, true, 'free', 4.9, 62,
  ARRAY['web-mobile-design', 'presentations'],
  'Data-driven design decisions that prioritize user needs'
),
(
  'Marcus', 'J', 'Johnson', 'Marcus Johnson', 'Creative Director',
  'marcus.j@example.com', '+1-555-0125',
  'Los Angeles', 'USA', 12,
  'Award-winning creative director specializing in brand campaigns and visual storytelling.',
  ARRAY['Bold', 'Cinematic', 'Innovative'],
  ARRAY['Entertainment', 'Fashion', 'Advertising'],
  250, 'available', 'America/Los_Angeles', 'https://marcusjohnson.studio',
  true, true, 'free', 4.9, 89,
  ARRAY['motion-graphics', 'photography-video'],
  'Visual storytelling that creates emotional connections'
),
(
  'Yuki', 'T', 'Tanaka', 'Yuki Tanaka', 'Mobile App Designer',
  'yuki.tanaka@example.com', '+81-3-1234-5678',
  'Tokyo', 'Japan', 5,
  'Crafting delightful mobile experiences with attention to micro-interactions and animations.',
  ARRAY['Minimal', 'Playful', 'Japanese-inspired'],
  ARRAY['Mobile Apps', 'Gaming', 'Social Media'],
  100, 'available', 'Asia/Tokyo', 'https://yukitanaka.jp',
  true, true, 'free', 4.6, 28,
  ARRAY['web-mobile-design', 'motion-graphics'],
  'Delightful interactions that surprise and engage users'
),
(
  'Sophie', 'L', 'Laurent', 'Sophie Laurent', 'Web Designer',
  'sophie.laurent@example.com', '+33-1-2345-6789',
  'Paris', 'France', 7,
  'Specializing in elegant web designs for luxury brands and high-end e-commerce.',
  ARRAY['Elegant', 'Sophisticated', 'French Chic'],
  ARRAY['Luxury', 'Fashion', 'Beauty'],
  140, 'available', 'Europe/Paris', 'https://sophielaurent.fr',
  true, true, 'free', 4.8, 41,
  ARRAY['web-mobile-design', 'branding-logo-design'],
  'Elegant design that reflects the sophistication of luxury brands'
);

-- Verify the insertion
SELECT id, first_name, last_name, is_verified, is_approved, availability, categories 
FROM designers 
WHERE email LIKE '%@example.com';