interface AIEnhancementOptions {
  title?: string;
  preview?: string;
  content?: string;
  prompt?: string;
  tone?: 'professional' | 'casual' | 'creative' | 'technical';
  targetAudience?: string;
  seoKeywords?: string[];
}

interface AIEnhancementResult {
  enhanced_title?: string;
  enhanced_preview?: string;
  enhanced_content?: string;
  original_title?: string;
  original_preview?: string;
  original_content?: string;
  prompt_used: string;
  success: boolean;
  error?: string;
}

class BlogAIService {
  private apiKey: string;
  private apiUrl: string;
  private defaultPrompts: {
    title: string;
    preview: string;
    content: string;
  };

  constructor() {
    // Use the new DeepSeek API key provided
    this.apiKey = process.env.DEEPSEEK_BLOG_API_KEY || 'sk-7f77c4bfc9f14f2a9cf66aaa7a4fe925';
    this.apiUrl = 'https://api.deepseek.com/v1/chat/completions';
    
    this.defaultPrompts = {
      title: `You are an expert SEO content writer for a design platform called OneDesigner. 
      Improve the following blog title to be more engaging, SEO-friendly, and compelling. 
      The title should:
      - Be between 50-60 characters for optimal SEO
      - Include power words that drive clicks
      - Be clear and specific about the content
      - Appeal to clients looking for designers or designers looking to showcase their work
      
      Keep the core message but make it more impactful.
      Return ONLY the improved title, nothing else.`,
      
      preview: `You are an expert content writer for OneDesigner, a platform that matches clients with designers. 
      Improve the following blog preview text to be more engaging and compelling. 
      The preview should:
      - Be between 150-160 characters for optimal display
      - Create curiosity and encourage clicks
      - Clearly communicate the value proposition
      - Use active voice and strong verbs
      
      Keep the core message but make it more enticing.
      Return ONLY the improved preview text, nothing else.`,
      
      content: `You are an expert content writer and SEO specialist for OneDesigner, a premium design matching platform. 
      Enhance the following blog article to be more engaging, informative, and SEO-optimized.
      
      Guidelines:
      - Maintain a professional yet approachable tone
      - Use clear, scannable formatting with short paragraphs
      - Include relevant industry insights and practical tips
      - Naturally incorporate SEO keywords without keyword stuffing
      - Add compelling transitions between sections
      - Ensure content provides real value to readers
      - Use active voice and engaging language
      - Include actionable takeaways
      - Target audience: business owners, startups, and professional designers
      
      Preserve any HTML formatting, image tags, or special markers in the content.
      Return ONLY the enhanced content, nothing else.`
    };
  }

  // Set custom prompts
  setCustomPrompts(prompts: Partial<typeof this.defaultPrompts>) {
    this.defaultPrompts = { ...this.defaultPrompts, ...prompts };
  }

