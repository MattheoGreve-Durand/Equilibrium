import React from 'react';
import '../canvas.css';
import { useData3D } from '../../contexts/Data3DContext';

export default function Toolbar3D() {
  const { activeTool, setActiveTool } = useData3D();

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
        className={`tool-btn ${activeTool === 'BEAM' ? 'active' : ''}`} // Ajout classe active visuelle
        onClick={() => toggleTool('BEAM')}
        title="Créer une Poutre"
      >
        {activeTool === 'BEAM' ? 'Annuler' : 'Poutre'}
      </button>

      {/* BOUTON FORCE (ACTIVÉ) */}
      <button 
        className={`tool-btn ${activeTool === 'FORCE' ? 'active' : ''}`}
        onClick={() => toggleTool('FORCE')}
        title="Ajouter une Force"
      >
        {activeTool === 'FORCE' ? 'Annuler' : 'Force'}
      </button>

       {/* BOUTON APPUI (Placeholder) */}
       <button 
        className="tool-btn" 
        onClick={() => toggleTool('SUPPORT')}
        style={{ opacity: 0.5, cursor: 'not-allowed' }}
        title="Bientôt disponible"
      >
        {activeTool === 'SUPPORT' ? 'Annuler' : 'Appui'}
      </button>
    </div>
  );
}