import { useState } from 'react'
import TranslationBox from '../components/TranslationBox'
import ChatbotPanel from '../components/ChatbotPanel'
import { motion } from 'framer-motion'

export default function TranslatePage() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const [translationContext, setTranslationContext] = useState<{
    original: string
    translated: string
    sourceLang: string
  } | null>(null)

  const handleTranslationComplete = (original: string, translated: string, sourceLang: string) => {
    setTranslationContext({ original, translated, sourceLang })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Translation Section - Centered */}
      <div className="flex justify-center mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-5xl"
        >
          <TranslationBox
            onTranslationComplete={handleTranslationComplete}
            onOpenChatbot={() => setIsChatbotOpen(true)}
          />
        </motion.div>
      </div>

      {/* Chatbot Section - Below translation, centered */}
      <div className="flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-5xl"
        >
          <ChatbotPanel
            isOpen={isChatbotOpen}
            onClose={() => setIsChatbotOpen(false)}
            translationContext={translationContext}
          />
        </motion.div>
      </div>
    </div>
  )
}
