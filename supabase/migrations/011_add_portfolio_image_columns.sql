-- Migration to add portfolio image columns to designers table
-- This migration adds the individual portfolio_image columns that were referenced in the code
-- but don't exist in the database yet

-- Add portfolio_image_1, portfolio_image_2, portfolio_image_3 columns
ALTER TABLE designers
ADD COLUMN IF NOT EXISTS portfolio_image_1 TEXT,
ADD COLUMN IF NOT EXISTS portfolio_image_2 TEXT,
ADD COLUMN IF NOT EXISTS portfolio_image_3 TEXT;

-- Add comment to explain the columns
COMMENT ON COLUMN designers.portfolio_image_1 IS 'First portfolio image URL or base64 data';
COMMENT ON COLUMN designers.portfolio_image_2 IS 'Second portfolio image URL or base64 data';
COMMENT ON COLUMN designers.portfolio_image_3 IS 'Third portfolio image URL or base64 data';

-- Note: The 'tools' column is currently being used to store portfolio images as an array
-- After this migration, you can migrate data from tools array to individual columns if needed

-- Optional: Migrate existing data from tools array to individual columns
-- Uncomment the following if you want to migrate existing data:
/*
UPDATE designers
SET 
  portfolio_image_1 = CASE 
    WHEN tools IS NOT NULL AND jsonb_array_length(tools::jsonb) > 0 
    THEN tools::jsonb->0 
    ELSE NULL 
  END,
  portfolio_image_2 = CASE 
    WHEN tools IS NOT NULL AND jsonb_array_length(tools::jsonb) > 1 
    THEN tools::jsonb->1 
    ELSE NULL 
  END,
  portfolio_image_3 = CASE 
    WHEN tools IS NOT NULL AND jsonb_array_length(tools::jsonb) > 2 
    THEN tools::jsonb->2 
    ELSE NULL 
  END
WHERE tools IS NOT NULL;
*/