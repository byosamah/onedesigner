import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { sendEmail } from '@/lib/email/send-email'
import { matchAcceptedEmail } from '@/lib/email/templates/match-accepted'
import { matchDeclinedEmail } from '@/lib/email/templates/match-declined'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get designer session
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('designer-session')
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const session = JSON.parse(sessionCookie.value)
    const { designerId } = session

    const { response, message } = await request.json()

    if (!response || !['accept', 'decline'].includes(response)) {
      return NextResponse.json(
        { error: 'Invalid response' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Verify the request belongs to this designer
    const { data: designerRequest, error: fetchError } = await supabase
      .from('designer_requests')
      .select(`
        *, 
        match:matches!designer_requests_match_id_fkey(
          *,
          client:clients(*),
          brief:briefs(*)
        ),
        designer:designers(*)
      `)
      .eq('id', params.id)
      .eq('designer_id', designerId)
      .single()

    if (fetchError || !designerRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    if (designerRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Request already responded' },
        { status: 400 }
      )
    }

    // Update designer request
    const { error: updateError } = await supabase
      .from('designer_requests')
      .update({
        status: response === 'accept' ? 'accepted' : 'declined',
        response,
        message,
        responded_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (updateError) {
      throw updateError
    }

    // Update match status if accepted and send email
    if (response === 'accept') {
      await supabase
        .from('matches')
        .update({ status: 'accepted' })
        .eq('id', designerRequest.match_id)

      // Send acceptance email to client
      if (designerRequest.match?.client?.email) {
        const { subject, html, text } = matchAcceptedEmail({
          clientName: designerRequest.match.client.name || 'there',
          designerName: designerRequest.designer.name,
          designerEmail: designerRequest.designer.email,
          designerPhone: designerRequest.designer.phone,
          designerWebsite: designerRequest.designer.website,
          projectType: designerRequest.match.brief?.project_type || 'design',
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://onedesigner.app'}/client/dashboard`
        })

        await sendEmail({ to: designerRequest.match.client.email, subject, html, text })
      }
    } else {
      // Send decline email to client
      if (designerRequest.match?.client?.email) {
        const { subject, html, text } = matchDeclinedEmail({
          clientName: designerRequest.match.client.name || 'there',
          designerName: designerRequest.designer.name,
          projectType: designerRequest.match.brief?.project_type || 'design',
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://onedesigner.app'}/client/dashboard`
        })

        await sendEmail({ to: designerRequest.match.client.email, subject, html, text })
      }
    }

    return NextResponse.json({
      success: true,
      message: response === 'accept' 
        ? 'Request accepted successfully' 
        : 'Request declined'
    })
  } catch (error) {
    console.error('Error responding to request:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to respond' },
      { status: 500 }
    )
  }
}