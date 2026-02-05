import Link from 'next/link'

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-4xl font-bold text-red-500">Losey</span>
            <span className="text-4xl font-light text-zinc-400">.co</span>
          </Link>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Check your email</h2>
          <p className="text-zinc-400 mb-8">
            We've sent a verification link to your email address. Please click the link to confirm your account.
          </p>
          <Link 
            href="/login"
            className="inline-block px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
