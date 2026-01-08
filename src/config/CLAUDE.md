# Configuration System - CLAUDE.md

## Overview
OneDesigner's configuration system (`/src/config/`) provides centralized, type-safe configuration management for forms, AI matching, and business rules. The system enables rapid customization without code changes.

## Configuration Architecture

### Central Export (`index.ts`)
```typescript
// Single source of truth for all configuration
export * from './forms/brief.config'
export * from './forms/designer.config' 
export * from './matching/prompt.config'

// Main configuration access point
export const config = {
  forms: {
    brief: briefFormConfig,
    designer: designerFormConfig
  },
  matching: matchingConfig,
  business: businessRulesConfig
}
```

## Form Configuration System

### Brief Form Configuration (`/forms/brief.config.ts`)
**Purpose**: Category-specific form configurations for client project briefs

#### Supported Design Categories:
1. **Branding & Logo Design**
2. **Web & Mobile Design**  
3. **Social Media Graphics**
4. **Motion Graphics**
5. **Photography & Video**
6. **Presentations**

#### Configuration Structure:
```typescript
interface BriefFormConfig {
  [category: string]: {
    title: string
    description: string
    defaultValues: Record<string, any>
    fields: FormFieldConfig[]
    validation: ValidationSchema
    estimatedTime: string // "5-10 minutes"
  }
}
```

#### Category-Specific Fields Example:
```typescript
export const briefFormConfig: BriefFormConfig = {
  'branding-logo': {
    title: 'Branding & Logo Design Brief',
    description: 'Tell us about your brand identity needs',
    defaultValues: {
      project_type: 'Branding & Logo Design',
      brand_name: '',
      industry: '',
      target_audience: '',
      brand_personality: [],
      color_preferences: [],
      style_preferences: [],
      deliverables: []
    },
    fields: [
      {
        name: 'brand_name',
        label: 'Brand/Company Name',
        type: 'text',
        required: true,
        placeholder: 'Enter your brand name'
      },
      {
        name: 'industry',
        label: 'Industry/Business Type',
        type: 'select',
        required: true,
        options: [
          'Technology', 'Healthcare', 'Finance', 'Education',
          'Retail', 'Food & Beverage', 'Real Estate', 'Other'
        ]
      },
      {
        name: 'brand_personality',
        label: 'Brand Personality',
        type: 'multi-select',
        options: [
          'Professional', 'Creative', 'Modern', 'Traditional',
          'Playful', 'Luxury', 'Minimalist', 'Bold'
        ]
      },
      {
        name: 'deliverables',
        label: 'Required Deliverables',
        type: 'checkbox-group',
        options: [
          'Logo Design', 'Brand Guidelines', 'Business Cards',
          'Letterhead', 'Social Media Kit', 'Website Headers'
        ]
      }
    ],
    validation: brandingValidationSchema,
    estimatedTime: '8-12 minutes'
  },
  
  'web-mobile': {
    title: 'Web & Mobile Design Brief',
    description: 'Share your digital product vision',
    defaultValues: {
      project_type: 'Web & Mobile Design',
      platform_type: '',
      target_devices: [],
      user_types: [],
      key_features: [],
      design_style: [],
      reference_sites: ''
    },
    fields: [
      {
        name: 'platform_type',
        label: 'Platform Type',
        type: 'radio',
        required: true,
        options: ['Website', 'Mobile App', 'Web App', 'Both Web & Mobile']
      },
      {
        name: 'target_devices',
        label: 'Target Devices',
        type: 'checkbox-group',
        options: ['Desktop', 'Tablet', 'Mobile Phone', 'Smart TV']
      },
      {
        name: 'key_features',
        label: 'Key Features/Pages',
        type: 'textarea',
        placeholder: 'List the main features or pages you need...'
      },
      {
        name: 'reference_sites',
        label: 'Reference Websites/Apps',
        type: 'textarea',
        placeholder: 'Share URLs of designs you like and why...'
      }
    ],
    validation: webMobileValidationSchema,
    estimatedTime: '6-10 minutes'
  }
  
  // ... Additional categories with specific fields
}
```

