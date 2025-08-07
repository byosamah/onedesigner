-- Create designer styles table
CREATE TABLE IF NOT EXISTS designer_styles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  style VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(designer_id, style)
);

-- Create designer project types table
CREATE TABLE IF NOT EXISTS designer_project_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  project_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(designer_id, project_type)
);

-- Create designer industries table
CREATE TABLE IF NOT EXISTS designer_industries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  industry VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(designer_id, industry)
);

-- Add indexes for better performance
CREATE INDEX idx_designer_styles_designer_id ON designer_styles(designer_id);
CREATE INDEX idx_designer_project_types_designer_id ON designer_project_types(designer_id);
CREATE INDEX idx_designer_industries_designer_id ON designer_industries(designer_id);

-- Add RLS policies
ALTER TABLE designer_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE designer_project_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE designer_industries ENABLE ROW LEVEL SECURITY;

-- Allow designers to read their own styles
CREATE POLICY "Designers can view their own styles" ON designer_styles
  FOR SELECT USING (true);

-- Allow designers to manage their own styles
CREATE POLICY "Designers can manage their own styles" ON designer_styles
  FOR ALL USING (designer_id IN (
    SELECT id FROM designers WHERE email = current_user
  ));

-- Allow designers to read their own project types
CREATE POLICY "Designers can view their own project types" ON designer_project_types
  FOR SELECT USING (true);

-- Allow designers to manage their own project types
CREATE POLICY "Designers can manage their own project types" ON designer_project_types
  FOR ALL USING (designer_id IN (
    SELECT id FROM designers WHERE email = current_user
  ));

-- Allow designers to read their own industries
CREATE POLICY "Designers can view their own industries" ON designer_industries
  FOR SELECT USING (true);

-- Allow designers to manage their own industries
CREATE POLICY "Designers can manage their own industries" ON designer_industries
  FOR ALL USING (designer_id IN (
    SELECT id FROM designers WHERE email = current_user
  ));

-- Add columns to designers table if they don't exist
ALTER TABLE designers 
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS calendly_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;