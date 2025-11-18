'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { MessageCircle, Send, Sparkles, Bot, User, Loader2, Trash2, Settings } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

interface AICareerCoachProps {
  compact?: boolean
}

export function AICareerCoach({ compact = false }: AICareerCoachProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [provider, setProvider] = useState<'openai' | 'copilot'>('openai')
  const [isExpanded, setIsExpanded] = useState(!compact)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { showToast } = useToast()

  useEffect(() => {
    // Load conversation history
    loadConversation()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversation = async () => {
    try {
      const response = await fetch('/api/ai-coach/conversation')
      if (response.ok) {
        const data = await response.json()
        if (data.conversation) {
          setMessages(JSON.parse(data.conversation.messages || '[]'))
          setConversationId(data.conversation.id)
          setProvider(data.conversation.provider)
        }
      }
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai-coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId,
          provider,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        setConversationId(data.conversationId)
      } else {
        const error = await response.json()
        showToast('error', error.error || 'Failed to get response from AI coach')
      }
    } catch (error) {
      showToast('error', 'An error occurred while chatting with AI coach')
    } finally {
      setLoading(false)
    }
  }

  const clearConversation = async () => {
    if (!confirm('Clear this conversation? This cannot be undone.')) return

    try {
      if (conversationId) {
        await fetch(`/api/ai-coach/conversation?id=${conversationId}`, {
          method: 'DELETE',
        })
      }
      setMessages([])
      setConversationId(null)
      showToast('success', 'Conversation cleared')
    } catch (error) {
      showToast('error', 'Failed to clear conversation')
    }
  }

  const getSuggestedPrompts = () => [
    "What skills should I focus on to advance my career?",
    "How can I prepare for my next performance review?",
    "What's the best way to transition into a leadership role?",
    "How do I negotiate a raise based on my skills?",
    "What are the most in-demand skills in my field?",
  ]

  if (compact && !isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className={
        compact
          ? 'fixed bottom-6 right-6 z-50 w-96 shadow-2xl rounded-lg overflow-hidden'
          : 'w-full'
      }
    >
      <Card className="h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold">AI Career Coach</h3>
              <p className="text-xs text-blue-100">
                Powered by {provider === 'openai' ? 'OpenAI GPT-4' : 'MS Copilot'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setProvider(provider === 'openai' ? 'copilot' : 'openai')}
              className="p-2 hover:bg-white/20 rounded transition-colors"
              title="Switch AI provider"
            >
              <Settings className="w-4 h-4" />
            </button>
            {messages.length > 0 && (
              <button
                onClick={clearConversation}
                className="p-2 hover:bg-white/20 rounded transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            {compact && (
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 hover:bg-white/20 rounded transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div
          className={`overflow-y-auto bg-gray-50 ${
            compact ? 'h-96' : 'h-[500px]'
          } p-4 space-y-4`}
        >
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Welcome to your AI Career Coach!</h4>
              <p className="text-sm text-gray-600 mb-6">
                I can help you with career planning, skill development, interview prep, and more.
              </p>
              <div className="space-y-2 text-left max-w-md mx-auto">
                <p className="text-xs font-semibold text-gray-700 mb-2">Try asking:</p>
                {getSuggestedPrompts().map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(prompt)}
                    className="block w-full text-left p-2 text-sm bg-white hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask me anything about your career..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <Button onClick={sendMessage} disabled={loading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
