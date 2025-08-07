// OneDesigner Design System - Marc Lou Style
// Based on ShipFast aesthetic with dark/light theme support

export const getTheme = (isDarkMode: boolean) => ({
  // Background colors
  bg: isDarkMode ? '#212121' : '#FAFAFA',
  cardBg: isDarkMode ? '#323232' : '#FFFFFF',
  nestedBg: isDarkMode ? '#212121' : '#F5F5F5',
  tagBg: isDarkMode ? '#1A1A1A' : '#F3F4F6',
  
  // Text colors
  text: {
    primary: isDarkMode ? '#cfcfcf' : '#111827',
    secondary: isDarkMode ? '#9CA3AF' : '#6B7280',
    muted: isDarkMode ? '#6B7280' : '#9CA3AF'
  },
  
  // UI elements
  border: isDarkMode ? '#374151' : '#E5E7EB',
  accent: '#f0ad4e',
  success: '#10B981',
  error: '#EF4444',
  
  // Shadows
  shadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)',
  shadowHover: isDarkMode ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.08)'
})

// Common styles
export const commonStyles = {
  // Typography
  h1: 'text-5xl font-extrabold',
  h2: 'text-3xl font-bold',
  h3: 'text-xl font-bold',
  body: 'text-base',
  small: 'text-sm',
  
  // Buttons
  buttonPrimary: 'font-bold py-4 px-8 rounded-2xl transition-all duration-300 hover:scale-[1.02]',
  buttonSecondary: 'font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02]',
  buttonGhost: 'font-medium transition-colors duration-300',
  
  // Cards
  card: 'rounded-3xl p-8 transition-all duration-300',
  cardSmall: 'rounded-2xl p-6 transition-all duration-300',
  
  // Inputs
  input: 'rounded-xl px-4 py-3 transition-all duration-300 focus:outline-none focus:ring-2',
  
  // Layout
  container: 'max-w-6xl mx-auto px-8',
  section: 'py-12',
  
  // Animations
  fadeIn: 'animate-fadeIn',
  scaleHover: 'hover:scale-[1.02]'
}

// Marc Lou style copy patterns
export const copyStyle = {
  // Headlines
  headlines: [
    "Holy [Thing]! [Achievement]",
    "[Action] in [short time], not [long time]",
    "Stop [bad thing]. Start [good thing].",
    "[Number]% [result] (not BS)"
  ],
  
  // CTAs
  ctas: [
    "Skip the BS. [Action] →",
    "[Action] & Start [Result] →",
    "Get [Result] Now →",
    "Let's [Action] →"
  ],
  
  // Social proof
  proof: [
    "[Number] [things] [action]",
    "Join [number] [people] who [result]",
    "[Number]% of [people] [result]"
  ]
}