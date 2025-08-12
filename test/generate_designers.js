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
  'New York, USA', 'Los Angeles, USA', 'Chicago, USA', 'Houston, USA', 'Phoenix, USA',
  'London, UK', 'Manchester, UK', 'Birmingham, UK', 'Edinburgh, UK', 'Bristol, UK',
  'Paris, France', 'Lyon, France', 'Berlin, Germany', 'Munich, Germany', 'Hamburg, Germany',
  'Toronto, Canada', 'Vancouver, Canada', 'Montreal, Canada', 'Sydney, Australia', 'Melbourne, Australia',
  'Tokyo, Japan', 'Osaka, Japan', 'Seoul, South Korea', 'Singapore', 'Hong Kong',
  'Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Dubai, UAE', 'Tel Aviv, Israel',
  'Stockholm, Sweden', 'Copenhagen, Denmark', 'Amsterdam, Netherlands', 'Brussels, Belgium', 'Zurich, Switzerland',
  'Milan, Italy', 'Rome, Italy', 'Barcelona, Spain', 'Madrid, Spain', 'Lisbon, Portugal'
];

const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Dutch', 'Swedish', 
                   'Japanese', 'Korean', 'Mandarin', 'Arabic', 'Hindi', 'Russian', 'Polish'];

// Category-specific data
const categoryData = {
  'Graphic Design': {
    specialties: ['Logo Design', 'Brand Identity', 'Print Design', 'Packaging Design', 'Typography', 'Illustration',
                  'Poster Design', 'Business Cards', 'Brochure Design', 'Social Media Graphics', 'Infographics',
                  'Book Cover Design', 'Magazine Layout', 'Label Design', 'Signage Design'],
    tools: ['Adobe Illustrator', 'Adobe Photoshop', 'Adobe InDesign', 'Sketch', 'Figma', 'Canva', 'CorelDRAW',
            'Affinity Designer', 'Procreate', 'Adobe XD'],
    industries: ['Fashion', 'Food & Beverage', 'Technology', 'Healthcare', 'Finance', 'Real Estate', 'Education',
                 'Entertainment', 'Sports', 'Non-profit', 'Retail', 'Hospitality', 'Automotive', 'Beauty'],
    styles: ['Minimalist', 'Modern', 'Vintage', 'Retro', 'Abstract', 'Geometric', 'Hand-drawn', 'Corporate',
             'Playful', 'Elegant', 'Bold', 'Organic', 'Grunge', 'Flat Design', 'Material Design'],
    projectTypes: ['Logo Design', 'Brand Guidelines', 'Marketing Materials', 'Packaging', 'Print Ads', 'Digital Ads']
  },
  'Web Design': {
    specialties: ['Responsive Design', 'E-commerce', 'Landing Pages', 'WordPress', 'Shopify', 'Webflow',
                  'HTML/CSS', 'JavaScript', 'React', 'Vue.js', 'SEO Optimization', 'Web Accessibility',
                  'CMS Development', 'Blog Design', 'Portfolio Sites'],
    tools: ['Figma', 'Adobe XD', 'Sketch', 'Webflow', 'WordPress', 'Elementor', 'Wix', 'Squarespace',
            'VS Code', 'Chrome DevTools', 'Bootstrap', 'Tailwind CSS'],
    industries: ['E-commerce', 'SaaS', 'Technology', 'Education', 'Healthcare', 'Finance', 'Real Estate',
                 'Media', 'Non-profit', 'Consulting', 'Agency', 'Startups', 'Enterprise', 'Government'],
    styles: ['Modern', 'Minimalist', 'Corporate', 'Creative', 'Dark Mode', 'Colorful', 'Brutalist',
             'Neumorphic', 'Glassmorphism', 'Flat', 'Material Design', 'Swiss Design', 'Retro'],
    projectTypes: ['Corporate Website', 'E-commerce Site', 'Landing Page', 'Web App', 'Blog', 'Portfolio']
  },
  'UI/UX Design': {
    specialties: ['User Research', 'Wireframing', 'Prototyping', 'Usability Testing', 'Information Architecture',
                  'Interaction Design', 'Visual Design', 'Design Systems', 'Mobile App Design', 'Web App Design',
                  'Dashboard Design', 'User Flow', 'Journey Mapping', 'Persona Development', 'A/B Testing'],
    tools: ['Figma', 'Sketch', 'Adobe XD', 'InVision', 'Principle', 'Framer', 'Maze', 'Hotjar',
            'Miro', 'FigJam', 'Zeplin', 'Abstract', 'Marvel', 'Proto.io', 'Axure'],
    industries: ['FinTech', 'HealthTech', 'EdTech', 'E-commerce', 'SaaS', 'Social Media', 'Gaming',
                 'Travel', 'Food Delivery', 'Fitness', 'Entertainment', 'Productivity', 'Enterprise'],
    styles: ['Clean', 'Modern', 'Minimalist', 'Material Design', 'Human Interface', 'Flat Design',
             'Skeuomorphic', 'Neumorphic', 'Dark UI', 'Colorful', 'Accessible', 'Data-Driven'],
    projectTypes: ['Mobile App', 'Web Application', 'Dashboard', 'Design System', 'SaaS Platform', 'Redesign']
  },
  'Product Design': {
    specialties: ['Industrial Design', 'Packaging Design', 'Consumer Products', '3D Modeling', 'CAD Design',
                  'Prototyping', 'Manufacturing', 'Sustainable Design', 'Ergonomics', 'Material Selection',
                  'Product Strategy', 'Design for Manufacturing', 'Concept Development', 'User Testing'],
    tools: ['SolidWorks', 'AutoCAD', 'Fusion 360', 'Rhino', 'KeyShot', 'Blender', 'SketchUp',
            'Adobe Dimension', 'Cinema 4D', 'Substance 3D', 'ZBrush', 'Inventor'],
    industries: ['Consumer Electronics', 'Furniture', 'Automotive', 'Medical Devices', 'Toys', 'Home Appliances',
                 'Sports Equipment', 'Fashion Accessories', 'Packaging', 'IoT Devices', 'Wearables'],
    styles: ['Minimalist', 'Functional', 'Sustainable', 'Luxury', 'Industrial', 'Organic', 'Futuristic',
             'Retro', 'Scandinavian', 'Bauhaus', 'Art Deco', 'Biomimicry', 'Modular'],
    projectTypes: ['Consumer Product', 'Packaging', 'Furniture', 'Electronics', 'Medical Device', 'Toy Design']
  },
  'Motion Design': {
    specialties: ['2D Animation', '3D Animation', 'Character Animation', 'Logo Animation', 'Explainer Videos',
                  'Title Sequences', 'Infographic Animation', 'UI Animation', 'VFX', 'Compositing',
                  'Kinetic Typography', 'Particle Effects', 'Motion Tracking', 'Rotoscoping'],
    tools: ['After Effects', 'Cinema 4D', 'Blender', 'Maya', 'Premiere Pro', 'DaVinci Resolve',
            'Lottie', 'Principle', 'Cavalry', 'Nuke', 'Houdini', 'Substance 3D'],
    industries: ['Film & TV', 'Advertising', 'Gaming', 'Social Media', 'Education', 'Corporate',
                 'Music Industry', 'Sports', 'Technology', 'Healthcare', 'Finance', 'Non-profit'],
    styles: ['Flat Animation', '3D Realistic', 'Cartoon', 'Abstract', 'Minimalist', 'Retro', 'Glitch',
             'Liquid Motion', 'Stop Motion', 'Isometric', 'Line Art', 'Cel Animation', 'Photo-realistic'],
    projectTypes: ['Explainer Video', 'Logo Animation', 'Social Media Content', 'Title Sequence', 'Commercial', 'Music Video']
  },
  'Interior Design': {
    specialties: ['Residential Design', 'Commercial Design', 'Space Planning', 'Color Consultation', 'Furniture Selection',
                  'Lighting Design', 'Kitchen Design', 'Bathroom Design', 'Office Design', 'Retail Design',
                  'Restaurant Design', 'Hotel Design', 'Sustainable Design', 'Historic Preservation'],
    tools: ['AutoCAD', 'SketchUp', 'Revit', '3ds Max', 'V-Ray', 'Lumion', 'Chief Architect',
            'ArchiCAD', 'Rhino', 'Enscape', 'Corona Renderer', 'Photoshop'],
    industries: ['Residential', 'Commercial', 'Hospitality', 'Retail', 'Healthcare', 'Education',
                 'Corporate Offices', 'Restaurants', 'Hotels', 'Real Estate', 'Museums', 'Theaters'],
    styles: ['Modern', 'Contemporary', 'Traditional', 'Scandinavian', 'Industrial', 'Minimalist', 'Bohemian',
             'Mid-Century Modern', 'Farmhouse', 'Art Deco', 'Mediterranean', 'Japanese', 'Eclectic'],
    projectTypes: ['Home Renovation', 'Office Space', 'Retail Store', 'Restaurant', 'Hotel Suite', 'Exhibition Design']
  }
};

