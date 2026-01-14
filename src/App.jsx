import React from 'react'
import { ModeProvider, useMode } from './contexts/ModeContext'
import { Data2DProvider } from './contexts/Data2DContext'
import { Data3DProvider } from './contexts/Data3DContext'
import Layout from './components/Layout'
import Canvas2D from './views/View2D/Canvas2D'
import Toolbar2D from './views/View2D/Toolbar2D'
import Canvas3D from './views/View3D/Canvas3D'
import Toolbar3D from './views/View3D/Toolbar3D'
import './index.css'
import './views/canvas.css' // Import des styles du ruban

function AppContent() {
  const { mode } = useMode()

  return (
    <Layout>
        {/* ZONE DU HAUT : CANVAS */}
        <div className="canvas-area">
          {mode === '2D' ? <Canvas2D /> : <Canvas3D />}
        </div>

        {/* ZONE DU BAS : TOOLBAR (RUBAN) */}
        <div className="toolbar-area">
          {mode === '2D' ? <Toolbar2D /> : <Toolbar3D />}
        </div>
    </Layout>
  )
}

export default function App() {
  return (
    <ModeProvider>
      <Data2DProvider>
        <Data3DProvider>
          <AppContent />
        </Data3DProvider>
      </Data2DProvider>
    </ModeProvider>
  )
}