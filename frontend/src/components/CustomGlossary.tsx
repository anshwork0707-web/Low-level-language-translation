import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Upload,
  Download,
  Search,
  Check,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useGovernmentMode } from './GovernmentModeProvider'

interface GlossaryEntry {
  id: string
  term: string
  translation: string
  language: string
  category?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface CustomGlossaryProps {
  language: string
}

const CATEGORIES = [
  'Legal Terms',
  'Government Departments',
  'Technical Terms',
  'Policy Names',
  'Common Phrases',
  'Other',
]

export default function CustomGlossary({ language }: CustomGlossaryProps) {
  const { governmentMode } = useGovernmentMode()
  const [glossary, setGlossary] = useState<GlossaryEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEntry, setNewEntry] = useState({
    term: '',
    translation: '',
    category: 'Other',
    notes: '',
  })

  // Load glossary from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`glossary_${language}`)
    if (stored) {
      try {
        setGlossary(JSON.parse(stored))
      } catch (error) {
        console.error('Failed to load glossary:', error)
      }
    }
  }, [language])

  // Save glossary to localStorage whenever it changes
  useEffect(() => {
    if (glossary.length > 0) {
      localStorage.setItem(`glossary_${language}`, JSON.stringify(glossary))
    }
  }, [glossary, language])

  const addEntry = () => {
    if (!newEntry.term.trim() || !newEntry.translation.trim()) {
      toast.error('Term and translation are required')
      return
    }

    const entry: GlossaryEntry = {
      id: Date.now().toString(),
      term: newEntry.term.trim(),
      translation: newEntry.translation.trim(),
      language,
      category: newEntry.category,
      notes: newEntry.notes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setGlossary([entry, ...glossary])
    setNewEntry({ term: '', translation: '', category: 'Other', notes: '' })
    setShowAddForm(false)
    toast.success('Term added to glossary!')
  }

  const updateEntry = (id: string, updates: Partial<GlossaryEntry>) => {
    setGlossary(
      glossary.map((entry) =>
        entry.id === id
          ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
          : entry
      )
    )
    setEditingId(null)
    toast.success('Entry updated!')
  }

  const deleteEntry = (id: string) => {
    setGlossary(glossary.filter((entry) => entry.id !== id))
    toast.success('Entry deleted')
  }

  const exportGlossary = () => {
    const dataStr = JSON.stringify(glossary, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `glossary_${language}_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Glossary exported!')
  }

  const importGlossary = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        if (Array.isArray(imported)) {
          setGlossary([...imported, ...glossary])
          toast.success(`Imported ${imported.length} entries!`)
        } else {
          toast.error('Invalid glossary file format')
        }
      } catch (error) {
        toast.error('Failed to import glossary')
      }
    }
    reader.readAsText(file)
  }

  const filteredGlossary = glossary.filter(
    (entry) =>
      entry.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Only show Custom Glossary when Government Mode is ON
  if (governmentMode === 'off') {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">
            Custom Glossary
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({glossary.length} terms)
            </span>
          </h3>
        </div>
        <div className="flex gap-2">
          <label className="btn-secondary cursor-pointer">
            <Upload className="w-4 h-4" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={importGlossary}
              className="hidden"
            />
          </label>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportGlossary}
            disabled={glossary.length === 0}
            className="btn-secondary disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Term
          </motion.button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-blue-400 mb-1">
            Government-Specific Terminology
          </p>
          <p className="text-muted-foreground">
            Define official translations for legal terms, department names, and policy
            terminology. Ensures consistency across all government documents.
          </p>
        </div>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-effect rounded-xl p-4 border border-border"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Original Term *
                </label>
                <input
                  type="text"
                  value={newEntry.term}
                  onChange={(e) => setNewEntry({ ...newEntry, term: e.target.value })}
                  placeholder="e.g., Ministry of Home Affairs"
                  className="input-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Translation *
                </label>
                <input
                  type="text"
                  value={newEntry.translation}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, translation: e.target.value })
                  }
                  placeholder="e.g., गृह मन्त्रालय"
                  className="input-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newEntry.category}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, category: e.target.value })
                  }
                  className="input-primary"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  placeholder="Context or usage notes"
                  className="input-primary"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addEntry}
                className="btn-primary flex-1"
              >
                <Save className="w-4 h-4" />
                Save Entry
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowAddForm(false)
                  setNewEntry({ term: '', translation: '', category: 'Other', notes: '' })
                }}
                className="btn-secondary"
              >
                <X className="w-4 h-4" />
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search terms, translations, or categories..."
          className="input-primary pl-10"
        />
      </div>

      {/* Glossary List */}
      <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
        {filteredGlossary.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No glossary entries yet</p>
            <p className="text-sm">
              Add terms to ensure consistent translations across documents
            </p>
          </div>
        ) : (
          filteredGlossary.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect rounded-lg p-4 border border-border hover:border-primary/30 transition-all"
            >
              {editingId === entry.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      defaultValue={entry.term}
                      className="input-primary text-sm"
                      onBlur={(e) =>
                        updateEntry(entry.id, { term: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      defaultValue={entry.translation}
                      className="input-primary text-sm"
                      onBlur={(e) =>
                        updateEntry(entry.id, { translation: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditingId(null)}
                      className="btn-primary text-sm px-3 py-1"
                    >
                      <Check className="w-3 h-3" />
                      Done
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                      <div>
                        <span className="text-xs text-muted-foreground">Original:</span>
                        <p className="font-medium truncate">{entry.term}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Translation:
                        </span>
                        <p className="font-medium truncate text-primary">
                          {entry.translation}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {entry.category && (
                        <span className="badge badge-primary text-xs">
                          {entry.category}
                        </span>
                      )}
                      {entry.notes && (
                        <span className="text-xs text-muted-foreground italic">
                          {entry.notes}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setEditingId(entry.id)}
                      className="p-2 rounded-lg hover:bg-secondary/50 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteEntry(entry.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Stats */}
      {glossary.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CATEGORIES.slice(0, 4).map((cat) => {
            const count = glossary.filter((e) => e.category === cat).length
            return count > 0 ? (
              <div
                key={cat}
                className="glass-effect rounded-lg p-3 border border-border text-center"
              >
                <p className="text-2xl font-bold text-primary">{count}</p>
                <p className="text-xs text-muted-foreground">{cat}</p>
              </div>
            ) : null
          })}
        </div>
      )}
    </div>
  )
}
