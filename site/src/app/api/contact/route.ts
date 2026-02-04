import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { name, email, phone, company, projectType, budget, timeline, description } = body
    
    if (!name || !email || !projectType || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Store in Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert({
        name,
        email,
        phone: phone || null,
        company: company || null,
        project_type: projectType,
        budget: budget || null,
        timeline: timeline || null,
        description,
        status: 'new',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      // Still return success - we don't want to fail the user experience
      // TODO: Add email notification fallback
    }

    // TODO: Send email notification to loseyp@gmail.com
    // For now, leads are stored in Supabase and can be viewed in dashboard

    console.log('New lead received:', { name, email, projectType, company })

    return NextResponse.json({ 
      success: true, 
      message: 'Thank you! We\'ll be in touch soon.',
      leadId: data?.id 
    })

  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
