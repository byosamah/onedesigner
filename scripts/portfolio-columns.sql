-- Add portfolio image columns to designers table
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/frwchtwxpnrlpzksupgm/sql/new)

-- Add portfolio_image_1 column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'designers' 
    AND column_name = 'portfolio_image_1'
  ) THEN
    ALTER TABLE designers ADD COLUMN portfolio_image_1 TEXT;
    RAISE NOTICE 'Added portfolio_image_1 column';
  ELSE
    RAISE NOTICE 'portfolio_image_1 column already exists';
  END IF;
END $$;

-- Add portfolio_image_2 column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'designers' 
    AND column_name = 'portfolio_image_2'
  ) THEN
    ALTER TABLE designers ADD COLUMN portfolio_image_2 TEXT;
    RAISE NOTICE 'Added portfolio_image_2 column';
  ELSE
    RAISE NOTICE 'portfolio_image_2 column already exists';
  END IF;
END $$;

-- Add portfolio_image_3 column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'designers' 
    AND column_name = 'portfolio_image_3'
  ) THEN
    ALTER TABLE designers ADD COLUMN portfolio_image_3 TEXT;
    RAISE NOTICE 'Added portfolio_image_3 column';
  ELSE
    RAISE NOTICE 'portfolio_image_3 column already exists';
  END IF;
END $$;

-- Migrate existing portfolio data from tools array to new columns
-- This will move any base64 images or URLs from the tools array
UPDATE designers
SET 
  portfolio_image_1 = CASE 
    WHEN tools IS NOT NULL AND array_length(tools, 1) >= 1 THEN tools[1]
    ELSE portfolio_image_1
  END,
  portfolio_image_2 = CASE 
    WHEN tools IS NOT NULL AND array_length(tools, 1) >= 2 THEN tools[2]
    ELSE portfolio_image_2
  END,
  portfolio_image_3 = CASE 
    WHEN tools IS NOT NULL AND array_length(tools, 1) >= 3 THEN tools[3]
    ELSE portfolio_image_3
  END,
  tools = ARRAY[]::text[]  -- Clear the tools array after migration
WHERE 
  tools IS NOT NULL 
  AND array_length(tools, 1) > 0
  AND portfolio_image_1 IS NULL  -- Only migrate if not already migrated
  AND portfolio_image_2 IS NULL
  AND portfolio_image_3 IS NULL;

-- Verify the migration
SELECT 
  COUNT(*) as total_designers,
  COUNT(CASE WHEN portfolio_image_1 IS NOT NULL THEN 1 END) as with_image_1,
  COUNT(CASE WHEN portfolio_image_2 IS NOT NULL THEN 1 END) as with_image_2,
  COUNT(CASE WHEN portfolio_image_3 IS NOT NULL THEN 1 END) as with_image_3,
  COUNT(CASE WHEN tools IS NOT NULL AND array_length(tools, 1) > 0 THEN 1 END) as still_using_tools
FROM designers;