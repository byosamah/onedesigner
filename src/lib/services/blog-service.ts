import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  preview_text: string;
  content: string;
  cover_image?: string;
  author_id?: string;
  author_name: string;
  status: 'draft' | 'published' | 'archived';
  
  // SEO fields
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  canonical_url?: string;
  og_image?: string;
  
  // Analytics
  views_count: number;
  reading_time?: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  published_at?: string;
  
  // AI Enhancement
  ai_enhanced?: boolean;
  ai_prompt_used?: string;
  original_title?: string;
  original_preview?: string;
  original_content?: string;
  
  // Relations
  categories?: string[];
  tags?: string[];
  images?: BlogImage[];
}

export interface BlogImage {
  id: string;
  post_id: string;
  url: string;
  alt_text?: string;
  caption?: string;
  position?: number;
  width?: number;
  height?: number;
  size_kb?: number;
  created_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  created_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface CreateBlogPostInput {
  title: string;
  preview_text: string;
  content: string;
  cover_image?: string;
  status?: 'draft' | 'published';
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  categories?: string[];
  tags?: string[];
  ai_enhanced?: boolean;
  ai_prompt_used?: string;
  original_title?: string;
  original_preview?: string;
  original_content?: string;
}

export interface UpdateBlogPostInput extends Partial<CreateBlogPostInput> {
  id: string;
}

class BlogService {
  private supabase: any;

  constructor() {
    // Use service role key for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (typeof window === 'undefined') {
      // Server-side: use service role
      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    } else {
      // Client-side: use anon key
      this.supabase = createClientComponentClient();
    }
  }

