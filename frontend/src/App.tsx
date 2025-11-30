import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import TranslatePage from './pages/TranslatePage'
import AboutPage from './pages/AboutPage'
import { ThemeProvider } from './components/ThemeProvider'
import { GovernmentModeProvider } from './components/GovernmentModeProvider'
import { ImageTranslate } from './components/ImageTranslate'

type Page = 'translate' | 'about' | 'image'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('translate')

  return (
    <ThemeProvider defaultTheme="light">
      <GovernmentModeProvider>
      {/* Light mode: light gradient, Dark mode: dark gradient */}
      <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10">
          <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
          
          <AnimatePresence mode="wait">
            {currentPage === 'translate' ? (
              <motion.div
                key="translate"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TranslatePage />
              </motion.div>
            ) : currentPage === 'image' ? (
              <motion.div
                key="image"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="container mx-auto px-4 py-8 max-w-6xl">
                  <ImageTranslate />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AboutPage />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      </GovernmentModeProvider>
    </ThemeProvider>
  )
}

export default App
