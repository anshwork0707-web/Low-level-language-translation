from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from models.chatbot import chat_with_ai
from core.utils import logger

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


class ChatRequest(BaseModel):
    prompt: str = Field(..., description="User's question or message", min_length=1)
    
    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "How does the translation work?"
            }
        }


class ChatResponse(BaseModel):
    response: str
    prompt: str


@router.post("/", response_model=ChatResponse)
async def chatbot(req: ChatRequest):
    """
    Chat with AI assistant for translation help.
    
    Ask questions about:
    - How translations work
    - Language-specific queries
    - System capabilities
    - Translation explanations
    """
    try:
        logger.info(f"Chatbot query: {req.prompt[:50]}...")
        
        # Get AI response
        reply = chat_with_ai(req.prompt)
        
        return {
            "response": reply,
            "prompt": req.prompt
        }
        
    except Exception as e:
        logger.error(f"Chatbot endpoint error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Chatbot error: {str(e)}"
        )


@router.get("/status")
async def chatbot_status():
    """Check chatbot availability."""
    from models.chatbot import OPENAI_AVAILABLE
    
    return {
        "available": True,
        "mode": "openai" if OPENAI_AVAILABLE else "fallback",
        "message": "Chatbot is operational" if OPENAI_AVAILABLE 
                  else "Using fallback responses (OpenAI not configured)"
    }
