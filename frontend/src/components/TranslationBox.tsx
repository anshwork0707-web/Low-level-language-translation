import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRightLeft,
  Copy,
  Loader2,
  Upload,
  Sparkles,
  X,
  History,
  Columns,
  Layers,
  BookOpen,
  Award,
  ShieldCheck,
  Edit2,
  Save,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from '../hooks/useTranslation'
import FileUpload from './FileUpload'
import HistoryList from './HistoryList'
import VoiceInput, { TextToSpeech } from './VoiceInput'
import ExportTranslation from './ExportTranslation'
import BatchTranslation from './BatchTranslation'
import CustomGlossary from './CustomGlossary'
import DocumentClassifier, { DocumentCategory } from './DocumentClassifier'
import TranslationQuality from './TranslationQuality'
import ConfidentialMode from './ConfidentialMode'
import OfficialStamp from './OfficialStamp'
import { useGovernmentMode } from './GovernmentModeProvider'

interface TranslationBoxProps {
  onTranslationComplete: (original: string, translated: string, sourceLang: string) => void
  onOpenChatbot: () => void
}

type Language = 'nepali' | 'sinhala' | 'english'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const SAMPLE_TEXTS = {
  nepali: [
    'नमस्ते, तपाईंलाई कस्तो छ?',
    'नेपालको राजधानी काठमाण्डौ हो।',
    'मलाई किताब पढ्न मन पर्छ।',
  ],
  sinhala: [
    'මම පොත් කියවීමට කැමතියි.',
    'ශ්‍රී ලංකාවේ අගනුවර කොළඹයි.',
    'අද කාලගුණය හොඳයි.',
  ],
  english: [
    'Hello, how are you?',
    'I love reading books.',
    'The weather is nice today.',
  ],
}

