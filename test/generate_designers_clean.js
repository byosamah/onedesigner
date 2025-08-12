const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Supabase configuration
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Name pools for realistic diversity
const firstNames = {
  male: ['James', 'John', 'Robert', 'Michael', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Christopher', 
         'Daniel', 'Matthew', 'Anthony', 'Mark', 'Paul', 'Steven', 'Andrew', 'Kenneth', 'Joshua', 'Kevin',
         'Carlos', 'Juan', 'Pedro', 'Luis', 'Miguel', 'Ahmed', 'Muhammad', 'Ali', 'Hassan', 'Omar',
         'Hiroshi', 'Takeshi', 'Kenji', 'Chen', 'Wei', 'Zhang', 'Raj', 'Arjun', 'Priya', 'Dmitri'],
  female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
           'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle',
           'Maria', 'Sofia', 'Ana', 'Carmen', 'Rosa', 'Fatima', 'Aisha', 'Zara', 'Layla', 'Noor',
           'Yuki', 'Sakura', 'Mei', 'Lin', 'Xiao', 'Priya', 'Anjali', 'Deepa', 'Nina', 'Olga']
};

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                   'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris',
                   'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright',
                   'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Gonzalez', 'Nelson', 'Carter', 'Mitchell',
                   'Nakamura', 'Yamamoto', 'Tanaka', 'Suzuki', 'Kim', 'Park', 'Chen', 'Wang', 'Singh', 'Patel',
                   'Dubois', 'Muller', 'Schmidt', 'Petrov', 'Ivanov', 'Novak', 'Kowalski', 'Andersson', 'Nielsen', 'Silva'];

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'London', 'Manchester', 'Birmingham', 'Edinburgh', 'Bristol',
  'Paris', 'Lyon', 'Berlin', 'Munich', 'Hamburg',
  'Toronto', 'Vancouver', 'Montreal', 'Sydney', 'Melbourne',
  'Tokyo', 'Osaka', 'Seoul', 'Singapore', 'Hong Kong',
  'Mumbai', 'Delhi', 'Bangalore', 'Dubai', 'Tel Aviv',
  'Stockholm', 'Copenhagen', 'Amsterdam', 'Brussels', 'Zurich',
  'Milan', 'Rome', 'Barcelona', 'Madrid', 'Lisbon'
];

const countries = [
  'USA', 'USA', 'USA', 'USA', 'USA',
  'UK', 'UK', 'UK', 'UK', 'UK',
  'France', 'France', 'Germany', 'Germany', 'Germany',
  'Canada', 'Canada', 'Canada', 'Australia', 'Australia',
  'Japan', 'Japan', 'South Korea', 'Singapore', 'China',
  'India', 'India', 'India', 'UAE', 'Israel',
  'Sweden', 'Denmark', 'Netherlands', 'Belgium', 'Switzerland',
  'Italy', 'Italy', 'Spain', 'Spain', 'Portugal'
];

