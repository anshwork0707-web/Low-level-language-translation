import { motion } from 'framer-motion'
import { Award, Zap, Shield, Users, Code, Rocket } from 'lucide-react'

export default function AboutPage() {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'GPU-accelerated translations in under 1 second',
    },
    {
      icon: Award,
      title: 'High Accuracy',
      description: 'BLEU score of 35+ with 98% real-world accuracy',
    },
    {
      icon: Shield,
      title: 'LoRA Fine-tuned',
      description: 'NLLB-200 model with LoRA adapters - Only 4.5MB model size',
    },
    {
      icon: Users,
      title: 'User-Friendly',
      description: 'Intuitive interface with AI chatbot assistance',
    },
    {
      icon: Code,
      title: 'Modern Stack',
      description: 'Built with React, TypeScript, and Tailwind CSS',
    },
    {
      icon: Rocket,
      title: 'Advanced Features',
      description: 'OCR, Live Translation, Batch Processing, Voice Input & Government Mode',
    },
  ]

  const stats = [
    { label: 'BLEU Score', value: '35+' },
    { label: 'Accuracy', value: '98%' },
    { label: 'Training Samples', value: '2M+' },
    { label: 'Languages', value: '3↔3' },
  ]

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-bold mb-6 gradient-text">
          ZeroDay1 Translation System
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Advanced neural machine translation for Nepali and Sinhala to English,
          powered by Meta's NLLB-200 model with LoRA fine-tuning.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
      >
        {stats.map((stat, index) => (
          <div
            key={index}
            className="glass-effect rounded-xl p-6 text-center border border-border card-hover"
          >
            <div className="text-4xl font-bold gradient-text mb-2">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
      >
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="glass-effect rounded-xl p-6 border border-border card-hover"
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Technology Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-effect rounded-xl p-8 border border-border mb-16"
      >
        <h2 className="text-2xl font-bold mb-6">📋 Complete Features List</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Core Translation */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Core Translation
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Text Translation (3 languages)</li>
              <li>✓ Voice Input (Speech-to-text)</li>
              <li>✓ Text-to-Speech Output</li>
              <li>✓ Sample Texts Library</li>
              <li>✓ Language Swap Button</li>
              <li>✓ Bidirectional Translation</li>
            </ul>
          </div>

          {/* File Processing */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
              <Code className="w-5 h-5" />
              File Processing
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ File Upload (50MB max)</li>
              <li>✓ OCR (Image to Text)</li>
              <li>✓ PDF Processing</li>
              <li>✓ DOCX Processing</li>
              <li>✓ Batch Translation</li>
              <li>✓ Drag & Drop Upload</li>
            </ul>
          </div>

          {/* Image Translation */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              Image Translation
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Snap & Translate (Camera)</li>
              <li>✓ Live Overlay Translation</li>
              <li>✓ Bounding Box Detection</li>
              <li>✓ Region Selection</li>
              <li>✓ Confidence Scores</li>
              <li>✓ Multi-region Support</li>
            </ul>
          </div>

          {/* Government Mode */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-orange-400 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Government Mode
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Confidential Mode</li>
              <li>✓ Official Stamp Generation</li>
              <li>✓ Custom Glossary</li>
              <li>✓ Document Classifier</li>
              <li>✓ Watermark Support</li>
              <li>✓ Certificate Numbers</li>
            </ul>
          </div>

          {/* Export & Quality */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-pink-400 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Export & Quality
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Export as TXT/PDF</li>
              <li>✓ Translation Quality Metrics</li>
              <li>✓ BLEU Score Display</li>
              <li>✓ Translation History</li>
              <li>✓ Copy to Clipboard</li>
              <li>✓ Batch Export</li>
            </ul>
          </div>

          {/* UI/UX Features */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
              <Users className="w-5 h-5" />
              UI/UX Features
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Dark/Light Theme Toggle</li>
              <li>✓ Side-by-Side View</li>
              <li>✓ AI Chatbot Assistant</li>
              <li>✓ Responsive Design</li>
              <li>✓ Smooth Animations</li>
              <li>✓ Real-time Feedback</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Technology Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-effect rounded-xl p-8 border border-border"
      >
        <h2 className="text-2xl font-bold mb-6">Technology Stack</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-400">Frontend</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• React 18 + TypeScript</li>
              <li>• Tailwind CSS + Framer Motion</li>
              <li>• React Query for state management</li>
              <li>• Lucide React icons</li>
              <li>• Vite for blazing-fast builds</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-purple-400">Backend</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• FastAPI + Uvicorn</li>
              <li>• PyTorch 2.6 + CUDA</li>
              <li>• Hugging Face Transformers</li>
              <li>• PEFT (LoRA fine-tuning)</li>
              <li>• NLLB-200-distilled-600M</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* SIH 2025 Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <div className="inline-block glass-effect rounded-full px-6 py-3 border border-border">
          <span className="text-sm font-semibold">
            🏆 SIH 2025 Problem ID: SIH25240 | Team: ZeroDay1
          </span>
        </div>
      </motion.div>
    </div>
  )
}
