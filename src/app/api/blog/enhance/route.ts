import { NextRequest, NextResponse } from 'next/server';
import { blogAIService } from '@/lib/services/blog-ai-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/blog/enhance - Enhance blog content with AI (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== 'osamah96@gmail.com') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { title, preview, content, prompt, seoKeywords } = body;
    
    const result = await blogAIService.enhanceAll({
      title,
      preview,
      content,
      prompt,
      seoKeywords
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error enhancing content:', error);
    return NextResponse.json(
      { error: 'Failed to enhance content' },
      { status: 500 }
    );
  }
}

// POST /api/blog/enhance/seo - Generate SEO metadata
export async function PUT(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.email !== 'osamah96@gmail.com') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { content, title } = body;
    
    const metadata = await blogAIService.generateSEOMetadata(content, title);
    
    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error generating SEO metadata:', error);
    return NextResponse.json(
      { error: 'Failed to generate SEO metadata' },
      { status: 500 }
    );
  }
}