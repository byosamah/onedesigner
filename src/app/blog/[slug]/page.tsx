import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import BlogPostClient from './BlogPostClient';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

async function getPost(slug: string) {
  try {
    // Use relative URL for server-side fetching in development
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/blog/posts/slug/${slug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return null;
  }
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const post = await getPost(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found - OneDesigner Blog',
    };
  }

  return {
    title: `${post.title} - OneDesigner Blog`,
    description: post.preview,
    keywords: `${post.title}, OneDesigner, design blog, ${post.category}`,
    openGraph: {
      title: post.title,
      description: post.preview,
      type: 'article',
      url: `https://onedesigner.app/blog/${post.slug}`,
      images: post.cover_image ? [post.cover_image] : [],
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.preview,
      images: post.cover_image ? [post.cover_image] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading article... 📖</p>
          </div>
        </div>
      }>
        <BlogPostClient post={post} />
      </Suspense>
    </div>
  );
}