// Category-specific data
const categoryData = {
  'Graphic Design': {
    styles: ['Minimalist', 'Modern', 'Vintage', 'Retro', 'Abstract', 'Geometric', 'Hand-drawn', 'Corporate',
             'Playful', 'Elegant', 'Bold', 'Organic', 'Grunge', 'Flat Design', 'Material Design'],
    tools: ['Adobe Illustrator', 'Adobe Photoshop', 'Adobe InDesign', 'Sketch', 'Figma', 'Canva', 'CorelDRAW',
            'Affinity Designer', 'Procreate', 'Adobe XD'],
    industries: ['Fashion', 'Food & Beverage', 'Technology', 'Healthcare', 'Finance', 'Real Estate', 'Education',
                 'Entertainment', 'Sports', 'Non-profit', 'Retail', 'Hospitality', 'Automotive', 'Beauty']
  },
  'Web Design': {
    styles: ['Modern', 'Minimalist', 'Corporate', 'Creative', 'Dark Mode', 'Colorful', 'Brutalist',
             'Neumorphic', 'Glassmorphism', 'Flat', 'Material Design', 'Swiss Design', 'Retro'],
    tools: ['Figma', 'Adobe XD', 'Sketch', 'Webflow', 'WordPress', 'Elementor', 'Wix', 'Squarespace',
            'VS Code', 'Chrome DevTools', 'Bootstrap', 'Tailwind CSS'],
    industries: ['E-commerce', 'SaaS', 'Technology', 'Education', 'Healthcare', 'Finance', 'Real Estate',
                 'Media', 'Non-profit', 'Consulting', 'Agency', 'Startups', 'Enterprise', 'Government']
  },
  'UI/UX Design': {
    styles: ['Clean', 'Modern', 'Minimalist', 'Material Design', 'Human Interface', 'Flat Design',
             'Skeuomorphic', 'Neumorphic', 'Dark UI', 'Colorful', 'Accessible', 'Data-Driven'],
    tools: ['Figma', 'Sketch', 'Adobe XD', 'InVision', 'Principle', 'Framer', 'Maze', 'Hotjar',
            'Miro', 'FigJam', 'Zeplin', 'Abstract', 'Marvel', 'Proto.io', 'Axure'],
    industries: ['FinTech', 'HealthTech', 'EdTech', 'E-commerce', 'SaaS', 'Social Media', 'Gaming',
                 'Travel', 'Food Delivery', 'Fitness', 'Entertainment', 'Productivity', 'Enterprise']
  },
  'Product Design': {
    styles: ['Minimalist', 'Functional', 'Sustainable', 'Luxury', 'Industrial', 'Organic', 'Futuristic',
             'Retro', 'Scandinavian', 'Bauhaus', 'Art Deco', 'Biomimicry', 'Modular'],
    tools: ['SolidWorks', 'AutoCAD', 'Fusion 360', 'Rhino', 'KeyShot', 'Blender', 'SketchUp',
            'Adobe Dimension', 'Cinema 4D', 'Substance 3D', 'ZBrush', 'Inventor'],
    industries: ['Consumer Electronics', 'Furniture', 'Automotive', 'Medical Devices', 'Toys', 'Home Appliances',
                 'Sports Equipment', 'Fashion Accessories', 'Packaging', 'IoT Devices', 'Wearables']
  },
  'Motion Design': {
    styles: ['Flat Animation', '3D Realistic', 'Cartoon', 'Abstract', 'Minimalist', 'Retro', 'Glitch',
             'Liquid Motion', 'Stop Motion', 'Isometric', 'Line Art', 'Cel Animation', 'Photo-realistic'],
    tools: ['After Effects', 'Cinema 4D', 'Blender', 'Maya', 'Premiere Pro', 'DaVinci Resolve',
            'Lottie', 'Principle', 'Cavalry', 'Nuke', 'Houdini', 'Substance 3D'],
    industries: ['Film & TV', 'Advertising', 'Gaming', 'Social Media', 'Education', 'Corporate',
                 'Music Industry', 'Sports', 'Technology', 'Healthcare', 'Finance', 'Non-profit']
  },
  'Interior Design': {
    styles: ['Modern', 'Contemporary', 'Traditional', 'Scandinavian', 'Industrial', 'Minimalist', 'Bohemian',
             'Mid-Century Modern', 'Farmhouse', 'Art Deco', 'Mediterranean', 'Japanese', 'Eclectic'],
    tools: ['AutoCAD', 'SketchUp', 'Revit', '3ds Max', 'V-Ray', 'Lumion', 'Chief Architect',
            'ArchiCAD', 'Rhino', 'Enscape', 'Corona Renderer', 'Photoshop'],
    industries: ['Residential', 'Commercial', 'Hospitality', 'Retail', 'Healthcare', 'Education',
                 'Corporate Offices', 'Restaurants', 'Hotels', 'Real Estate', 'Museums', 'Theaters']
  }
};

// Bio templates
const bioTemplates = {
  junior: [
    "Passionate {title} with {years} years of experience. I specialize in creating compelling designs that resonate with target audiences. Proficient in industry-standard tools and always eager to learn new techniques.",
    "Creative professional with {years} years in design. Focused on delivering innovative solutions that meet client objectives. Strong attention to detail and commitment to quality.",
    "Emerging designer with {years} years of experience. Dedicated to creating impactful visual solutions. Quick learner with strong communication skills."
  ],
  mid: [
    "Experienced designer with {years} years creating compelling visual solutions. I've worked with diverse clients across multiple industries, delivering projects that exceed expectations. Expert in modern design tools and methodologies.",
    "Versatile design professional with {years} years of experience. Specialized in creating user-centered designs that drive results. Proven track record of successful project delivery.",
    "Accomplished designer with {years} years delivering high-quality work. Focus on strategic design thinking and creative problem-solving. Strong collaboration skills and client-focused approach."
  ],
  senior: [
    "Award-winning designer with {years}+ years of experience leading major projects for Fortune 500 companies. Expert in design strategy and creative direction. Mentor to emerging designers and thought leader in the industry.",
    "Senior design professional with {years} years of expertise. Led design teams for major brands and startups alike. Specialized in creating scalable design systems and brand identities.",
    "Veteran designer with {years} years shaping visual experiences. Deep expertise in design thinking and innovation. Industry leader with a passion for pushing creative boundaries."
  ]
};

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getExperienceLevel(years) {
  if (years <= 3) return 'junior';
  if (years <= 10) return 'mid';
  return 'senior';
}

