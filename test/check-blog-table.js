const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://frwchtwxpnrlpzksupgm.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkBlogTable() {
  console.log('🔍 Checking blog_posts table...\n');

  try {
    // Try to query the table
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .limit(1);

    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('❌ Table blog_posts does not exist');
        console.log('\nCreating simplified blog_posts table...');
        
        // Create a simplified version of the table
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS blog_posts (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              slug VARCHAR(255) UNIQUE NOT NULL,
              title VARCHAR(500) NOT NULL,
              preview TEXT NOT NULL,
              content TEXT NOT NULL,
              category VARCHAR(50) DEFAULT 'design-tips',
              cover_image VARCHAR(500),
              views_count INTEGER DEFAULT 0,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
            CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
          `
        });

        if (createError) {
          // If RPC doesn't work, let's try a different approach
          console.log('RPC method failed, trying direct query...');
          
          // We'll update the API to match the existing schema instead
          console.log('\n📝 The table might exist with different column names.');
          console.log('The migration file shows these columns:');
          console.log('- preview_text (not preview)');
          console.log('- Additional columns like status, author_id, etc.');
          console.log('\nWe need to update the API to match the actual schema.');
        } else {
          console.log('✅ Table created successfully!');
        }
      } else {
        console.log('❌ Error:', error.message);
      }
    } else {
      console.log('✅ Table blog_posts exists');
      
      // Check the structure
      if (data && data.length > 0) {
        console.log('\nTable columns:');
        Object.keys(data[0]).forEach(col => {
          console.log(`  - ${col}`);
        });
      } else {
        // Try to insert a test record to see what columns are required
        const { error: insertError } = await supabase
          .from('blog_posts')
          .insert({
            title: 'Test',
            slug: 'test-' + Date.now(),
            preview: 'Test preview',
            content: 'Test content',
            category: 'design-tips'
          });
        
        if (insertError) {
          console.log('\n⚠️ Insert with "preview" column failed:', insertError.message);
          
          // Try with preview_text
          const { error: insertError2 } = await supabase
            .from('blog_posts')
            .insert({
              title: 'Test',
              slug: 'test-' + Date.now(),
              preview_text: 'Test preview',
              content: 'Test content',
              category: 'design-tips'
            });
          
          if (insertError2) {
            console.log('⚠️ Insert with "preview_text" column failed:', insertError2.message);
          } else {
            console.log('✅ Table uses "preview_text" column (not "preview")');
            
            // Clean up test record
            await supabase
              .from('blog_posts')
              .delete()
              .match({ title: 'Test' });
          }
        } else {
          console.log('✅ Table uses "preview" column');
          
          // Clean up test record
          await supabase
            .from('blog_posts')
            .delete()
            .match({ title: 'Test' });
        }
      }
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkBlogTable();