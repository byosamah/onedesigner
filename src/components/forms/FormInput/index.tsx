'use client'

import { InputHTMLAttributes } from 'react'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  theme: any
  error?: string
}

export const FormInput = ({ 
  label, 
  theme, 
  error,
  className = '',
  required,
  ...props 
}: FormInputProps) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-2 transition-colors duration-300" 
          style={{ color: theme.text.primary }}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 ${className}`}
        style={{
          backgroundColor: theme.nestedBg,
          border: `2px solid ${error ? theme.error : theme.border}`,
          color: theme.text.primary,
          '--tw-ring-color': theme.accent
        }}
        required={required}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm" style={{ color: theme.error }}>
          {error}
        </p>
      )}
    </div>
  )
}