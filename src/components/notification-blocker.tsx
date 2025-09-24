'use client'

import { useEffect } from 'react'

export function NotificationBlocker() {
  useEffect(() => {
    // Block browser notifications
    if ('Notification' in window) {
      // Override the Notification constructor
      const originalNotification = window.Notification
      window.Notification = class extends originalNotification {
        constructor(...args: any[]) {
          // Block all notifications by not calling super()
          return {} as any
        }
        static requestPermission() {
          return Promise.resolve('denied')
        }
        static get permission() {
          return 'denied'
        }
      }
    }

    // Block push notification registration
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const originalRegister = navigator.serviceWorker.register
      navigator.serviceWorker.register = function(...args) {
        // Block service worker registration that might show notifications
        return Promise.reject(new Error('Service worker registration blocked'))
      }
    }

    // Block annoying overlay notifications by removing common notification classes
    const blockNotificationOverlays = () => {
      const notificationSelectors = [
        '[class*="notification"]',
        '[class*="toast"]',
        '[class*="alert"]',
        '[class*="popup"]',
        '[class*="modal"]',
        '[id*="notification"]',
        '[id*="toast"]',
        '[data-testid*="notification"]',
        '.swal2-container', // SweetAlert2
        '.toast-container', // Bootstrap toasts
        '.notification-container',
        '.overlay-notification',
        '[role="alert"]',
        '[role="status"]'
      ]

      notificationSelectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector)
          elements.forEach(element => {
            // Only remove if it's not part of our app
            if (!element.closest('[data-app="onedesigner"]')) {
              const htmlElement = element as HTMLElement
              // Check if it looks like an intrusive notification
              const text = htmlElement.textContent?.toLowerCase() || ''
              const isIntrusive =
                text.includes('hired') ||
                text.includes('competitor') ||
                text.includes('revenue') ||
                text.includes('portfolio') ||
                text.includes('analysis paralysis') ||
                text.includes('truth bomb') ||
                text.includes('canva') ||
                text.includes('diy design') ||
                htmlElement.style.position === 'fixed' ||
                htmlElement.style.position === 'absolute'

              if (isIntrusive) {
                htmlElement.style.display = 'none'
                htmlElement.remove()
              }
            }
          })
        } catch (e) {
          // Silently continue if selector fails
        }
      })
    }

    // Run immediately
    blockNotificationOverlays()

    // Run periodically to catch dynamically added notifications
    const interval = setInterval(blockNotificationOverlays, 1000)

    // Watch for DOM mutations to catch new notification elements
    const observer = new MutationObserver(() => {
      blockNotificationOverlays()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    })

    // Block common notification libraries
    const blockNotificationLibraries = () => {
      // Block Toastr
      if ((window as any).toastr) {
        (window as any).toastr = {
          success: () => {},
          error: () => {},
          warning: () => {},
          info: () => {}
        }
      }

      // Block SweetAlert
      if ((window as any).Swal) {
        (window as any).Swal = {
          fire: () => Promise.resolve(),
          show: () => {},
          close: () => {}
        }
      }

      // Block other common notification methods
      const notificationMethods = ['showNotification', 'notify', 'alert']
      notificationMethods.forEach(method => {
        if ((window as any)[method]) {
          (window as any)[method] = () => {}
        }
      })
    }

    blockNotificationLibraries()

    // CSS to hide common notification patterns
    const style = document.createElement('style')
    style.textContent = `
      /* Hide notification overlays */
      .notification-overlay,
      .toast-overlay,
      .alert-overlay,
      .popup-overlay,
      [class*="notification"][style*="position: fixed"],
      [class*="toast"][style*="position: fixed"],
      [class*="alert"][style*="position: fixed"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }

      /* Hide elements with notification-like content */
      [data-content*="competitor"],
      [data-content*="hired"],
      [data-content*="revenue"],
      [data-content*="portfolio browsing"],
      [data-content*="analysis paralysis"] {
        display: none !important;
      }

      /* Hide elements that look like promotional notifications */
      div[style*="position: fixed"][style*="top:"],
      div[style*="position: fixed"][style*="bottom:"] {
        display: none !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      clearInterval(interval)
      observer.disconnect()
      document.head.removeChild(style)
    }
  }, [])

  return null // This component doesn't render anything
}