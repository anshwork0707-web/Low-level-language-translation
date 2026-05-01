# SIH Multilingual Translation Project

This repository contains a hybrid translation system for low-resource languages, focused on Nepali and Sinhala to English translation. It combines a Python AI backend, a React frontend, and a Java Spring Boot backend for demo, routing, and presentation workflows.

## Overview

The project is designed to support text translation, image OCR, batch processing, chatbot assistance, and demo-friendly routing between the frontend and backends.

### Main components

- `backend/` - FastAPI service for translation, OCR, chatbot, health checks, and model integration
- `frontend/` - React + TypeScript UI for translation and assisted workflows
- `java-backend/` - Spring Boot demo/gateway backend for presentation and routing
- `datasets/` - CSV data used for training and evaluation
- `models/nllb_lora_final/` - Fine-tuned LoRA model artifacts

## Architecture

Typical request flow:

1. User submits text, a file, or an image from the frontend.
2. The frontend sends the request to either the Java backend on port 8080 or the Python backend on port 8000.
3. The backend forwards the request to the translation/model service.
4. The translated result is returned to the UI.

The project supports two backend modes:

- Python AI mode for direct model-backed translation
- Java demo mode for presentation, gateway routing, and fallback behavior

## Features

- Single text translation
- Batch translation
- OCR for image and text extraction
- Chatbot support for translation help
- Translation history and export flows
- Voice input and text-to-speech support in the UI
- Government/official mode utilities such as glossary and stamp-related UI elements

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, Framer Motion, Axios, React Query
- Python backend: FastAPI, Transformers, PyTorch, PEFT, EasyOCR
- Java backend: Spring Boot 3, Java 17, Maven
- Data and models: CSV datasets and LoRA-enhanced NLLB model artifacts

## Repository Structure

```text
.
├── backend/                 # FastAPI application and model logic
├── frontend/                # React UI
├── java-backend/            # Spring Boot backend
├── datasets/                # Training and evaluation data
├── models/                  # Model artifacts
├── PROJECT_REPORT.md        # Project summary and notes
└── README.md                # This file
```

## Prerequisites

Make sure the following tools are installed:

- Python 3.10+
- Node.js 18+
- npm
- Java 17+
- Maven 3.9+

## Quick Start

### 1. Python backend

From the project root:

```bash
python -m uvicorn main:app --app-dir backend --host 0.0.0.0 --port 8000
```

Backend documentation and endpoint details are in [backend/README.md](backend/README.md).

### 2. Java backend

```bash
cd java-backend
mvn spring-boot:run
```

This backend is intended for demo and gateway support. See [java-backend/README.md](java-backend/README.md) for the Java-specific setup.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend README is here: [frontend/README.md](frontend/README.md).

## Frontend Scripts

The frontend package includes these useful scripts:

- `npm run dev` - start the Vite development server
- `npm run build` - build for production
- `npm run preview` - preview the production build
- `npm run test` - run Jest tests
- `npm run lint` - run ESLint
- `npm run format` - format source files with Prettier

## Environment Configuration

### Frontend API URL

If you want the frontend to use the Java backend, copy `frontend/.env.java.example` to `frontend/.env` and set:

```env
VITE_API_URL=http://localhost:8080
```

If you want it to use the Python backend directly, set:

```env
VITE_API_URL=http://localhost:8000
```

### Python backend dependencies

Install dependencies from `backend/requirements.txt`:

```bash
pip install -r backend/requirements.txt
```

## Core APIs

The Python backend exposes translation, OCR, chatbot, and health endpoints. See [backend/README.md](backend/README.md) for the full list.

The Java backend exposes demo and gateway endpoints such as:

- `POST /translate/`
- `POST /batch-translate/`
- `POST /chat/`
- `POST /translate/correction`
- `GET /health/`
- `GET /models/`

## Model and Data

- Base model: `facebook/nllb-200-distilled-600M`
- Enhancement: LoRA fine-tuning
- Supported languages: Nepali, Sinhala, and English workflows
- Data files live under `datasets/`
- Fine-tuned adapter and tokenizer artifacts live in `models/nllb_lora_final/`

## Current Status

- Frontend runs on port 3000
- Java backend runs on port 8080
- Python backend runs on port 8000
- Java gateway includes fallback behavior if the Python service is unavailable
- Longer translation requests may need more compute time depending on the machine

## Troubleshooting

- If the Python backend cannot load the model, check the path in `backend/core/config.py`
- If Maven fails, verify `JAVA_HOME` and `mvn` are installed and available in PATH
- If OCR fails, make sure the required Python packages from `backend/requirements.txt` are installed
- If the frontend points to the wrong backend, verify `frontend/.env`

## Related Documentation

- [Project report](PROJECT_REPORT.md)
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Java backend README](java-backend/README.md)

## Notes

- `.venv/` is ignored so local Python environments do not get pushed to Git.
- `java-backend/target/` is ignored so compiled Java outputs stay out of commits.
- Large dataset files may trigger GitHub size warnings.
- The repository is set up to support both direct Python model usage and Java demo-mode routing.