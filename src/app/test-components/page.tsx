'use client'

import { Navigation } from '@/components/shared/Navigation'
import { Logo } from '@/components/shared/Logo'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { useTheme } from '@/lib/hooks/useTheme'
import { PRICING_PACKAGES, DESIGN_STYLES, PROJECT_TYPES, INDUSTRIES } from '@/lib/constants'

export default function TestComponentsPage() {
  const { theme, isDarkMode, toggleTheme } = useTheme()

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Test Navigation Component */}
      <div className="border-b-2 border-red-500 pb-4">
        <h2 className="text-center text-red-500 font-bold">NEW CENTRALIZED NAVIGATION</h2>
        <Navigation 
          theme={theme} 
          isDarkMode={isDarkMode} 
          toggleTheme={toggleTheme}
          showCredits={true}
          credits={5}
          showDashboardLink={true}
        />
      </div>

      {/* Original Navigation for Comparison */}
      <div className="border-b-2 border-blue-500 pb-4">
        <h2 className="text-center text-blue-500 font-bold">ORIGINAL NAVIGATION (for comparison)</h2>
        <nav className="px-8 py-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <a href="/" className="flex items-center gap-2 text-xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={theme.accent} stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"/>
                <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
                <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>
              </svg>
              OneDesigner
            </a>
            
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-6">
                <a href="/client/dashboard" className="text-sm font-medium transition-colors duration-300" style={{ color: theme.text.secondary }}>
                  Previous Matches
                </a>
                
                <div className="text-sm px-4 py-2 rounded-full transition-colors duration-300" style={{ backgroundColor: theme.accent, color: '#000' }}>
                  <span className="font-normal">You have</span> <span className="font-bold">5 matches</span>
                </div>
              </div>
              
              <div className="border-l pl-8" style={{ borderColor: theme.border }}>
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
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Test Individual Components */}
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        <div className="grid grid-cols-2 gap-8">
          {/* Logo Test */}
          <div className="rounded-xl p-6" style={{ backgroundColor: theme.cardBg }}>
            <h3 className="font-bold mb-4" style={{ color: theme.text.primary }}>Logo Component Test</h3>
            <Logo theme={theme} />
          </div>

          {/* Theme Toggle Test */}
          <div className="rounded-xl p-6" style={{ backgroundColor: theme.cardBg }}>
            <h3 className="font-bold mb-4" style={{ color: theme.text.primary }}>Theme Toggle Test</h3>
            <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          </div>
        </div>

        {/* Constants Test */}
        <div className="rounded-xl p-6" style={{ backgroundColor: theme.cardBg }}>
          <h3 className="font-bold mb-4" style={{ color: theme.text.primary }}>Constants Import Test</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2" style={{ color: theme.text.secondary }}>Pricing Packages</h4>
              <ul className="space-y-1">
                {PRICING_PACKAGES.map(pkg => (
                  <li key={pkg.id} className="text-sm" style={{ color: theme.text.muted }}>
                    {pkg.name} - ${pkg.price}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2" style={{ color: theme.text.secondary }}>Design Styles</h4>
              <ul className="space-y-1">
                {DESIGN_STYLES.map(style => (
                  <li key={style.id} className="text-sm" style={{ color: theme.text.muted }}>
                    {style.emoji} {style.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="rounded-xl p-6" style={{ backgroundColor: theme.cardBg }}>
          <h3 className="font-bold mb-4" style={{ color: theme.text.primary }}>✅ Component Verification Checklist</h3>
          <ul className="space-y-2 text-sm" style={{ color: theme.text.secondary }}>
            <li>□ Navigation looks identical to original</li>
            <li>□ Logo links to home page</li>
            <li>□ Theme toggle switches between light/dark</li>
            <li>□ Credits display correctly</li>
            <li>□ Dashboard link works</li>
            <li>□ All hover states work</li>
            <li>□ Responsive design maintained</li>
            <li>□ No console errors</li>
          </ul>
        </div>
      </div>
    </main>
  )
}