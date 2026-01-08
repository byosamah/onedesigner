'use client'

import { useState, useEffect } from 'react'
import { getTheme } from '@/lib/design-system'
import { logger } from '@/lib/core/logging-service'

interface BriefData {
  project_type?: string
  timeline?: string
  budget?: string
  project_description?: string
  target_audience?: string
  project_goal?: string
  industry?: string
  styles?: string[]
  style_keywords?: string[]
  competitors?: string
  inspiration?: string
  deliverables?: string
  brand_guidelines?: string
  existing_assets?: string
  specific_requirements?: string
  category_specific_fields?: any
  company_name?: string
  match_score?: number
  match_reasons?: string[]
}

interface BriefViewerModalProps {
  isOpen: boolean
  onClose: () => void
  requestId: string
  isDarkMode: boolean
  onAccept?: () => void
  onReject?: () => void
  isLoading?: boolean
}

export function BriefViewerModal({
  isOpen,
  onClose,
  requestId,
  isDarkMode,
  onAccept,
  onReject,
  isLoading = false
}: BriefViewerModalProps) {
  const theme = getTheme(isDarkMode)
  const [briefData, setBriefData] = useState<BriefData | null>(null)
  const [loading, setLoading] = useState(true)
  const [hoursRemaining, setHoursRemaining] = useState<number>(72)
  const [requestStatus, setRequestStatus] = useState<string>('pending')

  useEffect(() => {
    if (isOpen && requestId) {
      fetchBriefDetails()
    }
  }, [isOpen, requestId])

  const fetchBriefDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/designer/project-requests/${requestId}/view`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch brief details')
      }

      const data = await response.json()
      
      // Extract brief data from the correct location in the response
      // API returns data in data.brief, but we need to handle all possible sources
      const briefData = data.brief || data.request?.brief_snapshot || data.match?.briefs || {}
      
      // Debug logging to understand the data flow
      console.log('🔍 BriefViewerModal API Response:', {
        briefExists: !!briefData,
        briefKeys: briefData ? Object.keys(briefData).length : 0,
        requestStatus: data.request?.status,
        hoursRemaining: data.request?.hours_remaining,
        fullResponseStructure: Object.keys(data)
      })
      
      // Set the extracted brief data and ensure status is properly set
      setBriefData(briefData && Object.keys(briefData).length > 0 ? briefData : null)
      setHoursRemaining(data.request?.hours_remaining || 0)
      setRequestStatus(data.request?.status || 'pending')
      
      // Debug the state after setting
      console.log('🎯 Modal State After API:', {
        briefDataSet: !!briefData && Object.keys(briefData).length > 0,
        statusSet: data.request?.status || 'pending',
        extractedBriefKeys: briefData ? Object.keys(briefData) : []
      })
    } catch (error) {
      logger.error('Error fetching brief details:', error)
      // Set fallback state on error
      setBriefData(null)
      setRequestStatus('error')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const getDeadlineColor = () => {
    if (hoursRemaining <= 12) return theme.error
    if (hoursRemaining <= 24) return '#f59e0b'
    return theme.success
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className="relative w-full max-w-3xl rounded-3xl animate-slideUp"
            style={{ 
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              boxShadow: isDarkMode ? 'none' : '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div 
              className="sticky top-0 z-10 px-6 py-4 border-b rounded-t-3xl"
              style={{ 
                backgroundColor: theme.cardBg,
                borderColor: theme.border 
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: theme.text.primary }}>
                    Project Brief Details
                  </h2>
                  {requestStatus === 'pending' && hoursRemaining > 0 && (
                    <p className="text-sm mt-1" style={{ color: getDeadlineColor() }}>
                      ⏱️ {hoursRemaining} hours remaining to respond
                    </p>
                  )}
                  {requestStatus === 'approved' && (
                    <p className="text-sm mt-1" style={{ color: theme.success }}>
                      ✅ You've accepted this project
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{ backgroundColor: theme.nestedBg, color: theme.text.primary }}
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin text-3xl mb-4" style={{ color: theme.accent }}>⚡</div>
                  <p style={{ color: theme.text.secondary }}>Loading brief details...</p>
                </div>
              ) : (() => {
                console.log('🔍 Brief display check:', {
                  loading,
                  briefDataExists: !!briefData,
                  briefDataType: typeof briefData,
                  briefDataKeys: briefData ? Object.keys(briefData).length : 0,
                  shouldShowContent: !!briefData
                })
                return !!briefData
              })() ? (
                <div className="space-y-6">
                  {/* Match Score Badge */}
                  {briefData.match_score && (
                    <div 
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold"
                      style={{ 
                        backgroundColor: theme.accent + '20',
                        color: theme.accent
                      }}
                    >
                      <span>🎯</span>
                      <span>{briefData.match_score}% Match Score</span>
                    </div>
                  )}

                  {/* Basic Information */}
                  <div>
                    <h3 className="font-semibold mb-3" style={{ color: theme.text.primary }}>
                      📋 Project Overview
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoCard label="Project Type" value={briefData.project_type} theme={theme} />
                      <InfoCard label="Timeline" value={briefData.timeline} theme={theme} />
                      <InfoCard label="Budget" value={briefData.budget} theme={theme} />
                      <InfoCard label="Industry" value={briefData.industry} theme={theme} />
                      {briefData.timezone && (
                        <InfoCard label="Client Timezone" value={briefData.timezone} theme={theme} />
                      )}
                    </div>
                  </div>

                  {/* Project Description */}
                  {briefData.project_description && (
                    <div>
                      <h3 className="font-semibold mb-3" style={{ color: theme.text.primary }}>
                        📝 Project Description
                      </h3>
                      <div 
                        className="p-4 rounded-xl"
                        style={{ 
                          backgroundColor: theme.nestedBg,
                          border: `1px solid ${theme.border}`
                        }}
                      >
                        <p className="whitespace-pre-wrap" style={{ color: theme.text.secondary }}>
                          {briefData.project_description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Target & Goals */}
                  {(briefData.target_audience || briefData.project_goal || briefData.brand_personality || briefData.tone_voice) && (
                    <div>
                      <h3 className="font-semibold mb-3" style={{ color: theme.text.primary }}>
                        🎯 Target & Goals
                      </h3>
                      <div className="space-y-3">
                        {briefData.target_audience && (
                          <InfoCard label="Target Audience" value={briefData.target_audience} theme={theme} />
                        )}
                        {briefData.project_goal && (
                          <InfoCard label="Project Goal" value={briefData.project_goal} theme={theme} />
                        )}
                        {briefData.brand_personality && (
                          <InfoCard label="Brand Personality" value={briefData.brand_personality} theme={theme} />
                        )}
                        {briefData.tone_voice && (
                          <InfoCard label="Tone of Voice" value={briefData.tone_voice} theme={theme} />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Design Preferences */}
                  {(briefData.styles?.length || briefData.style_keywords?.length || briefData.color_preferences || briefData.typography_preferences) && (
                    <div>
                      <h3 className="font-semibold mb-3" style={{ color: theme.text.primary }}>
                        🎨 Design Preferences
                      </h3>
                      <div className="space-y-3">
                        {briefData.styles?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                              Preferred Styles:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {briefData.styles.map((style, index) => (
                                <span 
                                  key={index}
                                  className="px-3 py-1 rounded-full text-sm"
                                  style={{ 
                                    backgroundColor: theme.accent + '20',
                                    color: theme.accent
                                  }}
                                >
                                  {style}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {briefData.style_keywords?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2" style={{ color: theme.text.secondary }}>
                              Style Keywords:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {briefData.style_keywords.map((keyword, index) => (
                                <span 
                                  key={index}
                                  className="px-3 py-1 rounded-full text-sm"
                                  style={{ 
                                    backgroundColor: theme.nestedBg,
                                    border: `1px solid ${theme.border}`,
                                    color: theme.text.secondary
                                  }}
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {briefData.color_preferences && (
                          <InfoCard label="Color Preferences" value={briefData.color_preferences} theme={theme} />
                        )}
                        {briefData.typography_preferences && (
                          <InfoCard label="Typography Preferences" value={briefData.typography_preferences} theme={theme} />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Additional Details */}
                  {(briefData.deliverables || briefData.specific_requirements || briefData.brand_guidelines || briefData.existing_assets || briefData.competitors || briefData.inspiration || briefData.company_name || briefData.website_url) && (
                    <div>
                      <h3 className="font-semibold mb-3" style={{ color: theme.text.primary }}>
                        📦 Additional Details
                      </h3>
                      <div className="space-y-3">
                        {briefData.company_name && (
                          <InfoCard label="Company Name" value={briefData.company_name} theme={theme} />
                        )}
                        {briefData.website_url && (
                          <InfoCard label="Website URL" value={briefData.website_url} theme={theme} />
                        )}
                        {briefData.deliverables && (
                          <InfoCard label="Deliverables" value={briefData.deliverables} theme={theme} />
                        )}
                        {briefData.specific_requirements && (
                          <InfoCard label="Specific Requirements" value={briefData.specific_requirements} theme={theme} />
                        )}
                        {briefData.brand_guidelines && (
                          <InfoCard label="Brand Guidelines" value={briefData.brand_guidelines} theme={theme} />
                        )}
                        {briefData.existing_assets && (
                          <InfoCard label="Existing Assets" value={briefData.existing_assets} theme={theme} />
                        )}
                        {briefData.competitors && (
                          <InfoCard label="Competitors/References" value={briefData.competitors} theme={theme} />
                        )}
                        {briefData.inspiration && (
                          <InfoCard label="Inspiration" value={briefData.inspiration} theme={theme} />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Communication Preferences */}
                  {briefData.communication?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3" style={{ color: theme.text.primary }}>
                        💬 Communication Preferences
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {briefData.communication.map((method, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 rounded-full text-sm font-medium"
                            style={{ 
                              backgroundColor: theme.accent + '20',
                              color: theme.accent
                            }}
                          >
                            {method.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technical Requirements */}
                  {(briefData.technical_requirements || briefData.platform_requirements || briefData.devices_supported || briefData.accessibility_requirements) && (
                    <div>
                      <h3 className="font-semibold mb-3" style={{ color: theme.text.primary }}>
                        ⚙️ Technical Requirements
                      </h3>
                      <div className="space-y-3">
                        {briefData.technical_requirements && (
                          <InfoCard label="Technical Requirements" value={briefData.technical_requirements} theme={theme} />
                        )}
                        {briefData.platform_requirements && (
                          <InfoCard label="Platform Requirements" value={briefData.platform_requirements} theme={theme} />
                        )}
                        {briefData.devices_supported && (
                          <InfoCard label="Devices Supported" value={briefData.devices_supported} theme={theme} />
                        )}
                        {briefData.accessibility_requirements && (
                          <InfoCard label="Accessibility Requirements" value={briefData.accessibility_requirements} theme={theme} />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Category-Specific Fields */}
                  {briefData.category_specific_fields && Object.keys(briefData.category_specific_fields).length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3" style={{ color: theme.text.primary }}>
                        🎯 Project-Specific Details
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(briefData.category_specific_fields).map(([key, value], index) => {
                          if (!value) return null
                          const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                          return (
                            <InfoCard key={index} label={label} value={String(value)} theme={theme} />
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* All Available Data - Debug Section */}
                  {process.env.NODE_ENV === 'development' && briefData && (
                    <div>
                      <h3 className="font-semibold mb-3" style={{ color: theme.text.primary }}>
                        🔍 All Available Data (Debug)
                      </h3>
                      <div 
                        className="p-3 rounded-xl text-xs"
                        style={{ 
                          backgroundColor: theme.nestedBg,
                          border: `1px solid ${theme.border}`,
                          color: theme.text.secondary
                        }}
                      >
                        <p className="mb-2 font-semibold">Available fields in briefData:</p>
                        <div className="space-y-1">
                          {Object.entries(briefData).map(([key, value]) => (
                            <div key={key} className="flex">
                              <span className="font-mono mr-2">{key}:</span>
                              <span>{value ? (Array.isArray(value) ? `[${value.length} items]` : typeof value === 'object' ? '[object]' : String(value).substring(0, 50)) : 'null'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Match Reasons */}
                  {briefData.match_reasons?.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3" style={{ color: theme.text.primary }}>
                        ✨ Why You're a Great Match
                      </h3>
                      <ul className="space-y-2">
                        {briefData.match_reasons.map((reason, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-sm mt-0.5" style={{ color: theme.accent }}>•</span>
                            <span className="text-sm" style={{ color: theme.text.secondary }}>
                              {reason}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p style={{ color: theme.text.secondary }}>No brief details available</p>
                </div>
              )}
            </div>
            
            {/* Footer Actions */}
            {(() => {
              console.log('🎯 Button visibility check:', {
                requestStatus,
                isPending: requestStatus === 'pending',
                isApproved: requestStatus === 'approved',
                loading,
                shouldShowButtons: requestStatus === 'pending' && !loading
              })
              // Only show action buttons if the request is still pending
              return requestStatus === 'pending' && !loading
            })() && (
              <div 
                className="sticky bottom-0 px-6 py-4 border-t rounded-b-3xl flex gap-3"
                style={{ 
                  backgroundColor: theme.cardBg,
                  borderColor: theme.border 
                }}
              >
                <button
                  onClick={onReject}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                  style={{
                    backgroundColor: 'transparent',
                    border: `1px solid ${theme.border}`,
                    color: theme.text.primary
                  }}
                >
                  Not Available
                </button>
                <button
                  onClick={onAccept}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                  style={{
                    backgroundColor: theme.accent,
                    color: '#000'
                  }}
                >
                  {isLoading ? 'Processing...' : 'Accept Project'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

// Helper component for info cards
function InfoCard({ label, value, theme }: { label: string; value?: string; theme: any }) {
  if (!value) return null
  
  return (
    <div 
      className="p-3 rounded-xl"
      style={{ 
        backgroundColor: theme.nestedBg,
        border: `1px solid ${theme.border}`
      }}
    >
      <p className="text-xs font-medium mb-1" style={{ color: theme.text.muted }}>
        {label}
      </p>
      <p className="text-sm" style={{ color: theme.text.primary }}>
        {value}
      </p>
    </div>
  )
}