#### Dynamic Field Rendering:
```typescript
const BriefForm = ({ category }: { category: DesignCategory }) => {
  const config = briefFormConfig[category]
  const [formData, setFormData] = useState(config.defaultValues)
  
  return (
    <form>
      <h2>{config.title}</h2>
      <p>{config.description}</p>
      
      {config.fields.map(field => (
        <FormField
          key={field.name}
          config={field}
          value={formData[field.name]}
          onChange={(value) => setFormData(prev => ({
            ...prev,
            [field.name]: value
          }))}
        />
      ))}
    </form>
  )
}
```

### Designer Form Configuration (`/forms/designer.config.ts`)
**Purpose**: Multi-step designer application form configuration

#### Application Steps:
1. **Basic Information** - Name, email, title, location
2. **Experience & Expertise** - Years, specializations, skills
3. **Portfolio & Work** - Portfolio URL, case studies, work samples
4. **Categories & Services** - Design categories, service offerings
5. **Tools & Technology** - Software, tools, technical skills
6. **Availability & Rates** - Working hours, pricing, availability

#### Configuration Structure:
```typescript
interface DesignerFormConfig {
  steps: {
    [stepNumber: number]: {
      title: string
      description: string
      fields: FormFieldConfig[]
      validation: ValidationSchema
      optional?: boolean
    }
  }
  totalSteps: number
  estimatedTime: string
}

export const designerFormConfig: DesignerFormConfig = {
  steps: {
    1: {
      title: 'Basic Information',
      description: 'Tell us about yourself',
      fields: [
        {
          name: 'first_name',
          label: 'First Name',
          type: 'text',
          required: true
        },
        {
          name: 'last_name', 
          label: 'Last Name',
          type: 'text',
          required: true
        },
        {
          name: 'professional_title',
          label: 'Professional Title',
          type: 'text',
          placeholder: 'e.g., Senior UI/UX Designer',
          required: true
        },
        {
          name: 'location',
          label: 'Location',
          type: 'text',
          placeholder: 'City, Country',
          required: false
        }
      ],
      validation: basicInfoValidationSchema
    },
    
    2: {
      title: 'Experience & Expertise',
      description: 'Share your design experience',
      fields: [
        {
          name: 'years_experience',
          label: 'Years of Professional Experience',
          type: 'select',
          required: true,
          options: [
            '0-1 years', '2-3 years', '4-5 years', 
            '6-8 years', '9-12 years', '12+ years'
          ]
        },
        {
          name: 'expertise_areas',
          label: 'Areas of Expertise',
          type: 'multi-select',
          required: true,
          options: [
            'User Interface (UI) Design',
            'User Experience (UX) Design',
            'Brand Identity & Logo Design',
            'Web Design',
            'Mobile App Design',
            'Print Design',
            'Motion Graphics',
            'Illustration',
            'Photography'
          ]
        },
        {
          name: 'industries_worked',
          label: 'Industries You\'ve Worked In',
          type: 'multi-select',
          options: [
            'Technology/Software', 'E-commerce', 'Healthcare',
            'Finance', 'Education', 'Entertainment', 'Non-profit',
            'Real Estate', 'Food & Beverage', 'Fashion'
          ]
        }
      ],
      validation: experienceValidationSchema
    }
    
    // ... Additional steps 3-6
  },
  totalSteps: 6,
  estimatedTime: '15-20 minutes'
}
```

## AI Matching Configuration

### Prompt Configuration (`/matching/prompt.config.ts`)
**Purpose**: Centralized AI matching system configuration

