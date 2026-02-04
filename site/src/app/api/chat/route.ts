import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    // 1. Save user message to messages table
    const { data: userMessage, error: userError } = await supabase
      .from('messages')
      .insert({
        content: message,
        role: 'user',
        source: 'web',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (userError) {
      console.error('Error saving user message:', userError)
    }

    // 2. Also save to memory_entries for legacy compatibility
    await supabase.from('memory_entries').insert({
      content: `[USER] ${message}`,
      type: 'chat',
    })

    // 3. Call OpenClaw webhook to send to Chase
    let chaseResponse = "I received your message. Chase will respond shortly."
    
    const webhookUrl = process.env.OPENCLAW_WEBHOOK_URL
    if (webhookUrl) {
      try {
        const webhookRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.OPENCLAW_WEBHOOK_SECRET && {
              'Authorization': `Bearer ${process.env.OPENCLAW_WEBHOOK_SECRET}`
            })
          },
          body: JSON.stringify({ message }),
        })

        if (webhookRes.ok) {
          const data = await webhookRes.json()
          chaseResponse = data.response || data.message || chaseResponse
        } else {
          console.error('Webhook error:', webhookRes.status, await webhookRes.text())
        }
      } catch (webhookErr) {
        console.error('Webhook call failed:', webhookErr)
      }
    }

    // 4. Save Chase's response to messages table
    const { data: agentMessage, error: agentError } = await supabase
      .from('messages')
      .insert({
        content: chaseResponse,
        role: 'assistant',
        source: 'web',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (agentError) {
      console.error('Error saving agent message:', agentError)
    }

    // 5. Also save to memory_entries for legacy compatibility
    await supabase.from('memory_entries').insert({
      content: `[AGENT] ${chaseResponse}`,
      type: 'chat',
    })

    return NextResponse.json({
      success: true,
      userMessage: userMessage,
      response: chaseResponse,
      agentMessage: agentMessage
    })

  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// GET endpoint to fetch recent messages
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('source', 'web')
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error fetching messages:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({ messages: data || [] })
  } catch (err) {
    console.error('Chat GET error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
