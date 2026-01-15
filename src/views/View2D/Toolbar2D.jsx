import React from 'react';
import { useData2D } from '../../contexts/Data2DContext';

export default function Toolbar2D() {
  // On récupère l'état de l'outil et le setter depuis le contexte
  const { activeTool, setActiveTool } = useData2D();

  /**
   * Fonction utilitaire pour basculer un outil :
   * - Si on clique sur l'outil déjà actif -> on le désactive (null)
   * - Sinon -> on active le nouvel outil
   */
  const toggleTool = (toolName) => {
    if (activeTool === toolName) {
      setActiveTool(null);
    } else {
      setActiveTool(toolName);
    }
  };

  return (
    <div className="toolbar-ribbon">
      
      {/* --- BOUTON POUTRE (BEAM) --- */}
      <button 
        className="tool-btn" 
        onClick={() => toggleTool('BEAM')}
        // Style conditionnel pour montrer que le bouton est enfoncé
        style={{ 
          backgroundColor: activeTool === 'BEAM' ? '#cbd5e1' : '#f3f4f6',
          borderColor: activeTool === 'BEAM' ? '#334155' : '#e5e7eb'
        }}
      >
        <span className="icon-placeholder" style={{ background: '#1e293b' }}></span>
        {activeTool === 'BEAM' ? 'Annuler' : 'Poutre'}
      </button>

      {/* --- BOUTON FORCE (FORCE) --- */}
      <button 
        className="tool-btn" 
        onClick={() => toggleTool('FORCE')}
        style={{ 
          backgroundColor: activeTool === 'FORCE' ? '#cbd5e1' : '#f3f4f6',
          borderColor: activeTool === 'FORCE' ? '#ef4444' : '#e5e7eb'
        }}
      >
        <span className="icon-placeholder" style={{ background: '#ef4444' }}></span>
        Force
      </button>

      {/* --- BOUTON MOMENT (Exemple futur) --- */}
      <button 
        className="tool-btn"
        onClick={() => toggleTool('MOMENT')}
        style={{ 
          backgroundColor: activeTool === 'MOMENT' ? '#cbd5e1' : '#f3f4f6',
          borderColor: activeTool === 'MOMENT' ? '#a855f7' : '#e5e7eb'
        }}
      >
        <span className="icon-placeholder" style={{ background: '#a855f7' }}></span>
        Moment
      </button>

    </div>
  );
}