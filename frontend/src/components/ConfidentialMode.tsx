import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  AlertTriangle,
  Clock,
  Trash2,
  CheckCircle,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useGovernmentMode } from './GovernmentModeProvider'

interface ConfidentialModeProps {
  isEnabled: boolean
  onToggle: (enabled: boolean) => void
}

export default function ConfidentialMode({ isEnabled, onToggle }: ConfidentialModeProps) {
  const { governmentMode } = useGovernmentMode()
  const [sessionTime, setSessionTime] = useState(0)
  const [showDialog, setShowDialog] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Close dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        setShowDialog(false)
      }
    }

    if (showDialog) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDialog])

  // Session timer
  useEffect(() => {
    let interval: number

    if (isEnabled) {
      interval = window.setInterval(() => {
        setSessionTime((prev) => prev + 1)
      }, 1000)
    } else {
      setSessionTime(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isEnabled])

  const handleToggle = () => {
    if (!isEnabled) {
      // Show warning before enabling
      setShowWarning(true)
    } else {
      // Disable immediately
      disableConfidentialMode()
    }
  }

  const confirmEnable = () => {
    onToggle(true)
    setSessionTime(0)
    setShowWarning(false)
    setShowDialog(false)
    
    // Clear any existing history
    localStorage.removeItem('translationHistory')
    
    toast.success('Confidential Mode Enabled - Secure Session Started', {
      icon: '🔒',
      duration: 3000,
    })
  }

  const disableConfidentialMode = () => {
    onToggle(false)
    setSessionTime(0)
    setShowDialog(false)
    
    toast.success('Confidential Mode Disabled - Data Auto-Deleted', {
      icon: '✅',
      duration: 3000,
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Only show Confidential Mode when Government Mode is ON
  if (governmentMode === 'off') {
    return null
  }

  return (
    <div className="relative inline-block">
      {/* Secure Icon Button */}
      <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowDialog(!showDialog)}
          className={`
            relative h-12 px-4 rounded-lg border-2 transition-all duration-300 flex items-center justify-center
            ${isEnabled 
              ? 'bg-red-500/10 border-red-500/50 text-red-400 shadow-lg shadow-red-500/20' 
              : 'bg-yellow-500/5 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10'
            }
          `}
          title={isEnabled ? 'Confidential Mode Active' : 'Enable Confidential Mode'}
        >
          <div className="flex items-center gap-2">
            {isEnabled ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <ShieldAlert className="w-5 h-5" />
            )}
            {isEnabled && (
              <span className="text-xs font-mono">{formatTime(sessionTime)}</span>
            )}
          </div>

          {/* Active indicator pulse */}
          {isEnabled && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          )}
        </motion.button>

        {/* Dropdown Dialog */}
        <AnimatePresence>
          {showDialog && (
            <motion.div
              ref={dialogRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-14 w-96 glass-effect rounded-xl border-2 border-yellow-500/30 shadow-2xl z-50"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-yellow-400" />
                  <h3 className="font-bold text-lg">Confidential Mode</h3>
                </div>
                <button
                  onClick={() => setShowDialog(false)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                For classified/sensitive government documents
              </p>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Status */}
              {isEnabled ? (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-5 h-5 text-red-400" />
                    <span className="font-semibold text-red-400">ACTIVE SESSION</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Session Time: {formatTime(sessionTime)}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-green-400 mb-1">No translation history saved</p>
                      <p className="text-muted-foreground text-xs">All data is temporary</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <Trash2 className="w-4 h-4 text-green-400 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-green-400 mb-1">Auto-delete after session</p>
                      <p className="text-muted-foreground text-xs">Data removed when disabled</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <Lock className="w-4 h-4 text-green-400 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-green-400 mb-1">Watermark on exports (optional)</p>
                      <p className="text-muted-foreground text-xs">Mark documents as classified</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Toggle Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleToggle}
                className={`
                  w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300
                  ${isEnabled 
                    ? 'bg-red-500/20 border-2 border-red-500/50 text-red-400 hover:bg-red-500/30' 
                    : 'bg-yellow-500/20 border-2 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30'
                  }
                `}
              >
                {isEnabled ? (
                  <span className="flex items-center justify-center gap-2">
                    <ShieldAlert className="w-5 h-5" />
                    Disable Confidential Mode
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    Enable Confidential Mode
                  </span>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-effect rounded-2xl border-2 border-red-500/30 max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-500/20 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-400">Enable Confidential Mode?</h3>
                  <p className="text-sm text-muted-foreground">This will activate secure mode</p>
                </div>
              </div>

              <div className="space-y-3 mb-6 text-sm">
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-yellow-400 font-medium mb-1">⚠️ Important Notice:</p>
                  <ul className="space-y-1 text-muted-foreground ml-4 list-disc">
                    <li>All existing translation history will be cleared</li>
                    <li>No new translations will be saved</li>
                    <li>Data auto-deletes when you disable this mode</li>
                    <li>Use only for classified/sensitive documents</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowWarning(false)}
                  className="flex-1 py-3 px-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmEnable}
                  className="flex-1 py-3 px-4 bg-red-500/20 border-2 border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-semibold"
                >
                  Enable Secure Mode
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
