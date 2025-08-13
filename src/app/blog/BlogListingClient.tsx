'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { theme } from '@/lib/design-system';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  preview_text: string;
  cover_image?: string;
  author_name: string;
  published_at: string;
  reading_time?: number;
  views_count: number;
  categories?: any[];
  tags?: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

interface BlogListingClientProps {
  initialPosts: BlogPost[];
  totalPosts: number;
  categories: Category[];
}

export default function BlogListingClient({ 
  initialPosts, 
  totalPosts,
  categories 
}: BlogListingClientProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [total, setTotal] = useState(totalPosts);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const postsPerPage = 12;
  const totalPages = Math.ceil(total / postsPerPage);
  
  // Load more posts
  const loadPosts = async (newPage: number, category?: string, search?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: newPage.toString(),
        limit: postsPerPage.toString(),
        status: 'published'
      });
      
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/blog/posts?${params}`);
      const data = await response.json();
      
      if (newPage === 1) {
        setPosts(data.posts || []);
      } else {
        setPosts(prev => [...prev, ...(data.posts || [])]);
      }
      setTotal(data.total || 0);
      setPage(newPage);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle category filter
  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
    loadPosts(1, categoryId, searchQuery);
  };
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadPosts(1, selectedCategory, searchQuery);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#f0ad4e] to-[#ec971f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              OneDesigner Blog
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Expert design advice, client success stories, and industry insights to help you make the perfect designer match
            </p>
          </div>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-8 max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full px-6 py-4 pr-12 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Categories Filter */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4 overflow-x-auto">
            <button
              onClick={() => handleCategoryFilter('')}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                !selectedCategory 
                  ? 'bg-[#f0ad4e] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Posts
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryFilter(category.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-[#f0ad4e] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: selectedCategory === category.id && category.color 
                    ? category.color 
                    : undefined
                }}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article 
                  key={post.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <Link href={`/blog/${post.slug}`}>
                    {/* Cover Image */}
                    {post.cover_image ? (
                      <div className="relative h-48 w-full">
                        <Image
                          src={post.cover_image}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-[#f0ad4e] to-[#ec971f] flex items-center justify-center">
                        <div className="text-white text-6xl">📝</div>
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="p-6">
                      {/* Categories */}
                      {post.categories && post.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.categories.map((cat: any) => (
                            <span
                              key={cat.id || cat.name}
                              className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                            >
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* Title */}
                      <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-[#f0ad4e] transition-colors">
                        {post.title}
                      </h2>
                      
                      {/* Preview */}
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.preview_text}
                      </p>
                      
                      {/* Meta */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>{post.author_name}</span>
                          {post.reading_time && (
                            <span>{post.reading_time} min read</span>
                          )}
                        </div>
                        <time dateTime={post.published_at}>
                          {formatDate(post.published_at)}
                        </time>
                      </div>
                      
                      {/* Views */}
                      {post.views_count > 0 && (
                        <div className="mt-2 text-xs text-gray-400">
                          {post.views_count} views
                        </div>
                      )}
                    </div>
                  </Link>
                </article>
              ))}
            </div>
            
            {/* Load More */}
            {page < totalPages && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => loadPosts(page + 1, selectedCategory, searchQuery)}
                  disabled={loading}
                  className="px-8 py-3 bg-[#f0ad4e] text-white rounded-lg hover:bg-[#ec971f] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More Articles'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No articles found
            </h2>
            <p className="text-gray-600">
              {searchQuery || selectedCategory 
                ? 'Try adjusting your filters or search query'
                : 'Check back soon for new content!'}
            </p>
          </div>
        )}
      </div>
      
      {/* Newsletter CTA */}
      <div className="bg-gradient-to-br from-[#f0ad4e] to-[#ec971f] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Stay Updated with Design Insights
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Get the latest design tips, success stories, and platform updates delivered to your inbox
          </p>
          <div className="max-w-md mx-auto">
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-[#f0ad4e] rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}