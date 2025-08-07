'use client'

import { TextareaHTMLAttributes } from 'react'

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  theme: any
  error?: string
  hint?: string
}

export const FormTextarea = ({ 
  label, 
  theme, 
  error,
  hint,
  className = '',
  required,
  ...props 
}: FormTextareaProps) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-2 transition-colors duration-300" 
          style={{ color: theme.text.primary }}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 resize-none ${className}`}
        style={{
          backgroundColor: theme.nestedBg,
          border: `2px solid ${error ? theme.error : theme.border}`,
          color: theme.text.primary,
          '--tw-ring-color': theme.accent
        }}
        required={required}
        {...props}
      />
      {hint && !error && (
        <p className="text-sm mt-2 transition-colors duration-300" style={{ color: theme.text.muted }}>
          {hint}
        </p>
      )}
      {error && (
        <p className="mt-1 text-sm" style={{ color: theme.error }}>
          {error}
        </p>
      )}
    </div>
  )
}