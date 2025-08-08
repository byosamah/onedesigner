-- Add portfolio image fields to designers table
-- This migration adds portfolio image support for designers

-- Add portfolio image columns to designers table
ALTER TABLE designers ADD COLUMN IF NOT EXISTS portfolio_image_1 TEXT;
ALTER TABLE designers ADD COLUMN IF NOT EXISTS portfolio_image_2 TEXT;
ALTER TABLE designers ADD COLUMN IF NOT EXISTS portfolio_image_3 TEXT;

-- Create index for portfolio images (for faster queries)
CREATE INDEX IF NOT EXISTS idx_designers_portfolio_images ON designers(portfolio_image_1, portfolio_image_2, portfolio_image_3);

-- Add constraints to ensure reasonable file sizes
COMMENT ON COLUMN designers.portfolio_image_1 IS 'First portfolio image URL - max 20MB';
COMMENT ON COLUMN designers.portfolio_image_2 IS 'Second portfolio image URL - max 20MB';
COMMENT ON COLUMN designers.portfolio_image_3 IS 'Third portfolio image URL - max 20MB';