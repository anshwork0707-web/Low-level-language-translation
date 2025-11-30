import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, FileText, Loader2, Download, CheckCircle2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface BatchFile {
  id: string
  file: File
  status: 'pending' | 'processing' | 'completed' | 'error'
  originalText?: string
  translatedText?: string
  error?: string
}

interface BatchTranslationProps {
  sourceLang: 'nepali' | 'sinhala' | 'english'
}

export default function BatchTranslation({ sourceLang }: BatchTranslationProps) {
  const [files, setFiles] = useState<BatchFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    if (selectedFiles.length === 0) return
    
    // Validate total size
    const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > 50 * 1024 * 1024) { // 50MB total limit
      toast.error('Total file size exceeds 50MB limit')
      return
    }

    const newFiles: BatchFile[] = selectedFiles.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      status: 'pending'
    }))

    setFiles(prev => [...prev, ...newFiles])
    toast.success(`${selectedFiles.length} file(s) added to batch`)
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const processFile = async (batchFile: BatchFile): Promise<BatchFile> => {
    try {
      // Update status to processing
      setFiles(prev => prev.map(f => 
        f.id === batchFile.id ? { ...f, status: 'processing' as const } : f
      ))

      const formData = new FormData()
      formData.append('file', batchFile.file)

      let extractedText = ''

      // Extract text based on file type
      if (batchFile.file.type === 'text/plain') {
        extractedText = await batchFile.file.text()
      } else if (batchFile.file.type.startsWith('image/')) {
        const response = await fetch('http://localhost:8000/ocr/', {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) throw new Error('OCR failed')
        const data = await response.json()
        extractedText = data.text_regions.map((r: any) => r.text).join('\n')
      } else if (batchFile.file.type === 'application/pdf') {
        const response = await fetch('http://localhost:8000/ocr/pdf', {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) throw new Error('PDF processing failed')
        const data = await response.json()
        extractedText = data.extracted_text
      } else if (batchFile.file.type.includes('wordprocessingml') || batchFile.file.type.includes('msword')) {
        const response = await fetch('http://localhost:8000/ocr/docx', {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) throw new Error('DOCX processing failed')
        const data = await response.json()
        extractedText = data.extracted_text
      } else {
        throw new Error('Unsupported file type')
      }

      // Translate the extracted text
      const translateResponse = await fetch('http://localhost:8000/translate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: extractedText,
          source_lang: sourceLang,
        }),
      })

      if (!translateResponse.ok) throw new Error('Translation failed')
      const translateData = await translateResponse.json()

      return {
        ...batchFile,
        status: 'completed',
        originalText: extractedText,
        translatedText: translateData.translation
      }
    } catch (error: any) {
      return {
        ...batchFile,
        status: 'error',
        error: error.message
      }
    }
  }

  const processAllFiles = async () => {
    if (files.length === 0) {
      toast.error('No files to process')
      return
    }

    setIsProcessing(true)
    toast.loading('Processing batch translation...')

    try {
      const results = await Promise.all(files.map(processFile))
      setFiles(results)
      
      const completed = results.filter(f => f.status === 'completed').length
      const failed = results.filter(f => f.status === 'error').length
      
      toast.dismiss()
      toast.success(`Batch complete! ${completed} succeeded, ${failed} failed`)
    } catch (error) {
      toast.dismiss()
      toast.error('Batch processing failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const exportAllResults = () => {
    const completedFiles = files.filter(f => f.status === 'completed')
    
    if (completedFiles.length === 0) {
      toast.error('No completed translations to export')
      return
    }

    let content = `Batch Translation Results\n`
    content += `=========================\n`
    content += `Date: ${new Date().toLocaleString()}\n`
    content += `Source Language: ${sourceLang}\n`
    content += `Total Files: ${completedFiles.length}\n\n`

    completedFiles.forEach((file, index) => {
      content += `\n${'='.repeat(60)}\n`
      content += `File ${index + 1}: ${file.file.name}\n`
      content += `${'='.repeat(60)}\n\n`
      content += `Original Text:\n${'-'.repeat(40)}\n${file.originalText}\n\n`
      content += `Translated Text:\n${'-'.repeat(40)}\n${file.translatedText}\n\n`
    })

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `batch_translation_${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Batch results exported!')
  }

  const clearAll = () => {
    setFiles([])
    toast.success('Batch cleared')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Batch Translation</h3>
        {files.length > 0 && (
          <button onClick={clearAll} className="btn-secondary text-xs">
            Clear All
          </button>
        )}
      </div>

      {/* File Upload Area */}
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-secondary/30 transition-all">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">Upload multiple files</span>
          </p>
          <p className="text-xs text-muted-foreground">
            TXT, DOCX, PDF, Images (Max 50MB total)
          </p>
        </div>
        <input
          type="file"
          className="hidden"
          accept=".txt,.docx,.doc,.pdf,.jpg,.jpeg,.png"
          onChange={handleFilesSelect}
          multiple
        />
      </label>

      {/* Files List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-thin">
              {files.map((batchFile) => (
                <motion.div
                  key={batchFile.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <FileText className="w-4 h-4 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{batchFile.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(batchFile.file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    {batchFile.status === 'pending' && (
                      <span className="text-xs text-muted-foreground">Pending</span>
                    )}
                    {batchFile.status === 'processing' && (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    )}
                    {batchFile.status === 'completed' && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    {batchFile.status === 'error' && (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <button
                    onClick={() => removeFile(batchFile.id)}
                    className="p-1 rounded hover:bg-secondary transition-all"
                    disabled={isProcessing}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={processAllFiles}
                disabled={isProcessing || files.every(f => f.status !== 'pending')}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Translate All ({files.filter(f => f.status === 'pending').length})
                  </>
                )}
              </motion.button>

              {files.some(f => f.status === 'completed') && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={exportAllResults}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Results
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary */}
      {files.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground p-3 bg-secondary/20 rounded-lg">
          <span>Total: {files.length}</span>
          <span>Pending: {files.filter(f => f.status === 'pending').length}</span>
          <span>Completed: {files.filter(f => f.status === 'completed').length}</span>
          <span>Failed: {files.filter(f => f.status === 'error').length}</span>
        </div>
      )}
    </div>
  )
}
