import React from 'react';
import { Layer, Line, Circle, Group, Arrow, Text } from 'react-konva';

/**
 * Composant regroupant les éléments de décor et de repère.
 */
export function Grid({ dimensions, gridSize = 50 }) {
  const gridLines = [];
  
  if (dimensions.width > 0 && dimensions.height > 0) {
    for (let i = 0; i <= dimensions.width; i += gridSize) {
      gridLines.push(
        <Line key={`v-${i}`} points={[i, 0, i, dimensions.height]} stroke="#e2e8f0" strokeWidth={1} />
      );
    }
    for (let j = 0; j <= dimensions.height; j += gridSize) {
      gridLines.push(
        <Line key={`h-${j}`} points={[0, j, dimensions.width, j]} stroke="#e2e8f0" strokeWidth={1} />
      );
    }
  }

  return <Layer>{gridLines}</Layer>;
}

export function Gizmo({ dimensions, gridSize = 50 }) {
  const axisLength = 50;
  const margin = 60;

  const originX = Math.round(margin / gridSize) * gridSize;
  const originY = Math.floor((dimensions.height - margin) / gridSize) * gridSize;

  if (dimensions.height <= 0) return null;

  return (
    <Group x={originX} y={originY} draggable>
      <Arrow points={[0, 0, axisLength, 0]} stroke="red" strokeWidth={2} pointerLength={6} pointerWidth={6} />
      <Text x={axisLength + 5} y={-5} text="X" fill="red" fontStyle="bold" />

      <Arrow points={[0, 0, 0, -axisLength]} stroke="green" strokeWidth={2} pointerLength={6} pointerWidth={6} />
      <Text x={-5} y={-axisLength - 15} text="Y" fill="green" fontStyle="bold" />
      
      <Circle radius={3} fill="#1f2937" />
    </Group>
  );
}

export function ReferenceLines({ dimensions, gridSize = 50 }) {
  const axisLength = 50;
  const margin = 60;

  const originX = Math.round(margin / gridSize) * gridSize;
  const originY = Math.floor((dimensions.height - margin) / gridSize) * gridSize;

  if (dimensions.height <= 0) return null;
  return (
    <Group x={originX + gridSize*2} y={originY}>
        <Line points={[0, 0, gridSize, 0]} stroke="#64748b" strokeWidth={2} />
        <Line points={[0, -3, 0, 3]} stroke="#64748b" strokeWidth={2} />
        <Line points={[gridSize, -3, gridSize, 3]} stroke="#64748b" strokeWidth={2} />
        <Text x={0} y={8} width={gridSize} align="center" text="1 m" fill="#64748b" fontSize={10} fontStyle="italic" />
      </Group>
  );
}

/**
 * Panneau d'information HTML (Overlay)
 */
export function InfoPanel() {
  return (
    <div style={{
      position: 'absolute',
      top: 10,
      left: 10,
      zIndex: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: '10px',
      borderRadius: '6px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      fontFamily: 'sans-serif',
      fontSize: '12px',
      color: '#334155',
      pointerEvents: 'none', // Permet de cliquer à travers le panneau
      userSelect: 'none'
    }}>
      <h4 style={{ margin: '0 0 5px 0', textDecoration: 'underline' }}>Aide & Raccourcis</h4>
      <ul style={{ margin: 0, paddingLeft: '15px' }}>
        <li><strong>Shift + Clic</strong> : Activer l'aimantation (Grid Snap)</li>
        <li><strong>Molette</strong> : (À venir) Zoom/Pan</li>
      </ul>
    </div>
  );
}

/**
 * Panneau d'état de l'outil actif (Overlay en bas à droite).
 * @param {string} activeTool - Le nom de l'outil sélectionné.
 * @param {string} helpText - Le texte d'instruction de l'outil.
 */
export function ToolStatusPanel({ activeTool, helpText }) {
  if (!activeTool) return null;

  return (
    <div style={{
      position: 'absolute', 
      bottom: 10, 
      right: 10, 
      background: '#fff', 
      padding: '8px 12px', 
      borderRadius: 4, 
      zIndex: 10, 
      fontSize: 12, 
      border: '2px solid #3b82f6', 
      fontWeight: 'bold', 
      color: '#1e293b',
      pointerEvents: 'none', // Pour ne pas bloquer les clics sur le canvas
      userSelect: 'none'
    }}>
      Outil : {activeTool} <br/>
      <span style={{ fontWeight: 'normal', color: '#64748b' }}>
        {helpText}
      </span>
    </div>
  );
}

/**
 * Menu d'édition pour l'objet sélectionné
 * @param {Object} selectedObject - L'objet complet (ex: la poutre)
 * @param {Function} onUpdate - Fonction pour sauvegarder les modifs
 * @param {Function} onClose - Fonction pour fermer/désélectionner
 */
export function SelectionMenu({ selectedObject, onUpdate, onClose }) {
  if (!selectedObject) return null;

  // On vérifie si c'est une poutre (elle a x1 et x2)
  const isBeam = selectedObject.x1 !== undefined;

  // Handler générique pour les inputs numériques
  const handleChange = (e, field) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onUpdate(selectedObject.id, { [field]: val });
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: 60, // En dessous du Header ou un peu plus bas
      right: 10,
      width: 200,
      backgroundColor: 'white',
      border: '2px solid orange', // Rappel de la sélection
      borderRadius: 8,
      padding: 15,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      fontFamily: 'sans-serif',
      fontSize: '13px',
      color: '#333',
      zIndex: 20
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <strong>Modifier {isBeam ? 'Poutre' : 'Objet'}</strong>
        <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight:'bold' }}>X</button>
      </div>

      {isBeam && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label>
            X1: <br/>
            <input 
              type="number" 
              value={selectedObject.x1} 
              onChange={(e) => handleChange(e, 'x1')} 
              style={{ width: '100%' }} 
            />
          </label>
          <label>
            Y1: <br/>
            <input 
              type="number" 
              value={selectedObject.y1} 
              onChange={(e) => handleChange(e, 'y1')} 
              style={{ width: '100%' }} 
            />
          </label>
          <label>
            X2: <br/>
            <input 
              type="number" 
              value={selectedObject.x2} 
              onChange={(e) => handleChange(e, 'x2')} 
              style={{ width: '100%' }} 
            />
          </label>
          <label>
            Y2: <br/>
            <input 
              type="number" 
              value={selectedObject.y2} 
              onChange={(e) => handleChange(e, 'y2')} 
              style={{ width: '100%' }} 
            />
          </label>
        </div>
      )}
      
      {!isBeam && <div>Propriétés non éditables pour le moment.</div>}

      <div style={{ marginTop: 10, fontSize: '11px', color: '#666' }}>
        ID: {selectedObject.id}
      </div>
    </div>
  );
}