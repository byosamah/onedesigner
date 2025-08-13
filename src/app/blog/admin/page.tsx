'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import RichTextEditor from '@/components/blog/RichTextEditor';
import { theme } from '@/lib/design-system';
import Image from 'next/image';

interface BlogPost {
  id: string;
  title: string;
  preview_text: string;
  content: string;
  cover_image?: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  published_at?: string;
  views_count: number;
  categories?: string[];
  tags?: string[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

export default function BlogAdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // State
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    preview_text: '',
    content: '',
    cover_image: '',
    status: 'draft' as 'draft' | 'published',
    categories: [] as string[],
    tags: [] as string[],
    meta_title: '',
    meta_description: '',
    meta_keywords: [] as string[]
  });
  
  // AI enhancement state
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  
  // Check admin access
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.email !== 'osamah96@gmail.com') {
      router.push('/');
    }
  }, [session, status, router]);
  
  // Load posts and categories
  useEffect(() => {
    loadPosts();
    loadCategories();
  }, []);
  
  const loadPosts = async () => {
    try {
      const response = await fetch('/api/blog/posts?admin=true&limit=100');
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/blog/categories');
      const data = await response.json();
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };
  
  // Handle form changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle image upload
  const handleImageUpload = async (file: File, type: 'cover' | 'content' = 'content'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await fetch('/api/blog/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    const data = await response.json();
    return data.url;
  };
  
  // Handle cover image selection
  const handleCoverImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const url = await handleImageUpload(file, 'cover');
      handleInputChange('cover_image', url);
    } catch (error) {
      console.error('Error uploading cover image:', error);
      alert('Failed to upload cover image');
    }
  };
  
  // AI Enhancement
  const enhanceWithAI = async () => {
    setIsEnhancing(true);
    try {
      const response = await fetch('/api/blog/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          preview: formData.preview_text,
          content: formData.content,
          prompt: aiPrompt,
          seoKeywords: formData.meta_keywords
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        if (result.enhanced_title) {
          handleInputChange('title', result.enhanced_title);
        }
        if (result.enhanced_preview) {
          handleInputChange('preview_text', result.enhanced_preview);
        }
        if (result.enhanced_content) {
          handleInputChange('content', result.enhanced_content);
        }
        alert('Content enhanced successfully!');
      } else {
        alert('Failed to enhance content: ' + result.error);
      }
    } catch (error) {
      console.error('Error enhancing content:', error);
      alert('Failed to enhance content');
    } finally {
      setIsEnhancing(false);
    }
  };
  
  // Save post
  const savePost = async () => {
    try {
      const url = editingPost 
        ? `/api/blog/posts/${editingPost.id}`
        : '/api/blog/posts';
      
      const method = editingPost ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save post');
      }
      
      alert('Post saved successfully!');
      resetForm();
      loadPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post');
    }
  };
  
  // Delete post
  const deletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const response = await fetch(`/api/blog/posts/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      
      alert('Post deleted successfully!');
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };
  
  // Edit post
  const editPost = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      preview_text: post.preview_text,
      content: post.content,
      cover_image: post.cover_image || '',
      status: post.status,
      categories: post.categories || [],
      tags: post.tags || [],
      meta_title: '',
      meta_description: '',
      meta_keywords: []
    });
    setIsCreating(true);
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      preview_text: '',
      content: '',
      cover_image: '',
      status: 'draft',
      categories: [],
      tags: [],
      meta_title: '',
      meta_description: '',
      meta_keywords: []
    });
    setEditingPost(null);
    setIsCreating(false);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold">Blog Admin</h1>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/blog')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                View Blog →
              </button>
              {!isCreating && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-6 py-2 bg-[#f0ad4e] text-white rounded-lg hover:bg-[#ec971f] transition-colors"
                >
                  + New Post
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isCreating ? (
          // Create/Edit Form
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0ad4e]"
                placeholder="Enter post title..."
              />
            </div>
            
            {/* Preview Text */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview Text
              </label>
              <textarea
                value={formData.preview_text}
                onChange={(e) => handleInputChange('preview_text', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0ad4e]"
                rows={3}
                placeholder="Enter preview text..."
              />
            </div>
            
            {/* Cover Image */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageSelect}
                  className="flex-1"
                />
                {formData.cover_image && (
                  <div className="relative w-32 h-20">
                    <Image
                      src={formData.cover_image}
                      alt="Cover"
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Content Editor */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => handleInputChange('content', value)}
                onImageUpload={handleImageUpload}
                placeholder="Start writing your blog post..."
              />
            </div>
            
            {/* Categories */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      const newCategories = formData.categories.includes(category.id)
                        ? formData.categories.filter(id => id !== category.id)
                        : [...formData.categories, category.id];
                      handleInputChange('categories', newCategories);
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      formData.categories.includes(category.id)
                        ? 'bg-[#f0ad4e] text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Tags */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags.join(', ')}
                onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0ad4e]"
                placeholder="design, ui, ux, branding..."
              />
            </div>
            
            {/* AI Enhancement Panel */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">AI Enhancement</h3>
                <button
                  type="button"
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {showAIPanel ? 'Hide' : 'Show'} AI Tools
                </button>
              </div>
              
              {showAIPanel && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom AI Prompt (optional)
                    </label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      rows={3}
                      placeholder="E.g., Make it more engaging for startup founders..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={enhanceWithAI}
                    disabled={isEnhancing || (!formData.title && !formData.preview_text && !formData.content)}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isEnhancing ? 'Enhancing...' : '✨ Enhance with AI'}
                  </button>
                </div>
              )}
            </div>
            
            {/* Status and Actions */}
            <div className="flex justify-between items-center">
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f0ad4e]"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              
              <div className="flex gap-4">
                <button
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={savePost}
                  className="px-6 py-2 bg-[#f0ad4e] text-white rounded-lg hover:bg-[#ec971f]"
                >
                  {editingPost ? 'Update Post' : 'Create Post'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Posts List
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {post.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {post.preview_text.substring(0, 60)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-800'
                          : post.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {post.views_count}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editPost(post)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deletePost(post.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {posts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No posts yet. Create your first post!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}