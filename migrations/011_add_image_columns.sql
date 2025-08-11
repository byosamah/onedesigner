-- Migration: Add image columns to designers table
-- Purpose: Store avatar, profile picture, and portfolio images for all designers

-- Add columns if they don't exist
ALTER TABLE designers 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS profile_picture TEXT,
ADD COLUMN IF NOT EXISTS portfolio_image_1 TEXT,
ADD COLUMN IF NOT EXISTS portfolio_image_2 TEXT,
ADD COLUMN IF NOT EXISTS portfolio_image_3 TEXT,
ADD COLUMN IF NOT EXISTS portfolio_images TEXT[];

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_designers_avatar_url ON designers(avatar_url);
CREATE INDEX IF NOT EXISTS idx_designers_has_images ON designers((portfolio_image_1 IS NOT NULL));

-- Add comments
COMMENT ON COLUMN designers.avatar_url IS 'Avatar image URL (initials or cartoon style)';
COMMENT ON COLUMN designers.profile_picture IS 'Professional profile picture URL';
COMMENT ON COLUMN designers.portfolio_image_1 IS 'First portfolio image URL';
COMMENT ON COLUMN designers.portfolio_image_2 IS 'Second portfolio image URL';
COMMENT ON COLUMN designers.portfolio_image_3 IS 'Third portfolio image URL';
COMMENT ON COLUMN designers.portfolio_images IS 'Array of all portfolio image URLs';

-- Check current state
SELECT 
  COUNT(*) as total_designers,
  COUNT(avatar_url) as with_avatar,
  COUNT(portfolio_image_1) as with_portfolio,
  COUNT(*) - COUNT(avatar_url) as missing_avatar,
  COUNT(*) - COUNT(portfolio_image_1) as missing_portfolio
FROM designers;