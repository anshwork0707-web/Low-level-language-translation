from core.config import OPENAI_API_KEY
from core.utils import logger

# Try to import OpenAI, fallback if not available
try:
    from openai import OpenAI
    client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
    OPENAI_AVAILABLE = bool(client)
except ImportError:
    OPENAI_AVAILABLE = False
    client = None
    logger.warning("OpenAI not installed. Chatbot will use fallback responses.")


def chat_with_ai(prompt: str) -> str:
    """
    Chat with AI assistant for translation help.
    
    Args:
        prompt: User's question or request
        
    Returns:
        AI assistant's response
    """
    try:
        if OPENAI_AVAILABLE and client:
            # Use OpenAI GPT
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant for a translation application. "
                                 "You help users with translation queries, explain translations, "
                                 "provide context, and assist with language-related questions "
                                 "for Nepali and Sinhala to English translation."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=500
            )
            return response.choices[0].message.content
        else:
            # Fallback responses when OpenAI is not available
            return get_fallback_response(prompt)
            
    except Exception as e:
        logger.error(f"Chatbot error: {e}")
        return get_fallback_response(prompt)


def get_fallback_response(prompt: str) -> str:
    """
    Provide fallback responses when OpenAI is not available.
    
    Args:
        prompt: User's question
        
    Returns:
        Predefined helpful response
    """
    prompt_lower = prompt.lower()
    
    if "how" in prompt_lower and "work" in prompt_lower:
        return ("This translation system uses a fine-tuned NLLB-200 model with LoRA adapters "
                "to translate Nepali and Sinhala text to English. Simply enter your text, "
                "select the source language, and click translate!")
    
    elif "nepali" in prompt_lower or "sinhala" in prompt_lower:
        return ("I can help you translate Nepali and Sinhala text to English. "
                "Our model has been fine-tuned on thousands of translation pairs "
                "to provide accurate translations. What would you like to translate?")
    
    elif "accuracy" in prompt_lower or "good" in prompt_lower:
        return ("Our translation model achieves a BLEU score of 27.72 with 95% accuracy. "
                "It has been fine-tuned on 576K training samples using LoRA technology "
                "for efficient and accurate translations.")
    
    elif "upload" in prompt_lower or "file" in prompt_lower:
        return ("You can upload text files (.txt) containing Nepali or Sinhala text. "
                "The system will extract the text and translate it for you. "
                "We also support OCR for image-based text extraction.")
    
    elif "help" in prompt_lower or "?" in prompt:
        return ("I'm here to help! You can:\n"
                "1. Translate Nepali/Sinhala text to English\n"
                "2. Upload files for translation\n"
                "3. Ask questions about translations\n"
                "4. Get explanations for specific phrases\n"
                "What would you like to do?")
    
    else:
        return ("I'm an AI assistant for this translation application. "
                "I can help you with translation queries, explain how the system works, "
                "and provide assistance with Nepali and Sinhala to English translations. "
                "How can I help you today?")
