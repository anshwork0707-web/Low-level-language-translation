import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).parent.parent
MODEL_DIR = BASE_DIR.parent / "models" / "nllb_lora_final"
STATIC_DIR = BASE_DIR / "static"
OUTPUTS_DIR = BASE_DIR / "outputs"

# Create directories if they don't exist
STATIC_DIR.mkdir(exist_ok=True)
OUTPUTS_DIR.mkdir(exist_ok=True)

# Model configuration
MODEL_PATH = str(MODEL_DIR)
BASE_MODEL_NAME = "facebook/nllb-200-distilled-600M"

# Language codes
LANG_CODES = {
    "nepali": "nep_Latn",
    "sinhala": "sin_Latn",
    "english": "eng_Latn"
}

# OpenAI configuration (optional - for chatbot)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Server configuration
HOST = "0.0.0.0"
PORT = 8000
RELOAD = True

# Upload configuration
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB (increased for images/PDFs)
ALLOWED_EXTENSIONS = {
    # Text files
    ".txt", ".csv", ".log",
    # Documents
    ".doc", ".docx", ".pdf", ".odt", ".rtf",
    # Images
    ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".tiff", ".tif",
    # Spreadsheets
    ".xls", ".xlsx",
    # Presentations
    ".ppt", ".pptx",
    # Other
    ".json", ".xml", ".html"
}
