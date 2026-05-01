from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from models.translator import translate_text
from models.user_memory import user_memory
from core.utils import format_translation_result, logger

router = APIRouter(prefix="/translate", tags=["Translation"])


class TranslateRequest(BaseModel):
    text: str = Field(..., description="Text to translate", min_length=1)
    source_lang: str = Field(..., description="Source language: 'english', 'nepali', or 'sinhala'")
    target_lang: str = Field(default="english", description="Target language: 'english', 'nepali', or 'sinhala'")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "नमस्ते",
                "source_lang": "nepali",
                "target_lang": "english"
            }
        }


class TranslateResponse(BaseModel):
    translation: str
    original_text: str
    source_language: str
    target_language: str
    timestamp: str


@router.post("/", response_model=TranslateResponse)
async def translate(req: TranslateRequest):
    """
    Translate between English, Nepali, and Sinhala.
    
    - **text**: Text to translate (required)
    - **source_lang**: Source language - 'english', 'nepali', or 'sinhala' (required)
    - **target_lang**: Target language - 'english', 'nepali', or 'sinhala' (optional, default='english')
    """
    try:
        logger.info(f"Translation request: {req.source_lang} → {req.target_lang}")
        
        valid_languages = {"english", "nepali", "sinhala", "sinhalese"}
        source_lang = req.source_lang.lower().strip()
        target_lang = req.target_lang.lower().strip()
        if source_lang == "sinhalese":
            source_lang = "sinhala"
        if target_lang == "sinhalese":
            target_lang = "sinhala"

        # Validate languages
        if source_lang not in valid_languages or target_lang not in valid_languages:
            raise HTTPException(
                status_code=400,
                detail="source_lang and target_lang must be one of: english, nepali, sinhala"
            )
        if source_lang == target_lang:
            raise HTTPException(status_code=400, detail="source_lang and target_lang cannot be the same")
        
        # Perform translation
        translation = translate_text(req.text, source_lang, target_lang)
        
        # Format response
        result = format_translation_result(
            original=req.text,
            translation=translation,
            source_lang=source_lang,
            target_lang=target_lang
        )
        
        return {
            "translation": translation,
            **result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Translation endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")


@router.post("/batch")
async def batch_translate(texts: list[str], source_lang: str, target_lang: str = "english"):
    """
    Translate multiple texts in batch.
    
    - **texts**: List of texts to translate
    - **source_lang**: Source language for all texts
    - **target_lang**: Target language for all texts
    """
    try:
        logger.info(f"Batch translation: {len(texts)} texts")
        
        translations = []
        for text in texts:
            translation = translate_text(text, source_lang, target_lang)
            translations.append({
                "original": text,
                "translation": translation
            })
        
        return {
            "translations": translations,
            "count": len(translations),
            "source_language": source_lang,
            "target_language": target_lang
        }
        
    except Exception as e:
        logger.error(f"Batch translation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class CorrectionRequest(BaseModel):
    original_text: str = Field(..., description="Original source text")
    ai_translation: str = Field(..., description="AI's translation")
    user_correction: str = Field(..., description="User's corrected translation")
    source_lang: str = Field(..., description="Source language")
    target_lang: str = Field(default="english", description="Target language")
    
    class Config:
        json_schema_extra = {
            "example": {
                "original_text": "नमस्ते",
                "ai_translation": "Hello",
                "user_correction": "Namaste",
                "source_lang": "nepali"
            }
        }


@router.post("/correction")
async def submit_correction(req: CorrectionRequest):
    """
    Submit a user correction for a translation.
    The system will "learn" from this and use it in future translations.
    
    - **original_text**: The original source text
    - **ai_translation**: What the AI translated
    - **user_correction**: The correct translation according to the user
    - **source_lang**: Source language
    """
    try:
        user_memory.add_correction(
            text=req.original_text,
            ai_translation=req.ai_translation,
            user_correction=req.user_correction,
            source_lang=req.source_lang,
            target_lang=req.target_lang
        )
        
        logger.info(f"✅ User correction saved: '{req.original_text[:30]}...' → '{req.user_correction[:30]}...'")
        
        return {
            "status": "success",
            "message": "Correction saved! The system has learned from your feedback.",
            "stats": user_memory.get_stats()
        }
        
    except Exception as e:
        logger.error(f"Failed to save correction: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/memory/stats")
async def get_memory_stats():
    """Get statistics about user corrections"""
    return user_memory.get_stats()
