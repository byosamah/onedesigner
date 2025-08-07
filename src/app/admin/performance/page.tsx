'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/shared'
import { getTheme } from '@/lib/design-system'
import { performanceMonitor } from '@/lib/monitoring/performance'

interface PerformanceStats {
  [event: string]: {
    avg: number
    min: number
    max: number
    p50: number
    p95: number
    p99: number
    count: number
  }
}

export default function PerformanceDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<PerformanceStats>({})
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const theme = getTheme(isDarkMode)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  useEffect(() => {
    checkAuth()
    loadStats()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth/session', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/admin')
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/admin/auth/signout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Signout error:', error)
    }
    
    sessionStorage.removeItem('adminEmail')
    router.push('/admin')
  }

  const loadStats = () => {
    const currentStats = performanceMonitor.getAllStats()
    setStats(currentStats)
  }

  const refresh = () => {
    setIsRefreshing(true)
    loadStats()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const getStatusColor = (event: string, value: number): string => {
    const thresholds: Record<string, { good: number; warning: number }> = {
      instant_match: { good: 50, warning: 100 },
      refined_match: { good: 500, warning: 750 },
      final_match: { good: 2000, warning: 3000 },
      embedding_calculation: { good: 30, warning: 50 },
      cache_lookup: { good: 5, warning: 10 },
      database_query: { good: 50, warning: 100 }
    }

    const threshold = thresholds[event]
    if (!threshold) return theme.text.muted

    if (value <= threshold.good) return theme.success
    if (value <= threshold.warning) return '#f59e0b'
    return theme.error
  }

  return (
    <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      {/* Using centralized Navigation */}
      <div style={{ borderBottom: `1px solid ${theme.border}` }}>
        <Navigation 
          theme={theme}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          title="OneDesigner Admin"
          showSignOut={true}
          onSignOut={handleSignOut}
        />
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="rounded-3xl p-8 mb-8 transition-all duration-300" style={{ 
          backgroundColor: theme.cardBg,
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold transition-colors duration-300" style={{ color: theme.text.primary }}>
              Performance Monitor
            </h1>
            <button
              onClick={refresh}
              disabled={isRefreshing}
              className="px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
              style={{ backgroundColor: theme.accent, color: '#000' }}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {Object.keys(stats).length === 0 ? (
            <p className="text-center py-8 transition-colors duration-300" style={{ color: theme.text.muted }}>No performance data available yet</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(stats).map(([event, data]) => (
                <div key={event} className="pb-6 last:border-0" style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <h3 className="font-semibold text-lg mb-3 capitalize transition-colors duration-300" style={{ color: theme.text.primary }}>
                    {event.replace(/_/g, ' ')}
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <MetricCard
                      label="Average"
                      value={`${data.avg.toFixed(1)}ms`}
                      color={getStatusColor(event, data.avg)}
                      theme={theme}
                    />
                    <MetricCard
                      label="Min"
                      value={`${data.min}ms`}
                      color={theme.text.muted}
                      theme={theme}
                    />
                    <MetricCard
                      label="Max"
                      value={`${data.max}ms`}
                      color={theme.text.muted}
                      theme={theme}
                    />
                    <MetricCard
                      label="P50"
                      value={`${data.p50}ms`}
                      color={getStatusColor(event, data.p50)}
                      theme={theme}
                    />
                    <MetricCard
                      label="P95"
                      value={`${data.p95}ms`}
                      color={getStatusColor(event, data.p95)}
                      theme={theme}
                    />
                    <MetricCard
                      label="P99"
                      value={`${data.p99}ms`}
                      color={getStatusColor(event, data.p99)}
                      theme={theme}
                    />
                    <MetricCard
                      label="Samples"
                      value={data.count.toString()}
                      color={theme.text.muted}
                      theme={theme}
                    />
                  </div>

                  {/* Performance Bar */}
                  <div className="mt-3">
                    <PerformanceBar event={event} data={data} theme={theme} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance Targets */}
        <div className="rounded-3xl p-6 transition-all duration-300" style={{ 
          backgroundColor: theme.cardBg,
          border: `1px solid ${theme.border}`,
          boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 className="text-xl font-semibold mb-4 transition-colors duration-300" style={{ color: theme.text.primary }}>Performance Targets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TargetCard
              title="Instant Match"
              target="< 50ms"
              acceptable="< 100ms"
              critical="> 200ms"
              theme={theme}
            />
            <TargetCard
              title="Refined Match"
              target="< 500ms"
              acceptable="< 750ms"
              critical="> 1s"
              theme={theme}
            />
            <TargetCard
              title="Final Match"
              target="< 2s"
              acceptable="< 3s"
              critical="> 5s"
              theme={theme}
            />
            <TargetCard
              title="Cache Hit Rate"
              target="> 60%"
              acceptable="> 40%"
              critical="< 20%"
              theme={theme}
            />
            <TargetCard
              title="AI Success Rate"
              target="> 95%"
              acceptable="> 90%"
              critical="< 80%"
              theme={theme}
            />
            <TargetCard
              title="Embedding Calc"
              target="< 30ms"
              acceptable="< 50ms"
              critical="> 100ms"
              theme={theme}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

function MetricCard({ label, value, color, theme }: { label: string; value: string; color: string; theme: any }) {
  return (
    <div className="text-center">
      <p className="text-sm transition-colors duration-300" style={{ color: theme.text.muted }}>{label}</p>
      <p className="text-lg font-semibold transition-colors duration-300" style={{ color }}>{value}</p>
    </div>
  )
}

function PerformanceBar({ event, data, theme }: { event: string; data: any; theme: any }) {
  const maxValue = Math.max(data.p99, getThreshold(event, 'critical'))
  const goodThreshold = getThreshold(event, 'good')
  const warningThreshold = getThreshold(event, 'warning')

  return (
    <div className="relative h-6 rounded-full overflow-hidden" style={{ backgroundColor: theme.nestedBg }}>
      {/* Good zone */}
      <div
        className="absolute h-full bg-green-100"
        style={{ width: `${(goodThreshold / maxValue) * 100}%` }}
      />
      
      {/* Warning zone */}
      <div
        className="absolute h-full bg-yellow-100"
        style={{ 
          left: `${(goodThreshold / maxValue) * 100}%`,
          width: `${((warningThreshold - goodThreshold) / maxValue) * 100}%`
        }}
      />
      
      {/* Critical zone */}
      <div
        className="absolute h-full bg-red-100"
        style={{ 
          left: `${(warningThreshold / maxValue) * 100}%`,
          width: `${((maxValue - warningThreshold) / maxValue) * 100}%`
        }}
      />
      
      {/* Current value markers */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-blue-600"
        style={{ left: `${(data.p50 / maxValue) * 100}%` }}
        title={`P50: ${data.p50}ms`}
      />
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-purple-600"
        style={{ left: `${(data.p95 / maxValue) * 100}%` }}
        title={`P95: ${data.p95}ms`}
      />
    </div>
  )
}

function TargetCard({ title, target, acceptable, critical, theme }: {
  title: string
  target: string
  acceptable: string
  critical: string
  theme: any
}) {
  return (
    <div className="rounded-xl p-4 transition-all duration-300" style={{ 
      backgroundColor: theme.nestedBg,
      border: `1px solid ${theme.border}`
    }}>
      <h3 className="font-medium mb-2 transition-colors duration-300" style={{ color: theme.text.primary }}>{title}</h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span style={{ color: theme.text.muted }}>Target:</span>
          <span className="font-medium" style={{ color: theme.success }}>{target}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: theme.text.muted }}>Acceptable:</span>
          <span className="font-medium" style={{ color: '#f59e0b' }}>{acceptable}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: theme.text.muted }}>Critical:</span>
          <span className="font-medium" style={{ color: theme.error }}>{critical}</span>
        </div>
      </div>
    </div>
  )
}

function getThreshold(event: string, level: 'good' | 'warning' | 'critical'): number {
  const thresholds: Record<string, Record<string, number>> = {
    instant_match: { good: 50, warning: 100, critical: 200 },
    refined_match: { good: 500, warning: 750, critical: 1000 },
    final_match: { good: 2000, warning: 3000, critical: 5000 },
    embedding_calculation: { good: 30, warning: 50, critical: 100 },
    cache_lookup: { good: 5, warning: 10, critical: 20 },
    database_query: { good: 50, warning: 100, critical: 200 }
  }

  return thresholds[event]?.[level] || 100
}