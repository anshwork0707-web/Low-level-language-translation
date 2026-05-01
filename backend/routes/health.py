from fastapi import APIRouter
from models.translator import translator_model
from models.chatbot import OPENAI_AVAILABLE
from models.ocr import OCR_AVAILABLE
import torch

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("/")
async def health_check():
    """
    Health check endpoint to verify API status.
    """
    return {
        "status": "healthy",
        "message": "API is running",
        "version": "1.0.0"
    }


@router.get("/model")
async def model_status():
    """
    Check translation model status and capabilities.
    """
    model_loaded = translator_model.model is not None
    
    return {
        "model_loaded": model_loaded,
        "device": translator_model.device if model_loaded else "not loaded",
        "cuda_available": torch.cuda.is_available(),
        "model_type": "NLLB-200 + LoRA",
        "supported_languages": ["english", "nepali", "sinhala"],
        "target_languages": ["english", "nepali", "sinhala"]
    }


@router.get("/features")
async def feature_status():
    """
    Check status of all features.
    """
    return {
        "translation": {
            "available": translator_model.model is not None,
            "model": "NLLB-200 with LoRA adapters",
            "languages": ["English ↔ Nepali", "English ↔ Sinhala", "Nepali ↔ Sinhala"]
        },
        "ocr": {
            "available": OCR_AVAILABLE,
            "supported_formats": [".jpg", ".jpeg", ".png"],
            "languages": ["Nepali", "Sinhala", "English"]
        },
        "chatbot": {
            "available": True,
            "mode": "openai" if OPENAI_AVAILABLE else "fallback"
        }
    }
