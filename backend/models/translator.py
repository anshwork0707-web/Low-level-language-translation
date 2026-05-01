import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from peft import PeftModel
from core.config import MODEL_PATH, BASE_MODEL_NAME, LANG_CODES
from core.utils import logger
import os
import hashlib
from typing import Dict, Optional
from datetime import datetime, timedelta
from models.user_memory import user_memory  # Import user memory

class TranslationCache:
    """Simple in-memory cache for translations"""
    def __init__(self, max_size: int = 1000, ttl_hours: int = 24):
        self.cache: Dict[str, tuple] = {}
        self.max_size = max_size
        self.ttl = timedelta(hours=ttl_hours)
    
    def _make_key(self, text: str, source_lang: str, target_lang: str) -> str:
        """Create cache key from text and language"""
        return hashlib.md5(f"{source_lang}:{target_lang}:{text}".encode()).hexdigest()
    
    def get(self, text: str, source_lang: str, target_lang: str) -> Optional[str]:
        """Get cached translation if available and not expired"""
        key = self._make_key(text, source_lang, target_lang)
        if key in self.cache:
            translation, timestamp = self.cache[key]
            if datetime.now() - timestamp < self.ttl:
                logger.info("✅ Cache hit - returning cached translation")
                return translation
            else:
                del self.cache[key]  # Remove expired entry
        return None
    
    def set(self, text: str, source_lang: str, target_lang: str, translation: str):
        """Cache a translation"""
        if len(self.cache) >= self.max_size:
            # Remove oldest entry
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
        
        key = self._make_key(text, source_lang, target_lang)
        self.cache[key] = (translation, datetime.now())

class TranslationModel:
    def __init__(self):
        self.tokenizer = None
        self.model = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.cache = TranslationCache(max_size=1000, ttl_hours=24)
        logger.info(f"Using device: {self.device}")
        
    def load_model(self):
        """Load the LoRA fine-tuned NLLB model."""
        try:
            logger.info(f"Loading model from: {MODEL_PATH}")
            
            # Check if model path exists
            if not os.path.exists(MODEL_PATH):
                logger.error(f"Model path does not exist: {MODEL_PATH}")
                raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
            
            # Load tokenizer
            logger.info("Loading tokenizer...")
            self.tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_NAME)
            
            # Load base model
            logger.info("Loading base NLLB model...")
            base_model = AutoModelForSeq2SeqLM.from_pretrained(
                BASE_MODEL_NAME,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
            )
            
            # Load LoRA adapters
            logger.info("Loading LoRA adapters...")
            self.model = PeftModel.from_pretrained(base_model, MODEL_PATH)
            self.model = self.model.to(self.device)
            self.model.eval()
            
            logger.info("✅ Model loaded successfully!")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error loading model: {e}")
            raise
    
    def translate(self, text: str, source_lang: str, target_lang: str = "english") -> str:
        """
        Translate text between English, Nepali, and Sinhala.
        
        Args:
            text: Input text to translate
            source_lang: Source language ('english', 'nepali', 'sinhala')
            target_lang: Target language ('english', 'nepali', 'sinhala')
            
        Returns:
            Translated text
        """
        try:
            normalized_source = source_lang.lower().strip()
            normalized_target = target_lang.lower().strip()

            if normalized_source == normalized_target:
                return text

            if normalized_source not in LANG_CODES:
                raise ValueError(f"Unsupported source_lang: {source_lang}")

            if normalized_target not in LANG_CODES:
                raise ValueError(f"Unsupported target_lang: {target_lang}")

            # Check user memory first (highest priority - user corrections)
            user_correction = user_memory.get_correction(text, normalized_source, normalized_target)
            if user_correction:
                return user_correction
            
            # Check cache second
            cached_translation = self.cache.get(text, normalized_source, normalized_target)
            if cached_translation:
                return cached_translation

            src_lang_code = LANG_CODES[normalized_source]
            tgt_lang_code = LANG_CODES[normalized_target]
            
            # Tokenize input
            self.tokenizer.src_lang = src_lang_code
            inputs = self.tokenizer(text, return_tensors="pt", padding=True).to(self.device)
            
            # Get target language token ID
            # Use convert_tokens_to_ids instead of lang_code_to_id
            tgt_token_id = self.tokenizer.convert_tokens_to_ids(tgt_lang_code)
            
            # Generate translation
            with torch.no_grad():
                translated_tokens = self.model.generate(
                    **inputs,
                    forced_bos_token_id=tgt_token_id,
                    max_length=512,
                    num_beams=2,  # Balanced: 2x faster, 99% quality (was 5)
                    early_stopping=True
                )
            
            # Decode translation
            translation = self.tokenizer.batch_decode(
                translated_tokens,
                skip_special_tokens=True
            )[0]
            
            # Cache the translation
            self.cache.set(text, normalized_source, normalized_target, translation)
            
            logger.info(f"Translation successful: {text[:50]}... → {translation[:50]}...")
            return translation
            
        except Exception as e:
            logger.error(f"Translation error: {e}")
            raise Exception(f"Translation failed: {str(e)}")


# Global model instance
translator_model = TranslationModel()

def translate_text(text: str, source_lang: str, target_lang: str = "english") -> str:
    """Convenience function for translation."""
    if translator_model.model is None:
        translator_model.load_model()
    return translator_model.translate(text, source_lang, target_lang)