// Bio templates based on experience level
const bioTemplates = {
  junior: [
    "Passionate {category} designer with {years} years of experience. Specialized in {specialty1} and {specialty2}. Proficient in {tool1} and {tool2}. Eager to bring fresh perspectives to your projects.",
    "Creative {category} professional with {years} years in the field. Focus on {specialty1} and {specialty2}. Skilled in {tool1}, {tool2}, and {tool3}. Committed to delivering innovative solutions.",
    "Emerging {category} designer with {years} years of experience. Expertise in {specialty1} and {specialty2}. Proficient with {tool1} and {tool2}. Dedicated to creating impactful designs."
  ],
  mid: [
    "Experienced {category} designer with {years} years creating compelling designs for {industry1} and {industry2}. Expert in {specialty1}, {specialty2}, and {specialty3}. Proficient in {tool1}, {tool2}, and {tool3}.",
    "Versatile {category} professional with {years} years of experience across {industry1}, {industry2}, and {industry3}. Specialized in {specialty1} and {specialty2}. Advanced skills in {tool1} and {tool2}.",
    "Accomplished {category} designer with {years} years delivering high-quality work. Focus on {specialty1}, {specialty2}, and {specialty3}. Expert user of {tool1}, {tool2}, and {tool3}. Proven track record in {industry1} and {industry2}."
  ],
  senior: [
    "Award-winning {category} designer with {years}+ years of experience leading projects for Fortune 500 companies. Expert in {specialty1}, {specialty2}, and {specialty3}. Master of {tool1}, {tool2}, and {tool3}. Specialized in {industry1} and {industry2} sectors.",
    "Senior {category} professional with {years} years of expertise. Led design teams for major brands in {industry1} and {industry2}. Specialized in {specialty1}, {specialty2}, and {specialty3}. Advanced proficiency in entire {tool1} suite.",
    "Veteran {category} designer with {years} years shaping visual experiences. Deep expertise in {specialty1} and {specialty2}. Industry leader in {industry1} and {industry2}. Mentor and thought leader in the design community."
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
  const experienceMultiplier = Math.min(years / 20, 1); // Max out at 20 years
  const variance = Math.random() * 0.3 - 0.15; // ±15% variance
  
  const rate = min + (max - min) * experienceMultiplier * (1 + variance);
  return Math.round(rate / 5) * 5; // Round to nearest $5
}

function generateBio(category, years, specialties, tools, industries) {
  const level = getExperienceLevel(years);
  const template = getRandomElement(bioTemplates[level]);
  
  return template
    .replace('{category}', category)
    .replace('{years}', years)
    .replace('{specialty1}', specialties[0])
    .replace('{specialty2}', specialties[1])
    .replace('{specialty3}', specialties[2] || specialties[0])
    .replace('{tool1}', tools[0])
    .replace('{tool2}', tools[1])
    .replace('{tool3}', tools[2] || tools[0])
    .replace('{industry1}', industries[0])
    .replace('{industry2}', industries[1])
    .replace('{industry3}', industries[2] || industries[0]);
}

function generatePortfolioImages(designerId, category) {
  // Using Lorem Picsum for realistic placeholder images
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
  // Using UI Avatars service for realistic avatar placeholders
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
  const specialties = getRandomElements(catData.specialties, Math.floor(Math.random() * 3) + 2);
  const tools = getRandomElements(catData.tools, Math.floor(Math.random() * 4) + 2);
  const industries = getRandomElements(catData.industries, Math.floor(Math.random() * 3) + 2);
  const styles = getRandomElements(catData.styles, Math.floor(Math.random() * 4) + 2);
  const projectTypes = getRandomElements(catData.projectTypes, Math.floor(Math.random() * 3) + 2);
  
  const bio = generateBio(category, yearsExperience, specialties, tools, industries);
  const location = getRandomElement(cities);
  const locationParts = location.split(', ');
  const city = locationParts[0] || 'New York';
  const country = locationParts[1] || 'USA';
  const userLanguages = ['English'].concat(getRandomElements(languages.filter(l => l !== 'English'), Math.floor(Math.random() * 2) + 1));
  
  const availability = getRandomElement(['immediate', '1_week', '2_weeks', '1_month']);
  const responseTime = getRandomElement(['1_hour', '2_hours', '6_hours', '12_hours', '24_hours']);
  const preferredProjectSize = getRandomElement(['small', 'medium', 'large', 'any']);
  
  const portfolioImages = generatePortfolioImages(index, category);
  const avatar = generateAvatar(firstName, lastName);
  
  // Generate realistic ratings
  const completedProjects = Math.floor(Math.random() * 100) + 10;
  const rating = (4 + Math.random() * 1).toFixed(1); // 4.0 to 5.0
  
  // Map to actual database columns based on schema
  return {
    id: uuidv4(),
    email,
    first_name: firstName,
    last_name: lastName,
    last_initial: lastName.charAt(0).toUpperCase(),
    title: `${getExperienceLevel(yearsExperience).charAt(0).toUpperCase() + getExperienceLevel(yearsExperience).slice(1)} ${category} Designer`,
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
    is_approved: true,
    edited_after_approval: false,
    subscription_tier: yearsExperience > 10 ? 'premium' : (yearsExperience > 5 ? 'pro' : 'free'),
    // Additional fields that might exist (will be added only if column exists)
    portfolio_url: `https://portfolio.${firstName.toLowerCase()}${lastName.toLowerCase()}.com`,
    dribbble_url: Math.random() > 0.5 ? `https://dribbble.com/${firstName.toLowerCase()}${lastName.toLowerCase()}` : null,
    behance_url: Math.random() > 0.5 ? `https://behance.net/${firstName.toLowerCase()}${lastName.toLowerCase()}` : null,
    portfolio_images: portfolioImages,
    portfolio_image_1: portfolioImages[0],
    portfolio_image_2: portfolioImages[1],
    portfolio_image_3: portfolioImages[2],
    specializations: specialties,
    project_types: projectTypes,
    preferred_project_size: preferredProjectSize,
    communication_style: getRandomElement(['formal', 'casual', 'collaborative']),
    created_at: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  };
}

async function insertDesigners(designers) {
  console.log(`\nInserting ${designers.length} designers into database...`);
  
  // Insert in batches of 50
  const batchSize = 50;
  for (let i = 0; i < designers.length; i += batchSize) {
    const batch = designers.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('designers')
      .insert(batch);
    
    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      return false;
    }
    
    console.log(`✓ Inserted batch ${i / batchSize + 1} (${batch.length} designers)`);
  }
  
  return true;
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
      
      // Show distribution
      console.log('\n📊 Category Distribution:');
      for (const category of categories) {
        const { count: catCount } = await supabase
          .from('designers')
          .select('*', { count: 'exact', head: true })
          .eq('category', category);
        console.log(`   ${category}: ${catCount} designers`);
      }
    }
  } else {
    console.error('\n❌ Failed to insert designers into database');
  }
}

main().catch(console.error);