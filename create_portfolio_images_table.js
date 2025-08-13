const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createPortfolioImagesTable() {
  console.log('📦 Creating designer_portfolio_images table...')
  
  try {
    // First, let's test if we can create a simple table
    const { data, error } = await supabase
      .from('designer_portfolio_images')
      .select('*')
      .limit(1)
    
    if (error && error.message.includes('does not exist')) {
      console.log('❓ Table does not exist, creating it via API call...')
      
      // Since we can't create tables directly, let's insert data and see what happens
      // This is a workaround - in production you'd use migrations
      console.log('⚠️ Cannot create table directly via API. Need to create it manually in Supabase dashboard.')
      console.log('SQL to run:')
      console.log(`
CREATE TABLE designer_portfolio_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  designer_id UUID NOT NULL REFERENCES designers(id) ON DELETE CASCADE,
  image_data TEXT NOT NULL,
  image_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_designer_portfolio_images_designer_id ON designer_portfolio_images(designer_id);
      `)
    } else if (!error) {
      console.log('✅ Table already exists!')
    } else {
      console.log('❌ Other error:', error.message)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

createPortfolioImagesTable()