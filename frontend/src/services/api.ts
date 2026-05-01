import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120 seconds for longer translation requests
})

// Translation API
export const translateAPI = async (data: { text: string; source_language: string; target_language?: string }) => {
  try {
    const response = await api.post('/translate/', {
      text: data.text,
      source_lang: data.source_language,  // Backend expects 'source_lang'
      target_lang: data.target_language,
    })
    return response.data
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Translation timed out for a long input. Please retry or split into smaller parts.')
    }
    if (error.response) {
      throw new Error(error.response.data.detail || 'Translation failed')
    } else if (error.request) {
      throw new Error(`Backend server is not responding at ${API_BASE_URL}. Please ensure the API is running.`)
    } else {
      throw new Error('An unexpected error occurred')
    }
  }
}

// Batch Translation API
export const batchTranslateAPI = async (data: {
  texts: string[]
  source_language: string
  target_language?: string
}) => {
  try {
    const response = await api.post('/batch-translate/', {
      texts: data.texts,
      source_language: data.source_language,
      target_language: data.target_language,
    })
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'Batch translation failed')
    } else {
      throw new Error('Backend server is not responding')
    }
  }
}

// Chatbot API
export const chatbotAPI = async (data: { message: string; context?: string }) => {
  try {
    const response = await api.post('/chat/', {
      message: data.message,
      context: data.context || '',
    })
    return response.data
  } catch (error: any) {
    // Fallback response if chatbot API is not implemented yet
    if (error.response?.status === 404) {
      return {
        reply: "I'm here to help! The chatbot API is currently being set up. For now, I can tell you that your translation looks good!",
        suggestions: ['Try another sentence', 'Check the translation', 'Learn more'],
      }
    }
    
    if (error.response) {
      throw new Error(error.response.data.detail || 'Chatbot request failed')
    } else {
      throw new Error('Failed to connect to chatbot')
    }
  }
}

// Health Check API
export const healthCheckAPI = async () => {
  try {
    const response = await api.get('/health/')
    return response.data
  } catch (error) {
    throw new Error('API health check failed')
  }
}

// Model Info API
export const modelInfoAPI = async () => {
  try {
    const response = await api.get('/models/')
    return response.data
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'Failed to fetch model info')
    } else {
      throw new Error('Backend server is not responding')
    }
  }
}

export default api