export default function TranslationBox({
  onTranslationComplete,
  onOpenChatbot,
}: TranslationBoxProps) {
  const [sourceText, setSourceText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [sourceLang, setSourceLang] = useState<Language>('nepali')
  const [targetLang, setTargetLang] = useState<Language>('english')
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showBatch, setShowBatch] = useState(false)
  const [sideBySide, setSideBySide] = useState(false)
  const [showGlossary, setShowGlossary] = useState(false)
  const [docCategory, setDocCategory] = useState<DocumentCategory>('general')
  const [isConfidential, setIsConfidential] = useState(false)
  const [showQuality, setShowQuality] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTranslation, setEditedTranslation] = useState('')
  const [translationProgress, setTranslationProgress] = useState(0)
  const [feedbackGiven, setFeedbackGiven] = useState(false)

  const { mutate: translate, isLoading } = useTranslation()
  const { governmentMode } = useGovernmentMode()

  const handleTranslate = () => {
    if (!sourceText.trim()) {
      toast.error('Please enter some text to translate')
      return
    }

    // Reset and start progress simulation
    setTranslationProgress(0)
    setFeedbackGiven(false) // Reset feedback for new translation
    const progressInterval = setInterval(() => {
      setTranslationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 300)

    translate(
      { text: sourceText, source_language: sourceLang, target_language: targetLang },
      {
        onSuccess: (data) => {
          clearInterval(progressInterval)
          setTranslationProgress(100)
          setTranslatedText(data.translation)
          onTranslationComplete(sourceText, data.translation, sourceLang)
          toast.success('Translation complete!')
          
          // Reset progress after a short delay
          setTimeout(() => setTranslationProgress(0), 1000)
          
          // Save to history (skip if confidential mode)
          if (!isConfidential) {
            const history = JSON.parse(localStorage.getItem('translationHistory') || '[]')
            history.unshift({
              id: Date.now(),
              original: sourceText,
              translated: data.translation,
              sourceLang,
              category: docCategory,
              timestamp: new Date().toISOString(),
            })
            localStorage.setItem('translationHistory', JSON.stringify(history.slice(0, 20)))
          }
        },
        onError: (error: any) => {
          clearInterval(progressInterval)
          setTranslationProgress(0)
          toast.error(error.message || 'Translation failed')
        },
      }
    )
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const handleEditTranslation = () => {
    setIsEditing(true)
    setEditedTranslation(translatedText)
  }

  const handleSaveCorrection = async () => {
    if (!editedTranslation.trim()) {
      toast.error('Please enter a corrected translation')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/translate/correction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original_text: sourceText,
          ai_translation: translatedText,
          user_correction: editedTranslation,
          source_lang: sourceLang,
          target_lang: targetLang,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save correction')
      }

      setTranslatedText(editedTranslation)
      setIsEditing(false)
      toast.success('✨ System has learned from your correction!', {
        duration: 3000,
        icon: '🎓',
      })
    } catch (error) {
      toast.error('Failed to save correction')
      console.error('Correction error:', error)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedTranslation('')
  }

  const handleFeedback = (isPositive: boolean) => {
    setFeedbackGiven(true)
    toast.success(
      isPositive 
        ? '👍 Thanks for the positive feedback!' 
        : '👎 Thanks! We\'ll improve. Try the Edit button to teach us!',
      { duration: 3000 }
    )
  }

  const handleSampleClick = (sample: string) => {
    setSourceText(sample)
    setTranslatedText('')
  }

  const handleFileTextExtracted = (text: string) => {
    setSourceText(text)
    setShowFileUpload(false)
    toast.success('Text extracted from file!')
  }

  const handleHistorySelect = (item: any) => {
    setSourceText(item.original)
    setTranslatedText(item.translated)
    setSourceLang(item.sourceLang)
    setShowHistory(false)
  }

  const handleVoiceTextReceived = (text: string) => {
    setSourceText(text)
    setTranslatedText('')
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6 border border-border"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text">Translate</h2>
          <div className="flex gap-2">
            {governmentMode === 'on' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowGlossary(!showGlossary)}
                className={`btn-secondary ${showGlossary ? 'bg-primary text-white' : ''}`}
                title="Custom Glossary"
              >
                <BookOpen className="w-4 h-4" />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowBatch(!showBatch)}
              className={`btn-secondary ${showBatch ? 'bg-primary text-white' : ''}`}
              title="Batch translation"
            >
              <Layers className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(!showHistory)}
              className="btn-secondary"
            >
              <History className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFileUpload(!showFileUpload)}
              className="btn-secondary"
            >
              <Upload className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsConfidential(!isConfidential)}
              className={`btn-secondary ${isConfidential ? 'bg-red-500/20 border-red-500/50 text-red-400' : ''}`}
              title="Confidential Mode"
            >
              <ShieldCheck className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Custom Glossary Section */}
        <AnimatePresence>
          {showGlossary && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 pb-6 border-b border-border"
            >
              <CustomGlossary language={sourceLang} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Document Classification */}
        {sourceText.length > 50 && (
          <div className="mb-6">
            <DocumentClassifier
              text={sourceText}
              onClassificationComplete={(category, confidence) => {
                setDocCategory(category)
                if (confidence > 80) {
                  toast.success(`Auto-detected: ${category} document`)
                }
              }}
              autoClassify={true}
            />
          </div>
        )}

        {/* Batch Translation Section */}
        <AnimatePresence>
          {showBatch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 pb-6 border-b border-border"
            >
              <BatchTranslation sourceLang={sourceLang} targetLang={targetLang} />
            </motion.div>
          )}
        </AnimatePresence>

                {/* Language Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              From
            </label>
            <select
              value={sourceLang}
              onChange={(e) => {
                const newSource = e.target.value as Language
                setSourceLang(newSource)
                if (newSource === targetLang) {
                  setTargetLang(sourceLang)
                }
              }}
              className="input-primary"
            >
              <option value="nepali">🇳🇵 Nepali</option>
              <option value="sinhala">🇱🇰 Sinhala</option>
              <option value="english">🇬🇧 English</option>
            </select>
          </div>

          <div className="flex items-end justify-center">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                const temp = sourceLang
                setSourceLang(targetLang)
                setTargetLang(temp)
                const tempText = sourceText
                setSourceText(translatedText)
                setTranslatedText(tempText)
              }}
              className="p-2 rounded-lg hover:bg-secondary/50 transition-all"
              title="Swap languages"
            >
              <ArrowRightLeft className="w-6 h-6 text-primary" />
            </motion.button>
          </div>

          <div className="sm:col-span-1">
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              To
            </label>
            <select
              value={targetLang}
              onChange={(e) => {
                const newTarget = e.target.value as Language
                setTargetLang(newTarget)
                if (newTarget === sourceLang) {
                  setSourceLang(targetLang)
                }
              }}
              className="input-primary"
            >
              <option value="nepali">🇳🇵 Nepali</option>
              <option value="sinhala">🇱🇰 Sinhala</option>
              <option value="english">🇬🇧 English</option>
            </select>
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">
                Source Text
              </label>
              <div className="flex items-center gap-2">
                <VoiceInput 
                  onTextReceived={handleVoiceTextReceived} 
                  language={sourceLang} 
                />
                <span className="text-xs text-muted-foreground">
                  {sourceText.split(/\s+/).filter(word => word.length > 0).length} words
                </span>
              </div>
            </div>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder={`Enter text in ${sourceLang === 'nepali' ? 'Nepali' : sourceLang === 'sinhala' ? 'Sinhala' : 'English'}...`}
              className="textarea-primary h-64 scrollbar-thin"
            />
          </div>

          {/* Sample Sentences */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-medium text-muted-foreground">Try samples:</span>
            {SAMPLE_TEXTS[sourceLang].map((sample, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSampleClick(sample)}
                className="text-xs px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary border border-border transition-all"
              >
                {sample}
              </motion.button>
            ))}
          </div>

          {/* Translate Button with Confidential Mode */}
          <div className="flex flex-row items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTranslate}
              disabled={isLoading || !sourceText.trim()}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="animate-pulse">Translating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Translate
                </>
              )}
            </motion.button>

            {/* Confidential Mode Toggle */}
            <ConfidentialMode
              isEnabled={isConfidential}
              onToggle={setIsConfidential}
            />
          </div>
          
          {/* Progress Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  ⚡ Processing with AI model...
                </span>
                <span className="text-primary font-medium">{translationProgress}%</span>
              </div>
              <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${translationProgress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                💡 Tip: Repeated translations are cached for instant results
              </p>
            </motion.div>
          )}
        </div>

        {/* Output Area */}
        <AnimatePresence>
          {translatedText && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-muted-foreground">
                  Translation
                </label>
                <div className="flex gap-2">
                  <TextToSpeech text={translatedText} language="english" />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleEditTranslation}
                    className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-all border border-green-500/50"
                    title="Edit translation (teach AI)"
                  >
                    <Edit2 className="w-4 h-4 text-green-400" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSideBySide(!sideBySide)}
                    className={`p-2 rounded-lg transition-all ${sideBySide ? 'bg-primary text-white' : 'bg-secondary/50 hover:bg-secondary'}`}
                    title="Toggle side-by-side view"
                  >
                    <Columns className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onOpenChatbot}
                    className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-all"
                    title="Ask AI about this translation"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCopy(translatedText)}
                    className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-all"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </motion.button>
                  
                  {/* Feedback Buttons */}
                  <div className="flex gap-1 ml-2 pl-2 border-l border-border">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleFeedback(true)}
                      disabled={feedbackGiven}
                      className={`p-2 rounded-lg transition-all ${
                        feedbackGiven
                          ? 'bg-secondary/30 opacity-50 cursor-not-allowed'
                          : 'bg-green-500/10 hover:bg-green-500/20 border border-green-500/30'
                      }`}
                      title="Good translation"
                    >
                      <ThumbsUp className="w-4 h-4 text-green-400" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleFeedback(false)}
                      disabled={feedbackGiven}
                      className={`p-2 rounded-lg transition-all ${
                        feedbackGiven
                          ? 'bg-secondary/30 opacity-50 cursor-not-allowed'
                          : 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/30'
                      }`}
                      title="Needs improvement"
                    >
                      <ThumbsDown className="w-4 h-4 text-red-400" />
                    </motion.button>
                  </div>
                </div>
              </div>
              
              {/* Translation Output - Side by Side or Stacked */}
              {sideBySide ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Original ({sourceLang})</h4>
                    <div className="bg-secondary/30 rounded-xl p-4 border border-border min-h-[16rem]">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{sourceText}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Translation (English)</h4>
                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-4 border-2 border-primary/30 min-h-[16rem]">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{translatedText}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-4 border-2 border-primary/30 min-h-[16rem]">
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">{translatedText}</p>
                </div>
              )}
              
              {/* Export Options */}
              <div className="mt-4">
                <ExportTranslation 
                  originalText={sourceText}
                  translatedText={translatedText}
                  sourceLang={sourceLang}
                  targetLang="English"
                />
              </div>

              {/* Translation Quality Score */}
              <div className="mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowQuality(!showQuality)}
                  className="btn-secondary w-full"
                >
                  <Award className="w-4 h-4" />
                  {showQuality ? 'Hide' : 'Show'} Quality Analysis
                </motion.button>
              </div>

              {showQuality && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <TranslationQuality
                    originalText={sourceText}
                    translatedText={translatedText}
                    sourceLang={sourceLang}
                  />
                </motion.div>
              )}

              {/* Official Stamp */}
              <div className="mt-4">
                <OfficialStamp
                  originalText={sourceText}
                  translatedText={translatedText}
                  sourceLang={sourceLang}
                  targetLang="English"
                />
              </div>
              
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="badge-success">✓ Translated</span>
                <span>Model: NLLB-200 + LoRA</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Edit Translation Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCancelEdit}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-green-400" />
                    Edit Translation
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    🎓 Teach the AI by correcting this translation
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCancelEdit}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-4">
                {/* Original Text */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Original Text ({sourceLang})
                  </label>
                  <div className="bg-secondary/30 rounded-lg p-3 border border-border">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{sourceText}</p>
                  </div>
                </div>

                {/* AI Translation */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    AI Translation (Original)
                  </label>
                  <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{translatedText}</p>
                  </div>
                </div>

                {/* Corrected Translation */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-2">
                    Your Corrected Translation ✏️
                  </label>
                  <textarea
                    value={editedTranslation}
                    onChange={(e) => setEditedTranslation(e.target.value)}
                    className="w-full px-4 py-3 bg-green-500/10 border-2 border-green-500/30 rounded-xl focus:outline-none focus:border-green-500/50 transition-all min-h-[8rem] resize-y"
                    placeholder="Enter the correct translation..."
                    autoFocus
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveCorrection}
                    className="btn-primary flex-1"
                  >
                    <Save className="w-4 h-4" />
                    Save & Teach AI
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancelEdit}
                    className="btn-secondary flex-1"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File Upload Modal */}
      <AnimatePresence>
        {showFileUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowFileUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-effect rounded-2xl p-6 border border-border max-w-2xl w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Upload File</h3>
                <button
                  onClick={() => setShowFileUpload(false)}
                  className="p-2 rounded-lg hover:bg-secondary/50 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FileUpload
                onTextExtracted={handleFileTextExtracted}
                sourceLang={sourceLang}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-effect rounded-2xl p-6 border border-border max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Translation History</h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 rounded-lg hover:bg-secondary/50 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <HistoryList onSelect={handleHistorySelect} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}