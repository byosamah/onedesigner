-- Delete existing seed data first
DELETE FROM designers WHERE email LIKE '%@example.com';

-- Seed data for designers with is_approved = true
INSERT INTO designers (
  first_name, last_initial, last_name, title, email, 
  city, country, years_experience, rating, total_projects,
  bio, styles, industries, tools, hourly_rate, 
  availability, timezone, is_verified, is_approved, categories, design_philosophy, website_url, calendar_url
) VALUES 
(
  'Sarah', 'C', 'Chen', 'Brand Identity Specialist', 'sarah.chen@example.com',
  'San Francisco', 'USA', 8, 4.9, 47,
  'I specialize in creating memorable brand identities for SaaS companies. Clean, minimal, and impactful design is my forte.',
  ARRAY['minimal', 'modern', 'technical'],
  ARRAY['Technology/SaaS', 'Finance', 'Healthcare'],
  ARRAY['Figma', 'Adobe Creative Suite', 'Webflow'],
  150, 'available', 'PST', true, true, ARRAY['branding-logo-design', 'web-mobile-design'], 'Clean, minimal, and impactful design that tells your brand story',
  'https://sarahchen.design', 'https://calendly.com/sarahchen'
),
(
  'Michael', 'R', 'Rodriguez', 'UI/UX Designer', 'michael.r@example.com',
  'New York', 'USA', 6, 4.8, 35,
  'Passionate about creating intuitive user experiences. I love working on complex dashboard designs and making them simple.',
  ARRAY['modern', 'minimal', 'technical'],
  ARRAY['Technology/SaaS', 'E-commerce', 'Finance'],
  ARRAY['Figma', 'Sketch', 'Framer'],
  125, 'available', 'EST', true, true, ARRAY['web-mobile-design', 'presentations'], 'Making complex systems simple and intuitive for users',
  'https://michaelrodriguez.io', 'https://calendly.com/mrodriguez'
),
(
  'Emma', 'T', 'Thompson', 'Product Designer', 'emma.thompson@example.com',
  'London', 'UK', 10, 4.95, 82,
  'Full-stack product designer with a focus on enterprise software. I bring clarity to complexity.',
  ARRAY['corporate', 'modern', 'minimal'],
  ARRAY['Technology/SaaS', 'Finance', 'Healthcare', 'Enterprise'],
  ARRAY['Figma', 'Principle', 'Miro'],
  175, 'available', 'GMT', true, true, ARRAY['web-mobile-design', 'presentations'], 'Bringing clarity to complexity through thoughtful product design',
  'https://emmathompson.co.uk', 'https://calendly.com/ethompson'
),
(
  'David', 'K', 'Kim', 'Visual Designer', 'david.kim@example.com',
  'Seoul', 'South Korea', 5, 4.7, 28,
  'Bold, playful designs that make brands stand out. Specialist in marketing websites and brand campaigns.',
  ARRAY['playful', 'modern', 'bold'],
  ARRAY['E-commerce', 'Entertainment', 'Fashion', 'Food & Beverage'],
  ARRAY['Adobe Creative Suite', 'Figma', 'After Effects'],
  100, 'available', 'KST', true, true, ARRAY['motion-graphics', 'photography-video'], 'Bold, playful designs that make brands unforgettable',
  'https://davidkim.kr', 'https://calendly.com/dkim'
),
(
  'Lisa', 'M', 'Martinez', 'Web Designer', 'lisa.martinez@example.com',
  'Barcelona', 'Spain', 7, 4.85, 41,
  'Creating beautiful, responsive web designs that convert. Specialized in landing pages and marketing sites.',
  ARRAY['elegant', 'modern', 'minimal'],
  ARRAY['E-commerce', 'Real Estate', 'Fashion', 'Technology/SaaS'],
  ARRAY['Figma', 'Webflow', 'Adobe XD'],
  130, 'available', 'CET', true, true, ARRAY['web-mobile-design', 'social-media-graphics'], 'Beautiful, responsive designs that convert visitors into customers',
  'https://lisamartinez.es', 'https://calendly.com/lmartinez'
);

-- Add sample portfolios for each designer
INSERT INTO portfolios (designer_id, title, description, image_url, project_type, industry, client, featured)
SELECT 
  d.id,
  'SaaS Dashboard Redesign',
  'Complete overhaul of analytics dashboard for B2B SaaS platform',
  'https://placeholder.com/portfolio1.jpg',
  'dashboard',
  'Technology/SaaS',
  'TechCorp',
  true
FROM designers d WHERE d.email = 'sarah.chen@example.com';

INSERT INTO portfolios (designer_id, title, description, image_url, project_type, industry, client, featured)
SELECT 
  d.id,
  'E-commerce Mobile App',
  'Native iOS and Android app design for fashion retailer',
  'https://placeholder.com/portfolio2.jpg',
  'app-design',
  'E-commerce',
  'FashionBrand',
  true
FROM designers d WHERE d.email = 'michael.r@example.com';

INSERT INTO portfolios (designer_id, title, description, image_url, project_type, industry, client, featured)
SELECT 
  d.id,
  'Enterprise CRM Platform',
  'Complex enterprise software made simple and intuitive',
  'https://placeholder.com/portfolio3.jpg',
  'dashboard',
  'Enterprise',
  'EnterpriseCo',
  true
FROM designers d WHERE d.email = 'emma.thompson@example.com';