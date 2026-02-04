import Link from 'next/link'

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8 text-center">
        <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✕</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
        
        <p className="text-zinc-400 mb-8">
          Your payment was cancelled. No charges were made to your card.
        </p>
        
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-8">
          <p className="text-sm text-zinc-500">
            Need help? Contact us at{' '}
            <a href="mailto:pj@losey.co" className="text-red-400 hover:text-red-300">
              pj@losey.co
            </a>
          </p>
        </div>
        
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors"
        >
          <span>←</span>
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  )
}
