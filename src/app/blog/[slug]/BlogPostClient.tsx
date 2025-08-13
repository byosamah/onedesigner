'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { theme } from '@/lib/design-system';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  preview_text: string;
  content: string;
  cover_image?: string;
  author_name: string;
  published_at: string;
  updated_at: string;
  reading_time?: number;
  views_count: number;
  categories?: any[];
  tags?: string[];
  images?: any[];
}

interface BlogPostClientProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export default function BlogPostClient({ post, relatedPosts }: BlogPostClientProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Share functionality
  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://onedesigner.app/blog/${post.slug}`)}`;
    window.open(url, '_blank');
  };
  
  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://onedesigner.app/blog/${post.slug}`)}`;
    window.open(url, '_blank');
  };
  
  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://onedesigner.app/blog/${post.slug}`)}`;
    window.open(url, '_blank');
  };
  
  const copyLink = () => {
    navigator.clipboard.writeText(`https://onedesigner.app/blog/${post.slug}`);
    alert('Link copied to clipboard!');
  };
  
  // Table of contents generation
  const generateTOC = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = post.content;
    const headings = tempDiv.querySelectorAll('h2, h3');
    return Array.from(headings).map((heading, index) => ({
      id: `heading-${index}`,
      text: heading.textContent || '',
      level: heading.tagName.toLowerCase()
    }));
  };
  
  const toc = generateTOC();
  
  // Scroll to section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  // Add IDs to headings for TOC navigation
  useEffect(() => {
    const contentElement = document.getElementById('blog-content');
    if (contentElement) {
      const headings = contentElement.querySelectorAll('h2, h3');
      headings.forEach((heading, index) => {
        heading.id = `heading-${index}`;
      });
    }
  }, [post.content]);
  
  return (
    <article className="min-h-screen bg-white">
      {/* Hero Section with Cover Image */}
      <div className="relative">
        {post.cover_image ? (
          <div className="relative h-[400px] md:h-[500px] w-full">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 text-white p-8">
              <div className="max-w-4xl mx-auto">
                {/* Categories */}
                {post.categories && post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.categories.map((cat: any) => (
                      <span
                        key={cat.id || cat.name}
                        className="text-xs px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                )}
                
                <h1 className="text-3xl md:text-5xl font-bold mb-4">
                  {post.title}
                </h1>
                
                <div className="flex items-center gap-6 text-sm">
                  <span>{post.author_name}</span>
                  <time dateTime={post.published_at}>
                    {formatDate(post.published_at)}
                  </time>
                  {post.reading_time && (
                    <span>{post.reading_time} min read</span>
                  )}
                  <span>{post.views_count} views</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-[#f0ad4e] to-[#ec971f] text-white py-16">
            <div className="max-w-4xl mx-auto px-4">
              {/* Categories */}
              {post.categories && post.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.categories.map((cat: any) => (
                    <span
                      key={cat.id || cat.name}
                      className="text-xs px-3 py-1 rounded-full bg-white/20"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}
              
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {post.title}
              </h1>
              
              <div className="flex items-center gap-6 text-sm text-white/90">
                <span>{post.author_name}</span>
                <time dateTime={post.published_at}>
                  {formatDate(post.published_at)}
                </time>
                {post.reading_time && (
                  <span>{post.reading_time} min read</span>
                )}
                <span>{post.views_count} views</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Breadcrumb Navigation */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <nav className="text-sm text-gray-600">
          <Link href="/" className="hover:text-[#f0ad4e]">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-[#f0ad4e]">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{post.title}</span>
        </nav>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 max-w-4xl">
            {/* Share Buttons */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b">
              <span className="text-sm font-medium text-gray-600">Share:</span>
              <button
                onClick={shareOnTwitter}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Share on Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </button>
              <button
                onClick={shareOnLinkedIn}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Share on LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
              <button
                onClick={shareOnFacebook}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Share on Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button
                onClick={copyLink}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Copy link"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
            </div>
            
            {/* Article Content */}
            <div 
              id="blog-content"
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-600">Tags:</span>
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="text-sm px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <aside className="hidden lg:block w-80">
            {/* Table of Contents */}
            {toc.length > 0 && (
              <div className="sticky top-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-4">Table of Contents</h3>
                  <nav className="space-y-2">
                    {toc.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`block text-left w-full hover:text-[#f0ad4e] transition-colors ${
                          item.level === 'h3' ? 'pl-4 text-sm' : 'text-base'
                        }`}
                      >
                        {item.text}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
      
      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {relatedPost.cover_image ? (
                    <div className="relative h-48 w-full">
                      <Image
                        src={relatedPost.cover_image}
                        alt={relatedPost.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-[#f0ad4e] to-[#ec971f] flex items-center justify-center">
                      <div className="text-white text-5xl">📝</div>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {relatedPost.preview_text}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* CTA Section */}
      <div className="bg-gradient-to-br from-[#f0ad4e] to-[#ec971f] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Find Your Perfect Designer Match?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join OneDesigner today and connect with pre-vetted creative professionals
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/client/signup"
              className="px-8 py-3 bg-white text-[#f0ad4e] rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Find a Designer
            </Link>
            <Link
              href="/designer/signup"
              className="px-8 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
            >
              Join as Designer
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}