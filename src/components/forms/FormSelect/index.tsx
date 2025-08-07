'use client'

import { SelectHTMLAttributes } from 'react'

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  theme: any
  error?: string
  options?: { value: string; label: string }[]
}

export const FormSelect = ({ 
  label, 
  theme, 
  error,
  options = [],
  className = '',
  required,
  children,
  ...props 
}: FormSelectProps) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-2 transition-colors duration-300" 
          style={{ color: theme.text.primary }}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 appearance-none cursor-pointer ${className}`}
        style={{
          backgroundColor: theme.nestedBg,
          border: `2px solid ${error ? theme.error : theme.border}`,
          color: theme.text.primary,
          '--tw-ring-color': theme.accent
        }}
        required={required}
        {...props}
      >
        {children || options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm" style={{ color: theme.error }}>
          {error}
        </p>
      )}
    </div>
  )
}