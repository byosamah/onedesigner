'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/shared/Navigation';
import { useTheme } from '@/lib/hooks/useTheme';

export default function BlogAdminVerifyPage() {
  const { isDarkMode, theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const navTheme = {
    text: {
      primary: theme.text.primary,
      secondary: theme.text.secondary
    },
    accent: theme.accent,
    border: theme.border
  };

  useEffect(() => {
    // Get email from session storage
    const storedEmail = sessionStorage.getItem('blog_admin_email');
    if (!storedEmail) {
      router.push('/blog/admin/login');
      return;
    }
    setEmail(storedEmail);
  }, [router]);

  useEffect(() => {
    // Countdown timer for resend button
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    // Remove any non-digit characters
    const cleanValue = value.replace(/\D/g, '');
    
    if (cleanValue.length > 1) {
      // Handle paste - distribute digits across all inputs
      const pastedCode = cleanValue.slice(0, 6).split('');
      const newOtp = ['', '', '', '', '', ''];
      pastedCode.forEach((digit, i) => {
        if (i < 6) {
          newOtp[i] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus on the last filled input or the next empty one
      const lastFilledIndex = Math.min(pastedCode.length - 1, 5);
      if (pastedCode.length >= 6) {
        // If all fields are filled, focus the last one
        inputRefs.current[5]?.focus();
      } else {
        // Otherwise focus the next empty field
        inputRefs.current[pastedCode.length]?.focus();
      }
    } else if (cleanValue.length === 1) {
      const newOtp = [...otp];
      newOtp[index] = cleanValue;
      setOtp(newOtp);

      // Auto-focus next input
      if (cleanValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (cleanValue.length === 0) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const cleanData = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (cleanData.length > 0) {
      const newOtp = ['', '', '', '', '', ''];
      cleanData.split('').forEach((digit, i) => {
        if (i < 6) {
          newOtp[i] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus appropriate input after paste
      if (cleanData.length >= 6) {
        inputRefs.current[5]?.focus();
      } else {
        inputRefs.current[cleanData.length]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter a complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/blog/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await response.json();

      if (response.ok) {
        // Store auth token in session storage
        sessionStorage.setItem('blog_admin_token', data.token);
        sessionStorage.setItem('blog_admin_authenticated', 'true');
        router.push('/blog/admin');
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/blog/admin/send-otp-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setResendTimer(60);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to resend code');
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
              <span className="text-2xl">✉️</span>
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: theme.text.primary }}>
              Verify Your Identity
            </h1>
            <p className="text-sm" style={{ color: theme.text.secondary }}>
              We've sent a 6-digit code to
            </p>
            <p className="font-medium mt-1" style={{ color: theme.text.primary }}>
              {email}
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-4 text-center" style={{ color: theme.text.primary }}>
                Enter Verification Code
              </label>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={6} // Allow pasting multiple digits
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onPaste={handlePaste}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={loading}
                    className="w-12 h-12 text-center text-lg font-bold rounded-lg border-2 focus:outline-none focus:ring-2 transition-all duration-200"
                    style={{ 
                      backgroundColor: theme.nestedBg,
                      borderColor: digit ? theme.accent : theme.border,
                      color: theme.text.primary
                    }}
                  />
                ))}
              </div>
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
              onClick={handleVerify}
              disabled={loading || otp.some(d => !d)}
              className="w-full py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              style={{ 
                backgroundColor: theme.accent,
                color: 'white'
              }}
            >
              {loading ? '🔄 Verifying...' : '✅ Verify & Continue'}
            </button>

            <div className="text-center">
              <button
                onClick={handleResend}
                disabled={loading || resendTimer > 0}
                className="text-sm font-medium transition-colors duration-200"
                style={{ 
                  color: resendTimer > 0 ? theme.text.secondary : theme.accent,
                  opacity: resendTimer > 0 ? 0.5 : 1
                }}
              >
                {resendTimer > 0 
                  ? `Resend code in ${resendTimer}s` 
                  : '📤 Resend Code'}
              </button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: theme.border }}>
            <button
              onClick={() => router.push('/blog/admin/login')}
              className="text-sm font-medium transition-colors duration-200"
              style={{ color: theme.accent }}
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}