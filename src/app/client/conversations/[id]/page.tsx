'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getTheme } from '@/lib/design-system'
import Link from 'next/link'
import { logger } from '@/lib/core/logging-service'

interface Message {
  id: string
  content: string
  sender_type: 'client' | 'designer'
  created_at: string
  is_read: boolean
}

interface Conversation {
  id: string
  status: string
  designer: {
    first_name: string
    last_name: string
    title: string
    avatar_url?: string
  }
  messages: Message[]
}

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const theme = getTheme(isDarkMode)

  useEffect(() => {
    fetchConversation()
  }, [params.id])

  const fetchConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${params.id}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load conversation')
      }
      
      setConversation(data.data)
    } catch (error) {
      logger.error('Error loading conversation:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const response = await fetch(`/api/conversations/${params.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      // Add new message to the list
      if (conversation) {
        setConversation({
          ...conversation,
          messages: [...conversation.messages, data.data]
        })
      }
      
      setNewMessage('')
    } catch (error) {
      logger.error('Error sending message:', error)
    } finally {
      setSending(false)
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
            <Link href="/client/dashboard" className="font-medium py-2 px-4 rounded-xl" style={{ color: theme.text.secondary }}>
              ← Back to Dashboard
            </Link>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-4">⚡</div>
            <p style={{ color: theme.text.secondary }}>Loading conversation...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!conversation) {
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
            <Link href="/client/dashboard" className="font-medium py-2 px-4 rounded-xl" style={{ color: theme.text.secondary }}>
              ← Back to Dashboard
            </Link>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p style={{ color: theme.text.secondary }}>Conversation not found</p>
            <button
              onClick={() => router.push('/client/dashboard')}
              className="mt-4 px-6 py-2 rounded-xl font-semibold"
              style={{ backgroundColor: theme.accent, color: '#000' }}
            >
              Back to Dashboard
            </button>
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
              Conversation
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/client/conversations" className="font-medium py-2 px-4 rounded-xl" style={{ color: theme.text.secondary }}>
              All Conversations
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
        {/* Header */}
        <div 
          className="rounded-2xl p-6 mb-6"
          style={{ backgroundColor: theme.cardBg }}
        >
          <div className="flex items-center gap-4">
            {conversation.designer.avatar_url ? (
              <img 
                src={conversation.designer.avatar_url}
                alt={conversation.designer.first_name}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                style={{ backgroundColor: theme.accent, color: '#000' }}
              >
                {conversation.designer.first_name[0]}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                {conversation.designer.first_name} {conversation.designer.last_name}
              </h2>
              <p style={{ color: theme.text.secondary }}>{conversation.designer.title}</p>
            </div>
            <div className="ml-auto">
              <span 
                className="px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: conversation.status === 'active' ? theme.success + '20' : theme.accent + '20',
                  color: conversation.status === 'active' ? theme.success : theme.accent
                }}
              >
                {conversation.status === 'pending' ? 'Awaiting Response' : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div 
          className="rounded-2xl p-6 mb-6"
          style={{ backgroundColor: theme.cardBg }}
        >
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {conversation.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[70%] p-4 rounded-2xl"
                  style={{
                    backgroundColor: message.sender_type === 'client' ? theme.accent : theme.nestedBg,
                    color: message.sender_type === 'client' ? '#000' : theme.text.primary
                  }}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p 
                    className="text-xs mt-2 opacity-70"
                    style={{ color: message.sender_type === 'client' ? '#000' : theme.text.muted }}
                  >
                    {new Date(message.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div 
          className="rounded-2xl p-6"
          style={{ backgroundColor: theme.cardBg }}
        >
          <div className="flex gap-4">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Type your message..."
              className="flex-1 p-4 rounded-xl resize-none"
              style={{
                backgroundColor: theme.nestedBg,
                color: theme.text.primary,
                border: `1px solid ${theme.border}`,
                outline: 'none'
              }}
              rows={3}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="px-8 py-4 rounded-xl font-bold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: theme.accent,
                color: '#000'
              }}
            >
              {sending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⚡</span>
                  Sending...
                </span>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}