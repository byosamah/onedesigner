'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getTheme } from '@/lib/design-system'

interface Conversation {
  id: string
  match_id: string
  status: string
  last_message_at: string
  last_message_preview: string
  unread_count: number
  designer: {
    id: string
    first_name: string
    last_name: string
    title: string
    avatar_url?: string
  }
  match_score: number
}

export default function ConversationsListPage() {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const theme = getTheme(isDarkMode)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/client/conversations')
      const data = await response.json()
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/client/login')
          return
        }
        throw new Error(data.error || 'Failed to load conversations')
      }
      
      setConversations(data.data || [])
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (days > 7) {
      return date.toLocaleDateString()
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else {
      return 'Just now'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.bg }}>
        {/* Simple Navigation */}
        <nav className="px-8 py-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold" style={{ color: theme.text.primary }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={theme.accent} stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1"/>
                  <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
                  <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>
                </svg>
                OneDesigner
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/client/dashboard" className="font-medium py-2 px-4 rounded-xl" style={{ color: theme.text.secondary }}>
                Dashboard
              </Link>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none hover:shadow-md"
                style={{ backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }}
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
        </nav>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⚡</div>
            <p style={{ color: theme.text.secondary }}>Loading conversations...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bg }}>
      {/* Simple Navigation */}
      <nav className="px-8 py-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold" style={{ color: theme.text.primary }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={theme.accent} stroke={theme.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"/>
                <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z"/>
                <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5Z"/>
              </svg>
              OneDesigner
            </Link>
            <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: theme.tagBg, color: theme.text.secondary }}>
              Conversations
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/client/dashboard" className="font-medium py-2 px-4 rounded-xl" style={{ color: theme.text.secondary }}>
              Dashboard
            </Link>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none hover:shadow-md"
              style={{ backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }}
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
      </nav>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: theme.text.primary }}>
            Conversations
          </h1>
          <p style={{ color: theme.text.secondary }}>
            Manage your communications with designers
          </p>
        </div>

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <div 
            className="text-center py-16 rounded-3xl"
            style={{
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`
            }}
          >
            <div className="text-5xl mb-6">💬</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: theme.text.primary }}>
              No conversations yet
            </h3>
            <p className="mb-6" style={{ color: theme.text.secondary }}>
              Start a conversation by messaging a designer from your matches
            </p>
            <Link
              href="/client/dashboard"
              className="inline-block px-6 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: theme.accent,
                color: '#000'
              }}
            >
              View Matches →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/client/conversations/${conversation.id}`}
                className="block"
              >
                <div 
                  className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01] cursor-pointer"
                  style={{
                    backgroundColor: theme.cardBg,
                    border: `1px solid ${theme.border}`,
                    boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    {conversation.designer.avatar_url ? (
                      <img 
                        src={conversation.designer.avatar_url}
                        alt={conversation.designer.first_name}
                        className="w-14 h-14 rounded-full flex-shrink-0"
                      />
                    ) : (
                      <div 
                        className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                        style={{ backgroundColor: theme.accent, color: '#000' }}
                      >
                        {conversation.designer.first_name[0]}
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg" style={{ color: theme.text.primary }}>
                            {conversation.designer.first_name} {conversation.designer.last_name}
                          </h3>
                          <p className="text-sm" style={{ color: theme.text.secondary }}>
                            {conversation.designer.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {conversation.unread_count > 0 && (
                            <span 
                              className="px-2 py-1 rounded-full text-xs font-bold"
                              style={{ backgroundColor: theme.accent, color: '#000' }}
                            >
                              {conversation.unread_count}
                            </span>
                          )}
                          <span className="text-xs" style={{ color: theme.text.muted }}>
                            {conversation.last_message_at ? formatTime(conversation.last_message_at) : 'New'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Last Message Preview */}
                      {conversation.last_message_preview && (
                        <p 
                          className="text-sm truncate"
                          style={{ color: theme.text.secondary }}
                        >
                          {conversation.last_message_preview}
                        </p>
                      )}
                      
                      {/* Status Badge */}
                      <div className="flex items-center gap-3 mt-2">
                        <span 
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ 
                            backgroundColor: conversation.status === 'active' ? theme.success + '20' : theme.accent + '20',
                            color: conversation.status === 'active' ? theme.success : theme.accent
                          }}
                        >
                          {conversation.status === 'pending' ? 'Awaiting Response' : 'Active'}
                        </span>
                        {conversation.match_score && (
                          <span className="text-xs" style={{ color: theme.text.muted }}>
                            {conversation.match_score}% match
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}