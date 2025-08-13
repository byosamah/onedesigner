const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyBlogMigration() {
  try {
    console.log('🚀 Setting up OneDesigner Blog System...\n');
    
    // Step 1: Create blog_posts table
    console.log('1️⃣ Creating blog_posts table...');
    const blogPostsQuery = `
      CREATE TABLE IF NOT EXISTS blog_posts (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          slug VARCHAR(255) UNIQUE NOT NULL,
          title VARCHAR(500) NOT NULL,
          preview_text TEXT NOT NULL,
          content TEXT NOT NULL,
          cover_image VARCHAR(500),
          author_id UUID,
          author_name VARCHAR(255) DEFAULT 'OneDesigner Team',
          status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
          
          meta_title VARCHAR(160),
          meta_description VARCHAR(320),
          meta_keywords TEXT[],
          canonical_url VARCHAR(500),
          og_image VARCHAR(500),
          
          views_count INTEGER DEFAULT 0,
          reading_time INTEGER,
          
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          published_at TIMESTAMP WITH TIME ZONE,
          
          ai_enhanced BOOLEAN DEFAULT false,
          ai_prompt_used TEXT,
          original_title VARCHAR(500),
          original_preview TEXT,
          original_content TEXT
      );
    `;
    
    const { error: postError } = await supabase.rpc('exec', { sql: blogPostsQuery });
    if (postError && !postError.message.includes('already exists')) {
      throw postError;
    }
    console.log('✅ blog_posts table created');
    
    // Step 2: Create categories table
    console.log('2️⃣ Creating blog_categories table...');
    const categoriesQuery = `
      CREATE TABLE IF NOT EXISTS blog_categories (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL,
          slug VARCHAR(100) UNIQUE NOT NULL,
          description TEXT,
          color VARCHAR(7),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: catError } = await supabase.rpc('exec', { sql: categoriesQuery });
    if (catError && !catError.message.includes('already exists')) {
      throw catError;
    }
    console.log('✅ blog_categories table created');
    
    // Step 3: Insert default categories
    console.log('3️⃣ Inserting default categories...');
    const { error: insertError } = await supabase
      .from('blog_categories')
      .upsert([
        { name: 'Design Tips', slug: 'design-tips', description: 'Expert advice on design best practices', color: '#f0ad4e' },
        { name: 'Client Success', slug: 'client-success', description: 'Stories from successful client-designer matches', color: '#28a745' },
        { name: 'Designer Spotlight', slug: 'designer-spotlight', description: 'Featured designers and their work', color: '#6f42c1' },
        { name: 'Platform Updates', slug: 'platform-updates', description: 'Latest features and improvements', color: '#17a2b8' },
        { name: 'Industry Insights', slug: 'industry-insights', description: 'Trends and analysis in the design industry', color: '#fd7e14' }
      ], { onConflict: 'slug' });
    
    if (insertError && !insertError.message.includes('duplicate key')) {
      console.warn('Categories insert warning:', insertError.message);
    } else {
      console.log('✅ Default categories inserted');
    }
    
    // Step 4: Create remaining tables
    console.log('4️⃣ Creating remaining blog tables...');
    const remainingTablesQuery = `
      CREATE TABLE IF NOT EXISTS blog_tags (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(50) UNIQUE NOT NULL,
          slug VARCHAR(50) UNIQUE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS blog_images (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
          url VARCHAR(500) NOT NULL,
          alt_text VARCHAR(500),
          caption VARCHAR(500),
          position INTEGER,
          width INTEGER,
          height INTEGER,
          size_kb INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS blog_post_categories (
          post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
          category_id UUID REFERENCES blog_categories(id) ON DELETE CASCADE,
          PRIMARY KEY (post_id, category_id)
      );
      
      CREATE TABLE IF NOT EXISTS blog_post_tags (
          post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
          tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
          PRIMARY KEY (post_id, tag_id)
      );
    `;
    
    const { error: tablesError } = await supabase.rpc('exec', { sql: remainingTablesQuery });
    if (tablesError && !tablesError.message.includes('already exists')) {
      console.warn('Tables creation warning:', tablesError.message);
    } else {
      console.log('✅ Remaining tables created');
    }
    
    // Step 5: Create indexes
    console.log('5️⃣ Creating indexes...');
    const indexesQuery = `
      CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
      CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
      CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
      CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_blog_images_post_id ON blog_images(post_id);
    `;
    
    const { error: indexError } = await supabase.rpc('exec', { sql: indexesQuery });
    if (indexError && !indexError.message.includes('already exists')) {
      console.warn('Index creation warning:', indexError.message);
    } else {
      console.log('✅ Indexes created');
    }
    
    // Step 6: Test the setup
    console.log('6️⃣ Testing setup...');
    const { data: categories, error: testError } = await supabase
      .from('blog_categories')
      .select('*');
    
    if (testError) {
      throw testError;
    }
    
    console.log(`✅ Test successful - Found ${categories.length} categories`);
    
    console.log('\n🎉 Blog system migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Visit /blog to see the public blog');
    console.log('2. Visit /blog/admin to manage posts (admin only)');
    console.log('3. Create your first blog post!');
    console.log('\nEnvironment variable needed:');
    console.log('DEEPSEEK_BLOG_API_KEY=sk-7f77c4bfc9f14f2a9cf66aaa7a4fe925');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

applyBlogMigration();