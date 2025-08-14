'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/shared/Navigation';
import { useTheme } from '@/lib/hooks/useTheme';

export default function BlogAdminLoginPage() {
  const { isDarkMode, theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navTheme = {
    text: {
      primary: theme.text.primary,
      secondary: theme.text.secondary
    },
    accent: theme.accent,
    border: theme.border
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check if email is the admin email
    if (email.toLowerCase() !== 'osamah96@gmail.com') {
      setError('Access denied. Only the blog administrator can access this area.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/blog/admin/send-otp-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        // Store email in session storage for verification page
        sessionStorage.setItem('blog_admin_email', email);
        router.push('/blog/admin/verify');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      <Navigation
        theme={navTheme}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        title="OneDesigner Blog"
      />
      
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div 
          className="rounded-2xl p-8"
          style={{ 
            backgroundColor: theme.cardBg,
            boxShadow: theme.shadow
          }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                 style={{ backgroundColor: theme.accent + '20' }}>
              <span className="text-2xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text.primary }}>
              Blog Admin Access
            </h1>
            <p className="text-sm" style={{ color: theme.text.secondary }}>
              Enter your admin email to receive a verification code
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: theme.text.primary }}>
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="osamah96@gmail.com"
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-200"
                style={{ 
                  backgroundColor: theme.nestedBg,
                  borderColor: theme.border,
                  color: theme.text.primary
                }}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg text-sm" style={{ 
                backgroundColor: '#ef4444' + '20',
                color: '#ef4444'
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              style={{ 
                backgroundColor: theme.accent,
                color: 'white'
              }}
            >
              {loading ? '📧 Sending OTP...' : '🚀 Send Verification Code'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: theme.border }}>
            <p className="text-sm" style={{ color: theme.text.secondary }}>
              Only authorized administrators can access this area
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}