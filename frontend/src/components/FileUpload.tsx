import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, X, Loader2, Cloud } from 'lucide-react'
import toast from 'react-hot-toast'

interface FileUploadProps {
  onTextExtracted: (text: string) => void
  sourceLang?: string
}

export default function FileUpload({ onTextExtracted }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file size (50MB max - increased for images/PDFs)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB')
      return
    }

    setFile(selectedFile)
    setIsProcessing(true)

    try {
      // For .txt files, read directly
      if (selectedFile.type === 'text/plain') {
        const text = await selectedFile.text()
        setExtractedText(text)
        toast.success('Text extracted successfully!')
      } else if (selectedFile.type.startsWith('image/')) {
        // For images, process with OCR
        const formData = new FormData()
        formData.append('file', selectedFile)
        
        const response = await fetch('http://localhost:8000/ocr/', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) throw new Error('OCR processing failed')
        
        const data = await response.json()
        const extractedTexts = data.text_regions.map((region: any) => region.text).join('\n')
        setExtractedText(extractedTexts || 'No text detected in image')
        toast.success(`Text extracted from image! (${data.text_regions.length} regions found)`)
      } else if (selectedFile.type === 'application/pdf') {
        // For PDFs, process with backend
        const formData = new FormData()
        formData.append('file', selectedFile)
        
        const response = await fetch('http://localhost:8000/ocr/pdf', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) throw new Error('PDF processing failed')
        
        const data = await response.json()
        setExtractedText(data.extracted_text)
        toast.success(`PDF processed! ${data.page_count} pages, ${data.character_count} characters`)
      } else if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 selectedFile.type === 'application/msword') {
        // For .docx/.doc files, process with backend
        const formData = new FormData()
        formData.append('file', selectedFile)
        
        const response = await fetch('http://localhost:8000/ocr/docx', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) throw new Error('DOCX processing failed')
        
        const data = await response.json()
        setExtractedText(data.extracted_text)
        toast.success(`Word document processed! ${data.paragraph_count} paragraphs, ${data.character_count} characters`)
      } else {
        // Accept all other files for future processing
        setExtractedText(`File: ${selectedFile.name}\n(This file type will be supported in future updates)`)
        toast.success('File uploaded! Processing coming soon.')
      }
    } catch (error) {
      console.error('File processing error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to process file')
      setExtractedText('')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUseText = () => {
    if (extractedText) {
      onTextExtracted(extractedText)
    }
  }

  const handleClear = () => {
    setFile(null)
    setExtractedText('')
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      // Create a fake input event to reuse existing logic
      const fakeEvent = {
        target: {
          files: [droppedFile]
        }
      } as any
      await handleFileChange(fakeEvent)
    }
  }

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative transition-all duration-300 ${
            isDragging ? 'scale-105' : ''
          }`}
        >
          <label className={`flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            isDragging 
              ? 'border-primary bg-primary/10 scale-105' 
              : 'border-border hover:bg-secondary/30 hover:border-primary/50'
          }`}>
            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-6">
              {/* Cloud Icon with Upload Arrow */}
              <div className="relative mb-6">
                <motion.div
                  animate={isDragging ? { y: -5 } : { y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <Cloud className={`w-24 h-24 transition-colors ${
                    isDragging ? 'text-primary' : 'text-blue-400/40'
                  }`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Upload className={`w-10 h-10 transition-colors ${
                      isDragging ? 'text-primary' : 'text-blue-500'
                    }`} />
                  </div>
                </motion.div>
              </div>

              {/* Text */}
              <p className="mb-3 text-lg font-semibold text-foreground">
                {isDragging ? 'Drop your file here' : 'Drag and drop'}
              </p>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-12 bg-border"></div>
                <p className="text-sm text-muted-foreground">Or choose a file</p>
                <div className="h-px w-12 bg-border"></div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary px-6 py-2.5 text-sm font-medium cursor-pointer"
              >
                Browse your files
              </motion.div>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                Supported file types: .docx, .pdf, .pptx, .xlsx
              </p>
              <p className="text-xs text-primary mt-1 cursor-pointer hover:underline">
                Learn more
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".txt,.docx,.doc,.pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.csv,.xlsx,.xls"
              onChange={handleFileChange}
            />
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="p-2 rounded-lg hover:bg-secondary transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isProcessing ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : extractedText ? (
            <>
              <div className="max-h-64 overflow-y-auto p-4 bg-background rounded-xl border border-border scrollbar-thin">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {extractedText}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUseText}
                className="btn-primary w-full"
              >
                Use This Text
              </motion.button>
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}
