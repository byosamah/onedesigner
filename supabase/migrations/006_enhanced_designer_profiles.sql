-- Migration: Enhanced Designer Profiles for AI Matching System
-- Description: Adds comprehensive fields for better designer-client matching

-- Add new fields to designers table
ALTER TABLE designers
ADD COLUMN IF NOT EXISTS portfolio_keywords TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS design_philosophy TEXT,
ADD COLUMN IF NOT EXISTS specializations TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tools_expertise TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_project_size TEXT CHECK (preferred_project_size IN ('small', 'medium', 'large', 'enterprise')),
ADD COLUMN IF NOT EXISTS preferred_timeline TEXT CHECK (preferred_timeline IN ('urgent', 'standard', 'flexible')),
ADD COLUMN IF NOT EXISTS revision_approach TEXT CHECK (revision_approach IN ('unlimited', 'structured', 'limited')),
ADD COLUMN IF NOT EXISTS communication_style TEXT CHECK (communication_style IN ('formal', 'casual', 'collaborative')),
ADD COLUMN IF NOT EXISTS avg_project_duration_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS project_completion_rate DECIMAL(5,2) DEFAULT 0.00 CHECK (project_completion_rate >= 0 AND project_completion_rate <= 100),
ADD COLUMN IF NOT EXISTS client_retention_rate DECIMAL(5,2) DEFAULT 0.00 CHECK (client_retention_rate >= 0 AND client_retention_rate <= 100),
ADD COLUMN IF NOT EXISTS on_time_delivery_rate DECIMAL(5,2) DEFAULT 0.00 CHECK (on_time_delivery_rate >= 0 AND on_time_delivery_rate <= 100),
ADD COLUMN IF NOT EXISTS budget_adherence_rate DECIMAL(5,2) DEFAULT 0.00 CHECK (budget_adherence_rate >= 0 AND budget_adherence_rate <= 100),
ADD COLUMN IF NOT EXISTS avg_client_satisfaction DECIMAL(3,2) DEFAULT 0.00 CHECK (avg_client_satisfaction >= 0 AND avg_client_satisfaction <= 5),
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{"English"}',
ADD COLUMN IF NOT EXISTS team_size TEXT CHECK (team_size IN ('solo', 'small_team', 'agency')),
ADD COLUMN IF NOT EXISTS total_projects_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS strengths TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS work_approach TEXT;

-- Create match_analytics table for tracking match outcomes
CREATE TABLE IF NOT EXISTS match_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  
  -- Initial Match Data
  match_score DECIMAL(5,2) NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  ai_confidence TEXT CHECK (ai_confidence IN ('high', 'medium', 'low')),
  match_reasons TEXT[] DEFAULT '{}',
  alternative_designers JSONB DEFAULT '[]',
  
  -- Outcome Tracking
  match_accepted BOOLEAN DEFAULT NULL,
  project_started BOOLEAN DEFAULT FALSE,
  project_completed BOOLEAN DEFAULT FALSE,
  client_satisfaction INTEGER CHECK (client_satisfaction >= 1 AND client_satisfaction <= 5),
  designer_satisfaction INTEGER CHECK (designer_satisfaction >= 1 AND designer_satisfaction <= 5),
  
  -- Performance Metrics
  timeline_adherence BOOLEAN DEFAULT NULL,
  budget_adherence BOOLEAN DEFAULT NULL,
  revision_count INTEGER DEFAULT 0,
  communication_quality INTEGER CHECK (communication_quality >= 1 AND communication_quality <= 5),
  
  -- Feedback
  client_feedback TEXT,
  designer_feedback TEXT,
  success_factors TEXT[] DEFAULT '{}',
  improvement_areas TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(match_id)
);

-- Create client_preferences table for learning client patterns
CREATE TABLE IF NOT EXISTS client_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Learned Preferences
  preferred_styles TEXT[] DEFAULT '{}',
  avoided_styles TEXT[] DEFAULT '{}',
  price_sensitivity TEXT CHECK (price_sensitivity IN ('low', 'medium', 'high')),
  quality_vs_speed TEXT CHECK (quality_vs_speed IN ('quality', 'balanced', 'speed')),
  communication_frequency TEXT CHECK (communication_frequency IN ('minimal', 'regular', 'frequent')),
  decision_making_speed TEXT CHECK (decision_making_speed IN ('fast', 'moderate', 'deliberate')),
  
  -- Historical Patterns
  avg_project_budget DECIMAL(10,2) DEFAULT 0.00,
  typical_project_duration INTEGER DEFAULT 0,
  preferred_designer_experience TEXT CHECK (preferred_designer_experience IN ('junior', 'mid', 'senior', 'any')),
  industry_focus TEXT[] DEFAULT '{}',
  
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(client_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_designers_specializations ON designers USING GIN (specializations);
CREATE INDEX IF NOT EXISTS idx_designers_tools ON designers USING GIN (tools_expertise);
CREATE INDEX IF NOT EXISTS idx_designers_performance ON designers (avg_client_satisfaction, on_time_delivery_rate);
CREATE INDEX IF NOT EXISTS idx_match_analytics_match_id ON match_analytics (match_id);
CREATE INDEX IF NOT EXISTS idx_match_analytics_client_id ON match_analytics (client_id);
CREATE INDEX IF NOT EXISTS idx_match_analytics_designer_id ON match_analytics (designer_id);
CREATE INDEX IF NOT EXISTS idx_client_preferences_client_id ON client_preferences (client_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_match_analytics_updated_at BEFORE UPDATE ON match_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_preferences_updated_at BEFORE UPDATE ON client_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update existing matches to have analytics records
INSERT INTO match_analytics (match_id, client_id, designer_id, match_score)
SELECT 
  m.id, 
  m.client_id, 
  m.designer_id, 
  COALESCE(m.score, 75)
FROM matches m
LEFT JOIN match_analytics ma ON m.id = ma.match_id
WHERE ma.id IS NULL;

-- Add some default values for existing designers
UPDATE designers
SET 
  avg_client_satisfaction = 4.5,
  on_time_delivery_rate = 90.00,
  project_completion_rate = 95.00,
  budget_adherence_rate = 85.00,
  preferred_project_size = 'medium',
  preferred_timeline = 'standard',
  communication_style = 'collaborative',
  team_size = 'solo',
  revision_approach = 'structured'
WHERE avg_client_satisfaction IS NULL OR avg_client_satisfaction = 0;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON match_analytics TO authenticated;
GRANT SELECT, INSERT, UPDATE ON client_preferences TO authenticated;
GRANT SELECT ON match_analytics TO anon;
GRANT SELECT ON client_preferences TO anon;