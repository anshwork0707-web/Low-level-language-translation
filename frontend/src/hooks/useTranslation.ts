import { useMutation } from 'react-query'
import { translateAPI } from '../services/api'

export interface TranslationRequest {
  text: string
  source_language: string
  target_language?: string
}

export interface TranslationResponse {
  translation: string
  original_text: string
  source_language: string
  target_language: string
  timestamp: string
}

export const useTranslation = () => {
  return useMutation<TranslationResponse, Error, TranslationRequest>(
    async (data) => {
      const response = await translateAPI(data)
      return response
    }
  )
}
