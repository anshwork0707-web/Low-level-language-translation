import { motion } from 'framer-motion'
import {
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface QualityMetrics {
  overallScore: number
  confidence: number
  fluency: number
  accuracy: number
  completeness: number
  grammarScore: number
}

interface TranslationQualityProps {
  originalText: string
  translatedText: string
  sourceLang: string
  onFeedback?: (isGood: boolean) => void
}

export default function TranslationQuality({
  originalText,
  translatedText,
  sourceLang,
  onFeedback,
}: TranslationQualityProps) {
  const [metrics] = useState<QualityMetrics>(
    calculateQualityMetrics(originalText, translatedText, sourceLang)
  )
  const [feedbackGiven, setFeedbackGiven] = useState(false)

  function calculateQualityMetrics(
    original: string,
    translated: string,
    _lang: string
  ): QualityMetrics {
    // Simulate quality calculation
    const originalWords = original.trim().split(/\s+/).length
    const translatedWords = translated.trim().split(/\s+/).length

    // Completeness (check if all content translated)
    const completeness = Math.min(100, (translatedWords / originalWords) * 100)

    // Confidence based on language and length
    const confidence =
      originalWords > 100
        ? 85 // Longer texts = slightly lower confidence
        : originalWords > 50
        ? 92
        : 95

    // Fluency (check for repeated words, proper structure)
    const uniqueWords = new Set(translated.toLowerCase().split(/\s+/)).size
    const fluency = Math.min(100, (uniqueWords / translatedWords) * 100 + 20)

    // Grammar score (simplified - check for basic punctuation)
    const hasPunctuation = /[.!?]/.test(translated)
    const hasCapitalization = /[A-Z]/.test(translated)
    const grammarScore = (hasPunctuation ? 50 : 0) + (hasCapitalization ? 50 : 0)

    // Accuracy (simulated based on confidence)
    const accuracy = confidence - 5

    // Overall score (weighted average)
    const overallScore = Math.round(
      confidence * 0.3 +
        fluency * 0.25 +
        accuracy * 0.25 +
        completeness * 0.1 +
        grammarScore * 0.1
    )

    return {
      overallScore,
      confidence,
      fluency,
      accuracy,
      completeness,
      grammarScore,
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 75) return 'text-yellow-400'
    if (score >= 60) return 'text-orange-400'
    return 'text-red-400'
  }

  const getQualityIcon = (score: number) => {
    if (score >= 90) return CheckCircle
    if (score >= 75) return AlertTriangle
    return XCircle
  }

  const getQualityLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 75) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Needs Review'
  }

  const getRecommendations = () => {
    const recommendations: string[] = []

    if (metrics.confidence < 80) {
      recommendations.push('Consider manual review - confidence is below 80%')
    }
    if (metrics.grammarScore < 70) {
      recommendations.push('Check punctuation and capitalization')
    }
    if (metrics.completeness < 85) {
      recommendations.push('Some content may be missing - verify completeness')
    }
    if (metrics.fluency < 80) {
      recommendations.push('Translation may sound unnatural - consider rephrasing')
    }

    if (recommendations.length === 0) {
      recommendations.push('Translation quality is excellent!')
    }

    return recommendations
  }

  const handleFeedback = (isPositive: boolean) => {
    setFeedbackGiven(true)
    onFeedback?.(isPositive)
    toast.success(isPositive ? 'Thanks for the positive feedback!' : 'Thanks! We\'ll improve.')
  }

  const QualityIcon = getQualityIcon(metrics.overallScore)

  return (
    <div className="space-y-4">
      {/* Overall Quality Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-effect rounded-xl p-4 border border-border"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <QualityIcon
              className={`w-6 h-6 ${getScoreColor(metrics.overallScore)}`}
            />
            <div>
              <h3 className="font-bold text-lg">Translation Quality</h3>
              <p className="text-sm text-muted-foreground">
                {getQualityLabel(metrics.overallScore)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${getScoreColor(metrics.overallScore)}`}>
              {metrics.overallScore}
            </p>
            <p className="text-xs text-muted-foreground">out of 100</p>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <ScoreMetric
            label="Confidence"
            score={metrics.confidence}
            icon={TrendingUp}
          />
          <ScoreMetric
            label="Fluency"
            score={metrics.fluency}
            icon={CheckCircle}
          />
          <ScoreMetric
            label="Accuracy"
            score={metrics.accuracy}
            icon={CheckCircle}
          />
          <ScoreMetric
            label="Completeness"
            score={metrics.completeness}
            icon={CheckCircle}
          />
          <ScoreMetric
            label="Grammar"
            score={metrics.grammarScore}
            icon={CheckCircle}
          />
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-xl p-4 border border-border"
      >
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <h4 className="font-bold">Recommendations</h4>
        </div>
        <ul className="space-y-2">
          {getRecommendations().map((rec, index) => (
            <li
              key={index}
              className="text-sm text-muted-foreground flex items-start gap-2"
            >
              <span className="text-primary mt-0.5">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* User Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-xl p-4 border border-border"
      >
        <h4 className="font-bold mb-3 text-sm">Was this translation helpful?</h4>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleFeedback(true)}
            disabled={feedbackGiven}
            className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
              feedbackGiven
                ? 'bg-secondary/30 border-border opacity-50'
                : 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'
            }`}
          >
            <ThumbsUp className="w-4 h-4 mx-auto text-green-400" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleFeedback(false)}
            disabled={feedbackGiven}
            className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
              feedbackGiven
                ? 'bg-secondary/30 border-border opacity-50'
                : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20'
            }`}
          >
            <ThumbsDown className="w-4 h-4 mx-auto text-red-400" />
          </motion.button>
        </div>
        {feedbackGiven && (
          <p className="text-xs text-center mt-2 text-muted-foreground">
            Thank you for your feedback!
          </p>
        )}
      </motion.div>
    </div>
  )
}

function ScoreMetric({
  label,
  score,
  icon: Icon,
}: {
  label: string
  score: number
  icon: any
}) {
  const getColor = (s: number) => {
    if (s >= 90) return 'text-green-400'
    if (s >= 75) return 'text-yellow-400'
    return 'text-orange-400'
  }

  const getBgColor = (s: number) => {
    if (s >= 90) return 'bg-green-400'
    if (s >= 75) return 'bg-yellow-400'
    return 'bg-orange-400'
  }

  return (
    <div className="bg-secondary/30 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${getColor(score)}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className={`text-xl font-bold ${getColor(score)}`}>{score}</span>
        <span className="text-xs text-muted-foreground mb-0.5">/ 100</span>
      </div>
      <div className="mt-2 w-full bg-secondary/50 rounded-full h-1.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${getBgColor(score)}`}
        />
      </div>
    </div>
  )
}
