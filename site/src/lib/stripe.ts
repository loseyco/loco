import Stripe from 'stripe'

// Server-side Stripe client
// Will throw helpful error if keys not configured
export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error(
      'STRIPE_SECRET_KEY is not configured. Please add it to your environment variables.'
    )
  }

  return new Stripe(secretKey, {
    apiVersion: '2026-01-28.clover',
    typescript: true,
  })
}

// Check if Stripe is configured
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

// Webhook secret for verifying signatures
export function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!secret) {
    throw new Error(
      'STRIPE_WEBHOOK_SECRET is not configured. Please add it to your environment variables.'
    )
  }

  return secret
}
