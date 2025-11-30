import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Clock, Languages } from 'lucide-react'
import toast from 'react-hot-toast'

interface HistoryItem {
  id: number
  original: string
  translated: string
  sourceLang: string
  timestamp: string
}

interface HistoryListProps {
  onSelect: (item: HistoryItem) => void
}

export default function HistoryList({ onSelect }: HistoryListProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('translationHistory')
    if (saved) {
      setHistory(JSON.parse(saved))
    }
  }, [])

  const handleClearAll = () => {
    localStorage.removeItem('translationHistory')
    setHistory([])
    toast.success('History cleared!')
  }

  const handleDelete = (id: number) => {
    const updated = history.filter((item) => item.id !== id)
    localStorage.setItem('translationHistory', JSON.stringify(updated))
    setHistory(updated)
    toast.success('Item removed!')
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
        <p className="text-muted-foreground">No translation history yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Your translations will appear here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between sticky top-0 bg-card/90 backdrop-blur-sm pb-2">
        <p className="text-sm text-muted-foreground">{history.length} translations</p>
        <button
          onClick={handleClearAll}
          className="text-xs px-3 py-1.5 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all"
        >
          <Trash2 className="w-3 h-3 inline mr-1" />
          Clear All
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
        {history.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(item)}
            className="p-4 bg-secondary/30 rounded-xl border border-border cursor-pointer hover:bg-secondary/50 hover:border-primary/30 transition-all group"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  {item.sourceLang === 'nepali' ? '🇳🇵 Nepali' : '🇱🇰 Sinhala'} → 🇬🇧 English
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {formatTime(item.timestamp)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(item.id)
                  }}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 transition-all"
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </button>
              </div>
            </div>

            <p className="text-sm mb-1 line-clamp-2">{item.original}</p>
            <p className="text-xs text-muted-foreground line-clamp-1">
              → {item.translated}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
