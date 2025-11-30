import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mic, Volume2, VolumeX, Loader2, Square } from 'lucide-react'
import toast from 'react-hot-toast'

interface VoiceInputProps {
  onTextReceived: (text: string) => void
  language: 'nepali' | 'sinhala' | 'english'
}

// Language codes for Web Speech API
const SPEECH_LANG_CODES = {
  nepali: 'ne-NP',
  sinhala: 'si-LK',
  english: 'en-US'
}

export default function VoiceInput({ onTextReceived, language }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    const recognitionInstance = new SpeechRecognition()
    recognitionInstance.continuous = false
    recognitionInstance.interimResults = false
    recognitionInstance.maxAlternatives = 1
    
    setRecognition(recognitionInstance)
  }, [])

  useEffect(() => {
    if (!recognition) return

    recognition.lang = SPEECH_LANG_CODES[language]

    recognition.onstart = () => {
      setIsListening(true)
      toast.success(`🎤 Listening in ${language}...`)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      const confidence = event.results[0][0].confidence
      
      console.log('Speech recognized:', transcript, 'Confidence:', confidence)
      onTextReceived(transcript)
      toast.success(`✅ Recognized: "${transcript.substring(0, 50)}..."`)
      setIsListening(false)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      
      if (event.error === 'no-speech') {
        toast.error('No speech detected. Please try again.')
      } else if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please enable microphone permissions.')
      } else {
        toast.error(`Speech recognition error: ${event.error}`)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }
  }, [recognition, language, onTextReceived])

  const startListening = () => {
    if (!recognition) {
      toast.error('Speech recognition not supported in this browser')
      return
    }

    try {
      recognition.start()
    } catch (error) {
      console.error('Error starting recognition:', error)
      toast.error('Failed to start listening. Please try again.')
    }
  }

  const stopListening = () => {
    if (recognition) {
      recognition.stop()
      setIsListening(false)
    }
  }

  if (!isSupported) {
    return (
      <div className="text-xs text-muted-foreground text-center p-2">
        Voice input not supported in this browser. Try Chrome or Edge.
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isListening ? stopListening : startListening}
        className={`btn-secondary flex items-center gap-2 ${
          isListening ? 'bg-red-500 hover:bg-red-600 text-white' : ''
        }`}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? (
          <>
            <Square className="w-4 h-4 fill-current" />
            <span className="text-xs">Stop</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4" />
            <span className="text-xs">Voice Input</span>
          </>
        )}
      </motion.button>
    </div>
  )
}

// Text-to-Speech Component
interface TextToSpeechProps {
  text: string
  language: 'english' | 'nepali' | 'sinhala'
}

export function TextToSpeech({ text, language }: TextToSpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const VOICE_LANG_CODES = {
    english: 'en-US',
    nepali: 'ne-NP',
    sinhala: 'si-LK'
  }

  const speak = () => {
    if (!text.trim()) {
      toast.error('No text to speak')
      return
    }

    // Check if browser supports Speech Synthesis
    if (!window.speechSynthesis) {
      toast.error('Text-to-speech not supported in this browser')
      return
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = VOICE_LANG_CODES[language]
    utterance.rate = 0.9 // Slightly slower for clarity
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => {
      setIsSpeaking(true)
      toast.success(`🔊 Speaking in ${language}...`)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event)
      setIsSpeaking(false)
      toast.error('Failed to speak text')
    }

    window.speechSynthesis.speak(utterance)
  }

  const stop = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={isSpeaking ? stop : speak}
      className="btn-secondary flex items-center gap-2"
      title={isSpeaking ? 'Stop speaking' : 'Listen to translation'}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-4 h-4" />
          <span className="text-xs">Stop</span>
          <Loader2 className="w-3 h-3 animate-spin" />
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4" />
          <span className="text-xs">Listen</span>
        </>
      )}
    </motion.button>
  )
}
