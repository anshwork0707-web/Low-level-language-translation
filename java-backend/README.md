# SIH Java Backend (Demo Ready)

Spring Boot backend to present this project as a Java implementation.

## What it provides

- `POST /translate/` (frontend-compatible)
- `POST /batch-translate/` (frontend-compatible)
- `POST /chat/` (simple Java demo response)
- `POST /translate/correction` (accepts correction payload)
- `GET /health/`
- `GET /models/`

This is a **Java demo backend** intended for project presentation and viva/demo support.

## Requirements

- Java 17+
- Maven 3.9+

## Run

```bash
cd java-backend
mvn spring-boot:run
```

Server runs at `http://localhost:8080`.

## Connect Frontend

In `frontend/.env`, set:

```env
VITE_API_URL=http://localhost:8080
```

Then run frontend:

```bash
cd frontend
npm install
npm run dev
```

## Sample test

```bash
curl -X POST "http://localhost:8080/translate/" \
  -H "Content-Type: application/json" \
  -d '{"text":"नमस्ते","source_lang":"nepali","target_lang":"english"}'
```
