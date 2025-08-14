import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Authentication middleware
function checkAdminAuth(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key');
  return adminKey === 'onedesigner_admin_2025';
}

export async function GET() {
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published') // Only get published posts
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map the posts to include frontend-compatible fields
    const mappedPosts = (posts || []).map(post => ({
      ...post,
      preview: post.preview_text, // Map preview_text to preview
      category: 'design-tips' // Default category since it's not in the main table
    }));

    return NextResponse.json({ posts: mappedPosts });
  } catch (error) {
    console.error('Blog posts fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, preview, content, category, cover_image } = body;

    if (!title || !preview || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate slug from title with timestamp to ensure uniqueness
    const timestamp = Date.now();
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 80) + '-' + timestamp;

    const { data: post, error } = await supabase
      .from('blog_posts')
      .insert({
        title,
        slug,
        preview_text: preview, // Changed from preview to preview_text
        content,
        cover_image: cover_image || null,
        status: 'published', // Set as published by default
        published_at: new Date().toISOString(),
        views_count: 0,
        author_name: 'OneDesigner Team'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return the post with category for frontend compatibility
    const postWithCategory = {
      ...post,
      preview: post.preview_text, // Map preview_text back to preview for frontend
      category: category || 'design-tips' // Add category for frontend
    };

    return NextResponse.json({ post: postWithCategory });
  } catch (error) {
    console.error('Blog post creation error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}