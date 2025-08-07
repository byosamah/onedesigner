// OneDesigner Design System
// Based on Marc Lou's ShipFast aesthetic

export interface Theme {
  bg: string
  cardBg: string
  nestedBg: string
  tagBg: string
  text: {
    primary: string
    secondary: string
    muted: string
  }
  border: string
  accent: string
  success: string
  error: string
}

export const getTheme = (isDarkMode: boolean): Theme => ({
  bg: isDarkMode ? '#212121' : '#FAFAFA',
  cardBg: isDarkMode ? '#323232' : '#FFFFFF',
  nestedBg: isDarkMode ? '#212121' : '#F5F5F5',
  tagBg: isDarkMode ? '#1A1A1A' : '#F3F4F6',
  text: {
    primary: isDarkMode ? '#cfcfcf' : '#111827',
    secondary: isDarkMode ? '#9CA3AF' : '#6B7280',
    muted: isDarkMode ? '#6B7280' : '#9CA3AF'
  },
  border: isDarkMode ? '#374151' : '#E5E7EB',
  accent: 'rgb(245, 193, 71)',
  success: '#10B981',
  error: '#EF4444'
})

// Animation classes to be added to globals.css
export const animations = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes bounce {
    0%, 100% {
      transform: translateY(-25%);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: translateY(0);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.6s ease-out;
  }

  .animate-slideUp {
    animation: slideUp 0.6s ease-out;
    animation-fill-mode: both;
  }

  .animate-bounce {
    animation: bounce 1s infinite;
  }
`