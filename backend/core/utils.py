import os
import logging
from pathlib import Path
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def get_file_extension(filename: str) -> str:
    """Get file extension from filename."""
    return Path(filename).suffix.lower()


def is_allowed_file(filename: str, allowed_extensions: set) -> bool:
    """Check if file extension is allowed."""
    return get_file_extension(filename) in allowed_extensions


def generate_temp_filename(original_filename: str) -> str:
    """Generate unique temporary filename."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    ext = get_file_extension(original_filename)
    return f"temp_{timestamp}{ext}"


def cleanup_temp_file(filepath: str):
    """Delete temporary file."""
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            logger.info(f"Cleaned up temp file: {filepath}")
    except Exception as e:
        logger.error(f"Error cleaning up file {filepath}: {e}")


def detect_language(text: str) -> str:
    """
    Simple language detection based on character patterns.
    Returns: 'nepali', 'sinhala', or 'unknown'
    """
    # Nepali Unicode range: \u0900-\u097F
    # Sinhala Unicode range: \u0D80-\u0DFF
    
    nepali_chars = sum(1 for c in text if '\u0900' <= c <= '\u097F')
    sinhala_chars = sum(1 for c in text if '\u0D80' <= c <= '\u0DFF')
    
    if nepali_chars > sinhala_chars:
        return "nepali"
    elif sinhala_chars > 0:
        return "sinhala"
    else:
        return "unknown"


def format_translation_result(
    original: str,
    translation: str,
    source_lang: str,
    target_lang: str = "english"
) -> dict:
    """Format translation result consistently."""
    return {
        "original_text": original,
        "translated_text": translation,
        "source_language": source_lang,
        "target_language": target_lang,
        "timestamp": datetime.now().isoformat()
    }
