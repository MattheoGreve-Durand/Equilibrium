import React, { useState, useEffect } from 'react';
import './../canvas.css';

/**
 * Menu générique qui distribue l'affichage vers le bon sous-menu 
 * en fonction du type d'objet sélectionné.
 */
export default function SelectionMenu({ selectedObject, parentObject, type, onUpdate, onDelete, onClose }) {
  if (!selectedObject || !type) return null;

  const renderContent = () => {
    switch (type) {
      case 'BEAM':
        return <BeamMenu beam={selectedObject} onUpdate={onUpdate} />;
      case 'FORCE':
        return <ForceMenu force={selectedObject} beam={parentObject} onUpdate={onUpdate} />;
      case 'MEASUREMENT':
        return <MeasurementMenu measurement={selectedObject} onUpdate={onUpdate} />;
      case 'MOMENT':
        return <MomentMenu moment={selectedObject} onUpdate={onUpdate} />;
      case 'LOAD': 
        return <LoadMenu load={selectedObject} onUpdate={onUpdate} />;
      default:
        return <div className="selection-menu-id-text">Propriétés non éditables pour cet élément.</div>;
    }
  };

  return (
    <div className="selection-menu-container">
      <div className="selection-menu-header">
        <strong>Éditer : {type}</strong>
        <button onClick={onClose} className="selection-menu-close-btn" aria-label="Fermer">X</button>
      </div>

      <div className="selection-menu-content">
        {renderContent()}
      </div>

      <div className="selection-menu-footer">
        <button onClick={() => onDelete(selectedObject.id)} className="selection-menu-delete-btn">
          Supprimer l'élément
        </button>
        <div className="selection-menu-id-text">ID: {selectedObject.id}</div>
      </div>
    </div>
  );
}

/** --- SOUS-MENUS SPÉCIFIQUES --- **/

function BeamMenu({ beam, onUpdate }) {
  const dx = beam.x2 - beam.x1;
  const dy = beam.y2 - beam.y1;
  const currentLength = Math.sqrt(dx * dx + dy * dy) / 50;
  
  const [len, setLen] = useState(currentLength.toFixed(2));

  useEffect(() => {
    setLen((Math.sqrt(dx * dx + dy * dy) / 50).toFixed(2));
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
          onChange={(e) => onUpdate({ material: e.target.value })}
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
          onChange={(e) => onUpdate({ shape: e.target.value })}
          className="selection-menu-input"
        >
          <option value="Rectangulaire">Rectangulaire</option>
          <option value="Circulaire">Circulaire</option>
          <option value="Profile I">Profilé en I</option>
          <option value="Profile T">Profilé en T</option>
        </select>
      </label>
    </div>
  );
}

function ForceMenu({ force, beam, onUpdate }) {
  const beamAngle = beam 
    ? (Math.atan2(beam.y2 - beam.y1, beam.x2 - beam.x1) * 180) / Math.PI 
    : 0;

  const currentRelAngle = Math.round((force.angle || 0) - beamAngle);

  const handleAngleChange = (relValue) => {
    const rel = parseFloat(relValue);
    if (isNaN(rel)) return;
    onUpdate({ angle: beamAngle + rel });
  };

  const handleBuckling = (targetNode) => {
    if (!beam) return;
    if (targetNode === 1) {
      onUpdate({ x: beam.x1, y: beam.y1, angle: beamAngle });
    } else {
      onUpdate({ x: beam.x2, y: beam.y2, angle: beamAngle + 180 });
    }
  };

  return (
    <div className="selection-menu-grid">
      <label className="selection-menu-label">
        Valeur (N):
        <input 
          type="number" 
          value={force.value} 
          onChange={(e) => onUpdate({ value: parseFloat(e.target.value) })} 
          className="selection-menu-input"
        />
      </label>

      <label className="selection-menu-label">
        Angle relatif (°):
        <div className="selection-menu-grid" style={{ gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
          <input 
            type="number" 
            value={currentRelAngle} 
            onChange={(e) => handleAngleChange(e.target.value)} 
            className="selection-menu-input"
          />
          <button onClick={() => handleAngleChange(90)} className="action-btn-secondary" title="Perpendiculaire">⊥</button>
        </div>
      </label>

      {beam && (
        <div className="selection-menu-footer">
          <label className="selection-menu-label">Mode Flambement (Nœuds):</label>
          <div className="selection-menu-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <button onClick={() => handleBuckling(1)} className="action-btn-secondary">Nœud 1</button>
            <button onClick={() => handleBuckling(2)} className="action-btn-secondary">Nœud 2</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MeasurementMenu({ measurement, onUpdate }) {
  const rawOffset = measurement.offset !== undefined ? measurement.offset : 50;
  const sizeInCases = Math.abs(rawOffset) / 50;
  const isInverted = rawOffset < 0;

  const handleSizeChange = (val) => {
    const size = parseFloat(val);
    if (isNaN(size) || size < 0) return;
    const sign = rawOffset < 0 ? -1 : 1;
    onUpdate({ offset: size * 50 * sign });
  };

  return (
    <div className="selection-menu-grid">
      <label className="selection-menu-label">
        Hauteur (cases):
        <input 
          type="number" step="0.5" min="0.5"
          value={sizeInCases} 
          onChange={(e) => handleSizeChange(e.target.value)} 
          className="selection-menu-input"
        />
        <small className="selection-menu-help-text">1 case = 50px</small>
      </label>

      <label className="selection-menu-label">
        Position :
        <button onClick={() => onUpdate({ offset: -rawOffset })} className="action-btn-secondary selection-menu-icon-btn">
          <span>{isInverted ? '⬆ Au-dessus' : '⬇ En-dessous'}</span>
          <span>(Inverser)</span>
        </button>
      </label>
    </div>
  );
}

function MomentMenu({ moment, onUpdate }) {
  const isCCW = moment.direction === 1;

  return (
    <div className="selection-menu-grid">
      <label className="selection-menu-label">
        Valeur (N.m):
        <input 
          type="number" min="0"
          value={moment.value} 
          onChange={(e) => onUpdate({ value: Math.max(0, parseFloat(e.target.value) || 0) })} 
          className="selection-menu-input"
        />
        <small className="selection-menu-help-text">Valeur positive uniquement.</small>
      </label>

      <label className="selection-menu-label">
        Sens de rotation :
        <button 
          onClick={() => onUpdate({ direction: moment.direction * -1 })} 
          className="action-btn-secondary selection-menu-icon-btn"
        >
          <span className="selection-menu-icon-large">{isCCW ? '↺' : '↻'}</span>
          <span>{isCCW ? 'Anti-horaire (CCW)' : 'Horaire (CW)'}</span>
        </button>
      </label>
    </div>
  );
}

/**
 * Menu pour les Charges Réparties
 */
function LoadMenu({ load, onUpdate }) {
  const handleValueChange = (val) => {
    let newValue = parseFloat(val);
    if (isNaN(newValue)) return;
    onUpdate({ value: newValue });
  };

  return (
    <div className="selection-menu-grid">
      <label className="selection-menu-label">
        Valeur (N/m):
        <input 
          type="number" 
          value={load.value} 
          onChange={(e) => handleValueChange(e.target.value)} 
          className="selection-menu-input"
        />
        <small className="selection-menu-help-text">
          Positif = Vers la poutre (Pression)<br/>
          Négatif = Vers l'extérieur (Succion)
        </small>
      </label>
    </div>
  );
}