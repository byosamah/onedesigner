import { AIProvider, Designer, Brief, MatchResult } from '../types'

export class FallbackAIProvider implements AIProvider {
  async analyzeMatch(designer: Designer, brief: Brief): Promise<MatchResult> {
    let score = 60 // Base score
    const reasons = []
    const personalizedReasons = []

    // Check style match (highest weight)
    const styleMatches = designer.styles.filter(style => 
      brief.styles.some(bs => bs.toLowerCase() === style.toLowerCase())
    ).length
    if (styleMatches > 0) {
      score += styleMatches * 8 // 8 points per matching style
      const matchedStyle = designer.styles.find(style => 
        brief.styles.some(bs => bs.toLowerCase() === style.toLowerCase())
      )
      reasons.push(`Expert in ${matchedStyle} design`)
      personalizedReasons.push(
        `You wanted "${brief.styles[0]}" style → ${designer.first_name} specializes in ${matchedStyle}`
      )
    }

    // Check industry match (high weight)
    const industryMatch = designer.industries.some(ind => 
      ind.toLowerCase().includes(brief.industry.toLowerCase()) ||
      brief.industry.toLowerCase().includes(ind.toLowerCase())
    )
    if (industryMatch) {
      score += 15
      const matchedIndustry = designer.industries.find(ind => 
        ind.toLowerCase().includes(brief.industry.toLowerCase()) ||
        brief.industry.toLowerCase().includes(ind.toLowerCase())
      )
      reasons.push(`${matchedIndustry} specialist`)
      personalizedReasons.push(
        `Your ${brief.industry} project → ${designer.first_name} has deep ${matchedIndustry} experience`
      )
    }

    // Check availability (medium weight)
    if (designer.availability === 'available') {
      score += 10
      reasons.push('Available immediately')
      personalizedReasons.push(
        `Your timeline: ${brief.timeline} → ${designer.first_name} is ready to start now`
      )
    } else if (designer.availability === 'busy') {
      score += 5
      personalizedReasons.push(
        `Currently busy but worth the wait for your ${brief.project_type}`
      )
    }

    // Experience bonus
    if (designer.years_experience >= 5) {
      score += 5
      if (reasons.length < 3) {
        reasons.push(`${designer.years_experience} years experience`)
      }
    }

    // Rating bonus
    if (designer.rating >= 4.5) {
      score += Math.round((designer.rating - 4.5) * 10)
      if (personalizedReasons.length < 5) {
        personalizedReasons.push(
          `Proven track record → ${designer.rating}/5 rating from ${designer.total_projects} projects`
        )
      }
    }

    // Add some variance to avoid same scores
    score += Math.random() * 5

    // Ensure we have enough reasons
    if (reasons.length === 0) {
      reasons.push('Experienced designer', 'Great portfolio', 'Professional approach')
    }
    if (personalizedReasons.length === 0) {
      personalizedReasons.push(
        `${designer.years_experience} years creating impactful designs`,
        `Based in ${designer.city} with global project experience`,
        `Specialized in ${designer.styles[0] || 'modern'} aesthetics`
      )
    }

    return {
      score: Math.min(98, Math.max(50, Math.round(score))),
      reasons: reasons.slice(0, 3),
      personalizedReasons: personalizedReasons.slice(0, 5)
    }
  }
}