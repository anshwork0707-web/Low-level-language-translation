import { motion } from 'framer-motion'
import { Languages, Info, Moon, Sun, Image, Building2 } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { useGovernmentMode } from './GovernmentModeProvider'

interface NavbarProps {
  currentPage: 'translate' | 'about' | 'image'
  onNavigate: (page: 'translate' | 'about' | 'image') => void
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { theme, setTheme } = useTheme()
  const { governmentMode, toggleGovernmentMode } = useGovernmentMode()

  return (
    <nav className="sticky top-0 z-50 glass-effect border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <Languages className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">ZeroDay1</h1>
              <p className="text-xs text-muted-foreground">Translation System</p>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('translate')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === 'translate'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Languages className="w-4 h-4 inline mr-2" />
              Translate
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('image')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === 'image'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Image className="w-4 h-4 inline mr-2" />
              Image
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('about')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === 'about'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Info className="w-4 h-4 inline mr-2" />
              About
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-all"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </motion.button>

            {/* Government Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleGovernmentMode}
              className={`p-2 rounded-lg transition-all ${
                governmentMode === 'on'
                  ? 'bg-blue-500/20 border-2 border-blue-500'
                  : 'bg-secondary/50 hover:bg-secondary'
              }`}
              title={governmentMode === 'on' ? 'Government Mode: ON' : 'Government Mode: OFF'}
            >
              <Building2 className={`w-5 h-5 ${governmentMode === 'on' ? 'text-blue-500' : 'text-muted-foreground'}`} />
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  )
}
