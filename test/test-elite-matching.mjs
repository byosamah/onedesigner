#!/usr/bin/env node

import { createAIProvider } from '../src/lib/ai/index.js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

console.log('🎯 Testing Elite Single-Match AI System\n')

// Test brief
const testBrief = {
  company_name: 'TechStartup Inc',
  industry: 'Technology / SaaS',
  project_type: 'branding',
  budget: 'mid',
  timeline: 'standard',
  styles: ['modern', 'minimalist', 'bold'],
  target_audience: 'B2B tech companies',
  brand_personality: 'Innovative, reliable, cutting-edge',
  requirements: 'Need a complete brand identity including logo, color palette, and brand guidelines',
  success_metrics: 'Brand recognition in tech industry',
  inspiration: 'Stripe, Notion, Linear'
}

// Test designers
const testDesigners = [
  {
    id: '1',
    first_name: 'Sarah',
    last_name: 'Chen',
    title: 'Brand Identity Specialist',
    years_experience: 8,
    city: 'San Francisco',
    country: 'USA',
    timezone: 'PST',
    specializations: ['branding', 'logo-design', 'visual-identity'],
    styles: ['modern', 'minimalist', 'clean'],
    industries: ['technology', 'saas', 'startups'],
    availability: 'available',
    preferred_timeline: 'standard',
    preferred_project_size: 'medium',
    communication_style: 'collaborative',
    avg_client_satisfaction: 4.9,
    on_time_delivery_rate: 98,
    budget_adherence_rate: 95,
    total_projects_completed: 120,
    design_philosophy: 'Creating timeless brand identities that communicate innovation and trust',
    portfolio_keywords: ['tech-branding', 'startup-identity', 'minimalist-logos']
  },
  {
    id: '2', 
    first_name: 'Marcus',
    last_name: 'Johnson',
    title: 'Creative Director',
    years_experience: 12,
    city: 'New York',
    country: 'USA',
    timezone: 'EST',
    specializations: ['branding', 'advertising', 'campaigns'],
    styles: ['bold', 'experimental', 'trendy'],
    industries: ['fashion', 'retail', 'lifestyle'],
    availability: 'available',
    preferred_timeline: 'flexible',
    preferred_project_size: 'large',
    communication_style: 'hands-off',
    avg_client_satisfaction: 4.7,
    on_time_delivery_rate: 85,
    budget_adherence_rate: 80,
    total_projects_completed: 200,
    design_philosophy: 'Push boundaries and create disruptive brand experiences',
    portfolio_keywords: ['fashion-branding', 'luxury-design', 'bold-campaigns']
  },
  {
    id: '3',
    first_name: 'Emily',
    last_name: 'Rodriguez', 
    title: 'UI/UX Designer',
    years_experience: 5,
    city: 'Austin',
    country: 'USA',
    timezone: 'CST',
    specializations: ['web-design', 'app-design', 'user-experience'],
    styles: ['clean', 'functional', 'user-centered'],
    industries: ['technology', 'healthcare', 'education'],
    availability: 'busy',
    preferred_timeline: 'urgent',
    preferred_project_size: 'small',
    communication_style: 'daily-updates',
    avg_client_satisfaction: 4.8,
    on_time_delivery_rate: 92,
    budget_adherence_rate: 90,
    total_projects_completed: 80,
    design_philosophy: 'User-first design that balances aesthetics with functionality',
    portfolio_keywords: ['saas-ui', 'dashboard-design', 'mobile-apps']
  }
]

async function testEliteMatching() {
  try {
    const aiProvider = createAIProvider()
    
    console.log('📋 Testing with brief:')
    console.log(`- Company: ${testBrief.company_name}`)
    console.log(`- Project: ${testBrief.project_type}`)
    console.log(`- Budget: ${testBrief.budget}`)
    console.log(`- Styles: ${testBrief.styles.join(', ')}\n`)
    
    console.log('👥 Available designers:')
    testDesigners.forEach(d => {
      console.log(`- ${d.first_name} ${d.last_name} (${d.title})`)
    })
    console.log('')
    
    console.log('🤖 AI is analyzing to find THE PERFECT MATCH...\n')
    
    // Test the new single-match system
    const matches = await aiProvider.generateMatches(testDesigners, testBrief, 1)
    
    if (!matches || matches.length === 0) {
      console.log('❌ NO SUITABLE MATCH FOUND')
      console.log('The AI determined none of the designers meet the minimum requirements.')
      return
    }
    
    const match = matches[0]
    
    console.log('✨ MATCH DECISION:', match.matchDecision || 'MATCH FOUND')
    console.log(`🎯 Selected Designer: ${match.designer.first_name} ${match.designer.last_name}`)
    console.log(`📊 Match Score: ${match.score}/100`)
    console.log(`🔒 Confidence: ${match.confidence || 'Not specified'}`)
    
    if (match.scoreBreakdown) {
      console.log('\n📈 Score Breakdown:')
      console.log(`- Category Mastery: ${match.scoreBreakdown.categoryMastery}/30`)
      console.log(`- Style Alignment: ${match.scoreBreakdown.styleAlignment}/25`)
      console.log(`- Project Fit: ${match.scoreBreakdown.projectFit}/20`)
      console.log(`- Working Compatibility: ${match.scoreBreakdown.workingCompatibility}/15`)
      console.log(`- Value Factors: ${match.scoreBreakdown.valueFactors}/10`)
    }
    
    console.log('\n🌟 Key Distinction:')
    console.log(match.uniqueValue || 'Perfect match for this project')
    
    console.log('\n📝 Match Narrative:')
    console.log(match.matchSummary || 'This designer is ideally suited for your project.')
    
    if (match.reasons && match.reasons.length > 0) {
      console.log('\n✅ Specific Evidence:')
      match.reasons.forEach((reason, i) => {
        console.log(`${i + 1}. ${reason}`)
      })
    }
    
    if (match.riskMitigation) {
      console.log('\n🛡️ Risk Mitigation:')
      console.log(match.riskMitigation)
    }
    
    if (match.challenges && match.challenges.length > 0) {
      console.log('\n⚠️ Potential Considerations:')
      match.challenges.forEach(challenge => {
        console.log(`- ${challenge}`)
      })
    }
    
    if (match.nextSteps) {
      console.log('\n🚀 Next Steps:')
      console.log(match.nextSteps)
    }
    
    console.log('\n✅ Elite matching test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error(error.stack)
  }
}

// Run the test
testEliteMatching()