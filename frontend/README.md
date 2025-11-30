# SIH 2025 - Multilingual Translation Frontend

🌐 **Modern React + TypeScript Translation Interface**

AI-powered translation application for Nepali and Sinhala to English using LoRA fine-tuned NLLB-200 model.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on `localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:3000`

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Navbar.tsx      # Navigation bar
│   │   ├── TranslationBox.tsx  # Main translation interface
│   │   ├── ChatbotPanel.tsx    # AI assistant chat
│   │   ├── FileUpload.tsx      # File upload component
│   │   ├── HistoryList.tsx     # Translation history
│   │   └── ThemeProvider.tsx   # Theme context
│   │
│   ├── pages/               # Page components
│   │   ├── TranslatePage.tsx   # Main translation page
│   │   └── AboutPage.tsx       # About/info page
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useTranslation.ts   # Translation API hook
│   │   └── useChatbot.ts       # Chatbot API hook
│   │
│   ├── services/            # API services
│   │   └── api.ts          # API client & endpoints
│   │
│   ├── utils/               # Utility functions
│   │   └── helpers.ts      # Helper functions
│   │
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
│
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## ✨ Features

### Core Translation
- ✅ Real-time Nepali/Sinhala → English translation
- ✅ GPU-accelerated backend (NLLB-200 + LoRA)
- ✅ Character counter and input validation
- ✅ Sample sentences for quick testing
- ✅ Copy-to-clipboard functionality

### AI Chatbot Assistant
- ✅ Context-aware conversation
- ✅ Translation explanations
- ✅ Alternative suggestions (formal/casual)
- ✅ Quick action buttons
- ✅ Minimizable chat panel

### File Upload
- ✅ Support for .txt files
- ✅ Text extraction and preview
- ✅ File size validation (5MB max)
- ✅ Drag-and-drop interface

### History Management
- ✅ Local storage of translations
- ✅ Timestamp and language tracking
- ✅ Quick re-selection
- ✅ Delete individual or clear all

### UI/UX
- ✅ Beautiful glass-morphism design
- ✅ Dark/light theme toggle
- ✅ Smooth animations (Framer Motion)
- ✅ Fully responsive (mobile-first)
- ✅ Loading states and error handling
- ✅ Toast notifications

---

## 🎨 Technology Stack

### Frontend Framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server

### Styling
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animations
- **Lucide React** - Beautiful icons

### State Management
- **React Query** - Server state & caching
- **React Context** - Theme management

### API Integration
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

---

## 🔌 API Integration

### Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:8000/api
```

### API Endpoints Used

```typescript
POST /api/translate          # Single translation
POST /api/batch-translate    # Batch translation
POST /api/chat              # Chatbot interaction
GET  /api/health            # Health check
GET  /api/models            # Model information
```

### Example API Call

```typescript
import { translateAPI } from './services/api'

const result = await translateAPI({
  text: "नमस्ते",
  source_language: "nepali"
})

// Response:
// {
//   original_text: "नमस्ते",
//   translated_text: "Hello",
//   source_language: "nepali",
//   target_language: "english",
//   model: "NLLB-200 + LoRA"
// }
```

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## 🏗️ Building for Production

```bash
# Create optimized build
npm run build

# Preview production build locally
npm run preview

# The build output will be in /dist
```

---

## 🐛 Troubleshooting

### Backend Connection Issues

If you see "Backend server is not responding":

1. Ensure backend is running: `cd ../backend && uvicorn app:app --reload`
2. Check API URL in `.env` file
3. Verify CORS is enabled in backend

### Development Server Won't Start

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Type check
npm run type-check

# Lint code
npm run lint
```

---

## 📱 Responsive Breakpoints

- **Mobile**: 360px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

---

## 🎯 Component Usage

### Translation Box

```tsx
<TranslationBox
  onTranslationComplete={(original, translated, lang) => {
    console.log('Translation:', translated)
  }}
  onOpenChatbot={() => setChatbotOpen(true)}
/>
```

### Chatbot Panel

```tsx
<ChatbotPanel
  isOpen={isChatbotOpen}
  onClose={() => setIsChatbotOpen(false)}
  translationContext={{
    original: "नमस्ते",
    translated: "Hello",
    sourceLang: "nepali"
  }}
/>
```

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Netlify

```bash
# Build command
npm run build

# Publish directory
dist
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## 🔧 Configuration

### Tailwind Theme

Edit `tailwind.config.js` to customize:
- Colors
- Spacing
- Animations
- Breakpoints

### Vite Config

Edit `vite.config.ts` for:
- Build options
- Dev server settings
- Proxy configuration

---

## 📊 Performance

- **Lighthouse Score**: 95+
- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 2s
- **Bundle Size**: ~200KB (gzipped)

---

## 👥 Team

**SIH 2025 - Problem ID: SIH25240**  
Team: ZeroDay1  
Frontend Developers: 2 Members

---

## 📄 License

This project was developed for Smart India Hackathon 2025.

---

## 🙏 Acknowledgments

- **Meta AI** - NLLB-200 model
- **Hugging Face** - Transformers library
- **Tailwind Labs** - Tailwind CSS
- **Vercel** - Hosting platform

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**

For backend documentation, see `../backend/README.md`
