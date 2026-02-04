import Link from 'next/link'

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8 text-center">
        <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✓</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        
        <p className="text-zinc-400 mb-8">
          Thank you for your payment. You&apos;ll receive a confirmation email shortly.
        </p>
        
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 mb-8">
          <p className="text-sm text-zinc-500">
            If you have any questions about your invoice, please contact us at{' '}
            <a href="mailto:pj@losey.co" className="text-red-400 hover:text-red-300">
              pj@losey.co
            </a>
          </p>
        </div>
        
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          <span>←</span>
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  )
}