#### System Configuration:
```typescript
interface MatchingConfig {
  provider: 'deepseek' | 'openai' | 'anthropic'
  model: string
  systemRole: string
  personality: string
  scoringWeights: ScoringWeights
  eliminationCriteria: EliminationCriteria
  responseFormat: ResponseFormat
  maxTokens: number
  temperature: number
}

export const matchingConfig: MatchingConfig = {
  provider: 'deepseek',
  model: 'deepseek-chat',
  systemRole: `You are an AI matching system for OneDesigner, a premium platform that connects clients with pre-vetted designers. Your role is to analyze client project briefs and designer profiles to create meaningful matches.`,
  
  personality: `Professional yet approachable. You understand both client needs and designer capabilities. You provide honest, realistic match scores and detailed reasoning for your recommendations.`,
  
  scoringWeights: {
    categoryMatch: 0.25,        // 25% - Designer's category expertise
    styleAlignment: 0.20,       // 20% - Visual style compatibility  
    industryExperience: 0.15,   // 15% - Industry-specific experience
    portfolioRelevance: 0.15,   // 15% - Portfolio work relevance
    skillsetMatch: 0.10,        // 10% - Technical skills alignment
    availabilityFit: 0.10,      // 10% - Timeline and availability
    budgetCompatibility: 0.05   // 5% - Budget range compatibility
  },
  
  eliminationCriteria: {
    categoryMismatch: {
      enabled: true,
      threshold: 0.3, // Eliminate if category match < 30%
      message: 'Designer specialization doesn\'t align with project type'
    },
    unavailableDesigner: {
      enabled: true,
      message: 'Designer is currently unavailable'
    },
    portfolioGap: {
      enabled: false, // Disabled to allow emerging designers
      threshold: 0.2,
      message: 'Limited portfolio relevance to project requirements'
    }
  },
  
  responseFormat: {
    scoreRange: { min: 50, max: 85 }, // Realistic scoring range
    reasoningPoints: 3, // Number of key reasoning points
    includeStrengths: true,
    includeConcerns: false, // Positive-focused matching
    personalizedMessage: true
  },
  
  maxTokens: 1000,
  temperature: 0.3 // Lower temperature for consistent scoring
}
```

#### Scoring Algorithm Configuration:
```typescript
interface ScoringWeights {
  categoryMatch: number        // Primary design category alignment
  styleAlignment: number       // Visual style preference matching
  industryExperience: number   // Industry-specific background
  portfolioRelevance: number   // Portfolio work relevance
  skillsetMatch: number        // Technical skills compatibility
  availabilityFit: number      // Timeline availability
  budgetCompatibility: number  // Budget range alignment
}

// Scoring calculation example:
const calculateMatchScore = (brief: Brief, designer: Designer): number => {
  const scores = {
    categoryMatch: calculateCategoryMatch(brief, designer),
    styleAlignment: calculateStyleAlignment(brief, designer),
    industryExperience: calculateIndustryMatch(brief, designer),
    portfolioRelevance: calculatePortfolioRelevance(brief, designer),
    skillsetMatch: calculateSkillsetMatch(brief, designer),
    availabilityFit: calculateAvailabilityFit(brief, designer),
    budgetCompatibility: calculateBudgetFit(brief, designer)
  }
  
  const weightedScore = Object.entries(scores).reduce((total, [key, score]) => {
    return total + (score * matchingConfig.scoringWeights[key])
  }, 0)
  
  return Math.round(weightedScore * 100) // Convert to percentage
}
```

#### Prompt Template System:
```typescript
const generateMatchingPrompt = (brief: Brief, designer: Designer): string => {
  return `
${matchingConfig.systemRole}

${matchingConfig.personality}

PROJECT BRIEF:
- Type: ${brief.project_type}
- Industry: ${brief.industry}
- Budget: ${brief.budget}
- Timeline: ${brief.timeline}  
- Style Preferences: ${brief.styles.join(', ')}
- Requirements: ${brief.requirements}

DESIGNER PROFILE:
- Name: ${designer.first_name} ${designer.last_name}
- Title: ${designer.professional_title}
- Experience: ${designer.years_experience}
- Specializations: ${designer.categories.join(', ')}
- Styles: ${designer.design_styles.join(', ')}
- Tools: ${designer.tools.join(', ')}
- Portfolio: ${designer.portfolio_url}

