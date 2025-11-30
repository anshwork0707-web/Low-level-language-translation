from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import translate, ocr, chatbot, health
from models.translator import translator_model
from core.utils import logger

app = FastAPI(title="SIH Translation API", version="1.0.0")

# CORS Middleware for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to load the model
@app.on_event("startup")
async def startup_event():
    """Load the translation model on startup."""
    try:
        logger.info("🚀 Starting up application...")
        logger.info("📦 Loading LoRA translation model...")
        translator_model.load_model()
        logger.info("✅ Model loaded successfully!")
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        raise

# Include all routers
app.include_router(translate.router)
app.include_router(ocr.router)
app.include_router(chatbot.router)
app.include_router(health.router)

@app.get("/")
def home():
    return {
        "status": "OK",
        "message": "Welcome to SIH Translator API",
        "version": "1.0.0",
        "endpoints": {
            "translate": "/translate/",
            "ocr": "/ocr/",
            "chatbot": "/chatbot/",
            "health": "/health/",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
