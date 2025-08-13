-- Add image columns to designers table
-- This allows storing profile pictures and portfolio images uploaded by designers

ALTER TABLE designers 
ADD COLUMN IF NOT EXISTS profile_picture TEXT, 
ADD COLUMN IF NOT EXISTS portfolio_images TEXT[];

-- Update any existing records to have empty portfolio_images array if null
UPDATE designers 
SET portfolio_images = '{}' 
WHERE portfolio_images IS NULL;

-- Add comments to document the columns
COMMENT ON COLUMN designers.profile_picture IS 'Base64 encoded profile picture uploaded by designer';
COMMENT ON COLUMN designers.portfolio_images IS 'Array of base64 encoded portfolio images (max 3)';