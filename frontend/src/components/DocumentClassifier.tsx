import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Scale,
  Building2,
  Wrench,
  User,
  Sparkles,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useGovernmentMode } from './GovernmentModeProvider'

export type DocumentCategory = 'legal' | 'administrative' | 'technical' | 'personal' | 'general'

interface DocumentClassifierProps {
  text: string
  onClassificationComplete: (category: DocumentCategory, confidence: number) => void
  autoClassify?: boolean
}

const DOCUMENT_CATEGORIES = {
  legal: {
    icon: Scale,
    label: 'Legal Document',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    keywords: [
      'court', 'petition', 'affidavit', 'writ', 'judgment', 'verdict',
      'plaintiff', 'defendant', 'jurisdiction', 'sue', 'appeal', 'law',
      'section', 'article', 'act', 'constitution', 'legal', 'justice',
      'अदालत', 'न्यायाधीश', 'कानून', 'धारा', 'संविधान'
    ],
    description: 'Court documents, legal notices, judgments, petitions',
    glossaryPreference: 'Legal Terms',
    translationStyle: 'Formal & Precise',
  },
  administrative: {
    icon: Building2,
    label: 'Administrative Document',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    keywords: [
      'ministry', 'department', 'government', 'office', 'circular',
      'notification', 'order', 'memo', 'directive', 'policy', 'scheme',
      'budget', 'allocation', 'official', 'secretary', 'मन्त्रालय',
      'विभाग', 'सरकार', 'कार्यालय', 'आदेश', 'नीति'
    ],
    description: 'Government orders, circulars, office memos, policies',
    glossaryPreference: 'Government Departments',
    translationStyle: 'Formal & Official',
  },
  technical: {
    icon: Wrench,
    label: 'Technical Document',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    keywords: [
      'technical', 'specification', 'manual', 'procedure', 'protocol',
      'guidelines', 'standards', 'implementation', 'system', 'software',
      'hardware', 'technology', 'प्राविधिक', 'प्रणाली', 'मापदण्ड'
    ],
    description: 'Technical manuals, specifications, guidelines',
    glossaryPreference: 'Technical Terms',
    translationStyle: 'Clear & Precise',
  },
  personal: {
    icon: User,
    label: 'Personal Document',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    keywords: [
      'dear', 'sir', 'madam', 'letter', 'application', 'request',
      'kindly', 'regards', 'sincerely', 'yours', 'आदरणीय', 'निवेदन',
      'प्रार्थना', 'धन्यवाद'
    ],
    description: 'Personal letters, applications, requests',
    glossaryPreference: 'Common Phrases',
    translationStyle: 'Polite & Respectful',
  },
  general: {
    icon: FileText,
    label: 'General Document',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
    keywords: [],
    description: 'General content, articles, reports',
    glossaryPreference: 'Other',
    translationStyle: 'Standard',
  },
}

export default function DocumentClassifier({
  text,
  onClassificationComplete,
  autoClassify = true,
}: DocumentClassifierProps) {
  const { governmentMode } = useGovernmentMode()
  const [category, setCategory] = useState<DocumentCategory>('general')
  const [confidence, setConfidence] = useState(0)
  const [isClassifying, setIsClassifying] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (autoClassify && text.trim().length > 50) {
      classifyDocument(text)
    }
  }, [text, autoClassify])

  const classifyDocument = (inputText: string) => {
    setIsClassifying(true)
    
    // Simulate classification with keyword matching
    setTimeout(() => {
      const lowerText = inputText.toLowerCase()
      const scores: Record<DocumentCategory, number> = {
        legal: 0,
        administrative: 0,
        technical: 0,
        personal: 0,
        general: 0,
      }

      // Calculate scores based on keyword matches
      Object.entries(DOCUMENT_CATEGORIES).forEach(([cat, config]) => {
        const matchedKeywords = config.keywords.filter(keyword =>
          lowerText.includes(keyword.toLowerCase())
        )
        scores[cat as DocumentCategory] = matchedKeywords.length
      })

      // Find category with highest score
      const maxScore = Math.max(...Object.values(scores))
      const detectedCategory = (Object.keys(scores).find(
        key => scores[key as DocumentCategory] === maxScore
      ) || 'general') as DocumentCategory

      // Calculate confidence (0-100)
      const totalWords = inputText.split(/\s+/).length
      const confidenceScore = maxScore > 0
        ? Math.min(95, Math.round((maxScore / totalWords) * 100 * 10))
        : 30

      setCategory(detectedCategory)
      setConfidence(confidenceScore)
      setIsClassifying(false)

      onClassificationComplete(detectedCategory, confidenceScore)

      // Only show toast for high confidence detections
      if (confidenceScore > 80) {
        toast.success(`Detected: ${DOCUMENT_CATEGORIES[detectedCategory].label}`)
      }
    }, 500)
  }

  const handleManualClassification = (selectedCategory: DocumentCategory) => {
    setCategory(selectedCategory)
    setConfidence(100) // Manual selection = 100% confidence
    onClassificationComplete(selectedCategory, 100)
    toast.success(`Set to: ${DOCUMENT_CATEGORIES[selectedCategory].label}`)
  }

  const categoryConfig = DOCUMENT_CATEGORIES[category]
  const CategoryIcon = categoryConfig.icon

  // Only show Document Classifier when Government Mode is ON
  if (governmentMode === 'off') {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Current Classification Display */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-4 border-2 ${categoryConfig.bgColor} ${categoryConfig.borderColor}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <CategoryIcon className={`w-6 h-6 ${categoryConfig.color}`} />
            <div>
              <h3 className="font-bold text-lg">{categoryConfig.label}</h3>
              <p className="text-sm text-muted-foreground">
                {categoryConfig.description}
              </p>
            </div>
          </div>
          {isClassifying ? (
            <Sparkles className="w-5 h-5 animate-spin text-primary" />
          ) : confidence >= 70 ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          )}
        </div>

        {/* Confidence Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Confidence</span>
            <span className={`font-bold ${confidence >= 70 ? 'text-green-400' : confidence >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
              {confidence}%
            </span>
          </div>
          <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                confidence >= 70
                  ? 'bg-green-400'
                  : confidence >= 50
                  ? 'bg-yellow-400'
                  : 'bg-red-400'
              }`}
            />
          </div>
        </div>

        {/* Translation Settings */}
        <div className="mt-3 pt-3 border-t border-border/30 space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Glossary Preference:</span>
            <span className="font-medium text-primary">
              {categoryConfig.glossaryPreference}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Translation Style:</span>
            <span className="font-medium text-primary">
              {categoryConfig.translationStyle}
            </span>
          </div>
        </div>

        {/* Show Details Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-3 text-sm text-primary hover:underline"
        >
          {showDetails ? 'Hide' : 'Show'} Manual Selection
        </button>
      </motion.div>

      {/* Manual Category Selection */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3"
        >
          {Object.entries(DOCUMENT_CATEGORIES).map(([key, config]) => {
            const Icon = config.icon
            const isSelected = key === category
            return (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleManualClassification(key as DocumentCategory)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? `${config.bgColor} ${config.borderColor}`
                    : 'bg-secondary/30 border-border hover:border-primary/30'
                }`}
              >
                <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? config.color : 'text-muted-foreground'}`} />
                <p className={`text-xs font-medium ${isSelected ? config.color : 'text-muted-foreground'}`}>
                  {config.label.replace(' Document', '')}
                </p>
              </motion.button>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}

export { DOCUMENT_CATEGORIES }
