import React from 'react'
import { useData2D } from '../../contexts/Data2DContext'

export default function Toolbar2D() {
  const { addBeam, addForce } = useData2D()

  return (
    <div className="toolbar-ribbon">
      <button className="tool-btn" onClick={() => addBeam({ x1: 50, y1: 150, x2: 350, y2: 150 })}>
        <span className="icon-placeholder" style={{background: '#1e293b'}}></span>
        Ajouter Poutre
      </button>
      
      <button className="tool-btn" onClick={() => addForce({ x: 100, y: 150, magnitude: 10 })}>
        <span className="icon-placeholder" style={{background: '#ef4444'}}></span>
        Ajouter Force
      </button>
    </div>
  )
}