function calculateHourlyRate(years, category) {
  const baseRates = {
    'Graphic Design': { min: 30, max: 150 },
    'Web Design': { min: 40, max: 175 },
    'UI/UX Design': { min: 50, max: 200 },
    'Product Design': { min: 60, max: 225 },
    'Motion Design': { min: 50, max: 200 },
    'Interior Design': { min: 45, max: 175 }
  };
  
  const { min, max } = baseRates[category];
  const experienceMultiplier = Math.min(years / 20, 1);
  const variance = Math.random() * 0.3 - 0.15;
  
  const rate = min + (max - min) * experienceMultiplier * (1 + variance);
  return Math.round(rate / 5) * 5;
}

function generateBio(title, years) {
  const level = getExperienceLevel(years);
  const template = getRandomElement(bioTemplates[level]);
  
  return template
    .replace('{title}', title)
    .replace('{years}', years);
}

function generatePortfolioImages(designerId, category) {
  const categorySeeds = {
    'Graphic Design': ['abstract', 'design', 'color'],
    'Web Design': ['tech', 'website', 'digital'],
    'UI/UX Design': ['app', 'interface', 'mobile'],
    'Product Design': ['product', 'object', 'minimal'],
    'Motion Design': ['motion', 'dynamic', 'animation'],
    'Interior Design': ['interior', 'architecture', 'room']
  };
  
  const seeds = categorySeeds[category];
  return [
    `https://picsum.photos/seed/${seeds[0]}-${designerId}/800/600`,
    `https://picsum.photos/seed/${seeds[1]}-${designerId}/800/600`,
    `https://picsum.photos/seed/${seeds[2]}-${designerId}/800/600`
  ];
}

function generateAvatar(firstName, lastName) {
  const name = `${firstName}+${lastName}`;
  const backgrounds = ['264653', '2a9d8f', 'e76f51', 'f4a261', 'e9c46a'];
  const bg = getRandomElement(backgrounds);
  return `https://ui-avatars.com/api/?name=${name}&background=${bg}&color=fff&size=200&bold=true`;
}

async function generateDesigner(category, index) {
  const gender = Math.random() > 0.5 ? 'male' : 'female';
  const firstName = getRandomElement(firstNames[gender]);
  const lastName = getRandomElement(lastNames);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@email.com`;
  
  const yearsExperience = Math.floor(Math.random() * 20) + 1;
  const hourlyRate = calculateHourlyRate(yearsExperience, category);
  
  const catData = categoryData[category];
  const styles = getRandomElements(catData.styles, Math.floor(Math.random() * 4) + 2);
  const tools = getRandomElements(catData.tools, Math.floor(Math.random() * 4) + 2);
  const industries = getRandomElements(catData.industries, Math.floor(Math.random() * 3) + 2);
  
  const title = `${getExperienceLevel(yearsExperience).charAt(0).toUpperCase() + getExperienceLevel(yearsExperience).slice(1)} ${category} Designer`;
  const bio = generateBio(title, yearsExperience);
  
  const cityIndex = Math.floor(Math.random() * cities.length);
  const city = cities[cityIndex];
  const country = countries[cityIndex];
  
  const availability = getRandomElement(['available', 'busy', 'away']);
  const responseTime = getRandomElement(['1 hour', '2 hours', '6 hours', '12 hours', '24 hours']);
  
  const portfolioImages = generatePortfolioImages(index, category);
  const avatar = generateAvatar(firstName, lastName);
  
  const completedProjects = Math.floor(Math.random() * 100) + 10;
  const rating = (4 + Math.random() * 1).toFixed(1);
  
  // Only include columns that exist in the base schema
  return {
    id: uuidv4(),
    email,
    first_name: firstName,
    last_name: lastName,
    last_initial: lastName.charAt(0).toUpperCase(),
    title,
    city,
    country,
    years_experience: yearsExperience,
    rating: parseFloat(rating),
    total_projects: completedProjects,
    avatar_url: avatar,
    phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    website_url: `https://portfolio.${firstName.toLowerCase()}${lastName.toLowerCase()}.com`,
    linkedin_url: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
    bio,
    styles,
    industries,
    tools,
    hourly_rate: hourlyRate,
    availability,
    response_time: responseTime,
    timezone: getRandomElement(['PST', 'EST', 'CST', 'GMT', 'CET', 'JST', 'AEST']),
    is_contactable: true,
    hide_phone: Math.random() > 0.7,
    is_verified: true,
    subscription_tier: yearsExperience > 10 ? 'premium' : (yearsExperience > 5 ? 'pro' : 'free'),
    created_at: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  };
}

