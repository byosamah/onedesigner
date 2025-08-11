'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getTheme } from '@/lib/design-system'
import { Navigation } from '@/components/shared/Navigation'

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
      console.error('Error loading conversation:', error)
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
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: theme.bg }}>
        <Navigation 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode}
          userType="client"
        />
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
        <Navigation 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode}
          userType="client"
        />
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
      <Navigation 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode}
        userType="client"
      />
      
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