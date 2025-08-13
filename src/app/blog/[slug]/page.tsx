import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostClient from './BlogPostClient';

interface PageProps {
  params: {
    slug: string;
  };
}

// Fetch post data
async function getPost(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://onedesigner.app';
    const response = await fetch(`${baseUrl}/api/blog/posts/slug/${slug}`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching post:', error);
    return null;
  }
}

// Fetch related posts
async function getRelatedPosts(postId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://onedesigner.app';
    const response = await fetch(`${baseUrl}/api/blog/posts?limit=3&exclude=${postId}`, {
      next: { revalidate: 300 }
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.posts || [];
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPost(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found - OneDesigner Blog',
      description: 'The blog post you are looking for could not be found.'
    };
  }
  
  const title = post.meta_title || post.title;
  const description = post.meta_description || post.preview_text;
  const keywords = post.meta_keywords?.join(', ') || 'design, creative services, OneDesigner';
  const url = `https://onedesigner.app/blog/${post.slug}`;
  const image = post.og_image || post.cover_image || 'https://onedesigner.app/og-default.png';
  
  return {
    title: `${title} - OneDesigner Blog`,
    description,
    keywords,
    authors: [{ name: post.author_name || 'OneDesigner Team' }],
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      siteName: 'OneDesigner',
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: [post.author_name || 'OneDesigner Team'],
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image]
    },
    alternates: {
      canonical: url
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    }
  };
}

// Generate static params for common blog posts
export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://onedesigner.app';
    const response = await fetch(`${baseUrl}/api/blog/posts?limit=50`);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    const posts = data.posts || [];
    
    return posts.map((post: any) => ({
      slug: post.slug
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPost(params.slug);
  
  if (!post) {
    notFound();
  }
  
  const relatedPosts = await getRelatedPosts(post.id);
  
  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.preview_text,
    image: post.cover_image,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: post.author_name || 'OneDesigner Team'
    },
    publisher: {
      '@type': 'Organization',
      name: 'OneDesigner',
      logo: {
        '@type': 'ImageObject',
        url: 'https://onedesigner.app/icon.svg'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://onedesigner.app/blog/${post.slug}`
    },
    wordCount: post.content.split(' ').length,
    articleBody: post.content.replace(/<[^>]*>/g, ''), // Strip HTML tags
    keywords: post.meta_keywords?.join(', ')
  };
  
  // Generate breadcrumb structured data
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://onedesigner.app'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://onedesigner.app/blog'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://onedesigner.app/blog/${post.slug}`
      }
    ]
  };
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BlogPostClient post={post} relatedPosts={relatedPosts} />
    </>
  );
}