-- Add enhanced fields to briefs table for better AI matching
ALTER TABLE briefs
ADD COLUMN IF NOT EXISTS design_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS project_description TEXT,
ADD COLUMN IF NOT EXISTS timeline_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS budget_range VARCHAR(50),
ADD COLUMN IF NOT EXISTS deliverables TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS project_goal TEXT,
ADD COLUMN IF NOT EXISTS design_style_keywords TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS design_examples TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS avoid_colors_styles TEXT,
ADD COLUMN IF NOT EXISTS involvement_level VARCHAR(50),
ADD COLUMN IF NOT EXISTS communication_preference VARCHAR(50),
ADD COLUMN IF NOT EXISTS previous_designer_experience TEXT,
ADD COLUMN IF NOT EXISTS has_brand_guidelines BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enhanced_data JSONB;

-- Migrate existing data to new fields
UPDATE briefs 
SET 
  design_category = project_type,
  timeline_type = timeline,
  budget_range = budget,
  project_description = requirements
WHERE design_category IS NULL;

-- Create index for faster matching queries
CREATE INDEX IF NOT EXISTS idx_briefs_design_category ON briefs(design_category);
CREATE INDEX IF NOT EXISTS idx_briefs_timeline_type ON briefs(timeline_type);
CREATE INDEX IF NOT EXISTS idx_briefs_budget_range ON briefs(budget_range);