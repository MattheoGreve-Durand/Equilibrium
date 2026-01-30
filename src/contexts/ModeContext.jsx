import React, { createContext, useContext, useState } from 'react'

// ModeContext: '2D' or '3D'
const ModeContext = createContext()

export function ModeProvider({ children }) {
  const [mode, setMode] = useState('3D')
  const toggleMode = () => setMode((m) => (m === '2D' ? '3D' : '2D'))

  return (
    <ModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode() {
  const ctx = useContext(ModeContext)
  if (!ctx) throw new Error('useMode must be used within ModeProvider')
  return ctx
}

export default ModeContext
