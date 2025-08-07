# Designer Tables Setup

Run this SQL in your Supabase SQL editor to create the missing designer attribute tables:

```sql
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

-- Add columns to designers table if they don't exist
ALTER TABLE designers 
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS calendly_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
```

## How to run:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the SQL above
4. Click "Run" to execute the script

This will create the necessary tables for storing designer styles, project types, and industries.