import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Zap, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(form.email, form.password)
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.error || 'Invalid email or password')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const demoAccounts = [
    { label: 'Admin', email: 'admin@intellidocs.com', pass: 'admin123' },
    { label: 'Manager', email: 'manager@intellidocs.com', pass: 'admin123' },
    { label: 'Employee', email: 'employee@intellidocs.com', pass: 'admin123' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-brand-600 flex-col justify-between p-12">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg">IntelliDocs AI</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Your company knowledge,<br />instantly accessible.
          </h2>
          <p className="text-brand-200 text-sm leading-relaxed max-w-sm">
            Ask questions in plain English. Get answers from your documents in seconds, with source citations you can trust.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[{ label: 'Documents indexed', value: '10M+' }, { label: 'Avg. response time', value: '1.8s' }, { label: 'Accuracy rate', value: '97.4%' }, { label: 'Enterprise clients', value: '500+' }].map(({ label, value }) => (
              <div key={label} className="bg-white/10 rounded-xl p-4">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-brand-200 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-brand-300 text-xs">© 2024 IntelliDocs AI. SOC 2 Type II Certified.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">IntelliDocs AI</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Sign in to your account to continue</p>

          {/* Demo accounts */}
          <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2"></p>
            <div className="flex flex-wrap gap-2">
              {demoAccounts.map(acc => (
                <button key={acc.label} onClick={() => setForm(f => ({ ...f, email: acc.email, password: acc.pass }))}
                  className="text-xs bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.remember} onChange={e => setForm(f => ({ ...f, remember: e.target.checked }))}
                  className="w-4 h-4 text-brand-600 rounded border-gray-300" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-brand-600 dark:text-brand-400 hover:underline">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</span>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
