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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { title, preview, content, category, cover_image } = body;

    if (!title || !preview || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Keep existing slug or generate new one
    const { data: existingPost } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('id', id)
      .single();

    const slug = existingPost?.slug || (title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 80) + '-' + Date.now());

    const { data: post, error } = await supabase
      .from('blog_posts')
      .update({
        title,
        slug,
        preview_text: preview, // Changed from preview to preview_text
        content,
        cover_image: cover_image || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
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
    console.error('Blog post update error:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Blog post delete error:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}