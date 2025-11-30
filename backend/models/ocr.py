from core.utils import logger
import os

# Try to import EasyOCR, fallback if not available
try:
    import easyocr
    reader = easyocr.Reader(['en', 'si', 'ne'], gpu=True)
    OCR_AVAILABLE = True
    logger.info("✅ EasyOCR initialized with Nepali, Sinhala, and English support")
except ImportError:
    OCR_AVAILABLE = False
    reader = None
    logger.warning("⚠️ EasyOCR not installed. OCR features will be limited.")
except Exception as e:
    OCR_AVAILABLE = False
    reader = None
    logger.error(f"Error initializing EasyOCR: {e}")


def extract_text(image_path: str) -> str:
    """
    Extract text from image using OCR.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Extracted text as string
    """
    try:
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
        
        if not OCR_AVAILABLE:
            return "OCR is not available. Please install easyocr: pip install easyocr"
        
        logger.info(f"Processing OCR for: {image_path}")
        
        # Read text from image
        results = reader.readtext(image_path)
        
        # Extract only the text parts
        extracted_text = " ".join([res[1] for res in results])
        
        logger.info(f"OCR completed. Extracted {len(extracted_text)} characters")
        return extracted_text if extracted_text.strip() else "No text detected in image"
        
    except Exception as e:
        logger.error(f"OCR error: {e}")
        raise Exception(f"OCR failed: {str(e)}")


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from PDF (future enhancement).
    
    Args:
        pdf_path: Path to PDF file
        
    Returns:
        Extracted text
    """
    # Placeholder for future PDF support
    raise NotImplementedError("PDF extraction not yet implemented")
