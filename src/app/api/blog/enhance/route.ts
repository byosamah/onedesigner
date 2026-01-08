import { NextRequest, NextResponse } from 'next/server';

// Authentication middleware
function checkAdminAuth(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key');
  return adminKey === 'onedesigner_admin_2025';
}

export async function POST(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, content, context } = body;

    if (!content || !type) {
      return NextResponse.json({ error: 'Missing content or type' }, { status: 400 });
    }

    // DeepSeek AI integration
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: getSystemPrompt(type)
          },
          {
            role: 'user',
            content: getEnhancementPrompt(type, content, context)
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    const enhanced = data.choices?.[0]?.message?.content?.trim() || content;

    return NextResponse.json({ enhanced });
  } catch (error) {
    console.error('AI enhancement error:', error);
    return NextResponse.json({ 
      error: 'Enhancement failed',
      enhanced: content // Return original content as fallback
    }, { status: 500 });
  }
}

function getSystemPrompt(type: string): string {
  const basePrompt = `You are an expert content writer for OneDesigner, a platform that connects clients with pre-vetted designers using AI-powered matching. Your role is to enhance blog content that helps designers and clients succeed in the design industry.

OneDesigner focuses on:
- Connecting clients with the perfect designer match
- Supporting designers in building successful careers
- Providing valuable design insights and industry knowledge
- Emphasizing quality, professionalism, and results

Write in a professional yet approachable tone. Be encouraging, insightful, and actionable.`;

  switch (type) {
    case 'title':
      return `${basePrompt}

Your task is to enhance blog post titles. Create compelling, SEO-friendly titles that:
- Are engaging and click-worthy
- Include relevant keywords naturally
- Are 50-60 characters long for optimal SEO
- Appeal to both designers and clients
- Convey clear value and benefit`;

    case 'preview':
      return `${basePrompt}

Your task is to enhance blog post preview text. Create compelling previews that:
- Are 120-160 characters long for optimal SEO
- Hook readers with a clear value proposition
- Summarize the main benefit or insight
- Use active voice and compelling language
- Include relevant keywords naturally`;

    case 'content':
      return `${basePrompt}

Your task is to enhance blog post content. Improve the content by:
- Making it more engaging and readable
- Adding valuable insights and actionable advice
- Improving structure with clear headings and sections
- Including relevant examples and case studies
- Optimizing for SEO with natural keyword inclusion
- Maintaining the original message and intent`;

    default:
      return basePrompt;
  }
}

function getEnhancementPrompt(type: string, content: string, context: any): string {
  const categoryContext = context?.category ? `Category: ${context.category}\n` : '';
  const titleContext = context?.title ? `Blog Title: ${context.title}\n` : '';
  
  switch (type) {
    case 'title':
      return `${categoryContext}Current title: "${content}"

Enhance this blog title to be more engaging, SEO-friendly, and appealing to designers and clients. Return only the improved title, nothing else.`;

    case 'preview':
      return `${categoryContext}${titleContext}Current preview: "${content}"

Enhance this blog preview to be more compelling and SEO-optimized. It should hook readers and clearly communicate the value. Return only the improved preview, nothing else.`;

    case 'content':
      return `${categoryContext}${titleContext}Current content:
${content}

Enhance this blog content to be more engaging, valuable, and well-structured. Improve readability, add insights, and optimize for SEO while maintaining the original message. Return only the improved content, nothing else.`;

    default:
      return `Please enhance this ${type}: ${content}`;
  }
}