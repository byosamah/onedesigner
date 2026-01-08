'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'

interface PoopUpProps {
  theme: any
  isDarkMode: boolean
}

// Harsh reality notifications for OneDesigner context
const harshNotifications = [
  {
    icon: '🎨',
    title: 'Canva Pro',
    message: 'Daily Average: 5h 36min',
    subtext: 'Your competitors hired real designers',
    delay: 500,  // Start almost immediately
    duration: 8000  // Stay longer
  },
  {
    icon: '💸',
    title: 'Lost Revenue',
    message: '6 months of DIY design',
    subtext: 'Still think you\'re saving money?',
    delay: 2500,
    duration: 8000
  },
  {
    icon: '🤦',
    title: 'Portfolio Browsing',
    message: '0 designers contacted',
    subtext: 'Analysis paralysis much?',
    delay: 4500,
    duration: 8000
  },
  {
    icon: '📉',
    title: 'Your Brand',
    message: 'Looks like everyone else\'s',
    subtext: 'Template life = forgotten brand',
    delay: 6500,
    duration: 8000
  },
  {
    icon: '⏰',
    title: 'Time Wasted',
    message: '147 hours on design this year',
    subtext: 'Could\'ve grown your business instead',
    delay: 8500,
    duration: 8000
  },
  {
    icon: '🚫',
    title: 'Bounce Rate: 68%',
    message: 'Visitors hate your design',
    subtext: 'First impressions matter',
    delay: 10500,
    duration: 8000
  }
]

interface Notification {
  id: string
  icon: string
  title: string
  message: string
  subtext: string
  timestamp: string
  isExiting?: boolean
}

export default function PoopUp({ theme, isDarkMode }: PoopUpProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if user has dismissed notifications
    const isDismissed = sessionStorage.getItem('poopup_dismissed')
    if (isDismissed) {
      setDismissed(true)
      return
    }

    // Schedule notifications
    const timeouts: NodeJS.Timeout[] = []
    
    harshNotifications.forEach((notif, index) => {
      const timeout = setTimeout(() => {
        const newNotification: Notification = {
          id: Date.now().toString() + index,
          icon: notif.icon,
          title: notif.title,
          message: notif.message,
          subtext: notif.subtext,
          timestamp: 'now'
        }
        
        setNotifications(prev => [...prev, newNotification])
      }, notif.delay)
      
      timeouts.push(timeout)
    })
    
    // After the last notification appears, wait 2 seconds then clear all
    const lastNotificationDelay = Math.max(...harshNotifications.map(n => n.delay))
    const clearAllTimeout = setTimeout(() => {
      // Wait 2 seconds after the last notification, then start exit animation
      setTimeout(() => {
        // Mark all notifications as exiting
        setNotifications(prev => prev.map(n => ({ ...n, isExiting: true })))
        
        // After animation completes, clear everything
        setTimeout(() => {
          setNotifications([])
          setDismissed(true)
          sessionStorage.setItem('poopup_dismissed', 'true')
        }, 400) // Match animation duration
      }, 2000)
    }, lastNotificationDelay)
    
    timeouts.push(clearAllTimeout)

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [dismissed])

  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleDismissAll = () => {
    setNotifications([])
    setDismissed(true)
    sessionStorage.setItem('poopup_dismissed', 'true')
  }

  if (dismissed || notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-80">
      {notifications.map((notif, index) => (
        <div
          key={notif.id}
          className={`rounded-xl p-4 shadow-2xl backdrop-blur-sm border transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
            notif.isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
          }`}
          style={{ 
            backgroundColor: isDarkMode ? 'rgba(50, 50, 50, 1)' : 'rgba(255, 255, 255, 1)',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
            animationDelay: notif.isExiting ? `${index * 30}ms` : `${index * 50}ms`
          }}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="text-2xl flex-shrink-0 mt-1">
              {notif.icon}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span 
                  className="font-bold text-sm"
                  style={{ color: theme.text.primary }}
                >
                  {notif.title}
                </span>
                <span 
                  className="text-xs"
                  style={{ color: theme.text.muted }}
                >
                  {notif.timestamp}
                </span>
              </div>
              
              <p 
                className="text-sm font-medium mb-1"
                style={{ color: theme.text.primary }}
              >
                {notif.message}
              </p>
              
              <p 
                className="text-xs"
                style={{ color: theme.text.secondary }}
              >
                {notif.subtext}
              </p>
            </div>
            
            {/* Close button */}
            <button
              onClick={() => handleDismiss(notif.id)}
              className="flex-shrink-0 p-1 rounded-lg hover:opacity-70 transition-opacity"
              style={{ color: theme.text.muted }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      
      {/* Dismiss all button - appears after 2nd notification */}
      {notifications.length >= 2 && (
        <button
          onClick={handleDismissAll}
          className="w-full text-center text-sm font-semibold py-3 rounded-lg hover:opacity-90 transition-all hover:scale-[1.02] shadow-lg animate-slide-in-right"
          style={{ 
            backgroundColor: theme.accent,
            color: '#000',
            animationDelay: '100ms'
          }}
        >
          OK, I get it! Stop the truth bombs 💣
        </button>
      )}
    </div>
  )
}