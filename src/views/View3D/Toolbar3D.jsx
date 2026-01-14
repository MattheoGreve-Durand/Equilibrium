import React from 'react'
import { useData3D } from '../../contexts/Data3DContext'

export default function Toolbar3D() {
  const { addObject } = useData3D()

  return (
    <div className="toolbar-ribbon">
      <button className="tool-btn" onClick={() => addObject({ type: 'beam', x: 0, y: 1, z: 0 })}>
        <span className="icon-placeholder" style={{background: '#64748b'}}></span>
        Ajouter Poutre 3D
      </button>
      
      <button className="tool-btn" onClick={() => alert('Feature à venir')}>
        <span className="icon-placeholder" style={{background: '#f59e0b'}}></span>
        Analyse FEM
      </button>
    </div>
  )
}