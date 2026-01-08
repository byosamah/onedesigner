export const DESIGN_CATEGORIES = {
  'branding-logo': {
    id: 'branding-logo',
    name: 'Branding & Logo Design',
    description: 'Brand identity, logos, brand guidelines, visual identity systems',
    icon: '🎨',
    subcategories: ['Logo Design', 'Brand Identity', 'Brand Guidelines', 'Visual Identity'],
    averageTimeline: { urgent: 3, standard: 14, flexible: 30 },
    budgetRanges: {
      entry: { min: 500, max: 2000 },
      mid: { min: 2000, max: 10000 },
      premium: { min: 10000, max: 50000 }
    }
  },
  'web-mobile': {
    id: 'web-mobile',
    name: 'Web & Mobile Design (UI/UX)', 
    description: 'Website design, mobile apps, user experience, interface design',
    icon: '💻',
    subcategories: ['Website Design', 'Mobile Apps', 'UI Design', 'UX Design'],
    averageTimeline: { urgent: 5, standard: 21, flexible: 45 },
    budgetRanges: {
      entry: { min: 500, max: 2000 },
      mid: { min: 2000, max: 10000 },
      premium: { min: 10000, max: 50000 }
    }
  },
  'social-media': {
    id: 'social-media',
    name: 'Social Media Design',
    description: 'Social media graphics, templates, content design, advertising',
    icon: '📱',
    subcategories: ['Social Graphics', 'Ad Creative', 'Content Templates', 'Social Campaigns'],
    averageTimeline: { urgent: 2, standard: 7, flexible: 14 },
    budgetRanges: {
      entry: { min: 500, max: 2000 },
      mid: { min: 2000, max: 10000 },
      premium: { min: 10000, max: 50000 }
    }
  },
  'motion-graphics': {
    id: 'motion-graphics',
    name: 'Motion Graphics & Animation',
    description: 'Video graphics, animations, explainer videos, motion design',
    icon: '🎬',
    subcategories: ['Motion Graphics', '2D Animation', 'Video Graphics', 'Explainer Videos'],
    averageTimeline: { urgent: 7, standard: 21, flexible: 60 },
    budgetRanges: {
      entry: { min: 500, max: 2000 },
      mid: { min: 2000, max: 10000 },
      premium: { min: 10000, max: 50000 }
    }
  },
  'photography-video': {
    id: 'photography-video',
    name: 'Photography & Video',
    description: 'Product photography, video production, photo editing, visual content',
    icon: '📸',
    subcategories: ['Product Photography', 'Video Production', 'Photo Editing', 'Content Creation'],
    averageTimeline: { urgent: 3, standard: 10, flexible: 21 },
    budgetRanges: {
      entry: { min: 500, max: 2000 },
      mid: { min: 2000, max: 10000 },
      premium: { min: 10000, max: 50000 }
    }
  },
  'presentations': {
    id: 'presentations',
    name: 'Presentations Design',
    description: 'Presentation decks, pitch decks, corporate presentations, templates',
    icon: '📊',
    subcategories: ['Pitch Decks', 'Corporate Presentations', 'Templates', 'Infographics'],
    averageTimeline: { urgent: 2, standard: 7, flexible: 14 },
    budgetRanges: {
      entry: { min: 500, max: 2000 },
      mid: { min: 2000, max: 10000 },
      premium: { min: 10000, max: 50000 }
    }
  }
} as const

export const TIMELINE_TYPES = {
  urgent: {
    id: 'urgent',
    name: 'Urgent',
    description: '<1 week',
    days: 7,
    icon: '⚡'
  },
  standard: {
    id: 'standard', 
    name: 'Standard',
    description: '2-4 weeks',
    days: 28,
    icon: '📅'
  },
  flexible: {
    id: 'flexible',
    name: 'Flexible', 
    description: '1+ months',
    days: 60,
    icon: '🕰️'
  }
} as const

