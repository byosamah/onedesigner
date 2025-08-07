// Enhanced Scoring System for Designer-Client Matching
// This module provides sophisticated scoring algorithms for perfect matches

export interface Designer {
  id: string;
  first_name: string;
  last_name: string;
  styles: string[];
  industries: string[];
  availability: 'available' | 'busy' | 'unavailable';
  years_experience: number;
  rating: number;
  total_projects: number;
  
  // New enhanced fields
  portfolio_keywords?: string[];
  design_philosophy?: string;
  specializations?: string[];
  tools_expertise?: string[];
  preferred_project_size?: 'small' | 'medium' | 'large' | 'enterprise';
  preferred_timeline?: 'urgent' | 'standard' | 'flexible';
  revision_approach?: 'unlimited' | 'structured' | 'limited';
  communication_style?: 'formal' | 'casual' | 'collaborative';
  avg_project_duration_days?: number;
  project_completion_rate?: number;
  client_retention_rate?: number;
  on_time_delivery_rate?: number;
  budget_adherence_rate?: number;
  avg_client_satisfaction?: number;
  timezone?: string;
  languages?: string[];
  team_size?: 'solo' | 'small_team' | 'agency';
  total_projects_completed?: number;
  strengths?: string[];
  work_approach?: string;
}

export interface Brief {
  id: string;
  client_id: string;
  project_type: string;
  company_name: string;
  industry: string;
  timeline: string;
  styles: string[];
  budget: string;
  requirements?: string;
  inspiration?: string;
  target_audience?: string;
  brand_personality?: string;
  goals?: string;
  complexity_level?: 'simple' | 'moderate' | 'complex';
  success_metrics?: string;
  required_tools?: string[];
}

export interface ClientPreferences {
  preferred_styles?: string[];
  avoided_styles?: string[];
  price_sensitivity?: 'low' | 'medium' | 'high';
  quality_vs_speed?: 'quality' | 'balanced' | 'speed';
  communication_frequency?: 'minimal' | 'regular' | 'frequent';
  decision_making_speed?: 'fast' | 'moderate' | 'deliberate';
  avg_project_budget?: number;
  typical_project_duration?: number;
  preferred_designer_experience?: 'junior' | 'mid' | 'senior' | 'any';
  industry_focus?: string[];
}

export interface EnhancedScoreBreakdown {
  styleMatch: number;
  industryMatch: number;
  availabilityMatch: number;
  experienceLevel: number;
  projectSizeMatch: number;
  specializationMatch: number;
  performanceScore: number;
  clientSatisfaction: number;
  deliveryReliability: number;
  communicationFit: number;
  workApproachFit: number;
  toolsCompatibility: number;
  previousSuccess: number;
  clientPreferenceBonus: number;
}

export interface EnhancedScoreResult {
  totalScore: number;
  breakdown: EnhancedScoreBreakdown;
  weights: Record<string, number>;
  confidence: 'high' | 'medium' | 'low';
}

// Dynamic weight calculation based on project characteristics
export function getDynamicWeights(brief: Brief): Record<string, number> {
  const weights: Record<string, number> = {
    // Base weights
    styleMatch: 0.20,
    industryMatch: 0.15,
    availabilityMatch: 0.10,
    experienceLevel: 0.10,
    projectSizeMatch: 0.08,
    specializationMatch: 0.12,
    performanceScore: 0.08,
    clientSatisfaction: 0.07,
    deliveryReliability: 0.05,
    communicationFit: 0.03,
    workApproachFit: 0.02,
    toolsCompatibility: 0.05,
    previousSuccess: 0.03,
    clientPreferenceBonus: 0.02
  };

  // Adjust weights based on project urgency
  if (brief.timeline === 'ASAP' || brief.timeline === '1-2 weeks') {
    weights.availabilityMatch = 0.20;
    weights.deliveryReliability = 0.15;
    weights.styleMatch = 0.15;
    weights.industryMatch = 0.10;
  }

  // Adjust for complex projects
  if (brief.complexity_level === 'complex') {
    weights.experienceLevel = 0.15;
    weights.specializationMatch = 0.15;
    weights.performanceScore = 0.10;
  }

  // Normalize weights to sum to 1
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  Object.keys(weights).forEach(key => {
    weights[key] = weights[key] / sum;
  });

  return weights;
}

// Calculate style match with fuzzy matching
export function calculateStyleMatch(designerStyles: string[], briefStyles: string[]): number {
  if (!designerStyles?.length || !briefStyles?.length) return 0;
  
  let matchScore = 0;
  const maxPossibleScore = briefStyles.length;
  
  briefStyles.forEach(briefStyle => {
    const exactMatch = designerStyles.some(ds => 
      ds.toLowerCase() === briefStyle.toLowerCase()
    );
    
    if (exactMatch) {
      matchScore += 1;
    } else {
      // Partial matching for related styles
      const partialMatch = designerStyles.some(ds => 
        ds.toLowerCase().includes(briefStyle.toLowerCase()) ||
        briefStyle.toLowerCase().includes(ds.toLowerCase())
      );
      if (partialMatch) matchScore += 0.5;
    }
  });
  
  return (matchScore / maxPossibleScore) * 100;
}

