'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getTheme } from '../../design-system'

export default function TestDesignerLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const theme = getTheme(isDarkMode)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate login for demo
    setTimeout(() => {
      router.push('/test-redesign/designer/dashboard')
    }, 1500)
  }

  return (
    <main className="min-h-screen flex flex-col transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Simple Navigation */}
      <nav className="px-8 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/test-redesign" className="flex items-center gap-2 text-xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={theme.accent} stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1"/>
              <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
              <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>
            </svg>
            OneDesigner
          </Link>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none hover:shadow-md"
            style={{ backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }}
            aria-label="Toggle theme"
          >
            <div
              className="absolute top-1 w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center text-xs"
              style={{
                left: isDarkMode ? '2px' : '32px',
                backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
                transform: isDarkMode ? 'rotate(0deg)' : 'rotate(360deg)'
              }}
            >
              {isDarkMode ? '🌙' : '☀️'}
            </div>
          </button>
        </div>
      </nav>

      {/* Login Content */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-fadeIn">
            <div className="text-5xl mb-6">🎨</div>
            <h1 className="text-4xl font-extrabold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>
              Welcome back, designer!
            </h1>
            <p className="text-lg transition-colors duration-300" style={{ color: theme.text.secondary }}>
              Time to connect with founders who need your magic
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 animate-slideUp">
            <div>
              <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@designstudio.com"
                required
                className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 placeholder-opacity-50"
                style={{
                  backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                  border: `2px solid ${theme.border}`,
                  color: theme.text.primary,
                  focusRingColor: theme.accent
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 placeholder-opacity-50 pr-12"
                  style={{
                    backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
                    border: `2px solid ${theme.border}`,
                    color: theme.text.primary,
                    focusRingColor: theme.accent
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm transition-colors duration-300"
                  style={{ color: theme.text.muted }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link 
                  href="/test-redesign/designer/forgot-password"
                  className="text-sm transition-colors duration-300 hover:opacity-80"
                  style={{ color: theme.accent }}
                >
                  Forgot password? (it happens)
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full font-bold py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: theme.accent, color: '#000' }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚡</span>
                  Logging you in...
                </span>
              ) : (
                'Sign In & Start Designing →'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="transition-colors duration-300" style={{ color: theme.text.secondary }}>
              New to OneDesigner?{' '}
              <Link 
                href="/test-redesign/designer/apply"
                className="font-semibold transition-colors duration-300 hover:opacity-80"
                style={{ color: theme.accent }}
              >
                Apply to join →
              </Link>
            </p>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-4 text-center">
            <div className="animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <div className="text-2xl font-bold" style={{ color: theme.accent }}>2,847</div>
              <div className="text-sm" style={{ color: theme.text.muted }}>Designers</div>
            </div>
            <div className="animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <div className="text-2xl font-bold" style={{ color: theme.accent }}>$2.1M</div>
              <div className="text-sm" style={{ color: theme.text.muted }}>Paid out</div>
            </div>
            <div className="animate-slideUp" style={{ animationDelay: '0.4s' }}>
              <div className="text-2xl font-bold" style={{ color: theme.accent }}>94%</div>
              <div className="text-sm" style={{ color: theme.text.muted }}>Match rate</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}