export const BUDGET_RANGES = {
  entry: {
    id: 'entry',
    name: 'Entry',
    description: '$500-2k',
    min: 500,
    max: 2000,
    icon: '💰'
  },
  mid: {
    id: 'mid',
    name: 'Mid',
    description: '$2k-10k', 
    min: 2000,
    max: 10000,
    icon: '💎'
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: '$10k+',
    min: 10000,
    max: 100000,
    icon: '👑'
  }
} as const

export const PROJECT_GOALS = [
  'Increase sales',
  'Build brand awareness', 
  'Rebrand/refresh identity',
  'Launch new product',
  'Improve user experience',
  'Create marketing materials',
  'Establish online presence',
  'Stand out from competitors'
] as const

export const INVOLVEMENT_LEVELS = {
  'highly-collaborative': {
    id: 'highly-collaborative',
    name: 'Highly Collaborative',
    description: 'I want to be involved in every step and provide frequent input'
  },
  'milestone-based': {
    id: 'milestone-based', 
    name: 'Check Key Milestones',
    description: 'Show me progress at key stages, but give creative freedom between'
  },
  'hands-off': {
    id: 'hands-off',
    name: 'Hands-off Until Review', 
    description: 'Handle it independently, just show me the final results for approval'
  }
} as const

export const COMMUNICATION_PREFERENCES = {
  'daily-updates': {
    id: 'daily-updates',
    name: 'Daily Updates',
    description: 'Brief daily check-ins on progress'
  },
  'weekly-summaries': {
    id: 'weekly-summaries',
    name: 'Weekly Summaries',
    description: 'Weekly progress reports and milestone updates'
  },
  'as-needed': {
    id: 'as-needed',
    name: 'As-needed',
    description: 'Only reach out when input or approval is needed'
  }
} as const

export const DESIGNER_PROJECT_SIZES = {
  small: {
    id: 'small',
    name: 'Small',
    description: '<$2k',
    max: 2000
  },
  medium: {
    id: 'medium',
    name: 'Medium', 
    description: '$2k-10k',
    min: 2000,
    max: 10000
  },
  large: {
    id: 'large',
    name: 'Large',
    description: '$10k+',
    min: 10000
  }
} as const

export const COLLABORATION_STYLES = {
  'high-touch': {
    id: 'high-touch',
    name: 'High-touch',
    description: 'Frequent collaboration and feedback throughout the project'
  },
  'milestone-based': {
    id: 'milestone-based',
    name: 'Milestone-based', 
    description: 'Regular check-ins at key project phases'
  },
  'independent': {
    id: 'independent',
    name: 'Independent',
    description: 'Work independently with final delivery and revisions'
  }
} as const

export const SPECIAL_SKILLS = [
  'Rush projects',
  'Brand strategy', 
  'User research',
  'Design systems',
  'Content strategy',
  'Technical implementation',
  'Multi-language design',
  'Accessibility compliance'
] as const

export const DESIGN_TOOLS = [
  'Figma',
  'Adobe Creative Suite',
  'Sketch',
  'InVision',
  'Principle',
  'After Effects',
  'Cinema 4D',
  'Webflow',
  'Framer',
  'Canva Pro'
] as const

// Helper functions
export function getCategoryById(id: string) {
  return DESIGN_CATEGORIES[id as keyof typeof DESIGN_CATEGORIES]
}

export function getCategoryOptions() {
  return Object.values(DESIGN_CATEGORIES).map(category => ({
    value: category.id,
    label: category.name,
    description: category.description,
    icon: category.icon
  }))
}

export function getTimelineOptions() {
  return Object.values(TIMELINE_TYPES).map(timeline => ({
    value: timeline.id,
    label: `${timeline.name}: ${timeline.description}`,
    icon: timeline.icon
  }))
}

export function getBudgetOptions() {
  return Object.values(BUDGET_RANGES).map(budget => ({
    value: budget.id,
    label: `${budget.name}: ${budget.description}`,
    icon: budget.icon
  }))
}