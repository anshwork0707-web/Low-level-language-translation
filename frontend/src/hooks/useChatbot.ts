import { useMutation } from 'react-query'
import { chatbotAPI } from '../services/api'

export interface ChatRequest {
  message: string
  context?: string
}

export interface ChatResponse {
  reply: string
  suggestions?: string[]
}

export const useChatbot = () => {
  return useMutation<ChatResponse, Error, ChatRequest>(
    async (data) => {
      const response = await chatbotAPI(data)
      return response
    }
  )
}
