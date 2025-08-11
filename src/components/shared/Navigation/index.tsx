import { memo } from 'react'
import { Logo } from '../Logo'
import { ThemeToggle } from '../ThemeToggle'

interface NavigationProps {
  theme: {
    text: {
      primary: string
      secondary: string
    }
    accent: string
    border: string
  }
  isDarkMode: boolean
  toggleTheme: () => void
  showCredits?: boolean
  credits?: number
  showDashboardLink?: boolean
  title?: string
  showSignOut?: boolean
  onSignOut?: () => void
  showBackButton?: boolean
  onBack?: () => void
}

const NavigationComponent = ({ 
  theme, 
  isDarkMode, 
  toggleTheme,
  showCredits = false,
  credits = 0,
  showDashboardLink = false,
  title,
  showSignOut = false,
  onSignOut,
  showBackButton = false,
  onBack
}: NavigationProps) => {
  return (
    <nav className="px-4 sm:px-8 py-6 sm:py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="text-sm font-medium transition-colors duration-300 hover:opacity-80 flex-shrink-0"
              style={{ color: theme.text.secondary }}
            >
              ← Back
            </button>
          )}
          <Logo theme={theme} title={title} />
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4 md:gap-8 flex-shrink-0">
          {showDashboardLink && (
            <div className="flex items-center gap-2 sm:gap-6">
              <a href="/client/dashboard" className="hidden sm:inline text-sm font-medium transition-colors duration-300" style={{ color: theme.text.secondary }}>
                Previous Matches
              </a>
              <a href="/client/dashboard" className="sm:hidden text-xs font-medium transition-colors duration-300" style={{ color: theme.text.secondary }}>
                Dashboard
              </a>
              
              {showCredits && (
                <a 
                  href="/client/purchase" 
                  className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 rounded-full transition-all duration-300 whitespace-nowrap hover:scale-105 cursor-pointer block"
                  style={{ backgroundColor: theme.accent, color: '#000' }}
                >
                  <span className="hidden sm:inline font-normal">You have</span> <span className="font-bold">{credits} matches</span>
                </a>
              )}
            </div>
          )}
          
          {showSignOut && onSignOut && (
            <button 
              onClick={onSignOut}
              className="text-xs sm:text-sm font-medium transition-colors duration-300 hover:opacity-80 flex-shrink-0" 
              style={{ color: theme.text.secondary }}
            >
              Sign Out
            </button>
          )}
          
          {/* Theme Toggle - Separated */}
          <div className="border-l pl-2 sm:pl-4 md:pl-8 flex-shrink-0" style={{ borderColor: showDashboardLink || showSignOut ? theme.border : 'transparent' }}>
            <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          </div>
        </div>
      </div>
    </nav>
  )
}

export const Navigation = memo(NavigationComponent)
Navigation.displayName = 'Navigation'