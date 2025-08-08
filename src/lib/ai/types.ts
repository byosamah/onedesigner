export interface Designer {
  id: string
  first_name: string
  last_name: string
  title: string
  email: string
  city: string
  country: string
  years_experience: number
  rating: number
  total_projects: number
  bio?: string
  styles: string[]
  industries: string[]
  tools: string[]
  hourly_rate?: number
  availability?: string
  timezone?: string
}

export interface Brief {
  id: string
  project_type: string
  industry: string
  timeline: string
  budget?: string
  styles: string[]
  inspiration?: string
  requirements?: string
  timezone?: string
}

export interface MatchResult {
  score: number
  reasons: string[]
  personalizedReasons: string[]
  confidence?: 'high' | 'medium' | 'low'
  uniqueValue?: string
  challenges?: string[]
  riskLevel?: 'low' | 'medium' | 'high'
  matchSummary?: string
  strengths?: string[]
  weaknesses?: string[]
  aiAnalyzed?: boolean
}

export interface AIProvider {
  analyzeMatch(designer: Designer, brief: Brief): Promise<MatchResult>
  generateText(params: {
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
    model?: string
    temperature?: number
    maxTokens?: number
    responseFormat?: { type: 'json_object' | 'text' }
  }): Promise<{ text: string }>
}