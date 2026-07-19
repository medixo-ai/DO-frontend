import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-lg">IntelliDocs AI</span>
        </div>
        <div className="card p-6 md:p-8">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">We sent a reset link to <strong>{email}</strong></p>
              <Link to="/login" className="btn-primary justify-center w-full py-2.5">Back to login</Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Forgot password?</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="you@company.com" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
                  {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</span> : 'Send reset link'}
                </button>
              </form>
              <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                <Link to="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Back to login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