  // Generate slug from title
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  }

  // Calculate reading time based on word count
  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  // Create a new blog post
  async createPost(input: CreateBlogPostInput): Promise<BlogPost> {
    try {
      const slug = this.generateSlug(input.title);
      const reading_time = this.calculateReadingTime(input.content);
      
      // Check if slug exists and make it unique
      let finalSlug = slug;
      let counter = 1;
      while (true) {
        const { data: existing } = await this.supabase
          .from('blog_posts')
          .select('id')
          .eq('slug', finalSlug)
          .single();
        
        if (!existing) break;
        finalSlug = `${slug}-${counter}`;
        counter++;
      }
      
      // Create the post
      const postData = {
        slug: finalSlug,
        title: input.title,
        preview_text: input.preview_text,
        content: input.content,
        cover_image: input.cover_image,
        status: input.status || 'draft',
        reading_time,
        meta_title: input.meta_title || input.title.substring(0, 160),
        meta_description: input.meta_description || input.preview_text.substring(0, 320),
        meta_keywords: input.meta_keywords,
        published_at: input.status === 'published' ? new Date().toISOString() : null,
        ai_enhanced: input.ai_enhanced,
        ai_prompt_used: input.ai_prompt_used,
        original_title: input.original_title,
        original_preview: input.original_preview,
        original_content: input.original_content,
      };
      
      const { data: post, error } = await this.supabase
        .from('blog_posts')
        .insert(postData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Add categories
      if (input.categories && input.categories.length > 0) {
        const categoryLinks = input.categories.map(categoryId => ({
          post_id: post.id,
          category_id: categoryId
        }));
        
        await this.supabase
          .from('blog_post_categories')
          .insert(categoryLinks);
      }
      
      // Add tags
      if (input.tags && input.tags.length > 0) {
        // First, ensure tags exist
        for (const tagName of input.tags) {
          const tagSlug = this.generateSlug(tagName);
          await this.supabase
            .from('blog_tags')
            .upsert({ name: tagName, slug: tagSlug })
            .select();
        }
        
        // Get tag IDs
        const { data: tags } = await this.supabase
          .from('blog_tags')
          .select('id, name')
          .in('name', input.tags);
        
        if (tags) {
          const tagLinks = tags.map((tag: any) => ({
            post_id: post.id,
            tag_id: tag.id
          }));
          
          await this.supabase
            .from('blog_post_tags')
            .insert(tagLinks);
        }
      }
      
      return post;
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  }

  // Update an existing blog post
  async updatePost(input: UpdateBlogPostInput): Promise<BlogPost> {
    try {
      const updateData: any = {};
      
      if (input.title) updateData.title = input.title;
      if (input.preview_text) updateData.preview_text = input.preview_text;
      if (input.content) {
        updateData.content = input.content;
        updateData.reading_time = this.calculateReadingTime(input.content);
      }
      if (input.cover_image !== undefined) updateData.cover_image = input.cover_image;
      if (input.status) {
        updateData.status = input.status;
        if (input.status === 'published' && !updateData.published_at) {
          updateData.published_at = new Date().toISOString();
        }
      }
      if (input.meta_title) updateData.meta_title = input.meta_title;
      if (input.meta_description) updateData.meta_description = input.meta_description;
      if (input.meta_keywords) updateData.meta_keywords = input.meta_keywords;
      
      // Update AI enhancement fields
      if (input.ai_enhanced !== undefined) updateData.ai_enhanced = input.ai_enhanced;
      if (input.ai_prompt_used) updateData.ai_prompt_used = input.ai_prompt_used;
      if (input.original_title) updateData.original_title = input.original_title;
      if (input.original_preview) updateData.original_preview = input.original_preview;
      if (input.original_content) updateData.original_content = input.original_content;
      
      const { data: post, error } = await this.supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update categories if provided
      if (input.categories) {
        // Remove existing categories
        await this.supabase
          .from('blog_post_categories')
          .delete()
          .eq('post_id', input.id);
        
        // Add new categories
        if (input.categories.length > 0) {
          const categoryLinks = input.categories.map(categoryId => ({
            post_id: input.id,
            category_id: categoryId
          }));
          
          await this.supabase
            .from('blog_post_categories')
            .insert(categoryLinks);
        }
      }
      
      // Update tags if provided
      if (input.tags) {
        // Remove existing tags
        await this.supabase
          .from('blog_post_tags')
          .delete()
          .eq('post_id', input.id);
        
        // Add new tags
        if (input.tags.length > 0) {
          for (const tagName of input.tags) {
            const tagSlug = this.generateSlug(tagName);
            await this.supabase
              .from('blog_tags')
              .upsert({ name: tagName, slug: tagSlug })
              .select();
          }
          
          const { data: tags } = await this.supabase
            .from('blog_tags')
            .select('id, name')
            .in('name', input.tags);
          
          if (tags) {
            const tagLinks = tags.map((tag: any) => ({
              post_id: input.id,
              tag_id: tag.id
            }));
            
            await this.supabase
              .from('blog_post_tags')
              .insert(tagLinks);
          }
        }
      }
      
      return post;
    } catch (error) {
      console.error('Error updating blog post:', error);
      throw error;
    }
  }

  // Get a single blog post by ID
  async getPostById(id: string): Promise<BlogPost | null> {
    try {
      const { data: post, error } = await this.supabase
        .from('blog_posts')
        .select(`
          *,
          blog_post_categories!inner(
            category:blog_categories(*)
          ),
          blog_post_tags!inner(
            tag:blog_tags(*)
          ),
          blog_images(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (post) {
        // Format categories and tags
        post.categories = post.blog_post_categories?.map((pc: any) => pc.category.name) || [];
        post.tags = post.blog_post_tags?.map((pt: any) => pt.tag.name) || [];
        post.images = post.blog_images || [];
        
        // Clean up response
        delete post.blog_post_categories;
        delete post.blog_post_tags;
        delete post.blog_images;
      }
      
      return post;
    } catch (error) {
      console.error('Error fetching blog post:', error);
      return null;
    }
  }

  // Get a single blog post by slug
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const { data: post, error } = await this.supabase
        .from('blog_posts')
        .select(`
          *,
          blog_post_categories!inner(
            category:blog_categories(*)
          ),
          blog_post_tags!inner(
            tag:blog_tags(*)
          ),
          blog_images(*)
        `)
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      
      if (post) {
        // Format categories and tags
        post.categories = post.blog_post_categories?.map((pc: any) => pc.category) || [];
        post.tags = post.blog_post_tags?.map((pt: any) => pt.tag) || [];
        post.images = post.blog_images || [];
        
        // Clean up response
        delete post.blog_post_categories;
        delete post.blog_post_tags;
        delete post.blog_images;
        
        // Increment view count
        await this.incrementViewCount(post.id);
      }
      
      return post;
    } catch (error) {
      console.error('Error fetching blog post by slug:', error);
      return null;
    }
  }

  // Get all blog posts with pagination
  async getPosts(options: {
    page?: number;
    limit?: number;
    status?: 'draft' | 'published' | 'archived';
    category?: string;
    tag?: string;
    search?: string;
    orderBy?: 'created_at' | 'published_at' | 'views_count';
    order?: 'asc' | 'desc';
  } = {}): Promise<{ posts: BlogPost[]; total: number }> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const offset = (page - 1) * limit;
      
      let query = this.supabase
        .from('blog_posts')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (options.status) {
        query = query.eq('status', options.status);
        if (options.status === 'published') {
          query = query.lte('published_at', new Date().toISOString());
        }
      }
      
      if (options.search) {
        query = query.or(`title.ilike.%${options.search}%,preview_text.ilike.%${options.search}%,content.ilike.%${options.search}%`);
      }
      
      // Apply ordering
      const orderBy = options.orderBy || 'created_at';
      const order = options.order || 'desc';
      query = query.order(orderBy, { ascending: order === 'asc' });
      
      // Apply pagination
      query = query.range(offset, offset + limit - 1);
      
      const { data: posts, error, count } = await query;
      
      if (error) throw error;
      
      // If category or tag filter, need to do additional filtering
      let filteredPosts = posts || [];
      
      if (options.category) {
        const { data: categoryPosts } = await this.supabase
          .from('blog_post_categories')
          .select('post_id')
          .eq('category_id', options.category);
        
        const postIds = categoryPosts?.map((cp: any) => cp.post_id) || [];
        filteredPosts = filteredPosts.filter((p: any) => postIds.includes(p.id));
      }
      
      if (options.tag) {
        const { data: tagPosts } = await this.supabase
          .from('blog_post_tags')
          .select('post_id')
          .eq('tag_id', options.tag);
        
        const postIds = tagPosts?.map((tp: any) => tp.post_id) || [];
        filteredPosts = filteredPosts.filter((p: any) => postIds.includes(p.id));
      }
      
      return {
        posts: filteredPosts,
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return { posts: [], total: 0 };
    }
  }

  // Get published posts for public display
  async getPublishedPosts(options: {
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
    search?: string;
  } = {}): Promise<{ posts: BlogPost[]; total: number }> {
    return this.getPosts({
      ...options,
      status: 'published',
      orderBy: 'published_at',
      order: 'desc'
    });
  }

  // Delete a blog post
  async deletePost(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      return false;
    }
  }

  // Archive a blog post
  async archivePost(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('blog_posts')
        .update({ status: 'archived' })
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error archiving blog post:', error);
      return false;
    }
  }

  // Increment view count
  async incrementViewCount(id: string): Promise<void> {
    try {
      await this.supabase.rpc('increment', {
        table_name: 'blog_posts',
        row_id: id,
        column_name: 'views_count'
      });
    } catch (error) {
      // Silent fail for view count
      console.error('Error incrementing view count:', error);
    }
  }

  // Get all categories
  async getCategories(): Promise<BlogCategory[]> {
    try {
      const { data: categories, error } = await this.supabase
        .from('blog_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Get all tags
  async getTags(): Promise<BlogTag[]> {
    try {
      const { data: tags, error } = await this.supabase
        .from('blog_tags')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return tags || [];
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  }

  // Add image to blog post
  async addImageToPost(postId: string, image: {
    url: string;
    alt_text?: string;
    caption?: string;
    position?: number;
  }): Promise<BlogImage | null> {
    try {
      const { data, error } = await this.supabase
        .from('blog_images')
        .insert({
          post_id: postId,
          ...image
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding image to post:', error);
      return null;
    }
  }

  // Remove image from blog post
  async removeImageFromPost(imageId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('blog_images')
        .delete()
        .eq('id', imageId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing image from post:', error);
      return false;
    }
  }

  // Get related posts
  async getRelatedPosts(postId: string, limit: number = 3): Promise<BlogPost[]> {
    try {
      // Get the current post's categories and tags
      const { data: currentPost } = await this.supabase
        .from('blog_posts')
        .select(`
          blog_post_categories(category_id),
          blog_post_tags(tag_id)
        `)
        .eq('id', postId)
        .single();
      
      if (!currentPost) return [];
      
      const categoryIds = currentPost.blog_post_categories?.map((c: any) => c.category_id) || [];
      const tagIds = currentPost.blog_post_tags?.map((t: any) => t.tag_id) || [];
      
      // Find posts with similar categories or tags
      let relatedPostIds = new Set<string>();
      
      if (categoryIds.length > 0) {
        const { data: categoryPosts } = await this.supabase
          .from('blog_post_categories')
          .select('post_id')
          .in('category_id', categoryIds)
          .neq('post_id', postId);
        
        categoryPosts?.forEach((cp: any) => relatedPostIds.add(cp.post_id));
      }
      
      if (tagIds.length > 0) {
        const { data: tagPosts } = await this.supabase
          .from('blog_post_tags')
          .select('post_id')
          .in('tag_id', tagIds)
          .neq('post_id', postId);
        
        tagPosts?.forEach((tp: any) => relatedPostIds.add(tp.post_id));
      }
      
      if (relatedPostIds.size === 0) {
        // If no related posts by category/tag, get recent posts
        const { data: recentPosts } = await this.supabase
          .from('blog_posts')
          .select('*')
          .eq('status', 'published')
          .neq('id', postId)
          .order('published_at', { ascending: false })
          .limit(limit);
        
        return recentPosts || [];
      }
      
      // Get the related posts
      const { data: relatedPosts } = await this.supabase
        .from('blog_posts')
        .select('*')
        .in('id', Array.from(relatedPostIds))
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit);
      
      return relatedPosts || [];
    } catch (error) {
      console.error('Error fetching related posts:', error);
      return [];
    }
  }
}

// Export singleton instance
export const blogService = new BlogService();