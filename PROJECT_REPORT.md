# SIH Translator Project Report

## 1. Project Summary
This project is a multilingual translation system focused on Nepali/Sinhala to English translation, with OCR, chatbot support, batch translation, and a modern frontend UI. It supports both:
- Python AI backend (FastAPI + NLLB-200 + LoRA)
- Java backend (Spring Boot gateway/demo mode)

## 2. Objectives
- Provide accurate translation for low-resource language pairs.
- Offer a user-friendly interface for text, image, and assisted translation.
- Support demo-ready Java framework integration while preserving AI model quality from Python.

## 3. High-Level Architecture
- Frontend (React + TypeScript + Vite): User interface and API calls.
- Java Backend (Spring Boot): Main framework endpoint layer for presentation/demo and routing.
- Python Backend (FastAPI): Core AI services (translation, OCR, chatbot, model health).
- Model Layer: NLLB-200 distilled model with LoRA adapter.

Request flow:
1. User submits text from frontend.  
2. Frontend calls Java API (port 8080).
3. Java forwards to Python model service (port 8000) when available.
4. Response is returned to frontend.

## 4. Tech Stack
- Frontend: React, TypeScript, Vite, Tailwind CSS, Framer Motion, React Query, Axios
- Python Backend: FastAPI, Transformers, PyTorch, PEFT (LoRA), EasyOCR
- Java Backend: Spring Boot 3, Java 17, Maven
- Data/Assets: CSV datasets and trained LoRA model artifacts

## 5. Core Features
- Single text translation (Nepali/Sinhala/English combinations)
- Batch translation support
- File/image text extraction (OCR)
- Chat assistant panel
- Translation history and export
- Voice input and text-to-speech
- Government mode utilities (glossary/official workflow elements)

## 6. Project Structure (Key Modules)
- frontend/: UI application and components
- backend/: Python AI APIs and model integration
- java-backend/: Spring Boot APIs/gateway
- datasets/: training/evaluation CSV files
- models/nllb_lora_final/: fine-tuned adapter/model config

## 7. Current Working Status
- Frontend runs on port 3000.
- Java backend runs on port 8080.
- Python backend runs on port 8000.
- Long-input translation reliability improved by increasing API/gateway timeouts.
- Java gateway includes fallback mode if Python service is unavailable.

## 8. How to Run
1. Start Python backend (model service):
   - `python -m uvicorn main:app --app-dir backend --host 0.0.0.0 --port 8000`
2. Start Java backend:
   - `mvn spring-boot:run` (inside java-backend)
3. Start frontend:
   - `npm run dev -- --host --port 3000` (inside frontend)

## 9. Risks and Notes
- If Python backend is down, Java may switch to fallback behavior (reduced translation quality vs full model).
- Environment variables (JAVA_HOME/M2_HOME) must be correctly set for Maven run.
- Very long requests may need higher compute time depending on local hardware.

## 10. Conclusion
The project is functional end-to-end with a clear hybrid architecture: Java framework compatibility for presentation/deployment workflows and Python AI backend for model-grade translation performance. It is suitable for demo, evaluation, and iterative feature enhancement.
