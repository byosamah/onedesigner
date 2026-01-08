import { logger } from '@/lib/core/logging-service'

// Simple toast notifications
// In production, you might want to use react-hot-toast or sonner

type ToastType = 'success' | 'error' | 'info'

class Toast {
  private showToast(message: string, type: ToastType) {
    // For now, we'll use browser alerts
    // In production, replace with a proper toast library
    if (typeof window !== 'undefined') {
      // Simple notification for now
      logger.info(`[${type.toUpperCase()}] ${message}`)
      
      // You can also use the browser's Notification API if you want
      if (type === 'error') {
        logger.error(message)
      }
    }
  }

  success(message: string) {
    this.showToast(message, 'success')
  }

  error(message: string) {
    this.showToast(message, 'error')
  }

  info(message: string) {
    this.showToast(message, 'info')
  }
}

export const toast = new Toast()