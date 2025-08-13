'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Navigation } from '@/components/Navigation';
import { getTheme } from '@/lib/design-system';
import { BlogPost } from '@/types/blog';

interface BlogPostClientProps {
  post: BlogPost;
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  const theme = getTheme(isDarkMode);
  const navTheme = {
    text: {
      primary: theme.text.primary,
      secondary: theme.text.secondary
    },
    accent: theme.accent,
    border: theme.border
  };

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

  const markdownComponents = {
    h1: ({node, ...props}: any) => (
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 mt-8" style={{ color: theme.text.primary }} {...props} />
    ),
    h2: ({node, ...props}: any) => (
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 mt-6" style={{ color: theme.text.primary }} {...props} />
    ),
    h3: ({node, ...props}: any) => (
      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 mt-4" style={{ color: theme.text.primary }} {...props} />
    ),
    p: ({node, ...props}: any) => (
      <p className="mb-4 leading-relaxed text-base sm:text-lg" style={{ color: theme.text.secondary }} {...props} />
    ),
    img: ({node, ...props}: any) => (
      <div className="my-8 text-center">
        <img 
          className="max-w-full h-auto rounded-xl shadow-lg mx-auto" 
          style={{ boxShadow: theme.shadow }}
          {...props} 
        />
      </div>
    ),
    blockquote: ({node, ...props}: any) => (
      <blockquote 
        className="border-l-4 pl-4 py-2 my-6 italic rounded-r-lg"
        style={{ 
          borderColor: theme.accent,
          backgroundColor: theme.cardBg,
          color: theme.text.secondary
        }}
        {...props}
      />
    ),
    code: ({node, inline, ...props}: any) => {
      if (inline) {
        return (
          <code 
            className="px-2 py-1 rounded text-sm font-mono"
            style={{ 
              backgroundColor: theme.cardBg,
              color: theme.accent
            }}
            {...props}
          />
        );
      }
      return (
        <code 
          className="block p-4 rounded-lg text-sm font-mono overflow-x-auto my-4"
          style={{ 
            backgroundColor: theme.cardBg,
            color: theme.text.primary,
            border: `1px solid ${theme.border}`
          }}
          {...props}
        />
      );
    },
    ul: ({node, ...props}: any) => (
      <ul className="list-disc list-inside mb-4 space-y-2" style={{ color: theme.text.secondary }} {...props} />
    ),
    ol: ({node, ...props}: any) => (
      <ol className="list-decimal list-inside mb-4 space-y-2" style={{ color: theme.text.secondary }} {...props} />
    ),
    li: ({node, ...props}: any) => (
      <li className="mb-1" {...props} />
    ),
    a: ({node, ...props}: any) => (
      <a 
        className="font-medium hover:underline transition-colors duration-200"
        style={{ color: theme.accent }}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),
  };

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      <Navigation
        theme={navTheme}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        title="Blog"
      />
      
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link 
            href="/blog" 
            className="text-sm hover:underline transition-colors duration-200"
            style={{ color: theme.accent }}
          >
            ← Back to Blog 📖
          </Link>
        </nav>
        
        {/* Cover Image */}
        {post.cover_image && (
          <div className="mb-8 rounded-2xl overflow-hidden" style={{ boxShadow: theme.shadow }}>
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-64 sm:h-80 md:h-96 object-cover"
            />
          </div>
        )}
        
        {/* Article Header */}
        <header className="mb-8">
          {/* Category and Date */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <span 
              className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 sm:mb-0"
              style={{ 
                backgroundColor: theme.accent + '20',
                color: theme.accent
              }}
            >
              🎯 {formatCategory(post.category)}
            </span>
            <div className="flex items-center gap-4 text-sm" style={{ color: theme.text.secondary }}>
              <span>📅 {formatDate(post.created_at)}</span>
              <span>👁️ {post.views_count || 0} views</span>
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4" style={{ color: theme.text.primary }}>
            {post.title}
          </h1>
          
          {/* Preview/Subtitle */}
          <p className="text-lg sm:text-xl leading-relaxed" style={{ color: theme.text.secondary }}>
            {post.preview}
          </p>
        </header>
        
        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none"
          style={{ 
            '--tw-prose-body': theme.text.secondary,
            '--tw-prose-headings': theme.text.primary,
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {post.content}
          </ReactMarkdown>
        </div>
        
        {/* Article Footer */}
        <footer className="mt-12 pt-8 border-t" style={{ borderColor: theme.border }}>
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: theme.text.primary }}>
              🚀 Ready to Start Your Design Journey?
            </h3>
            <p className="text-base sm:text-lg mb-6" style={{ color: theme.text.secondary }}>
              Connect with amazing designers and bring your ideas to life! ✨
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/brief"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: theme.accent,
                  color: 'white'
                }}
              >
                Get Started 🎨
              </Link>
              <Link 
                href="/blog"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: theme.cardBg,
                  color: theme.text.primary,
                  border: `1px solid ${theme.border}`
                }}
              >
                More Articles 📖
              </Link>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}