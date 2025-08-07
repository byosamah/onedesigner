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
  onSignOut
}: NavigationProps) => {
  return (
    <nav className="px-8 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Logo theme={theme} title={title} />
        
        <div className="flex items-center gap-8">
          {showDashboardLink && (
            <div className="flex items-center gap-6">
              <a href="/client/dashboard" className="text-sm font-medium transition-colors duration-300" style={{ color: theme.text.secondary }}>
                Previous Matches
              </a>
              
              {showCredits && (
                <div className="text-sm px-4 py-2 rounded-full transition-colors duration-300" style={{ backgroundColor: theme.accent, color: '#000' }}>
                  <span className="font-normal">You have</span> <span className="font-bold">{credits} matches</span>
                </div>
              )}
            </div>
          )}
          
          {showSignOut && onSignOut && (
            <button 
              onClick={onSignOut}
              className="text-sm font-medium transition-colors duration-300 hover:opacity-80" 
              style={{ color: theme.text.secondary }}
            >
              Sign Out
            </button>
          )}
          
          {/* Theme Toggle - Separated */}
          <div className="border-l pl-8" style={{ borderColor: showDashboardLink || showSignOut ? theme.border : 'transparent' }}>
            <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          </div>
        </div>
      </div>
    </nav>
  )
}

export const Navigation = memo(NavigationComponent)
Navigation.displayName = 'Navigation'