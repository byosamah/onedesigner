import { useState, useRef, useEffect } from 'react'

interface OTPInputProps {
  length?: number
  onComplete: (otp: string) => void
  error?: string
  theme: {
    nestedBg: string
    border: string
    text: {
      primary: string
    }
    accent: string
  }
}

export const OTPInput = ({ 
  length = 6, 
  onComplete, 
  error,
  theme 
}: OTPInputProps) => {
  const [otp, setOtp] = useState(Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, length).split('')
      const newOtp = [...otp]
      pastedCode.forEach((digit, i) => {
        if (index + i < length) {
          newOtp[index + i] = digit
        }
      })
      setOtp(newOtp)
      
      const lastFilledIndex = Math.min(index + pastedCode.length - 1, length - 1)
      inputRefs.current[lastFilledIndex]?.focus()
      
      // Check if complete
      if (newOtp.every(digit => digit)) {
        onComplete(newOtp.join(''))
      }
    } else {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      // Auto-focus next input
      if (value && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
      
      // Check if complete
      if (newOtp.every(digit => digit)) {
        onComplete(newOtp.join(''))
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text')
    const digits = pastedData.replace(/\D/g, '').slice(0, length).split('')
    
    if (digits.length > 0) {
      const newOtp = [...otp]
      digits.forEach((digit, i) => {
        if (i < length) {
          newOtp[i] = digit
        }
      })
      setOtp(newOtp)
      
      // Focus on the last filled input or the last input if all are filled
      const lastIndex = Math.min(digits.length - 1, length - 1)
      inputRefs.current[lastIndex]?.focus()
      
      // Check if complete
      if (newOtp.every(digit => digit)) {
        onComplete(newOtp.join(''))
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2 sm:gap-3 animate-slideUp">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              if (el) inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:scale-[1.05]"
            style={{
              backgroundColor: theme.nestedBg,
              border: error ? '2px solid #ef4444' : `2px solid ${theme.border}`,
              color: theme.text.primary,
              '--tw-ring-color': theme.accent
            } as React.CSSProperties}
          />
        ))}
      </div>
      
      {error && (
        <p className="text-center text-red-400 text-sm animate-slideUp font-medium">
          {error}
        </p>
      )}
    </div>
  )
}