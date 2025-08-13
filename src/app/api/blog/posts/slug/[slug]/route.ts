import { NextRequest, NextResponse } from 'next/server';
import { blogService } from '@/lib/services/blog-service';

// GET /api/blog/posts/slug/[slug] - Get a blog post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await blogService.getPostBySlug(params.slug);
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Only show published posts to public
    const isAdmin = request.nextUrl.searchParams.get('admin') === 'true';
    if (!isAdmin && post.status !== 'published') {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching blog post by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}