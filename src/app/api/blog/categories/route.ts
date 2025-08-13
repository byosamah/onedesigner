import { NextRequest, NextResponse } from 'next/server';
import { blogService } from '@/lib/services/blog-service';

// GET /api/blog/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const categories = await blogService.getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}