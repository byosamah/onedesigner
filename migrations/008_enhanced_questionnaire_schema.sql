-- Enhanced Client Brief Schema
-- Add new columns to briefs table for enhanced questionnaire

ALTER TABLE briefs ADD COLUMN IF NOT EXISTS design_category VARCHAR(50);
ALTER TABLE briefs ADD COLUMN IF NOT EXISTS project_description TEXT;
ALTER TABLE briefs ADD COLUMN IF NOT EXISTS timeline_type VARCHAR(20); -- 'urgent', 'standard', 'flexible'
ALTER TABLE briefs ADD COLUMN IF NOT EXISTS budget_range VARCHAR(20); -- 'entry', 'mid', 'premium'
ALTER TABLE briefs ADD COLUMN IF NOT EXISTS deliverables TEXT[];
ALTER TABLE briefs ADD COLUMN IF NOT EXISTS target_audience TEXT;
ALTER TABLE briefs ADD COLUMN IF NOT EXISTS project_goal VARCHAR(100);
ALTER TABLE briefs ADD COLUMN IF NOT EXISTS design_style_keywords VARCHAR(100)[];
ALTER TABLE briefs ADD COLUMN IF NOT EXISTS design_examples TEXT[];
ALTER TABLE briefs ADD COLUMN IF NOT EXISTS avoid_colors_styles TEXT;
ALTER TABLE briefs ADD COLUMN IF NOT EXISTS involvement_level VARCHAR(30);
ALTER TABLE briefs ADD COLUMN IF NOT EXISTS communication_preference VARCHAR(30);
ALTER TABLE briefs ADD COLUMN IF NOT EXISTS previous_designer_experience TEXT;
ALTER TABLE briefs ADD COLUMN IF NOT EXISTS has_brand_guidelines BOOLEAN;

-- Enhanced Designer Profile Schema
-- Add new columns to designers table for detailed profiles

ALTER TABLE designers ADD COLUMN IF NOT EXISTS primary_categories VARCHAR(50)[];
ALTER TABLE designers ADD COLUMN IF NOT EXISTS secondary_categories VARCHAR(50)[];
ALTER TABLE designers ADD COLUMN IF NOT EXISTS design_philosophy TEXT;
ALTER TABLE designers ADD COLUMN IF NOT EXISTS style_keywords VARCHAR(100)[];
ALTER TABLE designers ADD COLUMN IF NOT EXISTS portfolio_projects JSONB; -- {title, description, category, url, image_url}[]
ALTER TABLE designers ADD COLUMN IF NOT EXISTS preferred_industries VARCHAR(100)[];
ALTER TABLE designers ADD COLUMN IF NOT EXISTS preferred_project_sizes VARCHAR(20)[]; -- 'small', 'medium', 'large'
ALTER TABLE designers ADD COLUMN IF NOT EXISTS expert_tools VARCHAR(100)[];
ALTER TABLE designers ADD COLUMN IF NOT EXISTS special_skills VARCHAR(100)[]; -- rush, strategy, research, systems
ALTER TABLE designers ADD COLUMN IF NOT EXISTS turnaround_times JSONB; -- {category: days}
ALTER TABLE designers ADD COLUMN IF NOT EXISTS revision_rounds_included INTEGER;
ALTER TABLE designers ADD COLUMN IF NOT EXISTS collaboration_style VARCHAR(30);
ALTER TABLE designers ADD COLUMN IF NOT EXISTS current_availability VARCHAR(30);
ALTER TABLE designers ADD COLUMN IF NOT EXISTS ideal_client_types VARCHAR(100)[];
ALTER TABLE designers ADD COLUMN IF NOT EXISTS dream_project_description TEXT;
ALTER TABLE designers ADD COLUMN IF NOT EXISTS portfolio_link TEXT;

-- Create new table for portfolio images
CREATE TABLE IF NOT EXISTS designer_portfolio_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id UUID REFERENCES designers(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_key TEXT, -- For cloud storage reference
  project_title VARCHAR(200),
  project_description TEXT,
  category VARCHAR(50),
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_briefs_design_category ON briefs(design_category);
CREATE INDEX IF NOT EXISTS idx_briefs_timeline_budget ON briefs(timeline_type, budget_range);
CREATE INDEX IF NOT EXISTS idx_designers_primary_categories ON designers USING GIN(primary_categories);
CREATE INDEX IF NOT EXISTS idx_designers_secondary_categories ON designers USING GIN(secondary_categories);
CREATE INDEX IF NOT EXISTS idx_designers_style_keywords ON designers USING GIN(style_keywords);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_designer ON designer_portfolio_images(designer_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_images_category ON designer_portfolio_images(category);

-- Add constraints
ALTER TABLE briefs ADD CONSTRAINT check_timeline_type 
  CHECK (timeline_type IN ('urgent', 'standard', 'flexible'));
ALTER TABLE briefs ADD CONSTRAINT check_budget_range 
  CHECK (budget_range IN ('entry', 'mid', 'premium'));
ALTER TABLE briefs ADD CONSTRAINT check_involvement_level 
  CHECK (involvement_level IN ('highly-collaborative', 'milestone-based', 'hands-off'));
ALTER TABLE briefs ADD CONSTRAINT check_communication_preference 
  CHECK (communication_preference IN ('daily-updates', 'weekly-summaries', 'as-needed'));

-- Add constraints for designers
ALTER TABLE designers ADD CONSTRAINT check_collaboration_style 
  CHECK (collaboration_style IN ('high-touch', 'milestone-based', 'independent'));
ALTER TABLE designers ADD CONSTRAINT check_current_availability 
  CHECK (current_availability IN ('available', 'busy', 'unavailable'));

-- Update existing briefs with default categories based on project_type
UPDATE briefs SET design_category = 
  CASE 
    WHEN project_type = 'Brand Identity' THEN 'branding-logo'
    WHEN project_type = 'Website Design' THEN 'web-mobile'
    WHEN project_type = 'Mobile App' THEN 'web-mobile'
    WHEN project_type = 'Social Media' THEN 'social-media'
    WHEN project_type = 'Print Design' THEN 'presentations'
    WHEN project_type = 'Packaging' THEN 'branding-logo'
    ELSE 'branding-logo'
  END
WHERE design_category IS NULL;

-- Set default timeline and budget for existing briefs
UPDATE briefs SET 
  timeline_type = 'standard',
  budget_range = 'mid'
WHERE timeline_type IS NULL OR budget_range IS NULL;

-- Update existing designers with default categories based on their specializations
UPDATE designers SET 
  primary_categories = ARRAY['branding-logo'],
  collaboration_style = 'milestone-based',
  current_availability = 'available',
  revision_rounds_included = 3
WHERE primary_categories IS NULL;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for portfolio images
CREATE TRIGGER update_portfolio_images_updated_at BEFORE UPDATE ON designer_portfolio_images 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE designer_portfolio_images IS 'Stores portfolio images uploaded by designers';
COMMENT ON COLUMN briefs.design_category IS 'Main design category from new category system';
COMMENT ON COLUMN briefs.timeline_type IS 'Project urgency: urgent, standard, or flexible';
COMMENT ON COLUMN briefs.budget_range IS 'Budget category: entry, mid, or premium';
COMMENT ON COLUMN designers.primary_categories IS 'Designer primary specialties (max 3)';
COMMENT ON COLUMN designers.secondary_categories IS 'Designer secondary skills (max 5)';
COMMENT ON COLUMN designers.design_philosophy IS 'Designer philosophy in one sentence';
COMMENT ON COLUMN designers.portfolio_projects IS 'JSON array of portfolio project details';