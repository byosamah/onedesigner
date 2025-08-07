import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send-email'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin session
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('admin-session')
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const session = JSON.parse(sessionCookie.value)
    const supabase = createServiceClient()
    
    console.log(`=== APPROVING DESIGNER ${params.id} ===`)
    
    // Update designer approval status
    const { data: designer, error } = await supabase
      .from('designers')
      .update({
        is_approved: true,
        approved_at: new Date().toISOString(),
        approved_by: session.adminId
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error || !designer) {
      console.error('Error approving designer:', error)
      console.error('Designer ID:', params.id)
      console.error('Admin ID:', session.adminId)
      return NextResponse.json(
        { error: 'Failed to approve designer' },
        { status: 500 }
      )
    }

    console.log(`✅ Designer approved successfully:`, designer.id)
    console.log(`   Name: ${designer.first_name} ${designer.last_name}`)
    console.log(`   Email: ${designer.email}`)
    console.log(`   is_approved: ${designer.is_approved}`)

    // Send approval email to designer
    try {
      await sendEmail({
        to: designer.email,
        subject: 'Welcome to OneDesigner! Your application has been approved',
        html: `
          <h2>Congratulations ${designer.first_name}!</h2>
          <p>Your application to join OneDesigner has been approved.</p>
          <p>You can now:</p>
          <ul>
            <li>Log in to your dashboard</li>
            <li>Receive match requests from clients</li>
            <li>Update your profile</li>
          </ul>
          <p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/designer/login" 
               style="background: black; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Go to Dashboard
            </a>
          </p>
          <p>Best regards,<br>The OneDesigner Team</p>
        `,
        text: `Congratulations ${designer.first_name}! Your application to join OneDesigner has been approved. You can now log in to your dashboard at ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/designer/login`
      })
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError)
      // Don't fail the approval if email fails
    }

    return NextResponse.json({
      success: true,
      designer: {
        id: designer.id,
        email: designer.email,
        name: `${designer.first_name} ${designer.last_name}`
      }
    })
  } catch (error) {
    console.error('Error in approve route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}