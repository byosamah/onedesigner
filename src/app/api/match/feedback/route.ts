import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { logger } from '@/lib/core/logging-service'

// POST /api/match/feedback - Record match feedback and update analytics
export async function POST(request: NextRequest) {
  try {
    // Get client session
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('client-session')
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const session = JSON.parse(sessionCookie.value)

    if (!session || !session.clientId) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const { clientId } = session

    const body = await request.json()
    const { 
      matchId, 
      feedback,
      projectStarted,
      designerId
    } = body

    if (!matchId || !feedback) {
      return NextResponse.json(
        { error: 'Match ID and feedback are required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Update match analytics
    const { error: analyticsError } = await supabase
      .from('audit_logs')
      .update({
        match_accepted: feedback.accepted,
        client_feedback: feedback.comments,
        project_started: projectStarted || false,
        client_satisfaction: feedback.satisfaction,
        communication_quality: feedback.communicationQuality,
        success_factors: feedback.successFactors || [],
        improvement_areas: feedback.improvementAreas || [],
        updated_at: new Date().toISOString()
      })
      .eq('match_id', matchId)
      .eq('client_id', clientId)

    if (analyticsError) {
      logger.error('Error updating match analytics:', analyticsError)
      return NextResponse.json(
        { error: 'Failed to update feedback' },
        { status: 500 }
      )
    }

    // Update client preferences based on feedback
    if (feedback.accepted) {
      await updateClientPreferences(supabase, clientId, matchId, feedback)
    }

    // Update designer metrics if project completed
    if (feedback.projectCompleted && designerId) {
      await updateDesignerMetrics(supabase, designerId, feedback)
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully'
    })
  } catch (error) {
    logger.error('Error in feedback API:', error)
    return NextResponse.json(
      { error: 'Failed to record feedback' },
      { status: 500 }
    )
  }
}

// Helper function to update client preferences
async function updateClientPreferences(
  supabase: any, 
  clientId: string, 
  matchId: string,
  feedback: any
) {
  try {
    // Get the match and designer details
    const { data: match } = await supabase
      .from('matches')
      .select(`
        designer_id,
        designers (
          styles,
          industries,
          communication_style,
          team_size,
          years_experience
        )
      `)
      .eq('id', matchId)
      .single()

    if (!match) return

    const designer = match.designers

    // Get existing preferences or create new
    const { data: existingPrefs } = await supabase
      .from('client_preferences')
      .select('*')
      .eq('client_id', clientId)
      .single()

    const updates: any = {}

    // Update style preferences
    if (designer.styles?.length) {
      updates.preferred_styles = [
        ...(existingPrefs?.preferred_styles || []),
        ...designer.styles
      ].filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
    }

    // Update industry focus
    if (designer.industries?.length) {
      updates.industry_focus = [
        ...(existingPrefs?.industry_focus || []),
        ...designer.industries
      ].filter((v, i, a) => a.indexOf(v) === i)
    }

    // Update communication preference
    if (feedback.communicationQuality >= 4) {
      updates.communication_frequency = designer.communication_style
    }

    // Update experience preference
    if (designer.years_experience) {
      if (designer.years_experience < 3) {
        updates.preferred_designer_experience = 'junior'
      } else if (designer.years_experience < 7) {
        updates.preferred_designer_experience = 'mid'
      } else {
        updates.preferred_designer_experience = 'senior'
      }
    }

    // Update quality vs speed based on feedback
    if (feedback.timelineSatisfaction >= 4 && feedback.qualitySatisfaction >= 4) {
      updates.quality_vs_speed = 'balanced'
    } else if (feedback.qualitySatisfaction > feedback.timelineSatisfaction) {
      updates.quality_vs_speed = 'quality'
    } else {
      updates.quality_vs_speed = 'speed'
    }

    // Upsert preferences
    await supabase
      .from('client_preferences')
      .upsert({
        client_id: clientId,
        ...updates,
        updated_at: new Date().toISOString()
      })
  } catch (error) {
    logger.error('Error updating client preferences:', error)
  }
}

// Helper function to update designer metrics
async function updateDesignerMetrics(
  supabase: any,
  designerId: string,
  feedback: any
) {
  try {
    // Get current metrics
    const { data: designer } = await supabase
      .from('designers')
      .select(`
        total_projects_completed,
        avg_client_satisfaction,
        on_time_delivery_rate,
        budget_adherence_rate,
        project_completion_rate
      `)
      .eq('id', designerId)
      .single()

    if (!designer) return

    const totalProjects = (designer.total_projects_completed || 0) + 1

    // Calculate new averages
    const updates: any = {
      total_projects_completed: totalProjects
    }

    // Update client satisfaction average
    if (feedback.satisfaction) {
      const currentAvg = designer.avg_client_satisfaction || 4.5
      const currentTotal = currentAvg * (totalProjects - 1)
      updates.avg_client_satisfaction = (currentTotal + feedback.satisfaction) / totalProjects
    }

    // Update on-time delivery rate
    if (feedback.timelineAdherence !== undefined) {
      const currentRate = designer.on_time_delivery_rate || 90
      const currentOnTime = (currentRate / 100) * (totalProjects - 1)
      const newOnTime = feedback.timelineAdherence ? currentOnTime + 1 : currentOnTime
      updates.on_time_delivery_rate = (newOnTime / totalProjects) * 100
    }

    // Update budget adherence rate
    if (feedback.budgetAdherence !== undefined) {
      const currentRate = designer.budget_adherence_rate || 85
      const currentAdherent = (currentRate / 100) * (totalProjects - 1)
      const newAdherent = feedback.budgetAdherence ? currentAdherent + 1 : currentAdherent
      updates.budget_adherence_rate = (newAdherent / totalProjects) * 100
    }

    // Update project completion rate (always 100% if project completed)
    const currentRate = designer.project_completion_rate || 95
    const currentCompleted = (currentRate / 100) * (totalProjects - 1)
    updates.project_completion_rate = ((currentCompleted + 1) / totalProjects) * 100

    // Update designer metrics
    await supabase
      .from('designers')
      .update(updates)
      .eq('id', designerId)

  } catch (error) {
    logger.error('Error updating designer metrics:', error)
  }
}

// GET /api/match/feedback/analytics - Get match analytics data
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    // Get aggregate analytics
    const { data: analytics, error } = await supabase
      .from('audit_logs')
      .select(`
        match_score,
        ai_confidence,
        match_accepted,
        project_started,
        project_completed,
        client_satisfaction,
        designer_satisfaction,
        timeline_adherence,
        budget_adherence,
        communication_quality
      `)

    if (error) {
      logger.error('Error fetching analytics:', error)
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      )
    }

    // Calculate aggregate metrics
    const totalMatches = analytics.length
    const acceptedMatches = analytics.filter(a => a.match_accepted).length
    const startedProjects = analytics.filter(a => a.project_started).length
    const completedProjects = analytics.filter(a => a.project_completed).length
    
    const avgMatchScore = analytics.reduce((sum, a) => sum + (a.match_score || 0), 0) / totalMatches
    const avgClientSatisfaction = analytics
      .filter(a => a.client_satisfaction)
      .reduce((sum, a, _, arr) => sum + a.client_satisfaction / arr.length, 0)
    
    const highConfidenceMatches = analytics.filter(a => a.ai_confidence === 'high').length
    const successfulMatches = analytics.filter(a => 
      a.project_completed && a.client_satisfaction >= 4
    ).length

    return NextResponse.json({
      totalMatches,
      matchAcceptanceRate: (acceptedMatches / totalMatches) * 100,
      projectStartRate: (startedProjects / acceptedMatches) * 100,
      projectCompletionRate: (completedProjects / startedProjects) * 100,
      avgMatchScore,
      avgClientSatisfaction,
      highConfidenceRate: (highConfidenceMatches / totalMatches) * 100,
      successRate: (successfulMatches / completedProjects) * 100,
      insights: {
        topSuccessFactors: getTopSuccessFactors(analytics),
        commonChallenges: getCommonChallenges(analytics),
        confidenceAccuracy: calculateConfidenceAccuracy(analytics)
      }
    })
  } catch (error) {
    logger.error('Error in analytics API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

// Helper functions for analytics
function getTopSuccessFactors(analytics: any[]): string[] {
  const factors: Record<string, number> = {}
  
  analytics.forEach(a => {
    if (a.success_factors?.length) {
      a.success_factors.forEach((factor: string) => {
        factors[factor] = (factors[factor] || 0) + 1
      })
    }
  })
  
  return Object.entries(factors)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([factor]) => factor)
}

function getCommonChallenges(analytics: any[]): string[] {
  const challenges: Record<string, number> = {}
  
  analytics.forEach(a => {
    if (a.improvement_areas?.length) {
      a.improvement_areas.forEach((area: string) => {
        challenges[area] = (challenges[area] || 0) + 1
      })
    }
  })
  
  return Object.entries(challenges)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([challenge]) => challenge)
}

function calculateConfidenceAccuracy(analytics: any[]): Record<string, number> {
  const accuracy: Record<string, { total: number; successful: number }> = {
    high: { total: 0, successful: 0 },
    medium: { total: 0, successful: 0 },
    low: { total: 0, successful: 0 }
  }
  
  analytics.forEach(a => {
    const confidence = a.ai_confidence || 'medium'
    accuracy[confidence].total++
    
    if (a.match_accepted && a.client_satisfaction >= 4) {
      accuracy[confidence].successful++
    }
  })
  
  return {
    high: accuracy.high.total ? (accuracy.high.successful / accuracy.high.total) * 100 : 0,
    medium: accuracy.medium.total ? (accuracy.medium.successful / accuracy.medium.total) * 100 : 0,
    low: accuracy.low.total ? (accuracy.low.successful / accuracy.low.total) * 100 : 0
  }
}