interface ThemeToggleProps {
  isDarkMode: boolean
  toggleTheme: () => void
}

export const ThemeToggle = ({ isDarkMode, toggleTheme }: ThemeToggleProps) => {
  return (
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
  )
}