import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, Bot, User, Loader2, Sparkles, X, Minimize2, Maximize2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useChatbot } from '../hooks/useChatbot'

interface ChatbotPanelProps {
  isOpen: boolean
  onClose: () => void
  translationContext: {
    original: string
    translated: string
    sourceLang: string
  } | null
}

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatbotPanel({
  isOpen,
  onClose,
  translationContext,
}: ChatbotPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content:
        'Hello! I\'m your AI translation assistant. I can help explain translations, suggest alternatives, or answer questions about the translation. How can I help you?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { mutate: sendMessage, isLoading } = useChatbot()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')

    // Send to chatbot API
    sendMessage(
      {
        message: input,
        context: translationContext?.translated || '',
      },
      {
        onSuccess: (data: any) => {
          const assistantMessage: Message = {
            id: Date.now() + 1,
            role: 'assistant',
            content: data.reply || 'I\'m here to help with translations!',
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, assistantMessage])
          scrollToBottom()
        },
        onError: () => {
          toast.error('Failed to get response from chatbot')
        },
      }
    )

    setTimeout(scrollToBottom, 100)
  }

  const handleQuickAction = (action: string) => {
    let question = ''
    if (action === 'explain') {
      question = 'Can you explain this translation in detail?'
    } else if (action === 'formal') {
      question = 'Can you provide a more formal version?'
    } else if (action === 'casual') {
      question = 'Can you provide a more casual version?'
    }
    setInput(question)
  }

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={onClose}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all z-40"
      >
        <Bot className="w-6 h-6 text-white" />
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-effect rounded-2xl border border-border flex flex-col ${
        isMinimized ? 'h-16' : 'h-[600px]'
      } transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">
              {isLoading ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 rounded-lg hover:bg-secondary/50 transition-all"
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minimize2 className="w-4 h-4" />
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary/50 transition-all"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-primary'
                      : 'bg-gradient-to-br from-blue-500 to-purple-600'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`flex-1 ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block px-4 py-2 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary/50'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 px-4">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-secondary/50 px-4 py-3 rounded-2xl">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {translationContext && (
            <div className="px-4 py-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleQuickAction('explain')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary border border-border transition-all"
                >
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Explain
                </button>
                <button
                  onClick={() => handleQuickAction('formal')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary border border-border transition-all"
                >
                  Formal version
                </button>
                <button
                  onClick={() => handleQuickAction('casual')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary border border-border transition-all"
                >
                  Casual version
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 input-primary py-2"
                disabled={isLoading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="btn-primary px-4 py-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}
