const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupPortfolioStorage() {
  console.log('📁 Setting up portfolio images storage...\n');
  
  try {
    // First, let's create a portfolio-images bucket if it doesn't exist
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    const portfolioBucket = buckets.find(b => b.name === 'portfolio-images');
    
    if (!portfolioBucket) {
      const { data, error } = await supabase.storage.createBucket('portfolio-images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
      } else {
        console.log('✅ Created portfolio-images storage bucket');
      }
    } else {
      console.log('✅ Portfolio images bucket already exists');
    }
    
    // Create a separate table for portfolio images if needed
    console.log('\n📝 Alternative: Create a separate portfolio_images table');
    console.log('=====================================');
    console.log(`
CREATE TABLE IF NOT EXISTS portfolio_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  designer_id UUID REFERENCES designers(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_images_designer 
ON portfolio_images(designer_id);
    `);
    
    console.log('\n💡 Or add columns directly to designers table:');
    console.log('=====================================');
    console.log(`
ALTER TABLE designers 
ADD COLUMN IF NOT EXISTS portfolio_image_1 TEXT,
ADD COLUMN IF NOT EXISTS portfolio_image_2 TEXT,
ADD COLUMN IF NOT EXISTS portfolio_image_3 TEXT;
    `);
    
  } catch (error) {
    console.error('Setup error:', error);
  }
}

setupPortfolioStorage();