const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://frwchtwxpnrlpzksupgm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyd2NodHd4cG5ybHB6a3N1cGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQxNjM1OCwiZXhwIjoyMDY5OTkyMzU4fQ.etecMSfQ317vkouRXaMX3Jqg669kf5KL4pE08V03TV8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupBlogSystem() {
  try {
    console.log('🚀 Setting up OneDesigner Blog System...\n');
    
    // Just insert default categories to verify connection
    console.log('1️⃣ Setting up default categories...');
    
    const { error: insertError } = await supabase
      .from('blog_categories')
      .upsert([
        { name: 'Design Tips', slug: 'design-tips', description: 'Expert advice on design best practices', color: '#f0ad4e' },
        { name: 'Client Success', slug: 'client-success', description: 'Stories from successful client-designer matches', color: '#28a745' },
        { name: 'Designer Spotlight', slug: 'designer-spotlight', description: 'Featured designers and their work', color: '#6f42c1' },
        { name: 'Platform Updates', slug: 'platform-updates', description: 'Latest features and improvements', color: '#17a2b8' },
        { name: 'Industry Insights', slug: 'industry-insights', description: 'Trends and analysis in the design industry', color: '#fd7e14' }
      ], { onConflict: 'slug' });
    
    if (insertError) {
      console.log('Need to create tables first. Running manual SQL setup...');
      console.log('\n📋 Please run this SQL in Supabase SQL Editor:');
      console.log('=====================================');
      console.log(`
-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    preview_text TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image VARCHAR(500),
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

-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog_tags table
CREATE TABLE IF NOT EXISTS blog_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog_images table
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

-- Create junction tables
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_images_post_id ON blog_images(post_id);

-- Insert default categories
INSERT INTO blog_categories (name, slug, description, color) VALUES
    ('Design Tips', 'design-tips', 'Expert advice on design best practices', '#f0ad4e'),
    ('Client Success', 'client-success', 'Stories from successful client-designer matches', '#28a745'),
    ('Designer Spotlight', 'designer-spotlight', 'Featured designers and their work', '#6f42c1'),
    ('Platform Updates', 'platform-updates', 'Latest features and improvements', '#17a2b8'),
    ('Industry Insights', 'industry-insights', 'Trends and analysis in the design industry', '#fd7e14')
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public can read published posts" ON blog_posts
    FOR SELECT USING (status = 'published' AND published_at <= NOW());

CREATE POLICY "Service role full access" ON blog_posts
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read categories" ON blog_categories
    FOR SELECT USING (true);

CREATE POLICY "Service role full access categories" ON blog_categories
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read tags" ON blog_tags
    FOR SELECT USING (true);

CREATE POLICY "Service role full access tags" ON blog_tags
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read images" ON blog_images
    FOR SELECT USING (true);

CREATE POLICY "Service role full access images" ON blog_images
    FOR ALL USING (auth.role() = 'service_role');
      `);
      console.log('=====================================');
      console.log('\nAfter running the SQL, run this command again to verify.');
      return;
    }
    
    console.log('✅ Default categories inserted successfully!');
    
    // Test the setup
    console.log('2️⃣ Testing blog API endpoints...');
    const { data: categories, error: testError } = await supabase
      .from('blog_categories')
      .select('*');
    
    if (testError) {
      throw testError;
    }
    
    console.log(`✅ Found ${categories.length} categories`);
    categories.forEach(cat => console.log(`  - ${cat.name} (${cat.slug})`));
    
    console.log('\n🎉 Blog system setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Visit http://localhost:3000/blog to see the public blog');
    console.log('2. Visit http://localhost:3000/blog/admin to manage posts');
    console.log('3. Add this environment variable:');
    console.log('   DEEPSEEK_BLOG_API_KEY=sk-7f77c4bfc9f14f2a9cf66aaa7a4fe925');
    console.log('\n🔗 Blog URLs:');
    console.log('   • Public Blog: /blog');
    console.log('   • Admin Panel: /blog/admin');
    console.log('   • Individual Posts: /blog/[slug]');
    console.log('   • Sitemap: /sitemap.xml');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('\n💡 The blog tables need to be created first.');
      console.log('Please run the SQL provided above in your Supabase dashboard.');
    }
  }
}

setupBlogSystem();