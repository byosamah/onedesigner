'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/shared/Navigation';
import { useTheme } from '@/lib/hooks/useTheme';
import { RichTextEditor } from '@/components/blog/RichTextEditor';
import { ImageCropper } from '@/components/blog/ImageCropper';
import { BlogPost } from '@/types';

interface FormData {
  title: string;
  preview: string;
  content: string;
  category: string;
  cover_image: string;
}

export default function BlogAdminPage() {
  const { isDarkMode, theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    preview: '',
    content: '',
    category: 'design-tips',
    cover_image: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [enhancing, setEnhancing] = useState<string | null>(null);
  const [enhancedFields, setEnhancedFields] = useState<Set<string>>(new Set());
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageForCrop, setTempImageForCrop] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication
    const checkAuth = () => {
      const authenticated = sessionStorage.getItem('blog_admin_authenticated');
      const token = sessionStorage.getItem('blog_admin_token');
      
      if (!authenticated || !token) {
        router.push('/blog/admin/login');
        return false;
      }
      
      setIsAuthenticated(true);
      return true;
    };

    if (checkAuth()) {
      fetchPosts();
    }
  }, [router]);
  const navTheme = {
    text: {
      primary: theme.text.primary,
      secondary: theme.text.secondary
    },
    accent: theme.accent,
    border: theme.border
  };

  const categories = [
    { value: 'design-tips', label: '🎨 Design Tips' },
    { value: 'ui-ux', label: '🖥️ UI/UX' },
    { value: 'trends', label: '📈 Trends' },
    { value: 'tutorials', label: '📚 Tutorials' },
    { value: 'industry-insights', label: '💡 Industry Insights' }
  ];

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog/posts');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setMessage('❌ Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
      return;
    }

    // Validate file size (max 10MB for initial upload, will be reduced after crop)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setMessage('❌ File size too large. Maximum size is 10MB.');
      return;
    }

    // Convert file to data URL for cropping
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageSrc = event.target?.result as string;
      setTempImageForCrop(imageSrc);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImageUrl: string, croppedBlob: Blob) => {
    setShowCropper(false);
    setUploadingImage(true);
    setMessage('');

    try {
      // Create a File object from the blob
      const croppedFile = new File([croppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
      
      const formData = new FormData();
      formData.append('file', croppedFile);

      const response = await fetch('/api/blog/upload-image', {
        method: 'POST',
        headers: {
          'x-admin-key': 'onedesigner_admin_2025'
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, cover_image: data.url }));
        setImagePreview(data.url);
        setMessage('✅ Image cropped and uploaded successfully!');
      } else {
        const error = await response.json();
        setMessage(`❌ Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('❌ Failed to upload image');
    } finally {
      setUploadingImage(false);
      setTempImageForCrop(null);
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setTempImageForCrop(null);
  };

  const handleContentImageUpload = async (file: File): Promise<string> => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/blog/upload-image', {
      method: 'POST',
      headers: {
        'x-admin-key': 'onedesigner_admin_2025'
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const url = editingId ? `/api/blog/posts/${editingId}` : '/api/blog/posts';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-key': 'onedesigner_admin_2025'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage(editingId ? '✅ Post updated successfully!' : '✅ Post created successfully!');
        setFormData({ title: '', preview: '', content: '', category: 'design-tips', cover_image: '' });
        setEditingId(null);
        setEnhancedFields(new Set());
        setImagePreview(null);
        fetchPosts();
      } else {
        const errorData = await response.json();
        setMessage(`❌ Error: ${errorData.message || 'Failed to save post'}`);
      }
    } catch (error) {
      setMessage('❌ Error: Failed to save post');
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setFormData({
      title: post.title,
      preview: post.preview,
      content: post.content,
      category: post.category,
      cover_image: post.cover_image || ''
    });
    setEditingId(post.id);
    setEnhancedFields(new Set());
    setImagePreview(post.cover_image || null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post? 🗑️')) return;

    try {
      const response = await fetch(`/api/blog/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-key': 'onedesigner_admin_2025'
        }
      });

      if (response.ok) {
        setMessage('✅ Post deleted successfully!');
        fetchPosts();
      } else {
        setMessage('❌ Error: Failed to delete post');
      }
    } catch (error) {
      setMessage('❌ Error: Failed to delete post');
      console.error('Delete error:', error);
    }
  };

  const enhanceWithAI = async (field: 'title' | 'preview' | 'content') => {
    setEnhancing(field);
    try {
      const response = await fetch('/api/blog/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'onedesigner_admin_2025'
        },
        body: JSON.stringify({
          type: field,
          content: formData[field],
          context: {
            title: formData.title,
            category: formData.category
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, [field]: data.enhanced }));
        setEnhancedFields(prev => new Set([...prev, field]));
        setMessage('✨ Content enhanced successfully!');
      } else {
        setMessage('❌ Enhancement failed. Please try again.');
      }
    } catch (error) {
      setMessage('❌ Enhancement failed. Please try again.');
    } finally {
      setEnhancing(null);
    }
  };

  const cancelEdit = () => {
    setFormData({ title: '', preview: '', content: '', category: 'design-tips', cover_image: '' });
    setEditingId(null);
    setEnhancedFields(new Set());
    setMessage('');
  };

  // Show loading while checking auth
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p style={{ color: theme.text.secondary }}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      <Navigation
        theme={navTheme}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        title="Blog Admin"
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold" style={{ color: theme.text.primary }}>
            ✏️ Blog Administration
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/blog')}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: theme.accent,
                color: 'white'
              }}
            >
              ← Back to Blog
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem('blog_admin_authenticated');
                sessionStorage.removeItem('blog_admin_token');
                sessionStorage.removeItem('blog_admin_email');
                router.push('/blog/admin/login');
              }}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: theme.nestedBg,
                color: theme.text.primary,
                border: `1px solid ${theme.border}`
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.includes('❌') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create/Edit Form */}
          <div className="order-2 lg:order-1">
            <div 
              className="rounded-xl p-6"
              style={{ 
                backgroundColor: theme.cardBg,
                boxShadow: theme.shadow
              }}
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: theme.text.primary }}>
                {editingId ? '✏️ Edit Post' : '➕ Create New Post'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium" style={{ color: theme.text.primary }}>
                      📝 Title
                    </label>
                    <button
                      type="button"
                      onClick={() => enhanceWithAI('title')}
                      disabled={enhancing === 'title' || !formData.title.trim()}
                      className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50"
                    >
                      {enhancing === 'title' ? '✨ Enhancing...' : '🚀 AI Enhance'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-amber-500 ${enhancedFields.has('title') ? 'border-amber-400 bg-amber-50' : ''}`}
                    style={{ 
                      backgroundColor: enhancedFields.has('title') ? undefined : theme.nestedBg,
                      borderColor: enhancedFields.has('title') ? undefined : theme.border,
                      color: theme.text.primary
                    }}
                    placeholder="Enter post title..."
                    required
                  />
                  {enhancedFields.has('title') && (
                    <div className="mt-1 text-xs text-amber-600 flex items-center">
                      ✨ Enhanced by AI
                    </div>
                  )}
                </div>

                {/* Preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium" style={{ color: theme.text.primary }}>
                      👀 Preview Text
                    </label>
                    <button
                      type="button"
                      onClick={() => enhanceWithAI('preview')}
                      disabled={enhancing === 'preview' || !formData.preview.trim()}
                      className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50"
                    >
                      {enhancing === 'preview' ? '✨ Enhancing...' : '🚀 AI Enhance'}
                    </button>
                  </div>
                  <textarea
                    value={formData.preview}
                    onChange={(e) => setFormData({...formData, preview: e.target.value})}
                    rows={3}
                    className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-amber-500 ${enhancedFields.has('preview') ? 'border-amber-400 bg-amber-50' : ''}`}
                    style={{ 
                      backgroundColor: enhancedFields.has('preview') ? undefined : theme.nestedBg,
                      borderColor: enhancedFields.has('preview') ? undefined : theme.border,
                      color: theme.text.primary
                    }}
                    placeholder="Brief description of the post..."
                    required
                  />
                  {enhancedFields.has('preview') && (
                    <div className="mt-1 text-xs text-amber-600 flex items-center">
                      ✨ Enhanced by AI
                    </div>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                    🏷️ Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-amber-500"
                    style={{ 
                      backgroundColor: theme.nestedBg,
                      borderColor: theme.border,
                      color: theme.text.primary
                    }}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                    🖼️ Cover Image
                  </label>
                  
                  {/* Image Preview */}
                  {(imagePreview || formData.cover_image) && (
                    <div className="mb-4">
                      <img 
                        src={imagePreview || formData.cover_image} 
                        alt="Cover preview" 
                        className="w-full h-48 object-cover rounded-lg"
                        style={{ border: `1px solid ${theme.border}` }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({...formData, cover_image: ''});
                          setImagePreview(null);
                        }}
                        className="mt-2 text-sm text-red-600 hover:text-red-700"
                      >
                        ❌ Remove Image
                      </button>
                    </div>
                  )}
                  
                  {/* File Upload */}
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                      id="cover-image-upload"
                    />
                    <label
                      htmlFor="cover-image-upload"
                      className="inline-flex items-center px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105"
                      style={{ 
                        backgroundColor: theme.accent,
                        color: 'white',
                        opacity: uploadingImage ? 0.5 : 1,
                        pointerEvents: uploadingImage ? 'none' : 'auto'
                      }}
                    >
                      {uploadingImage ? '📤 Uploading...' : '📁 Choose & Crop Image'}
                    </label>
                    
                    <div className="text-xs" style={{ color: theme.text.secondary }}>
                      Accepted formats: JPEG, PNG, GIF, WebP (Max 5MB)
                    </div>
                    
                    {/* Alternative: URL input */}
                    <div className="mt-4">
                      <div className="text-sm mb-2" style={{ color: theme.text.secondary }}>Or enter image URL:</div>
                      <input
                        type="url"
                        value={formData.cover_image}
                        onChange={(e) => {
                          setFormData({...formData, cover_image: e.target.value});
                          setImagePreview(e.target.value);
                        }}
                        className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-amber-500"
                        style={{ 
                          backgroundColor: theme.nestedBg,
                          borderColor: theme.border,
                          color: theme.text.primary
                        }}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>

                {/* Content Editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium" style={{ color: theme.text.primary }}>
                      📄 Content
                    </label>
                    <button
                      type="button"
                      onClick={() => enhanceWithAI('content')}
                      disabled={enhancing === 'content' || !formData.content.trim()}
                      className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50"
                    >
                      {enhancing === 'content' ? '✨ Enhancing...' : '🚀 AI Enhance'}
                    </button>
                  </div>
                  <div className={enhancedFields.has('content') ? 'border-2 border-amber-400 rounded-lg bg-amber-50 p-2' : ''}>
                    <RichTextEditor
                      value={formData.content}
                      onChange={(content) => setFormData({...formData, content})}
                      onImageUpload={handleContentImageUpload}
                      theme={theme}
                    />
                  </div>
                  {enhancedFields.has('content') && (
                    <div className="mt-1 text-xs text-amber-600 flex items-center">
                      ✨ Enhanced by AI
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-6 rounded-lg font-semibold transition-colors duration-200"
                    style={{ 
                      backgroundColor: theme.accent,
                      color: 'white'
                    }}
                  >
                    {loading ? '⏳ Saving...' : editingId ? '💾 Update Post' : '✨ Create Post'}
                  </button>
                  
                  {editingId && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                      style={{ 
                        backgroundColor: theme.nestedBg,
                        color: theme.text.primary,
                        border: `1px solid ${theme.border}`
                      }}
                    >
                      ❌ Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Posts List */}
          <div className="order-1 lg:order-2">
            <div 
              className="rounded-xl p-6"
              style={{ 
                backgroundColor: theme.cardBg,
                boxShadow: theme.shadow
              }}
            >
              <h2 className="text-xl font-bold mb-6" style={{ color: theme.text.primary }}>
                📚 Existing Posts
              </h2>

              {posts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📝</div>
                  <p style={{ color: theme.text.secondary }}>No posts yet. Create your first post! 🚀</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 rounded-lg border"
                      style={{ 
                        backgroundColor: theme.nestedBg,
                        borderColor: theme.border
                      }}
                    >
                      <h3 className="font-semibold mb-2" style={{ color: theme.text.primary }}>
                        {post.title}
                      </h3>
                      <p className="text-sm mb-3 line-clamp-2" style={{ color: theme.text.secondary }}>
                        {post.preview}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: theme.text.secondary }}>
                          🏷️ {post.category} • 👁️ {post.views_count || 0}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(post)}
                            className="text-xs px-2 py-1 rounded text-blue-600 hover:bg-blue-50"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && tempImageForCrop && (
        <ImageCropper
          imageSrc={tempImageForCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={16/9}
          theme={theme}
        />
      )}
    </div>
  );
}