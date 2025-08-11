import { logger } from '@/lib/core/logging-service'

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()
  private timers: Map<string, number> = new Map()
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }
  
  /**
   * Start timing an operation
   */
  startTimer(operation: string): void {
    this.timers.set(operation, Date.now())
  }
  
  /**
   * End timing and record the duration
   */
  endTimer(operation: string): number {
    const startTime = this.timers.get(operation)
    if (!startTime) {
      logger.warn(`No timer found for operation: ${operation}`)
      return 0
    }
    
    const duration = Date.now() - startTime
    this.track(operation, duration)
    this.timers.delete(operation)
    
    return duration
  }
  
  /**
   * Track a performance metric
   */
  track(event: string, duration: number): void {
    if (!this.metrics.has(event)) {
      this.metrics.set(event, [])
    }
    
    const values = this.metrics.get(event)!
    values.push(duration)
    
    // Keep only last 100 values to prevent memory bloat
    if (values.length > 100) {
      values.shift()
    }
    
    // Log warnings for performance degradation
    this.checkPerformance(event, duration)
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      logger.info(`[PERF] ${event}: ${duration}ms`)
    }
  }
  
  /**
   * Check if performance is degrading
   */
  private checkPerformance(event: string, duration: number): void {
    const thresholds: Record<string, number> = {
      'instant_match': 100,
      'refined_match': 750,
      'final_match': 3000,
      'embedding_calculation': 50,
      'cache_lookup': 10,
      'database_query': 100
    }
    
    const threshold = thresholds[event]
    if (threshold && duration > threshold) {
      logger.warn(`⚠️ Performance degradation detected: ${event} took ${duration}ms (threshold: ${threshold}ms)`)
      
      // Could send to monitoring service here
      this.reportToMonitoring(event, duration, threshold)
    }
  }
  
  /**
   * Get statistics for an event
   */
  getStats(event: string): {
    avg: number
    min: number
    max: number
    p50: number
    p95: number
    p99: number
    count: number
  } | null {
    const durations = this.metrics.get(event)
    if (!durations || durations.length === 0) return null
    
    const sorted = [...durations].sort((a, b) => a - b)
    
    return {
      avg: this.average(durations),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: this.percentile(sorted, 50),
      p95: this.percentile(sorted, 95),
      p99: this.percentile(sorted, 99),
      count: durations.length
    }
  }
  
  /**
   * Get all performance stats
   */
  getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {}
    
    for (const [event, _] of this.metrics) {
      stats[event] = this.getStats(event)
    }
    
    return stats
  }
  
  /**
   * Calculate average
   */
  private average(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length
  }
  
  /**
   * Calculate percentile
   */
  private percentile(sortedValues: number[], p: number): number {
    const index = Math.ceil((p / 100) * sortedValues.length) - 1
    return sortedValues[Math.max(0, index)]
  }
  
  /**
   * Report to external monitoring service
   */
  private async reportToMonitoring(event: string, duration: number, threshold: number): Promise<void> {
    // This would integrate with DataDog, New Relic, etc.
    if (process.env.MONITORING_ENDPOINT) {
      try {
        await fetch(process.env.MONITORING_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event,
            duration,
            threshold,
            exceeded: duration - threshold,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV
          })
        })
      } catch (error) {
        logger.error('Failed to report to monitoring:', error)
      }
    }
  }
  
  /**
   * Generate performance report
   */
  generateReport(): string {
    let report = '=== Performance Report ===\n\n'
    
    const stats = this.getAllStats()
    
    for (const [event, data] of Object.entries(stats)) {
      if (!data) continue
      
      report += `${event}:\n`
      report += `  Average: ${data.avg.toFixed(2)}ms\n`
      report += `  Min: ${data.min}ms | Max: ${data.max}ms\n`
      report += `  P50: ${data.p50}ms | P95: ${data.p95}ms | P99: ${data.p99}ms\n`
      report += `  Samples: ${data.count}\n\n`
    }
    
    return report
  }
  
  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear()
    this.timers.clear()
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()