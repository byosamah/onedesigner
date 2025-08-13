-- Blog System Tables Migration
-- OneDesigner Blog Platform

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    preview_text TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image VARCHAR(500),
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(255) DEFAULT 'OneDesigner Team',
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    
    -- SEO fields
    meta_title VARCHAR(160),
    meta_description VARCHAR(320),
    meta_keywords TEXT[],
    canonical_url VARCHAR(500),
    og_image VARCHAR(500),
    
    -- Analytics fields
    views_count INTEGER DEFAULT 0,
    reading_time INTEGER, -- in minutes
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- AI Enhancement tracking
    ai_enhanced BOOLEAN DEFAULT false,
    ai_prompt_used TEXT,
    original_title VARCHAR(500),
    original_preview TEXT,
    original_content TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);

-- Create blog_images table for inline images
CREATE TABLE IF NOT EXISTS blog_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(500),
    caption VARCHAR(500),
    position INTEGER, -- position in the article
    width INTEGER,
    height INTEGER,
    size_kb INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for blog images
CREATE INDEX IF NOT EXISTS idx_blog_images_post_id ON blog_images(post_id);

-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7), -- hex color for UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog_post_categories junction table
CREATE TABLE IF NOT EXISTS blog_post_categories (
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES blog_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, category_id)
);

-- Create blog_tags table
CREATE TABLE IF NOT EXISTS blog_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog_post_tags junction table
CREATE TABLE IF NOT EXISTS blog_post_tags (
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- Insert default categories
INSERT INTO blog_categories (name, slug, description, color) VALUES
    ('Design Tips', 'design-tips', 'Expert advice on design best practices', '#f0ad4e'),
    ('Client Success', 'client-success', 'Stories from successful client-designer matches', '#28a745'),
    ('Designer Spotlight', 'designer-spotlight', 'Featured designers and their work', '#6f42c1'),
    ('Platform Updates', 'platform-updates', 'Latest features and improvements', '#17a2b8'),
    ('Industry Insights', 'industry-insights', 'Trends and analysis in the design industry', '#fd7e14')
ON CONFLICT (slug) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_updated_at();

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION generate_blog_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
BEGIN
    -- Convert title to lowercase and replace spaces with hyphens
    base_slug := LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := TRIM(BOTH '-' FROM base_slug);
    
    final_slug := base_slug;
    
    -- Check if slug exists and append number if needed
    WHILE EXISTS (SELECT 1 FROM blog_posts WHERE slug = final_slug) LOOP
        final_slug := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Create view for published posts with category and tag info
CREATE OR REPLACE VIEW published_blog_posts AS
SELECT 
    p.*,
    COALESCE(
        ARRAY_AGG(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL),
        '{}'::TEXT[]
    ) AS categories,
    COALESCE(
        ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL),
        '{}'::TEXT[]
    ) AS tags
FROM blog_posts p
LEFT JOIN blog_post_categories pc ON p.id = pc.post_id
LEFT JOIN blog_categories c ON pc.category_id = c.id
LEFT JOIN blog_post_tags pt ON p.id = pt.post_id
LEFT JOIN blog_tags t ON pt.tag_id = t.id
WHERE p.status = 'published' AND p.published_at <= NOW()
GROUP BY p.id;

-- Add RLS policies
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Public can read published blog posts" ON blog_posts
    FOR SELECT USING (status = 'published' AND published_at <= NOW());

-- Authenticated users can manage their own posts (for future multi-author support)
CREATE POLICY "Users can manage own blog posts" ON blog_posts
    FOR ALL USING (auth.uid() = author_id);

-- Service role has full access
CREATE POLICY "Service role has full access to blog posts" ON blog_posts
    FOR ALL USING (auth.role() = 'service_role');

-- Similar policies for other tables
CREATE POLICY "Public can read blog images" ON blog_images
    FOR SELECT USING (true);

CREATE POLICY "Service role has full access to blog images" ON blog_images
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read blog categories" ON blog_categories
    FOR SELECT USING (true);

CREATE POLICY "Service role has full access to blog categories" ON blog_categories
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read blog tags" ON blog_tags
    FOR SELECT USING (true);

CREATE POLICY "Service role has full access to blog tags" ON blog_tags
    FOR ALL USING (auth.role() = 'service_role');