// Calculate industry match with domain knowledge
export function calculateIndustryMatch(designerIndustries: string[], briefIndustry: string): number {
  if (!designerIndustries?.length || !briefIndustry) return 0;
  
  const industryGroups: Record<string, string[]> = {
    'tech': ['SaaS', 'Software', 'Technology', 'Fintech', 'EdTech', 'HealthTech'],
    'retail': ['E-commerce', 'Retail', 'Fashion', 'Consumer Goods'],
    'creative': ['Media', 'Entertainment', 'Gaming', 'Arts'],
    'professional': ['Consulting', 'Legal', 'Finance', 'Real Estate'],
    'health': ['Healthcare', 'Wellness', 'Fitness', 'Medical']
  };
  
  // Direct match
  const directMatch = designerIndustries.some(di => 
    di.toLowerCase() === briefIndustry.toLowerCase()
  );
  if (directMatch) return 100;
  
  // Group match
  let groupMatchScore = 0;
  Object.entries(industryGroups).forEach(([group, industries]) => {
    const briefInGroup = industries.some(ind => 
      ind.toLowerCase().includes(briefIndustry.toLowerCase())
    );
    const designerInGroup = designerIndustries.some(di => 
      industries.some(ind => ind.toLowerCase().includes(di.toLowerCase()))
    );
    
    if (briefInGroup && designerInGroup) {
      groupMatchScore = 75;
    }
  });
  
  return groupMatchScore;
}

// Calculate availability match based on timeline
export function calculateAvailabilityMatch(availability: string, timeline: string): number {
  const timelineUrgency: Record<string, number> = {
    'ASAP': 5,
    '1-2 weeks': 4,
    '2-4 weeks': 3,
    '1-2 months': 2,
    '2-3 months': 1
  };
  
  const urgency = timelineUrgency[timeline] || 3;
  
  if (availability === 'available') {
    return 100;
  } else if (availability === 'busy') {
    // Busy designers score lower for urgent projects
    return Math.max(30, 100 - (urgency * 15));
  }
  return 0;
}

// Match experience level to project complexity
export function matchExperienceLevel(yearsExperience: number, complexity?: string): number {
  const complexityRequirements: Record<string, { min: number; optimal: number }> = {
    'simple': { min: 1, optimal: 3 },
    'moderate': { min: 3, optimal: 5 },
    'complex': { min: 5, optimal: 8 }
  };
  
  const req = complexityRequirements[complexity || 'moderate'];
  
  if (yearsExperience < req.min) {
    return (yearsExperience / req.min) * 50;
  } else if (yearsExperience >= req.optimal) {
    return 100;
  } else {
    return 50 + ((yearsExperience - req.min) / (req.optimal - req.min)) * 50;
  }
}

// Match project size preferences
export function matchProjectSize(designerPref?: string, budget?: string): number {
  if (!designerPref || !budget) return 80; // Default score if data missing
  
  const budgetToSize: Record<string, string> = {
    '$500-1000': 'small',
    '$1000-2500': 'small',
    '$2500-5000': 'medium',
    '$5000-10000': 'large',
    '$10000+': 'enterprise'
  };
  
  const projectSize = budgetToSize[budget] || 'medium';
  
  if (designerPref === projectSize) return 100;
  
  // Adjacent sizes are acceptable
  const sizes = ['small', 'medium', 'large', 'enterprise'];
  const prefIndex = sizes.indexOf(designerPref);
  const projectIndex = sizes.indexOf(projectSize);
  const distance = Math.abs(prefIndex - projectIndex);
  
  return Math.max(40, 100 - (distance * 30));
}

// Match specializations to project type
export function matchSpecializations(specializations: string[], projectType: string): number {
  if (!specializations?.length || !projectType) return 60;
  
  const projectKeywords = projectType.toLowerCase().split(' ');
  let matchScore = 0;
  
  specializations.forEach(spec => {
    const specLower = spec.toLowerCase();
    projectKeywords.forEach(keyword => {
      if (specLower.includes(keyword) || keyword.includes(specLower)) {
        matchScore += 50 / projectKeywords.length;
      }
    });
  });
  
  return Math.min(100, matchScore);
}

// Calculate overall performance score
export function calculatePerformanceScore(designer: Designer): number {
  const metrics = [
    (designer.project_completion_rate || 0),
    (designer.on_time_delivery_rate || 0),
    (designer.budget_adherence_rate || 0),
    (designer.client_retention_rate || 0)
  ];
  
  const avgPerformance = metrics.reduce((sum, val) => sum + val, 0) / metrics.length;
  return avgPerformance;
}

