import React, { useState, useEffect } from 'react';
import './../canvas.css';

/**
 * Menu générique qui dispatch vers le bon sous-menu
 */
export default function SelectionMenu({ selectedObject, type, onUpdate, onDelete, onClose }) {
  if (!selectedObject || !type) return null;

  // On détermine quel contenu afficher selon le type
  const renderContent = () => {
    switch (type) {
      case 'BEAM':
        return <BeamMenu beam={selectedObject} onUpdate={onUpdate} />;
      case 'FORCE':
        return <div>Propriétés de la force (À implémenter)</div>;
      default:
        return <div>Élément inconnu</div>;
    }
  };

  return (
    <div className="selection-menu-container">
      <div className="selection-menu-header">
        <strong>Éditer : {type}</strong>
        <button onClick={onClose} className="selection-menu-close-btn">X</button>
      </div>

      <div className="selection-menu-content">
        {renderContent()}
      </div>

      <div className="selection-menu-footer">
        <button onClick={() => onDelete(selectedObject.id)} className="selection-menu-delete-btn">
          Supprimer
        </button>
        <div className="selection-menu-id-text">ID: {selectedObject.id}</div>
      </div>
    </div>
  );
}

function BeamMenu({ beam, onUpdate }) {
  const dx = beam.x2 - beam.x1;
  const dy = beam.y2 - beam.y1;
  const currentLength = Math.sqrt(dx*dx + dy*dy) / 50;
  
  const [len, setLen] = useState(currentLength.toFixed(2));

  useEffect(() => {
    setLen((Math.sqrt(dx*dx + dy*dy) / 50).toFixed(2));
  }, [beam.x1, beam.y1, beam.x2, beam.y2]);

  const handleLengthChange = (newLengthM) => {
    const L_new = parseFloat(newLengthM);
    if (isNaN(L_new) || L_new <= 0) return;

    const angle = Math.atan2(dy, dx);
    const lengthPx = L_new * 50;

    onUpdate({
      x2: beam.x1 + lengthPx * Math.cos(angle),
      y2: beam.y1 + lengthPx * Math.sin(angle)
    });
    setLen(newLengthM);
  };

  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  return (
    <div className="selection-menu-grid">
      <label className="selection-menu-label">
        Longueur (m):
        <input 
          type="number" step="0.1" 
          value={len} 
          onChange={(e) => handleLengthChange(e.target.value)} 
          className="selection-menu-input"
        />
      </label>

      <label className="selection-menu-label">
        Matériau:
        <select 
          value={beam.material || 'Acier'} 
          onChange={(e) => handleChange('material', e.target.value)}
          className="selection-menu-input"
        >
          <option value="Acier">Acier</option>
          <option value="Bois">Bois</option>
          <option value="PVC">PVC</option>
          <option value="Aluminium">Aluminium</option>
        </select>
      </label>

      <label className="selection-menu-label">
        Forme section:
        <select 
          value={beam.shape || 'Rectangulaire'} 
          onChange={(e) => handleChange('shape', e.target.value)}
          className="selection-menu-input"
        >
          <option value="Rectangulaire">Rectangulaire</option>
          <option value="Circulaire">Circulaire</option>
          <option value="Circulaire vide">Circulaire vide</option>
          <option value="Profile I">Profilé en I</option>
          <option value="Profile T">Profilé en T</option>
        </select>
      </label>

      <label className="selection-menu-label">
        Épaisseur (mm):
        <input 
          type="number" 
          value={beam.thickness || 10} 
          onChange={(e) => handleChange('thickness', parseFloat(e.target.value))} 
          className="selection-menu-input"
        />
      </label>
    </div>
  );
}