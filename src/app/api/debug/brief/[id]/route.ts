import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const briefId = params.id

    // 1. Get brief data
    const { data: brief, error: briefError } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', briefId)
      .single()

    if (briefError) {
      return NextResponse.json({ 
        error: 'Brief not found',
        briefError: briefError.message 
      }, { status: 404 })
    }

    // 2. Count available designers
    const { count: availableDesigners, error: designerError } = await supabase
      .from('designers')
      .select('*', { count: 'exact' })
      .eq('is_verified', true)
      .eq('is_approved', true)
      .eq('availability', 'available')

    // 3. Count matched designers for this brief
    const { count: matchedDesigners, error: matchError } = await supabase
      .from('matches')
      .select('*', { count: 'exact' })
      .eq('brief_id', briefId)

    // 4. Check fallback conditions
    const shouldUseFallback = (
      // Brief has incomplete data
      (brief.industry && brief.industry.length <= 3) ||
      !brief.styles || brief.styles.length === 0 ||
      (brief.description && brief.description.length < 20) ||
      !brief.industry ||
      !brief.description
    )

    // 5. Get sample designers to see what's available
    const { data: sampleDesigners, error: sampleError } = await supabase
      .from('designers')
      .select('id, first_name, last_name, is_verified, is_approved, availability')
      .eq('is_verified', true)
      .eq('is_approved', true)
      .eq('availability', 'available')
      .limit(5)

    return NextResponse.json({
      briefId,
      brief: {
        id: brief.id,
        project_type: brief.project_type,
        industry: brief.industry,
        description: brief.description,
        styles: brief.styles,
        budget: brief.budget,
        timeline: brief.timeline,
        created_at: brief.created_at
      },
      counts: {
        availableDesigners,
        matchedDesigners
      },
      fallback: {
        shouldUseFallback,
        reasons: {
          shortIndustry: brief.industry && brief.industry.length <= 3,
          noStyles: !brief.styles || brief.styles.length === 0,
          shortDescription: brief.description && brief.description.length < 20,
          noIndustry: !brief.industry,
          noDescription: !brief.description
        }
      },
      sampleDesigners,
      errors: {
        briefError: briefError?.message || null,
        designerError: designerError?.message || null,
        matchError: matchError?.message || null,
        sampleError: sampleError?.message || null
      }
    })

  } catch (error) {
    console.error('Debug brief error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}