// Match communication style preferences
export function matchCommunicationStyle(
  designerStyle?: string, 
  clientPrefs?: ClientPreferences
): number {
  if (!designerStyle || !clientPrefs?.communication_frequency) return 80;
  
  const compatibility: Record<string, Record<string, number>> = {
    'formal': { 'minimal': 90, 'regular': 80, 'frequent': 60 },
    'casual': { 'minimal': 70, 'regular': 90, 'frequent': 80 },
    'collaborative': { 'minimal': 60, 'regular': 80, 'frequent': 100 }
  };
  
  return compatibility[designerStyle]?.[clientPrefs.communication_frequency] || 75;
}

// Match work approach to requirements
export function matchWorkApproach(workApproach?: string, requirements?: string): number {
  if (!workApproach || !requirements) return 75;
  
  const approachKeywords = workApproach.toLowerCase().split(' ');
  const reqKeywords = requirements.toLowerCase().split(' ');
  
  let matchCount = 0;
  approachKeywords.forEach(keyword => {
    if (reqKeywords.includes(keyword)) matchCount++;
  });
  
  return Math.min(100, 60 + (matchCount * 10));
}

// Match tools compatibility
export function matchTools(designerTools?: string[], requiredTools?: string[]): number {
  if (!requiredTools?.length) return 100; // No specific tools required
  if (!designerTools?.length) return 30; // Designer has no tools listed
  
  const matchedTools = requiredTools.filter(tool => 
    designerTools.some(dt => dt.toLowerCase() === tool.toLowerCase())
  );
  
  return (matchedTools.length / requiredTools.length) * 100;
}

// Get bonus for previous successful collaborations
export function getPreviousSuccessBonus(designerId: string, clientId: string): number {
  // This would query the database for previous successful matches
  // For now, returning 0 as placeholder
  return 0;
}

// Get bonus based on client preferences
export function getClientPreferenceBonus(
  designer: Designer, 
  clientPrefs?: ClientPreferences
): number {
  if (!clientPrefs) return 0;
  
  let bonus = 0;
  
  // Style preferences
  if (clientPrefs.preferred_styles?.length && designer.styles?.length) {
    const matchingStyles = designer.styles.filter(style => 
      clientPrefs.preferred_styles!.includes(style)
    );
    bonus += (matchingStyles.length / clientPrefs.preferred_styles.length) * 30;
  }
  
  // Avoid certain styles
  if (clientPrefs.avoided_styles?.length && designer.styles?.length) {
    const hasAvoidedStyles = designer.styles.some(style => 
      clientPrefs.avoided_styles!.includes(style)
    );
    if (hasAvoidedStyles) bonus -= 20;
  }
  
  // Experience preference
  if (clientPrefs.preferred_designer_experience) {
    const expMap: Record<string, number[]> = {
      'junior': [0, 3],
      'mid': [3, 7],
      'senior': [7, 100],
      'any': [0, 100]
    };
    
    const [min, max] = expMap[clientPrefs.preferred_designer_experience];
    if (designer.years_experience >= min && designer.years_experience <= max) {
      bonus += 20;
    }
  }
  
  return Math.max(0, Math.min(100, bonus));
}

// Main enhanced scoring function
export function calculateEnhancedRelevanceScore(
  designer: Designer,
  brief: Brief,
  clientPrefs?: ClientPreferences
): EnhancedScoreResult {
  const weights = getDynamicWeights(brief);
  
  const breakdown: EnhancedScoreBreakdown = {
    styleMatch: calculateStyleMatch(designer.styles, brief.styles),
    industryMatch: calculateIndustryMatch(designer.industries, brief.industry),
    availabilityMatch: calculateAvailabilityMatch(designer.availability, brief.timeline),
    experienceLevel: matchExperienceLevel(designer.years_experience, brief.complexity_level),
    projectSizeMatch: matchProjectSize(designer.preferred_project_size, brief.budget),
    specializationMatch: matchSpecializations(designer.specializations || [], brief.project_type),
    performanceScore: calculatePerformanceScore(designer),
    clientSatisfaction: (designer.avg_client_satisfaction || 4) * 20,
    deliveryReliability: designer.on_time_delivery_rate || 85,
    communicationFit: matchCommunicationStyle(designer.communication_style, clientPrefs),
    workApproachFit: matchWorkApproach(designer.work_approach, brief.requirements),
    toolsCompatibility: matchTools(designer.tools_expertise, brief.required_tools),
    previousSuccess: getPreviousSuccessBonus(designer.id, brief.client_id),
    clientPreferenceBonus: getClientPreferenceBonus(designer, clientPrefs)
  };
  
  // Calculate weighted total
  let totalScore = 0;
  Object.entries(breakdown).forEach(([key, score]) => {
    totalScore += score * (weights[key] || 0);
  });
  
  // Determine confidence level
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  const dataCompleteness = Object.values(breakdown).filter(v => v > 0).length / Object.keys(breakdown).length;
  
  if (totalScore >= 85 && dataCompleteness >= 0.8) {
    confidence = 'high';
  } else if (totalScore < 60 || dataCompleteness < 0.5) {
    confidence = 'low';
  }
  
  return {
    totalScore: Math.min(100, Math.round(totalScore)),
    breakdown,
    weights,
    confidence
  };
}