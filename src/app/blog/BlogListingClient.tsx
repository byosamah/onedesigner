'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { getTheme } from '@/lib/design-system';
import { BlogPost } from '@/types/blog';

export default function BlogListingClient() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  const theme = getTheme(isDarkMode);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'design-tips', 'ui-ux', 'trends', 'tutorials', 'industry-insights'];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCategory = (category: string) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const navTheme = {
    text: {
      primary: theme.text.primary,
      secondary: theme.text.secondary
    },
    accent: theme.accent,
    border: theme.border
  };

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      <Navigation
        theme={navTheme}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        title="Blog"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: theme.text.primary }}>
            📖 OneDesigner Blog
          </h1>
          <p className="text-xl mb-8" style={{ color: theme.text.secondary }}>
            🎨 Discover the latest design trends, tips, and insights from professional designers
          </p>
          
          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="🔍 Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200"
                  style={{ 
                    backgroundColor: theme.cardBg,
                    borderColor: theme.border,
                    color: theme.text.primary
                  }}
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              </div>
              
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200"
                style={{ 
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border,
                  color: theme.text.primary
                }}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? '📚 All Categories' : `🎯 ${formatCategory(category)}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p style={{ color: theme.text.secondary }}>Loading amazing content... ✨</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: theme.text.primary }}>
              {searchTerm || selectedCategory !== 'all' ? 'No articles found' : 'No articles yet'}
            </h3>
            <p style={{ color: theme.text.secondary }}>
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Stay tuned for amazing design content! 🚀'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.id}>
                <article 
                  className="rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer h-full"
                  style={{ 
                    backgroundColor: theme.cardBg,
                    boxShadow: theme.shadow,
                    border: `1px solid ${theme.border}`
                  }}
                >
                  {/* Cover Image */}
                  {post.cover_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* Category Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span 
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{ 
                          backgroundColor: theme.accent + '20',
                          color: theme.accent
                        }}
                      >
                        🎯 {formatCategory(post.category)}
                      </span>
                      <span className="text-sm" style={{ color: theme.text.secondary }}>
                        📅 {formatDate(post.created_at)}
                      </span>
                    </div>
                    
                    {/* Title */}
                    <h2 className="text-xl font-bold mb-3 line-clamp-2" style={{ color: theme.text.primary }}>
                      {post.title}
                    </h2>
                    
                    {/* Preview */}
                    <p className="line-clamp-3 mb-4" style={{ color: theme.text.secondary }}>
                      {post.preview}
                    </p>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2" style={{ color: theme.text.secondary }}>
                        👁️ {post.views_count || 0} views
                      </span>
                      <span 
                        className="font-medium hover:underline"
                        style={{ color: theme.accent }}
                      >
                        Read more 📖
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
        
        {/* Call to Action */}
        {!loading && filteredPosts.length > 0 && (
          <div className="text-center mt-16 py-12 rounded-2xl" style={{ backgroundColor: theme.cardBg }}>
            <h3 className="text-2xl font-bold mb-4" style={{ color: theme.text.primary }}>
              🚀 Ready to Start Your Design Journey?
            </h3>
            <p className="text-lg mb-6" style={{ color: theme.text.secondary }}>
              Connect with amazing designers and bring your ideas to life! ✨
            </p>
            <Link 
              href="/brief"
              className="inline-flex items-center px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: theme.accent,
                color: 'white'
              }}
            >
              Get Started 🎨
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}