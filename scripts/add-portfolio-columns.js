const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addPortfolioColumns() {
  console.log('🚀 Starting portfolio columns migration...');
  
  try {
    // Step 1: Add portfolio_image columns if they don't exist
    console.log('📊 Adding portfolio_image columns to designers table...');
    
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
          -- Add portfolio_image_1 if it doesn't exist
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
          
          -- Add portfolio_image_2 if it doesn't exist
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
          
          -- Add portfolio_image_3 if it doesn't exist
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
      `
    });
    
    if (alterError) {
      // If exec_sql doesn't exist, try direct approach
      console.log('⚠️ exec_sql not available, trying direct SQL statements...');
      
      // Check if columns exist first
      const { data: columns } = await supabase
        .from('designers')
        .select('*')
        .limit(1);
      
      if (columns && columns.length > 0) {
        const sampleRow = columns[0];
        const hasCol1 = 'portfolio_image_1' in sampleRow;
        const hasCol2 = 'portfolio_image_2' in sampleRow;
        const hasCol3 = 'portfolio_image_3' in sampleRow;
        
        if (hasCol1 && hasCol2 && hasCol3) {
          console.log('✅ All portfolio_image columns already exist!');
        } else {
          console.log('❌ Some portfolio columns are missing. Please add them manually in Supabase dashboard:');
          if (!hasCol1) console.log('   - portfolio_image_1 (TEXT)');
          if (!hasCol2) console.log('   - portfolio_image_2 (TEXT)');
          if (!hasCol3) console.log('   - portfolio_image_3 (TEXT)');
          return;
        }
      }
    } else {
      console.log('✅ Portfolio columns added/verified successfully!');
    }
    
    // Step 2: Migrate data from tools array to portfolio_image columns
    console.log('📦 Migrating existing portfolio data from tools array...');
    
    // Get all designers with tools array data
    const { data: designers, error: fetchError } = await supabase
      .from('designers')
      .select('id, tools, portfolio_image_1, portfolio_image_2, portfolio_image_3')
      .not('tools', 'is', null);
    
    if (fetchError) {
      console.error('❌ Error fetching designers:', fetchError);
      return;
    }
    
    console.log(`Found ${designers?.length || 0} designers with tools data`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    // Migrate each designer's portfolio images
    for (const designer of designers || []) {
      // Skip if already has portfolio images
      if (designer.portfolio_image_1 || designer.portfolio_image_2 || designer.portfolio_image_3) {
        console.log(`⏭️ Skipping designer ${designer.id} - already has portfolio images`);
        skippedCount++;
        continue;
      }
      
      // Only migrate if tools is an array with image data
      if (Array.isArray(designer.tools) && designer.tools.length > 0) {
        // Check if tools array contains base64 images or URLs
        const isImageData = designer.tools.some(item => 
          typeof item === 'string' && 
          (item.startsWith('data:image') || item.startsWith('http'))
        );
        
        if (isImageData) {
          const updateData = {
            portfolio_image_1: designer.tools[0] || null,
            portfolio_image_2: designer.tools[1] || null,
            portfolio_image_3: designer.tools[2] || null,
            // Clear the tools array after migration
            tools: []
          };
          
          const { error: updateError } = await supabase
            .from('designers')
            .update(updateData)
            .eq('id', designer.id);
          
          if (updateError) {
            console.error(`❌ Error updating designer ${designer.id}:`, updateError);
          } else {
            console.log(`✅ Migrated portfolio images for designer ${designer.id}`);
            migratedCount++;
          }
        } else {
          console.log(`⏭️ Skipping designer ${designer.id} - tools array doesn't contain image data`);
          skippedCount++;
        }
      }
    }
    
    console.log('');
    console.log('🎉 Migration completed!');
    console.log(`   - Migrated: ${migratedCount} designers`);
    console.log(`   - Skipped: ${skippedCount} designers`);
    console.log(`   - Total processed: ${designers?.length || 0} designers`);
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

// Run the migration
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('Run with: SUPABASE_SERVICE_ROLE_KEY="your-key" node scripts/add-portfolio-columns.js');
  process.exit(1);
}

addPortfolioColumns();