async function checkAndAddColumns() {
  console.log('Checking and adding missing columns...');
  
  // Try to add columns that might be missing
  const columnsToAdd = [
    { name: 'is_approved', type: 'BOOLEAN DEFAULT false' },
    { name: 'edited_after_approval', type: 'BOOLEAN DEFAULT false' },
    { name: 'portfolio_url', type: 'VARCHAR(500)' },
    { name: 'dribbble_url', type: 'VARCHAR(500)' },
    { name: 'behance_url', type: 'VARCHAR(500)' },
    { name: 'portfolio_images', type: 'TEXT[]' },
    { name: 'portfolio_image_1', type: 'TEXT' },
    { name: 'portfolio_image_2', type: 'TEXT' },
    { name: 'portfolio_image_3', type: 'TEXT' }
  ];
  
  for (const col of columnsToAdd) {
    try {
      // We'll try to add each column - if it exists, it will fail silently
      const { error } = await supabase.rpc('exec_sql', {
        query: `ALTER TABLE designers ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`
      });
      if (!error) {
        console.log(`✓ Added column ${col.name}`);
      }
    } catch (e) {
      // Column might already exist, that's fine
    }
  }
}

async function insertDesigners(designers) {
  console.log(`\nInserting ${designers.length} designers into database...`);
  
  // First, add any missing columns  
  await checkAndAddColumns();
  
  // Update designers with additional fields if columns were added
  const enhancedDesigners = designers.map(d => ({
    ...d,
    is_approved: true,
    edited_after_approval: false,
    portfolio_url: d.website_url,
    portfolio_images: generatePortfolioImages(d.id, d.title.includes('Graphic') ? 'Graphic Design' : 
                                                     d.title.includes('Web') ? 'Web Design' :
                                                     d.title.includes('UI/UX') ? 'UI/UX Design' :
                                                     d.title.includes('Product') ? 'Product Design' :
                                                     d.title.includes('Motion') ? 'Motion Design' : 'Interior Design'),
    portfolio_image_1: generatePortfolioImages(d.id, 'Graphic Design')[0],
    portfolio_image_2: generatePortfolioImages(d.id, 'Graphic Design')[1],
    portfolio_image_3: generatePortfolioImages(d.id, 'Graphic Design')[2]
  }));
  
  // Insert in batches of 50
  const batchSize = 50;
  let successCount = 0;
  
  for (let i = 0; i < enhancedDesigners.length; i += batchSize) {
    const batch = enhancedDesigners.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('designers')
      .insert(batch);
    
    if (error) {
      console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
      
      // Try inserting without optional fields
      const simpleBatch = batch.map(d => ({
        id: d.id,
        email: d.email,
        first_name: d.first_name,
        last_name: d.last_name,
        last_initial: d.last_initial,
        title: d.title,
        city: d.city,
        country: d.country,
        years_experience: d.years_experience,
        rating: d.rating,
        total_projects: d.total_projects,
        avatar_url: d.avatar_url,
        phone: d.phone,
        website_url: d.website_url,
        linkedin_url: d.linkedin_url,
        bio: d.bio,
        styles: d.styles,
        industries: d.industries,
        tools: d.tools,
        hourly_rate: d.hourly_rate,
        availability: d.availability,
        response_time: d.response_time,
        timezone: d.timezone,
        is_contactable: d.is_contactable,
        hide_phone: d.hide_phone,
        is_verified: d.is_verified,
        subscription_tier: d.subscription_tier
      }));
      
      const { data: simpleData, error: simpleError } = await supabase
        .from('designers')
        .insert(simpleBatch);
      
      if (simpleError) {
        console.error(`Failed to insert even with simple batch:`, simpleError.message);
      } else {
        console.log(`✓ Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} designers) - simplified`);
        successCount += batch.length;
      }
    } else {
      console.log(`✓ Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} designers)`);
      successCount += batch.length;
    }
  }
  
  return successCount > 0;
}

async function main() {
  console.log('🎨 Starting Designer Data Generation...\n');
  
  const categories = Object.keys(categoryData);
  const designersPerCategory = 100;
  const allDesigners = [];
  
  for (const category of categories) {
    console.log(`Generating ${designersPerCategory} ${category} designers...`);
    
    for (let i = 0; i < designersPerCategory; i++) {
      const designer = await generateDesigner(category, allDesigners.length + i);
      allDesigners.push(designer);
    }
    
    console.log(`✓ Generated ${designersPerCategory} ${category} designers`);
  }
  
  console.log(`\nTotal designers generated: ${allDesigners.length}`);
  
  // Insert into database
  const success = await insertDesigners(allDesigners);
  
  if (success) {
    // Verify insertion
    const { count, error } = await supabase
      .from('designers')
      .select('*', { count: 'exact', head: true });
    
    if (!error) {
      console.log(`\n✅ Success! Database now contains ${count} designers`);
    }
  } else {
    console.error('\n❌ Failed to insert all designers into database');
  }
}

main().catch(console.error);