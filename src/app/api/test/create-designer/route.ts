import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { apiResponse } from '@/lib/api/responses'
import { v4 as uuidv4 } from 'uuid'

const designerProfiles = [
  {
    first_name: 'Sarah',
    last_name: 'Johnson',
    title: 'Senior UI/UX Designer',
    city: 'San Francisco',
    country: 'USA',
    years_experience: 7,
    bio: 'I believe in creating intuitive, user-centered designs that balance aesthetics with functionality.',
    styles: ['minimal', 'modern', 'clean', 'user-friendly'],
    industries: ['tech', 'e-commerce', 'fashion', 'health'],
    rating: 4.8,
    total_projects: 42
  },
  {
    first_name: 'Michael',
    last_name: 'Kim',
    title: 'Product Designer',
    city: 'Seattle',
    country: 'USA',
    years_experience: 12,
    bio: 'Design is not just what it looks like. Design is how it works. I focus on creating seamless experiences.',
    styles: ['functional', 'innovative', 'data-driven', 'accessible'],
    industries: ['fintech', 'saas', 'enterprise', 'education'],
    rating: 4.9,
    total_projects: 156
  },
  {
    first_name: 'Lisa',
    last_name: 'Wang',
    title: 'UI/UX Designer',
    city: 'Austin',
    country: 'USA',
    years_experience: 5,
    bio: 'Passionate about creating beautiful, functional designs that make a difference in peoples lives.',
    styles: ['colorful', 'playful', 'bold', 'engaging'],
    industries: ['consumer', 'media', 'entertainment', 'lifestyle'],
    rating: 4.7,
    total_projects: 43
  },
  {
    first_name: 'Rachel',
    last_name: 'Martinez',
    title: 'E-commerce Designer',
    city: 'Miami',
    country: 'USA',
    years_experience: 7,
    bio: 'Specialized in e-commerce and conversion optimization. I design stores that sell.',
    styles: ['conversion-focused', 'clean', 'trustworthy', 'modern'],
    industries: ['e-commerce', 'retail', 'fashion', 'beauty'],
    rating: 4.7,
    total_projects: 71
  }
]

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    // Get random designer profile
    const randomProfile = designerProfiles[Math.floor(Math.random() * designerProfiles.length)]
    
    // Create a test designer
    const { data: designer, error } = await supabase
      .from('designers')
      .insert({
        id: uuidv4(),
        email: `${randomProfile.first_name.toLowerCase()}.${randomProfile.last_name.toLowerCase()}.${Date.now()}@onedesigner.app`,
        first_name: randomProfile.first_name,
        last_name: randomProfile.last_name,
        last_initial: randomProfile.last_name.charAt(0),
        title: randomProfile.title,
        city: randomProfile.city,
        country: randomProfile.country,
        years_experience: randomProfile.years_experience,
        bio: randomProfile.bio,
        is_verified: true,
        is_approved: true,
        styles: randomProfile.styles,
        industries: randomProfile.industries,
        tools: ['Figma', 'Adobe XD', 'Sketch'],
        availability: 'available',
        rating: randomProfile.rating,
        total_projects: randomProfile.total_projects,
        hourly_rate: 100 + (randomProfile.years_experience * 10),
        timezone: 'PST'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating test designer:', error)
      return apiResponse.serverError('Failed to create test designer', error)
    }

    return apiResponse.success({
      designer,
      message: 'Test designer created successfully'
    })

  } catch (error) {
    console.error('Error:', error)
    return apiResponse.serverError('Internal server error')
  }
}