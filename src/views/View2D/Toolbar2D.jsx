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

      {/* BOUTON CHARGE REPARTIE */}
      <button 
        className="tool-btn" 
        onClick={() => toggleTool('LOAD')}
      >
        <span className="icon-placeholder"></span>
        {activeTool === 'LOAD' ? 'Annuler' : 'Charge'}
      </button>

      {/* BOUTON ENCASTREMENT */}
      <button 
        className="tool-btn" onClick={() => toggleTool('FIXED')}
      >
        <span className="icon-placeholder"></span>
        {activeTool === 'FIXED' ? 'Annuler' : 'Encast.'}
      </button>

      {/* BOUTON APPUI SIMPLE */}
      <button 
        className="tool-btn" onClick={() => toggleTool('PINNED')}
      >
        <span className="icon-placeholder"></span>
        {activeTool === 'PINNED' ? 'Annuler' : 'Appui S.'}
      </button>

      {/* BOUTON ROULEAU */}
      <button 
        className="tool-btn" onClick={() => toggleTool('ROLLER')}
      >
        <span className="icon-placeholder"></span>
        {activeTool === 'ROLLER' ? 'Annuler' : 'Rouleau'}
      </button>

      <div style={{ 
        width: '1px', 
        backgroundColor: '#cbd5e1', 
        margin: '0 4px', 
        alignSelf: 'stretch' 
      }}></div>

      {/* BOUTON COTATION */}
      <button 
        className="tool-btn" 
        onClick={() => toggleTool('DIMENSION')}
      >
        <span className="icon-placeholder"></span>
        {activeTool === 'DIMENSION' ? 'Annuler' : 'Cotation'}
      </button>

    </div>
  );
}