SCORING CRITERIA:
${Object.entries(matchingConfig.scoringWeights)
  .map(([criterion, weight]) => `- ${criterion}: ${weight * 100}%`)
  .join('\n')}

Please provide:
1. Match score (${matchingConfig.responseFormat.scoreRange.min}-${matchingConfig.responseFormat.scoreRange.max}%)
2. ${matchingConfig.responseFormat.reasoningPoints} key reasons for this match
3. Personalized recommendation message

Response format: JSON
{
  "score": number,
  "reasons": [string, string, string],
  "message": "Personal recommendation for the client"
}
`
}
```

## Business Rules Configuration

### Configuration Integration:
```typescript
interface BusinessRulesConfig {
  creditPackages: CreditPackage[]
  matchingRules: MatchingRules  
  timingRules: TimingRules
  validationRules: ValidationRules
}

export const businessRulesConfig: BusinessRulesConfig = {
  creditPackages: [
    { id: 'starter', name: 'Starter', price: 5, credits: 3 },
    { id: 'growth', name: 'Growth', price: 15, credits: 10 },
    { id: 'scale', name: 'Scale', price: 30, credits: 25 }
  ],
  
  matchingRules: {
    maxMatchesPerClient: 50,
    noDuplicateDesigners: true,
    onlyApprovedDesigners: true,
    persistAfterPayment: true,
    scoreThreshold: 50 // Minimum match score to display
  },
  
  timingRules: {
    sessionExpiry: 30 * 24 * 60 * 60 * 1000, // 30 days
    otpExpiry: 10 * 60 * 1000, // 10 minutes
    otpCooldown: 60 * 1000, // 60 seconds
    matchExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
    projectRequestDeadline: 72 * 60 * 60 * 1000 // 72 hours
  },
  
  validationRules: {
    minBriefLength: 50, // Minimum brief description length
    maxBriefLength: 2000,
    requiredBriefFields: ['project_type', 'budget', 'timeline'],
    designerApprovalRequired: true,
    profileEditRequiresReapproval: true
  }
}
```

## Configuration Usage Patterns

### Form Rendering:
```typescript
import { briefFormConfig } from '@/config'

const CategorySelector = () => {
  const categories = Object.keys(briefFormConfig)
  
  return (
    <div className="category-grid">
      {categories.map(category => (
        <CategoryCard
          key={category}
          title={briefFormConfig[category].title}
          description={briefFormConfig[category].description}
          estimatedTime={briefFormConfig[category].estimatedTime}
          onClick={() => navigateToForm(category)}
        />
      ))}
    </div>
  )
}
```

### AI Matching Integration:
```typescript
import { matchingConfig } from '@/config'

const generateMatchingRequest = async (brief: Brief, designer: Designer) => {
  const prompt = generateMatchingPrompt(brief, designer)
  
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: matchingConfig.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: matchingConfig.maxTokens,
      temperature: matchingConfig.temperature
    })
  })
  
  return await response.json()
}
```

### Business Rules Validation:
```typescript
import { businessRulesConfig } from '@/config'

const validateCreditPurchase = (packageId: string) => {
  const package = businessRulesConfig.creditPackages.find(p => p.id === packageId)
  if (!package) {
    throw new Error('Invalid package selected')
  }
  return package
}
```

## Configuration Management Benefits

### Rapid Customization:
- **Form Changes**: Add/remove fields without code changes
- **AI Tuning**: Adjust scoring weights and prompts easily
- **Business Rules**: Modify pricing and timing rules instantly
- **A/B Testing**: Switch between different configurations

### Type Safety:
- **Full TypeScript**: All configurations type-checked
- **IntelliSense**: Auto-completion for configuration properties
- **Validation**: Runtime validation of configuration values
- **Error Prevention**: Compile-time error catching

### Maintainability:
- **Centralized**: Single source of truth for each domain
- **Documented**: Self-documenting configuration structure  
- **Versioned**: Configuration changes tracked in git
- **Testable**: Configuration can be unit tested

This configuration system enables OneDesigner to be highly customizable and maintainable, with business logic separated from application code and full type safety throughout.