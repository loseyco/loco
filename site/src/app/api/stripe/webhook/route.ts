import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeClient, getWebhookSecret, isStripeConfigured } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

// Use service role for webhook (server-side, no user context)
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Supabase service role not configured')
  }

  return createClient(url, serviceKey)
}

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 503 }
    )
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const stripe = getStripeClient()
    const webhookSecret = getWebhookSecret()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Get invoice ID from metadata
        const invoiceId = session.metadata?.invoice_id

        if (invoiceId) {
          const supabase = getServiceClient()

          // Update invoice status to paid
          const { error: updateError } = await supabase
            .from('invoices')
            .update({
              status: 'paid',
              updated_at: new Date().toISOString(),
            })
            .eq('id', invoiceId)

          if (updateError) {
            console.error('Failed to update invoice:', updateError)
          } else {
            console.log(`Invoice ${invoiceId} marked as paid`)
          }
        }
        break
      }

      case 'checkout.session.expired': {
        // Optional: Handle expired sessions
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout session expired:', session.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

// Note: In Next.js App Router, raw body is available by default via request.text()
// No special config needed unlike Pages Router
