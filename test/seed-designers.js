/**
 * Seed 600 Realistic Designers for OneDesigner Platform
 * Creates 100 designers for each of the 6 categories with realistic, human-like data
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const { faker } = require('@faker-js/faker')

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Categories (100 designers each)
const CATEGORIES = [
  'branding-logo',
  'web-mobile', 
  'social-media',
  'motion-graphics',
  'photography-video',
  'presentations'
]

// Experience distribution
const EXPERIENCE_LEVELS = [
  { value: '0-2', weight: 0.20, minProjects: 5, maxProjects: 25, priceMin: 500, priceMax: 2000 },
  { value: '3-5', weight: 0.35, minProjects: 26, maxProjects: 75, priceMin: 1500, priceMax: 5000 },
  { value: '6-10', weight: 0.30, minProjects: 76, maxProjects: 200, priceMin: 3000, priceMax: 10000 },
  { value: '10+', weight: 0.15, minProjects: 201, maxProjects: 500, priceMin: 5000, priceMax: 25000 }
]

// Geographic distribution with cities
const LOCATIONS = [
  // North America (30%)
  { country: 'United States', cities: ['New York', 'Los Angeles', 'San Francisco', 'Austin', 'Seattle', 'Chicago', 'Boston', 'Miami', 'Denver', 'Portland'], weight: 0.20 },
  { country: 'Canada', cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'], weight: 0.10 },
  // Europe (25%)
  { country: 'United Kingdom', cities: ['London', 'Manchester', 'Edinburgh', 'Bristol', 'Birmingham'], weight: 0.08 },
  { country: 'Germany', cities: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'], weight: 0.07 },
  { country: 'France', cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'], weight: 0.05 },
  { country: 'Netherlands', cities: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'], weight: 0.05 },
  // Asia (20%)
  { country: 'India', cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune'], weight: 0.08 },
  { country: 'Japan', cities: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama'], weight: 0.05 },
  { country: 'Singapore', cities: ['Singapore'], weight: 0.04 },
  { country: 'South Korea', cities: ['Seoul', 'Busan'], weight: 0.03 },
  // South America (10%)
  { country: 'Brazil', cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'], weight: 0.05 },
  { country: 'Argentina', cities: ['Buenos Aires', 'Córdoba', 'Rosario'], weight: 0.03 },
  { country: 'Mexico', cities: ['Mexico City', 'Guadalajara', 'Monterrey'], weight: 0.02 },
  // Africa (5%)
  { country: 'South Africa', cities: ['Cape Town', 'Johannesburg', 'Durban'], weight: 0.03 },
  { country: 'Nigeria', cities: ['Lagos', 'Abuja'], weight: 0.02 },
  // Australia (10%)
  { country: 'Australia', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'], weight: 0.10 }
]

// Style combinations by category
const STYLE_PROFILES = {
  'branding-logo': [
    ['minimal', 'modern'], ['corporate', 'elegant'], ['playful', 'modern'],
    ['elegant', 'minimal'], ['modern', 'technical'], ['artistic', 'playful'],
    ['retro', 'playful'], ['organic', 'elegant'], ['minimal', 'corporate']
  ],
  'web-mobile': [
    ['minimal', 'technical'], ['modern', 'minimal'], ['corporate', 'technical'],
    ['playful', 'modern'], ['elegant', 'minimal'], ['technical', 'modern'],
    ['minimal', 'elegant'], ['modern', 'playful'], ['corporate', 'modern']
  ],
  'social-media': [
    ['playful', 'modern'], ['artistic', 'playful'], ['modern', 'minimal'],
    ['retro', 'playful'], ['elegant', 'artistic'], ['playful', 'retro'],
    ['modern', 'artistic'], ['minimal', 'playful'], ['organic', 'playful']
  ],
  'motion-graphics': [
    ['modern', 'technical'], ['playful', 'artistic'], ['technical', 'minimal'],
    ['artistic', 'modern'], ['playful', 'modern'], ['futuristic', 'technical'],
    ['minimal', 'modern'], ['retro', 'artistic'], ['elegant', 'modern']
  ],
  'photography-video': [
    ['artistic', 'elegant'], ['organic', 'artistic'], ['minimal', 'elegant'],
    ['modern', 'artistic'], ['elegant', 'corporate'], ['artistic', 'modern'],
    ['organic', 'minimal'], ['retro', 'artistic'], ['playful', 'artistic']
  ],
  'presentations': [
    ['corporate', 'minimal'], ['technical', 'modern'], ['elegant', 'corporate'],
    ['minimal', 'technical'], ['modern', 'corporate'], ['corporate', 'elegant'],
    ['technical', 'minimal'], ['modern', 'elegant'], ['corporate', 'modern']
  ]
}

// Industry focus by category
const INDUSTRY_FOCUS = {
  'branding-logo': ['saas', 'fintech', 'ecommerce', 'healthcare', 'real-estate', 'fashion', 'food-beverage'],
  'web-mobile': ['saas', 'fintech', 'ecommerce', 'education', 'crypto', 'ai-ml', 'social-media'],
  'social-media': ['fashion', 'food-beverage', 'ecommerce', 'travel', 'nonprofit', 'gaming', 'social-media'],
  'motion-graphics': ['gaming', 'ai-ml', 'crypto', 'saas', 'education', 'social-media', 'fintech'],
  'photography-video': ['fashion', 'food-beverage', 'real-estate', 'travel', 'ecommerce', 'nonprofit'],
  'presentations': ['saas', 'fintech', 'education', 'healthcare', 'nonprofit', 'ai-ml', 'crypto']
}

// Project types by category
const PROJECT_TYPES = {
  'branding-logo': ['brand-identity', 'marketing', 'packaging'],
  'web-mobile': ['web-design', 'app-design', 'dashboard'],
  'social-media': ['marketing', 'illustration', 'brand-identity'],
  'motion-graphics': ['motion', 'marketing', 'illustration'],
  'photography-video': ['marketing', 'brand-identity', 'packaging'],
  'presentations': ['dashboard', 'marketing', 'brand-identity']
}

// Specializations by category
const SPECIALIZATIONS = {
  'branding-logo': ['typography', 'design-systems', 'user-research', 'accessibility'],
  'web-mobile': ['prototyping', 'wireframing', 'design-systems', 'accessibility', 'user-research'],
  'social-media': ['animation', 'typography', 'user-research'],
  'motion-graphics': ['animation', '3d-design', 'prototyping'],
  'photography-video': ['3d-design', 'animation', 'typography'],
  'presentations': ['design-systems', 'typography', 'wireframing', 'accessibility']
}

// Software skills by category
const SOFTWARE_SKILLS = {
  'branding-logo': ['illustrator', 'photoshop', 'figma', 'sketch'],
  'web-mobile': ['figma', 'sketch', 'adobe-xd', 'framer', 'webflow'],
  'social-media': ['photoshop', 'illustrator', 'figma', 'after-effects'],
  'motion-graphics': ['after-effects', 'illustrator', 'photoshop', 'figma'],
  'photography-video': ['photoshop', 'after-effects', 'illustrator'],
  'presentations': ['figma', 'sketch', 'photoshop', 'illustrator']
}

// Bio templates with variables
const BIO_TEMPLATES = [
  "Award-winning {title} with {years} years of experience crafting {style1} and {style2} designs for {industry} clients. Specialized in {specialty}, I've helped over {number} companies transform their visual identity and achieve measurable results.",
  "Passionate about creating {style1} experiences that drive business growth. My {years}-year journey in {industry} has taught me that great design is about understanding user needs and delivering solutions that exceed expectations.",
  "As a {title} with {years} years in the field, I combine {style1} aesthetics with {style2} functionality to create designs that resonate with audiences. My work in {industry} focuses on {specialty} to deliver impactful results.",
  "Creative {title} specializing in {style1} and {style2} design solutions. With {years} years of experience primarily in {industry}, I bring a unique perspective to every project, ensuring each design tells a compelling story.",
  "Experienced {title} dedicated to pushing creative boundaries. Over {years} years, I've developed expertise in {specialty} while working with {industry} clients to create {style1} designs that captivate and convert.",
  "Results-driven {title} with a proven track record in {industry}. My {years} years of experience have honed my skills in creating {style1} and {style2} designs that not only look beautiful but also achieve business objectives.",
  "Innovative {title} passionate about {specialty}. Through {years} years of dedication to {style1} design principles, I've helped {industry} brands establish strong visual identities that stand out in competitive markets.",
  "Detail-oriented {title} with {years} years crafting pixel-perfect designs. My approach combines {style1} simplicity with {style2} sophistication, particularly for {industry} clients seeking to elevate their brand presence.",
  "Strategic {title} focused on user-centered design. With {years} years in {industry}, I specialize in {specialty} to create {style1} experiences that engage users and drive meaningful interactions.",
  "Versatile {title} with expertise across {style1} and {style2} design styles. My {years}-year career in {industry} has equipped me with the skills to tackle complex design challenges and deliver exceptional results."
]

// Communication styles
const COMMUNICATION_STYLES = ['direct', 'collaborative', 'detailed', 'flexible']

// Availability options
const AVAILABILITY = ['immediate', '1_week', '2_weeks', '1_month']

// Team sizes
const TEAM_SIZES = ['solo', 'small', 'medium', 'large']

// Professional titles by category
const TITLES = {
  'branding-logo': ['Brand Designer', 'Logo Designer', 'Brand Identity Designer', 'Visual Identity Designer', 'Brand Strategist'],
  'web-mobile': ['UI/UX Designer', 'Product Designer', 'Web Designer', 'Mobile App Designer', 'UX Designer', 'UI Designer'],
  'social-media': ['Social Media Designer', 'Content Designer', 'Digital Designer', 'Visual Content Creator', 'Social Media Specialist'],
  'motion-graphics': ['Motion Designer', 'Motion Graphics Artist', 'Animation Designer', '3D Motion Designer', 'Video Designer'],
  'photography-video': ['Visual Designer', 'Photography Director', 'Video Producer', 'Visual Content Creator', 'Creative Director'],
  'presentations': ['Presentation Designer', 'Visual Communication Designer', 'Information Designer', 'Deck Designer', 'Pitch Deck Specialist']
}

// Helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function getWeightedRandom(items) {
  const random = Math.random()
  let accumulated = 0
  
  for (const item of items) {
    accumulated += item.weight
    if (random < accumulated) return item
  }
  return items[items.length - 1]
}

function getMultipleRandom(array, min, max) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

function generatePortfolioUrl(firstName, lastName, index) {
  const domains = ['portfolio.com', 'design.io', 'creative.co', 'works.design', 'folio.site']
  const formats = [
    `https://${firstName.toLowerCase()}${lastName.toLowerCase()}.${getRandomElement(domains)}`,
    `https://www.${firstName.toLowerCase()}-design.com`,
    `https://${getRandomElement(domains)}/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `https://portfolio.${firstName.toLowerCase()}${index}.com`
  ]
  return getRandomElement(formats)
}

function generateBio(profile) {
  const template = getRandomElement(BIO_TEMPLATES)
  
  return template
    .replace('{title}', profile.title)
    .replace('{years}', profile.years_experience)
    .replace('{style1}', profile.styles[0])
    .replace('{style2}', profile.styles[1] || profile.styles[0])
    .replace('{industry}', profile.industries[0])
    .replace('{specialty}', profile.tools[0])
    .replace('{number}', Math.floor(Math.random() * 50) + 20)
}

function generateProjectPreferences(category, styles) {
  const preferences = {
    'branding-logo': `I'm most excited about brand identity projects that allow me to create comprehensive visual systems. I love working with startups and established companies looking to refresh their brand presence. My ideal project involves deep collaboration with stakeholders to understand the brand's essence and translate it into powerful visual language.`,
    'web-mobile': `I thrive on creating digital products that solve real user problems. My ideal projects involve designing intuitive interfaces for web and mobile applications, particularly those that require complex user flows and data visualization. I enjoy the challenge of making sophisticated functionality feel simple and delightful.`,
    'social-media': `I'm passionate about creating content that stops the scroll and drives engagement. My ideal projects involve developing comprehensive social media strategies with consistent visual languages across multiple platforms. I love working with brands that aren't afraid to be bold and creative in their social presence.`,
    'motion-graphics': `I get energized by projects that bring static designs to life through motion. Whether it's explainer videos, logo animations, or interactive experiences, I love crafting smooth, purposeful animations that enhance storytelling and user engagement. My ideal project combines technical excellence with creative innovation.`,
    'photography-video': `I'm driven by visual storytelling projects that capture authentic moments and emotions. My ideal assignments involve creating compelling visual narratives for brands, whether through product photography, lifestyle shoots, or video content. I excel at projects that require both creative vision and technical precision.`,
    'presentations': `I specialize in transforming complex information into visually compelling presentations. My ideal projects involve creating pitch decks, investor presentations, and corporate communications that not only look professional but also tell a clear, persuasive story. I enjoy the challenge of making data beautiful and accessible.`
  }
  
  return preferences[category] || preferences['web-mobile']
}

function generateWorkingStyle(communicationStyle) {
  const styles = {
    'direct': `I believe in clear, efficient communication and getting straight to the point. My design process starts with understanding your goals, then I create initial concepts quickly for feedback. I provide regular updates at key milestones and am always available for quick questions. I use tools like Slack and Figma for real-time collaboration.`,
    'collaborative': `I see design as a partnership and love involving clients throughout the creative process. We'll have regular check-ins, brainstorming sessions, and collaborative reviews. I believe the best results come from combining your industry expertise with my design skills. I'm comfortable with video calls and enjoy the energy of creative collaboration.`,
    'detailed': `I take a methodical approach to design, documenting every decision and providing comprehensive explanations for my choices. You'll receive detailed project plans, mood boards, and rationale documents. I believe in transparency and ensuring you understand not just what I'm creating, but why each element serves your goals.`,
    'flexible': `I adapt my process to match your preferred working style and timeline. Whether you want daily updates or weekly summaries, extensive collaboration or independent work, I adjust to fit your needs. I'm comfortable with changing requirements and believe good design often emerges from iterative exploration.`
  }
  
  return styles[communicationStyle]
}

function generateRemoteExperience(years) {
  const yearsNum = years === '0-2' ? 'two' : 
                   years === '3-5' ? 'five' :
                   years === '6-10' ? 'eight' : 'twelve'
  
  return `I've been working remotely with international clients for over ${yearsNum} years, collaborating across multiple time zones and cultures. I'm proficient with all major collaboration tools including Figma, Slack, Zoom, and project management platforms. I maintain structured communication schedules and use time zone overlaps efficiently for real-time collaboration when needed. My home studio is fully equipped for high-quality video calls and I'm comfortable presenting work remotely.`
}

function generatePreviousClients(industries, experience) {
  const clientTypes = {
    'saas': ['TechFlow Solutions', 'CloudSync Pro', 'DataDrive Analytics', 'StreamlineOS'],
    'fintech': ['PaySecure', 'FinanceHub', 'CryptoTrust', 'InvestSmart'],
    'ecommerce': ['ShopEasy', 'MarketPlace Pro', 'QuickCart', 'GlobalTrade'],
    'healthcare': ['HealthFirst', 'MedConnect', 'CarePoint', 'WellnessHub'],
    'education': ['LearnSphere', 'EduTech Pro', 'SkillBridge', 'KnowledgeBase'],
    'fashion': ['StyleForward', 'TrendSetters', 'FashionHub', 'ChicBoutique'],
    'real-estate': ['PropertyPro', 'RealtyFirst', 'HomeFinder', 'EstateManager']
  }
  
  const clients = []
  industries.slice(0, 3).forEach(industry => {
    if (clientTypes[industry]) {
      clients.push(getRandomElement(clientTypes[industry]))
    }
  })
  
  if (experience === '10+') {
    clients.push('Fortune 500 companies')
  }
  
  return clients.length > 0 ? `Notable clients include: ${clients.join(', ')}. I've also worked with numerous startups and mid-size companies across various industries.` : ''
}

// Main designer generation function
async function generateDesigner(category, index, globalIndex) {
  const location = getWeightedRandom(LOCATIONS)
  const city = getRandomElement(location.cities)
  const experience = getWeightedRandom(EXPERIENCE_LEVELS)
  const styles = getRandomElement(STYLE_PROFILES[category])
  const industries = getMultipleRandom(INDUSTRY_FOCUS[category], 2, 4)
  const projectTypes = getMultipleRandom(PROJECT_TYPES[category], 2, 3)
  const specializations = getMultipleRandom(SPECIALIZATIONS[category], 2, 4)
  const softwareSkills = getMultipleRandom(SOFTWARE_SKILLS[category], 3, 4)
  const communicationStyle = getRandomElement(COMMUNICATION_STYLES)
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const title = getRandomElement(TITLES[category])
  
  const designer = {
    // Authentication
    email: `designer${globalIndex}@test.onedesigner.app`,
    
    // Basic Info
    first_name: firstName,
    last_name: lastName,
    last_initial: lastName.charAt(0),
    title: title,
    phone: faker.phone.number('+1 ###-###-####'),
    
    // Location
    country: location.country,
    city: city,
    timezone: 'UTC',
    
    // Experience (convert to integer)
    years_experience: experience.value === '0-2' ? Math.floor(Math.random() * 3) :
                     experience.value === '3-5' ? Math.floor(Math.random() * 3) + 3 :
                     experience.value === '6-10' ? Math.floor(Math.random() * 5) + 6 :
                     Math.floor(Math.random() * 10) + 11,
    total_projects: Math.floor(Math.random() * (experience.maxProjects - experience.minProjects + 1)) + experience.minProjects,
    
    // Portfolio
    website_url: generatePortfolioUrl(firstName, lastName, globalIndex),
    linkedin_url: Math.random() > 0.7 ? `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}` : null,
    calendar_url: Math.random() > 0.5 ? `https://calendly.com/${firstName.toLowerCase()}${globalIndex}` : null,
    
    // Pricing (using hourly_rate as average)
    hourly_rate: Math.floor((experience.priceMin / 40 + experience.priceMax / 80) / 2),
    
    // Design preferences
    styles: styles,
    industries: industries,
    tools: softwareSkills,
    
    // Bio and descriptions
    bio: '',  // Will be generated after profile is created
    
    // Availability
    availability: getRandomElement(AVAILABILITY),
    
    // Performance metrics (use existing fields)
    rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
    total_projects: Math.floor(Math.random() * (experience.maxProjects - experience.minProjects + 1)) + experience.minProjects,
    
    // Response time
    response_time: getRandomElement(['12 hours', '24 hours', '48 hours']),
    
    // Status
    is_verified: true,
    is_approved: true,
    is_contactable: true,
    hide_phone: false,
    subscription_tier: 'premium',
    created_at: new Date().toISOString()
  }
  
  // Generate bio after profile is complete
  designer.bio = generateBio(designer)
  
  return designer
}

// Main seeding function
async function seedDesigners() {
  console.log('🚀 Starting to seed 600 designers...\n')
  
  const allDesigners = []
  let globalIndex = 1
  
  // Generate designers for each category
  for (const category of CATEGORIES) {
    console.log(`\n📁 Generating ${category} designers...`)
    
    for (let i = 0; i < 100; i++) {
      const designer = await generateDesigner(category, i + 1, globalIndex)
      allDesigners.push(designer)
      globalIndex++
      
      if ((i + 1) % 20 === 0) {
        console.log(`  ✓ Generated ${i + 1}/100 ${category} designers`)
      }
    }
  }
  
  console.log(`\n✅ Generated ${allDesigners.length} total designers`)
  console.log('\n📤 Starting database insertion...\n')
  
  // Insert in batches of 50
  const batchSize = 50
  let inserted = 0
  
  for (let i = 0; i < allDesigners.length; i += batchSize) {
    const batch = allDesigners.slice(i, i + batchSize)
    
    try {
      const { data, error } = await supabase
        .from('designers')
        .insert(batch)
      
      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error)
        // Continue with next batch even if one fails
      } else {
        inserted += batch.length
        console.log(`✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allDesigners.length / batchSize)} (${inserted}/${allDesigners.length} designers)`)
      }
    } catch (error) {
      console.error(`❌ Unexpected error in batch ${Math.floor(i / batchSize) + 1}:`, error)
    }
  }
  
  console.log('\n🎉 Seeding complete!')
  console.log(`✅ Successfully inserted ${inserted} designers`)
  
  // Verify distribution
  console.log('\n📊 Verifying distribution...\n')
  
  // Check category distribution
  for (const category of CATEGORIES) {
    const { count, error } = await supabase
      .from('designers')
      .select('*', { count: 'exact', head: true })
      .contains('project_types', PROJECT_TYPES[category][0])
    
    if (!error) {
      console.log(`${category}: ~${count} designers`)
    }
  }
  
  // Check experience distribution
  console.log('\n📈 Experience levels:')
  for (const level of EXPERIENCE_LEVELS) {
    const { count } = await supabase
      .from('designers')
      .select('*', { count: 'exact', head: true })
      .eq('years_experience', level.value)
    
    console.log(`${level.value} years: ${count} designers`)
  }
  
  console.log('\n✨ All done! Your database now has 600 realistic test designers.')
}

// Run the seeding
seedDesigners().catch(console.error)