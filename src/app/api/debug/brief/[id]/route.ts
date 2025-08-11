import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/core/logging-service'

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
      (brief.requirements && brief.requirements.length < 20) ||
      (brief.project_description && brief.project_description.length < 20) ||
      !brief.industry ||
      (!brief.description && !brief.requirements && !brief.project_description)
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
        ...brief,
        // Show specific fields we care about
        has_description: !!brief.description,
        has_requirements: !!brief.requirements,
        has_project_description: !!brief.project_description,
        description_length: brief.description ? brief.description.length : 0,
        requirements_length: brief.requirements ? brief.requirements.length : 0,
        project_description_length: brief.project_description ? brief.project_description.length : 0
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
          shortRequirements: brief.requirements && brief.requirements.length < 20,
          shortProjectDescription: brief.project_description && brief.project_description.length < 20,
          noIndustry: !brief.industry,
          noDescription: !brief.description,
          noRequirements: !brief.requirements,
          noProjectDescription: !brief.project_description,
          noAnyDescription: !brief.description && !brief.requirements && !brief.project_description
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
    logger.error('Debug brief error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}