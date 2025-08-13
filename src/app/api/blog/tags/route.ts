import { NextRequest, NextResponse } from 'next/server';
import { blogService } from '@/lib/services/blog-service';

// GET /api/blog/tags - Get all tags
export async function GET(request: NextRequest) {
  try {
    const tags = await blogService.getTags();
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}