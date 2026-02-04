import { NextRequest, NextResponse } from 'next/server'
import { getStripeClient, isStripeConfigured } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.' },
      { status: 503 }
    )
  }

  try {
    const { invoiceId } = await request.json()

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 })
    }

    // Fetch invoice from Supabase
    const supabase = await createClient()
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single()

    if (fetchError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 })
    }

    // Create Stripe checkout session
    const stripe = getStripeClient()
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://losey.co'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: invoice.client_email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Invoice from Losey.Co`,
              description: invoice.description,
            },
            unit_amount: invoice.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancelled`,
      metadata: {
        invoice_id: invoice.id,
      },
    })

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
