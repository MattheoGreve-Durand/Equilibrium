import React from 'react'
import { useMode } from '../contexts/ModeContext'

export default function Header() {
  const { mode, toggleMode } = useMode()

  return (
    <header className="app-header">
      <div className="header-left">RDMate</div>
      <div className="header-right">
        <button id = "toggle-mode" onClick={toggleMode} aria-label="Basculer 2D/3D">
          {mode === '2D' ? '3D' : '2D'}
        </button>
      </div>
    </header>
  )
}
