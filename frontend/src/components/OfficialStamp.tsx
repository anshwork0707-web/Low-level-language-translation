import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Stamp,
  FileSignature,
  Download,
  Settings,
  Calendar,
  User,
  Shield,
  QrCode,
} from 'lucide-react'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import { useGovernmentMode } from './GovernmentModeProvider'

interface OfficialStampProps {
  originalText: string
  translatedText: string
  sourceLang: string
  targetLang: string
}

interface StampConfig {
  organizationName: string
  officerName: string
  designation: string
  seal: 'ntro' | 'government' | 'custom'
  includeQR: boolean
  includeWatermark: boolean
  watermarkText: string
  certificateNumber: string
}

// Helper function to generate certificate number
function generateCertificateNumber() {
  const date = new Date()
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')
  return `NTRO/${year}/${month}${day}/${random}`
}

export default function OfficialStamp({
  originalText,
  translatedText,
  sourceLang,
  targetLang,
}: OfficialStampProps) {
  const { governmentMode } = useGovernmentMode()
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState<StampConfig>({
    organizationName: 'National Technical Research Organisation',
    officerName: 'Translation Officer',
    designation: 'Senior Translation Specialist',
    seal: 'ntro',
    includeQR: true,
    includeWatermark: false,
    watermarkText: 'OFFICIAL TRANSLATION',
    certificateNumber: generateCertificateNumber(),
  })

  // Only show Official Stamp when Government Mode is ON
  if (governmentMode === 'off') {
    return null
  }

  const exportWithStamp = async () => {
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      let yPos = 20

      // Add watermark if enabled
      if (config.includeWatermark) {
        doc.setFontSize(60)
        doc.setTextColor(200, 200, 200)
        doc.text(config.watermarkText, pageWidth / 2, pageHeight / 2, {
          align: 'center',
          angle: 45,
        })
      }

      // Header - Government Seal
      doc.setFontSize(16)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      doc.text(config.organizationName, pageWidth / 2, yPos, { align: 'center' })
      yPos += 10

      // Subtitle
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text('CERTIFIED TRANSLATION', pageWidth / 2, yPos, { align: 'center' })
      yPos += 15

      // Certificate Number
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(`Certificate No: ${config.certificateNumber}`, 20, yPos)
      yPos += 10

      // Date
      const currentDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
      doc.setFont('helvetica', 'normal')
      doc.text(`Date: ${currentDate}`, 20, yPos)
      yPos += 15

      // Divider
      doc.setDrawColor(100, 100, 100)
      doc.line(20, yPos, pageWidth - 20, yPos)
      yPos += 10

      // Original Text Section
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text(`Original Text (${sourceLang.toUpperCase()}):`, 20, yPos)
      yPos += 7

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      const originalLines = doc.splitTextToSize(originalText, pageWidth - 40)
      doc.text(originalLines, 20, yPos)
      yPos += originalLines.length * 5 + 10

      // Translated Text Section
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text(`Translated Text (${targetLang.toUpperCase()}):`, 20, yPos)
      yPos += 7

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      const translatedLines = doc.splitTextToSize(translatedText, pageWidth - 40)
      doc.text(translatedLines, 20, yPos)
      yPos += translatedLines.length * 5 + 15

      // Certification Section
      doc.setDrawColor(100, 100, 100)
      doc.line(20, yPos, pageWidth - 20, yPos)
      yPos += 10

      doc.setFont('helvetica', 'italic')
      doc.setFontSize(9)
      const certText = doc.splitTextToSize(
        'This is to certify that the above translation has been done accurately from the original text using AI-powered translation system with human oversight. This translation is certified for official use.',
        pageWidth - 40
      )
      doc.text(certText, 20, yPos)
      yPos += certText.length * 4 + 10

      // Officer Details
      const signatureY = Math.max(yPos + 20, pageHeight - 80)

      // QR Code placeholder (if enabled)
      if (config.includeQR) {
        doc.setFontSize(8)
        doc.text('[QR CODE]', pageWidth - 50, signatureY - 10)
        doc.rect(pageWidth - 50, signatureY - 5, 25, 25)
        doc.setFontSize(7)
        doc.text('Scan to verify', pageWidth - 48, signatureY + 23)
      }

      // Signature Box
      doc.setFontSize(9)
      doc.text('Certified by:', 20, signatureY)
      doc.setFont('helvetica', 'bold')
      doc.text(config.officerName, 20, signatureY + 5)
      doc.setFont('helvetica', 'normal')
      doc.text(config.designation, 20, signatureY + 10)
      doc.text(config.organizationName, 20, signatureY + 15)

      // Signature Line
      doc.line(20, signatureY + 20, 80, signatureY + 20)
      doc.setFontSize(8)
      doc.text('Digital Signature', 20, signatureY + 25)

      // Official Seal Placeholder
      doc.setFontSize(9)
      doc.circle(pageWidth / 2, signatureY + 15, 15)
      doc.setFont('helvetica', 'bold')
      doc.text('OFFICIAL', pageWidth / 2, signatureY + 12, { align: 'center' })
      doc.text('SEAL', pageWidth / 2, signatureY + 18, { align: 'center' })

      // Footer
      const footerY = pageHeight - 15
      doc.setFontSize(7)
      doc.setTextColor(128, 128, 128)
      doc.setFont('helvetica', 'italic')
      doc.text(
        'Generated by NTRO Translation System - AI/ML Based Translation',
        pageWidth / 2,
        footerY,
        { align: 'center' }
      )

      // Save PDF
      doc.save(`certified_translation_${config.certificateNumber.replace(/\//g, '_')}.pdf`)
      toast.success('Certified translation downloaded!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate certified document')
    }
  }

  return (
    <div className="space-y-4">
      <div className="glass-effect rounded-xl p-4 border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Stamp className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="font-bold">Official Certification</h3>
              <p className="text-sm text-muted-foreground">
                Add government stamp & digital signature
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowConfig(!showConfig)}
            className="btn-secondary"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Certificate Preview */}
        <div className="bg-secondary/30 rounded-lg p-4 border border-border mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Cert. No.</p>
                <p className="font-mono text-xs font-bold truncate">
                  {config.certificateNumber}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-xs font-semibold">
                  {new Date().toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Officer</p>
                <p className="text-xs font-semibold truncate">{config.officerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Seal</p>
                <p className="text-xs font-semibold uppercase">{config.seal}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Panel */}
        {showConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 pt-4 border-t border-border"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={config.organizationName}
                  onChange={(e) =>
                    setConfig({ ...config, organizationName: e.target.value })
                  }
                  className="input-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Officer Name</label>
                <input
                  type="text"
                  value={config.officerName}
                  onChange={(e) =>
                    setConfig({ ...config, officerName: e.target.value })
                  }
                  className="input-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Designation</label>
                <input
                  type="text"
                  value={config.designation}
                  onChange={(e) =>
                    setConfig({ ...config, designation: e.target.value })
                  }
                  className="input-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Official Seal</label>
                <select
                  value={config.seal}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      seal: e.target.value as 'ntro' | 'government' | 'custom',
                    })
                  }
                  className="input-primary text-sm"
                >
                  <option value="ntro">NTRO Seal</option>
                  <option value="government">Government of India</option>
                  <option value="custom">Custom Seal</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeQR}
                  onChange={(e) =>
                    setConfig({ ...config, includeQR: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-border bg-secondary"
                />
                <QrCode className="w-4 h-4 text-primary" />
                <span className="text-sm">Include QR Code for verification</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.includeWatermark}
                  onChange={(e) =>
                    setConfig({ ...config, includeWatermark: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-border bg-secondary"
                />
                <Stamp className="w-4 h-4 text-primary" />
                <span className="text-sm">Add watermark to document</span>
              </label>

              {config.includeWatermark && (
                <input
                  type="text"
                  value={config.watermarkText}
                  onChange={(e) =>
                    setConfig({ ...config, watermarkText: e.target.value })
                  }
                  placeholder="Watermark text"
                  className="input-primary text-sm ml-6"
                />
              )}
            </div>
          </motion.div>
        )}

        {/* Download Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={exportWithStamp}
          className="btn-primary w-full mt-4"
        >
          <Download className="w-5 h-5" />
          Download Certified Translation (PDF)
        </motion.button>

        <p className="text-xs text-muted-foreground text-center mt-2">
          Includes official seal, digital signature, and certificate number
        </p>
      </div>
    </div>
  )
}
