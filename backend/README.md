# SIH Translation API - Backend

FastAPI backend for Nepali/Sinhala to English translation with LoRA-enhanced NLLB-200 model.

## 🚀 Features

- **Translation**: Nepali/Sinhala → English using fine-tuned NLLB-200 + LoRA
- **OCR**: Text extraction from images (EasyOCR)
- **Chatbot**: AI assistant for translation help
- **Batch Processing**: Translate multiple texts at once
- **File Upload**: Support for .txt and image files

## 📁 Structure

```
backend/
├── main.py              # FastAPI entry point
├── requirements.txt     # Python dependencies
├── core/
│   ├── config.py       # Configuration
│   └── utils.py        # Helper functions
├── models/
│   ├── translator.py   # Translation logic
│   ├── chatbot.py      # Chatbot integration
│   └── ocr.py          # OCR processing
├── routes/
│   ├── translate.py    # Translation endpoints
│   ├── ocr.py          # OCR endpoints
│   ├── chatbot.py      # Chatbot endpoints
│   └── health.py       # Health check
├── static/             # Temporary file storage
└── outputs/            # Logs and results
```

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment (optional):**
   ```bash
   cp .env.example .env
   # Edit .env with your OpenAI API key if using chatbot
   ```

3. **Run the server:**
   ```bash
   uvicorn main:app --reload
   ```

   Or use Python directly:
   ```bash
   python main.py
   ```

## 📡 API Endpoints

### Base URL: `http://localhost:8000`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Home / API info |
| `/docs` | GET | Swagger documentation |
| `/translate/` | POST | Translate text |
| `/translate/batch` | POST | Batch translation |
| `/ocr/` | POST | Extract text from image |
| `/ocr/text-file` | POST | Extract text from .txt file |
| `/chatbot/` | POST | Chat with AI assistant |
| `/chatbot/status` | GET | Check chatbot status |
| `/health/` | GET | Health check |
| `/health/model` | GET | Model status |
| `/health/features` | GET | Feature status |

## 📝 Usage Examples

### Translation
```bash
curl -X POST "http://localhost:8000/translate/" \
  -H "Content-Type: application/json" \
  -d '{"text": "नमस्ते", "source_lang": "nepali"}'
```

### OCR (Image)
```bash
curl -X POST "http://localhost:8000/ocr/" \
  -F "file=@image.jpg"
```

### Chatbot
```bash
curl -X POST "http://localhost:8000/chatbot/" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "How does translation work?"}'
```

## 🔧 Configuration

Edit `core/config.py` to customize:
- Model paths
- Upload limits
- Language codes
- Server settings

## 📊 Model Information

- **Base Model**: facebook/nllb-200-distilled-600M
- **Enhancement**: LoRA fine-tuning
- **Training Data**: 576K samples
- **BLEU Score**: 27.72
- **Accuracy**: 95%
- **Languages**: Nepali, Sinhala → English

## 🐛 Troubleshooting

**Model not found:**
```bash
# Check model path in core/config.py
# Default: ../models/nllb_lora_final
```

**CUDA not available:**
```bash
# Model will automatically use CPU
# Check with: python -c "import torch; print(torch.cuda.is_available())"
```

**OCR errors:**
```bash
pip install easyocr
```

## 📦 Dependencies

Main packages:
- FastAPI
- Transformers
- PyTorch
- PEFT (LoRA)
- EasyOCR
- OpenAI (optional)

See `requirements.txt` for complete list.

## 🌐 CORS

CORS is configured to allow all origins for development.
For production, update `main.py` to restrict origins.

## 📖 API Documentation

Interactive docs available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

**Built for SIH 2025** 🇮🇳
