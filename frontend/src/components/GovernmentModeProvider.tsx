import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type GovernmentMode = 'on' | 'off'

interface GovernmentModeContextType {
  governmentMode: GovernmentMode
  setGovernmentMode: (mode: GovernmentMode) => void
  toggleGovernmentMode: () => void
}

const GovernmentModeContext = createContext<GovernmentModeContextType | undefined>(undefined)

export function GovernmentModeProvider({ children }: { children: ReactNode }) {
  const [governmentMode, setGovernmentModeState] = useState<GovernmentMode>(() => {
    // Get from localStorage or default to 'off'
    const saved = localStorage.getItem('governmentMode')
    return (saved as GovernmentMode) || 'off'
  })

  useEffect(() => {
    localStorage.setItem('governmentMode', governmentMode)
  }, [governmentMode])

  const setGovernmentMode = (mode: GovernmentMode) => {
    setGovernmentModeState(mode)
  }

  const toggleGovernmentMode = () => {
    setGovernmentModeState(mode => mode === 'on' ? 'off' : 'on')
  }

  return (
    <GovernmentModeContext.Provider value={{ governmentMode, setGovernmentMode, toggleGovernmentMode }}>
      {children}
    </GovernmentModeContext.Provider>
  )
}

export function useGovernmentMode() {
  const context = useContext(GovernmentModeContext)
  if (context === undefined) {
    throw new Error('useGovernmentMode must be used within a GovernmentModeProvider')
  }
  return context
}
