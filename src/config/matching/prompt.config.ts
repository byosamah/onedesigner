/**
 * AI Matching Prompt Configuration
 * Edit this file to change how the AI analyzes and matches designers to clients
 */

export const MATCHING_PROMPT_CONFIG = {
  // System role defines the AI's persona and approach
  systemRole: `You are an elite designer-client matchmaker AI with deep expertise in creative industries. 
Your task is to analyze client projects and designer profiles to identify THE SINGLE PERFECT MATCH with surgical precision. 
Your selection must be defensible, data-driven, and compelling. You understand nuances in design styles, industry requirements, and working relationships.`,

  // Scoring weights (must total 100)
  scoringWeights: {
    categoryMastery: 30,      // Expertise in the specific project type
    styleAlignment: 25,       // Match between required and offered styles
    projectFit: 20,          // Industry experience and project scale match
    workingCompatibility: 15, // Communication style and process alignment
    valueFactors: 10         // Budget fit, availability, and extras
  },

  // Elimination criteria - designers must pass ALL of these
  eliminationCriteria: {
    correctSpecialization: {
      enabled: true,
      description: "Designer must have experience in the project type"
    },
    withinBudget: {
      enabled: true,
      tolerance: 0.2, // 20% tolerance
      description: "Designer's rates must be within budget range"
    },
    availableForTimeline: {
      enabled: true,
      description: "Designer must be available for the project timeline"
    },
    styleAlignment: {
      enabled: true,
      minOverlap: 1, // At least 1 style must match
      description: "Designer must offer at least one required style"
    },
    industryExperience: {
      enabled: false, // Can be disabled if not critical
      description: "Designer should have experience in the client's industry"
    }
  },

  // Matching thresholds
  thresholds: {
    minimumScore: 70,        // Minimum score to be considered a match
    excellentMatch: 85,      // Score for an excellent match
    perfectMatch: 95,        // Score for a perfect match
    noMatchMessage: "No designers currently meet your specific requirements. We recommend adjusting your criteria or waiting for new designers to join."
  },

  // Score interpretation for clients
  scoreInterpretation: {
    "95-100": "Perfect Match - This designer is ideally suited for your project",
    "85-94": "Excellent Match - Highly recommended with strong alignment",
    "75-84": "Good Match - Solid choice with good compatibility",
    "70-74": "Fair Match - Meets requirements but consider alternatives",
    "0-69": "Not Recommended - Significant gaps in requirements"
  },

  // Key factors to analyze in the brief
  briefAnalysisFactors: [
    "project_type",
    "industry",
    "budget",
    "timeline",
    "styles",
    "target_audience",
    "brand_personality",
    "requirements",
    "success_metrics",
    "inspiration"
  ],

  // Key factors to analyze in designer profiles
  designerAnalysisFactors: [
    "specializations",
    "industries",
    "years_experience",
    "styles",
    "portfolio_keywords",
    "availability",
    "communication_style",
    "avg_client_satisfaction",
    "on_time_delivery_rate",
    "project_price_range"
  ],

  // Response format instructions
  responseFormat: {
    requireJSON: true,
    maxReasons: 5,
    includeAlternatives: false, // Set to true to get backup options
    includeConfidenceScore: true,
    includeActionableInsights: true
  },

  // Temperature settings for AI
  aiSettings: {
    temperature: 0.3,        // Lower = more consistent, Higher = more creative
    maxTokens: 2000,
    model: "deepseek-chat"  // Can switch models here
  },

  // Custom matching rules (can be edited without code changes)
  customRules: [
    {
      id: "premium_client_rule",
      condition: "budget >= 10000",
      action: "prioritize_designers_with_rating >= 4.8",
      enabled: true
    },
    {
      id: "urgent_project_rule",
      condition: "timeline === 'urgent'",
      action: "require_availability === 'immediate'",
      enabled: true
    },
    {
      id: "enterprise_rule",
      condition: "company_size === 'enterprise'",
      action: "prioritize_designers_with_enterprise_experience",
      enabled: false
    }
  ],

  // Prompt template components (can be customized)
  promptTemplates: {
    missionStatement: `Analyze this client's project and the available designers to identify THE SINGLE PERFECT MATCH.`,
    
    scoringInstructions: `Use a 100-point scoring system with the following weights:
- Category Mastery (30 pts): Deep expertise in the specific project type
- Style Alignment (25 pts): Perfect match between required and offered styles
- Project Fit (20 pts): Industry experience and project scale compatibility
- Working Compatibility (15 pts): Communication style and process alignment
- Value Factors (10 pts): Budget fit, immediate availability, and bonus skills`,

    outputInstructions: `Return a JSON object with:
- selectedDesignerIndex: The array index of the chosen designer
- matchScore: Numerical score out of 100
- topReasons: Array of 3-5 compelling reasons for this match
- confidence: 'high', 'medium', or 'low'
- uniqueValue: What makes this designer uniquely perfect for this project`
  }
}

export type MatchingPromptConfig = typeof MATCHING_PROMPT_CONFIG