import React from 'react';
import { useData2D } from '../../contexts/Data2DContext';

export default function Toolbar2D() {
  const { activeTool, setActiveTool } = useData2D();

  const toggleTool = (toolName) => {
    if (activeTool === toolName) {
      setActiveTool(null);
    } else {
      setActiveTool(toolName);
    }
  };

  return (
    <div className="toolbar-ribbon">
      
      {/* BOUTON POUTRE */}
      <button 
        className="tool-btn" 
        onClick={() => toggleTool('BEAM')}        
      >
        <span className="icon-placeholder"></span>
        {activeTool === 'BEAM' ? 'Annuler' : 'Poutre'}
      </button>

      {/* BOUTON FORCE */}
      <button 
        className="tool-btn" 
        onClick={() => toggleTool('FORCE')}
      >
      <span className="icon-placeholder"></span>
        {activeTool === 'FORCE' ? 'Annuler' : 'Force'}
      </button>

      {/* BOUTON MOMENT */}
      <button 
        className="tool-btn"
        onClick={() => toggleTool('MOMENT')}
      >
      <span className="icon-placeholder"></span>
        {activeTool === 'MOMENT' ? 'Annuler' : 'Moment'}
      </button>

      {/* BOUTON COTATION */}
      <button 
        className="tool-btn" 
        onClick={() => toggleTool('DIMENSION')}
      >
        <span className="icon-placeholder"></span>
        {activeTool === 'DIMENSION' ? 'Annuler' : 'Cotation'}
      </button>

      {/* BOUTON CHARGE REPARTIE */}
      <button 
        className="tool-btn" 
        onClick={() => toggleTool('LOAD')}
      >
        <span className="icon-placeholder"></span>
        {activeTool === 'LOAD' ? 'Annuler' : 'Charge'}
      </button>

    </div>
  );
}