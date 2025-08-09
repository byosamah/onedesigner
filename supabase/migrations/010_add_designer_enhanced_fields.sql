-- Add missing columns to designers table
ALTER TABLE designers
ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS dribbble_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS behance_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS previous_clients TEXT,
ADD COLUMN IF NOT EXISTS project_preferences TEXT,
ADD COLUMN IF NOT EXISTS working_style TEXT,
ADD COLUMN IF NOT EXISTS communication_style VARCHAR(100),
ADD COLUMN IF NOT EXISTS remote_experience TEXT,
ADD COLUMN IF NOT EXISTS team_collaboration TEXT;

-- Create designer styles table if not exists
CREATE TABLE IF NOT EXISTS designer_styles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  style VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(designer_id, style)
);

-- Create designer project types table if not exists
CREATE TABLE IF NOT EXISTS designer_project_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  project_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(designer_id, project_type)
);

-- Create designer industries table if not exists
CREATE TABLE IF NOT EXISTS designer_industries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  industry VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(designer_id, industry)
);

-- Create designer specializations table if not exists
CREATE TABLE IF NOT EXISTS designer_specializations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  specialization VARCHAR(200) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(designer_id, specialization)
);

-- Create designer software skills table if not exists
CREATE TABLE IF NOT EXISTS designer_software_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  software VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(designer_id, software)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_designer_styles_designer_id ON designer_styles(designer_id);
CREATE INDEX IF NOT EXISTS idx_designer_project_types_designer_id ON designer_project_types(designer_id);
CREATE INDEX IF NOT EXISTS idx_designer_industries_designer_id ON designer_industries(designer_id);
CREATE INDEX IF NOT EXISTS idx_designer_specializations_designer_id ON designer_specializations(designer_id);
CREATE INDEX IF NOT EXISTS idx_designer_software_skills_designer_id ON designer_software_skills(designer_id);

-- Add index for pending approvals
CREATE INDEX IF NOT EXISTS idx_designers_is_approved ON designers(is_approved) WHERE is_approved = false;