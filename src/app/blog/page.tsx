import { Metadata } from 'next';
import BlogListingClient from './BlogListingClient';

export const metadata: Metadata = {
  title: 'OneDesigner Blog - Design Tips, Client Success Stories & Industry Insights',
  description: 'Discover expert design advice, successful client-designer match stories, platform updates, and industry insights from OneDesigner - the premium designer matching platform.',
  keywords: 'design blog, designer tips, client success, creative services, design industry, OneDesigner blog, designer matching, design trends',
  openGraph: {
    title: 'OneDesigner Blog - Expert Design Insights & Success Stories',
    description: 'Discover expert design advice, successful client-designer match stories, and industry insights from OneDesigner.',
    type: 'website',
    url: 'https://onedesigner.app/blog',
    siteName: 'OneDesigner',
    images: [
      {
        url: 'https://onedesigner.app/og-blog.png',
        width: 1200,
        height: 630,
        alt: 'OneDesigner Blog'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OneDesigner Blog - Design Tips & Success Stories',
    description: 'Expert design advice and successful client-designer match stories.',
    images: ['https://onedesigner.app/og-blog.png']
  },
  alternates: {
    canonical: 'https://onedesigner.app/blog'
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

// Server Component for initial data fetch
async function getBlogPosts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://onedesigner.app';
    const response = await fetch(`${baseUrl}/api/blog/posts?status=published&limit=12`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    });
    
    if (!response.ok) {
      console.error('Failed to fetch blog posts');
      return { posts: [], total: 0 };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return { posts: [], total: 0 };
  }
}

async function getCategories() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://onedesigner.app';
    const response = await fetch(`${baseUrl}/api/blog/categories`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });
    
    if (!response.ok) {
      console.error('Failed to fetch categories');
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function BlogPage() {
  const [initialData, categories] = await Promise.all([
    getBlogPosts(),
    getCategories()
  ]);
  
  // Generate JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'OneDesigner Blog',
    description: 'Expert design advice and successful client-designer match stories',
    url: 'https://onedesigner.app/blog',
    publisher: {
      '@type': 'Organization',
      name: 'OneDesigner',
      logo: {
        '@type': 'ImageObject',
        url: 'https://onedesigner.app/icon.svg'
      }
    },
    blogPost: initialData.posts.map((post: any) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.preview_text,
      datePublished: post.published_at,
      dateModified: post.updated_at,
      author: {
        '@type': 'Person',
        name: post.author_name || 'OneDesigner Team'
      },
      image: post.cover_image,
      url: `https://onedesigner.app/blog/${post.slug}`
    }))
  };
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogListingClient 
        initialPosts={initialData.posts} 
        totalPosts={initialData.total}
        categories={categories}
      />
    </>
  );
}