  // Call DeepSeek API
  private async callDeepSeekAPI(prompt: string, content: string): Promise<string> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: prompt
            },
            {
              role: 'user',
              content: content
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`DeepSeek API error: ${error}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || content;
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      throw error;
    }
  }

  // Enhance blog title
  async enhanceTitle(title: string, customPrompt?: string): Promise<string> {
    const prompt = customPrompt || this.defaultPrompts.title;
    return this.callDeepSeekAPI(prompt, title);
  }

  // Enhance blog preview
  async enhancePreview(preview: string, customPrompt?: string): Promise<string> {
    const prompt = customPrompt || this.defaultPrompts.preview;
    return this.callDeepSeekAPI(prompt, preview);
  }

  // Enhance blog content
  async enhanceContent(content: string, customPrompt?: string, seoKeywords?: string[]): Promise<string> {
    let prompt = customPrompt || this.defaultPrompts.content;
    
    if (seoKeywords && seoKeywords.length > 0) {
      prompt += `\n\nImportant SEO keywords to naturally incorporate: ${seoKeywords.join(', ')}`;
    }
    
    return this.callDeepSeekAPI(prompt, content);
  }

  // Enhance all content at once
  async enhanceAll(options: AIEnhancementOptions): Promise<AIEnhancementResult> {
    try {
      const result: AIEnhancementResult = {
        prompt_used: options.prompt || 'default',
        success: false
      };

      // Store originals
      if (options.title) result.original_title = options.title;
      if (options.preview) result.original_preview = options.preview;
      if (options.content) result.original_content = options.content;

      // Enhance each part if provided
      if (options.title) {
        result.enhanced_title = await this.enhanceTitle(options.title, options.prompt);
      }

      if (options.preview) {
        result.enhanced_preview = await this.enhancePreview(options.preview, options.prompt);
      }

      if (options.content) {
        result.enhanced_content = await this.enhanceContent(
          options.content, 
          options.prompt,
          options.seoKeywords
        );
      }

      result.success = true;
      return result;
    } catch (error) {
      console.error('Error enhancing content:', error);
      return {
        original_title: options.title,
        original_preview: options.preview,
        original_content: options.content,
        prompt_used: options.prompt || 'default',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Generate SEO metadata
  async generateSEOMetadata(content: string, title: string): Promise<{
    meta_title: string;
    meta_description: string;
    meta_keywords: string[];
  }> {
    try {
      const prompt = `Based on the following blog title and content, generate SEO metadata.
      
      Title: ${title}
      
      Return a JSON object with:
      - meta_title: SEO-optimized title (max 60 characters)
      - meta_description: Compelling meta description (max 160 characters)
      - meta_keywords: Array of 5-10 relevant keywords
      
      Return ONLY valid JSON, nothing else.`;
      
      const response = await this.callDeepSeekAPI(prompt, content.substring(0, 2000));
      
      try {
        const metadata = JSON.parse(response);
        return {
          meta_title: metadata.meta_title || title.substring(0, 60),
          meta_description: metadata.meta_description || content.substring(0, 160),
          meta_keywords: metadata.meta_keywords || []
        };
      } catch {
        // Fallback if JSON parsing fails
        return {
          meta_title: title.substring(0, 60),
          meta_description: content.substring(0, 160).replace(/\n/g, ' '),
          meta_keywords: []
        };
      }
    } catch (error) {
      console.error('Error generating SEO metadata:', error);
      return {
        meta_title: title.substring(0, 60),
        meta_description: content.substring(0, 160).replace(/\n/g, ' '),
        meta_keywords: []
      };
    }
  }

  // Generate blog post ideas
  async generateBlogIdeas(topic: string, count: number = 5): Promise<string[]> {
    try {
      const prompt = `Generate ${count} compelling blog post ideas for OneDesigner, a platform that connects clients with professional designers.
      
      Topic focus: ${topic}
      
      Each idea should:
      - Be relevant to design, creative services, or client-designer relationships
      - Address real pain points or interests
      - Be specific and actionable
      - Have SEO potential
      
      Return ONLY a JSON array of title strings, nothing else.`;
      
      const response = await this.callDeepSeekAPI(prompt, '');
      
      try {
        const ideas = JSON.parse(response);
        return Array.isArray(ideas) ? ideas : [];
      } catch {
        return [];
      }
    } catch (error) {
      console.error('Error generating blog ideas:', error);
      return [];
    }
  }

  // Check content for SEO optimization
  async analyzeSEO(content: string, targetKeywords: string[]): Promise<{
    score: number;
    suggestions: string[];
    keywordDensity: { [key: string]: number };
  }> {
    try {
      const prompt = `Analyze the following content for SEO optimization.
      
      Target keywords: ${targetKeywords.join(', ')}
      
      Provide:
      1. An SEO score from 0-100
      2. Specific improvement suggestions
      3. Keyword density for each target keyword (as percentage)
      
      Return ONLY valid JSON with structure:
      {
        "score": number,
        "suggestions": ["suggestion1", "suggestion2"],
        "keywordDensity": { "keyword": percentage }
      }`;
      
      const response = await this.callDeepSeekAPI(prompt, content);
      
      try {
        return JSON.parse(response);
      } catch {
        return {
          score: 0,
          suggestions: ['Unable to analyze content'],
          keywordDensity: {}
        };
      }
    } catch (error) {
      console.error('Error analyzing SEO:', error);
      return {
        score: 0,
        suggestions: ['Error analyzing content'],
        keywordDensity: {}
      };
    }
  }

  // Rewrite content for different tones
  async rewriteWithTone(content: string, tone: 'professional' | 'casual' | 'creative' | 'technical'): Promise<string> {
    const tonePrompts = {
      professional: 'Rewrite this content in a professional, authoritative tone suitable for business executives and decision-makers.',
      casual: 'Rewrite this content in a friendly, conversational tone that feels approachable and relatable.',
      creative: 'Rewrite this content with a creative, inspiring tone that excites and motivates readers.',
      technical: 'Rewrite this content with a technical, detailed tone that provides in-depth information for experts.'
    };
    
    const prompt = `${tonePrompts[tone]}
    
    Maintain all factual information and key points.
    Preserve any HTML formatting or image tags.
    Return ONLY the rewritten content.`;
    
    return this.callDeepSeekAPI(prompt, content);
  }

  // Generate content outline
  async generateOutline(topic: string, keywords: string[]): Promise<string> {
    try {
      const prompt = `Create a detailed blog post outline for OneDesigner on the topic: "${topic}"
      
      Include these keywords naturally: ${keywords.join(', ')}
      
      The outline should:
      - Have a compelling introduction
      - Include 3-5 main sections with subsections
      - End with actionable conclusions
      - Be structured for a 1500-2000 word article
      
      Format as a numbered outline with clear hierarchy.`;
      
      return this.callDeepSeekAPI(prompt, '');
    } catch (error) {
      console.error('Error generating outline:', error);
      return '';
    }
  }
}

// Export singleton instance
export const blogAIService = new BlogAIService();