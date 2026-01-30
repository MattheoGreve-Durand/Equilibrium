import React, { useState, useEffect } from 'react';
import './../canvas.css';

/**
 * Composant Input avec Validation.
 * Permet d'écrire librement sans déclencher de mise à jour à chaque frappe.
 * La mise à jour se fait au clic sur "OK" ou sur la touche Entrée.
 */
function ValidatedInput({ value, onCommit, type = "number", step, min, max, className, style }) {
  const [localValue, setLocalValue] = useState(value);

  // Synchronise l'état local si la valeur externe change (ex: sélection d'un autre objet)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleCommit = () => {
    if (localValue === "" || localValue === undefined) return;
    onCommit(localValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCommit();
    }
  };

  return (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'center', width: '100%' }}>
      <input
        type={type}
        step={step}
        min={min}
        max={max}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={className}
        style={{ ...style, flex: 1 }} // Prend toute la place dispo
      />
      <button 
        onClick={handleCommit} 
        className="action-btn-secondary"
        style={{ flex: '0 0 auto', padding: '4px 8px', minWidth: '30px', background: '#dcfce7', borderColor: '#86efac', color: '#166534' }}
        title="Valider"
      >
        OK
      </button>
    </div>
  );
}

/**
 * Menu générique qui distribue l'affichage vers le bon sous-menu.
 */
export default function SelectionMenu({ selectedObject, parentObject, type, onUpdate, onDelete, onClose }) {
  if (!selectedObject || !type) return null;

  const renderContent = () => {
    switch (type) {
      case 'BEAM': return <BeamMenu beam={selectedObject} onUpdate={onUpdate} />;
      case 'FORCE': return <ForceMenu force={selectedObject} beam={parentObject} onUpdate={onUpdate} />;
      case 'MEASUREMENT': return <MeasurementMenu measurement={selectedObject} onUpdate={onUpdate} />;
      case 'MOMENT': return <MomentMenu moment={selectedObject} onUpdate={onUpdate} />;
      case 'LOAD': return <LoadMenu load={selectedObject} onUpdate={onUpdate} />;
      case 'ANGLE': return <AngleMenu angle={selectedObject} onUpdate={onUpdate} />;
      case 'FIXED': case 'PINNED': case 'ROLLER': return <SupportMenu support={selectedObject} onUpdate={onUpdate} type={type} />;
      default: return <BeamCoordsMenu object={selectedObject} onUpdate={onUpdate} />; // Fallback pour édition brute coord
    }
  };

  return (
    <div className="selection-menu-container">
      <div className="selection-menu-header">
        <strong>Éditer : {type}</strong>
        <button onClick={onClose} className="selection-menu-close-btn">X</button>
      </div>
      <div className="selection-menu-content">{renderContent()}</div>
      <div className="selection-menu-footer">
        <button onClick={() => onDelete(selectedObject.id)} className="selection-menu-delete-btn">Supprimer</button>
        <div className="selection-menu-id-text">ID: {selectedObject.id}</div>
      </div>
    </div>
  );
}

// --- SOUS-MENUS ---

function BeamMenu({ beam, onUpdate }) {
  const dx = beam.x2 - beam.x1;
  const dy = beam.y2 - beam.y1;
  const currentLength = (Math.sqrt(dx * dx + dy * dy) / 50).toFixed(2);

  const handleLengthCommit = (val) => {
    const L = parseFloat(val);
    if (isNaN(L) || L <= 0) return;
    const angle = Math.atan2(dy, dx);
    onUpdate({ 
      x2: beam.x1 + L * 50 * Math.cos(angle), 
      y2: beam.y1 + L * 50 * Math.sin(angle) 
    });
  };

  const handleUpdate = (field, val) => {
    onUpdate({ [field]: parseFloat(val) });
  };

  return (
    <div className="selection-menu-grid">
      <div style={{ fontWeight: 'bold', color: '#555', borderBottom: '1px solid #eee', paddingBottom: 5, marginBottom: 5 }}>
        Géométrie
      </div>

      <label className="selection-menu-label">
        Longueur (m): 
        <ValidatedInput value={currentLength} onCommit={handleLengthCommit} step="0.1" className="selection-menu-input" />
      </label>

      {/* NOUVEAUX CHAMPS DE PROPRIÉTÉS */}
        <label className="selection-menu-label">
          Hauteur (cm):
          <ValidatedInput value={beam.height || 40} onCommit={(v) => handleUpdate('height', v)} className="selection-menu-input" />
        </label>
        <label className="selection-menu-label">
          Largeur (cm):
          <ValidatedInput value={beam.width || 10} onCommit={(v) => handleUpdate('width', v)} className="selection-menu-input" />
        </label>

      <label className="selection-menu-label">
        Épaisseur (cm):
        <ValidatedInput value={beam.thickness || 1} onCommit={(v) => handleUpdate('thickness', v)} className="selection-menu-input" />
      </label>

      <label className="selection-menu-label">
        Forme Section:
        <select 
          value={beam.shape || 'Rectangulaire'} 
          onChange={(e) => onUpdate({ shape: e.target.value })} 
          className="selection-menu-input"
          style={{ width: '100%' }}
        >
          <option value="Rectangulaire">Rectangulaire</option>
          <option value="Circulaire">Circulaire</option>
          <option value="Profile I">Profilé en I</option>
          <option value="Profile T">Profilé en T</option>
        </select>
      </label>

      <div style={{ fontWeight: 'bold', color: '#555', borderBottom: '1px solid #eee', paddingBottom: 5, marginBottom: 5, marginTop: 10 }}>
        Matériau
      </div>

      <label className="selection-menu-label">Matériau: 
        <select value={beam.material || 'Acier'} onChange={(e) => onUpdate({ material: e.target.value })} className="selection-menu-input" style={{width:'100%'}}>
          <option>Acier</option><option>Bois</option><option>Beton</option>
        </select>
      </label>
    </div>
  );
}

function ForceMenu({ force, beam, onUpdate }) {
  const currentRelAngle = force.angle !== undefined ? force.angle : 90;

  const handleAngleCommit = (inputValue) => {
    let newAngle = parseFloat(inputValue);
    if (isNaN(newAngle)) return;

    if (newAngle < 0) newAngle = 0;
    if (newAngle > 180) newAngle = 180;

    const updates = { angle: parseFloat(newAngle.toFixed(2)) };

    // Snapping aux extrémités si 0 ou 180
   if (beam){
      if (newAngle === 0){
        updates.x = beam.x2;
        updates.y = beam.y2;
      }
      if (newAngle === 180) { 
        updates.x = beam.x1;
        updates.y = beam.y1;
      }
    }
    onUpdate(updates);
  };

  return (
    <div className="selection-menu-grid">
      <label className="selection-menu-label">
        Valeur (N):
        <ValidatedInput value={force.value} onCommit={(v) => onUpdate({ value: parseFloat(v) })} className="selection-menu-input" />
      </label>

      <label className="selection-menu-label">
        Angle relatif (0-180°):
        <ValidatedInput 
          value={currentRelAngle} 
          onCommit={handleAngleCommit} 
          min="0" max="180" 
          className="selection-menu-input" 
        />
        <div style={{display:'flex', gap:2, marginTop:5}}>
          <button onClick={() => handleAngleCommit(90)} className="action-btn-secondary" title="Perpendiculaire">⊥</button>
          <button onClick={() => handleAngleCommit(0)} className="action-btn-secondary" title="Axial Droite">→</button>
          <button onClick={() => handleAngleCommit(180)} className="action-btn-secondary" title="Axial Gauche">←</button>
        </div>
      </label>
    </div>
  );
}

function MeasurementMenu({ measurement, onUpdate }) {
  const rawOffset = measurement.offset || 50;
  const currentSize = Math.abs(rawOffset) / 50;
  const isInverted = rawOffset < 0;

  // Calcul de la longueur actuelle
  const dx = measurement.x2 - measurement.x1;
  const dy = measurement.y2 - measurement.y1;
  const currentLength = (Math.sqrt(dx * dx + dy * dy) / 50).toFixed(2);

  const handleLengthCommit = (val) => {
    const L = parseFloat(val);
    if (isNaN(L) || L <= 0) return;
    const angle = Math.atan2(dy, dx);
    // On déplace le point 2 pour ajuster la longueur
    onUpdate({
      x2: measurement.x1 + L * 50 * Math.cos(angle),
      y2: measurement.y1 + L * 50 * Math.sin(angle)
    });
  };

  const handleCoordCommit = (key, val) => {
    onUpdate({ [key]: parseFloat(val) });
  };

  const handleSizeCommit = (val) => {
    const size = parseFloat(val);
    if (isNaN(size) || size < 0) return;
    const sign = rawOffset < 0 ? -1 : 1;
    onUpdate({ offset: size * 50 * sign });
  };

  return (
    <div className="selection-menu-grid">
      <div style={{ fontWeight: 'bold', color: '#555', borderBottom: '1px solid #eee', paddingBottom: 5, marginBottom: 5 }}>
        Dimensions
      </div>

      <label className="selection-menu-label">
        Longueur (m):
        <ValidatedInput 
          value={currentLength} 
          onCommit={handleLengthCommit} 
          step="0.1" 
          className="selection-menu-input" 
        />
      </label>

      <div style={{ fontWeight: 'bold', color: '#555', borderBottom: '1px solid #eee', paddingBottom: 5, marginBottom: 5, marginTop: 10 }}>
        Apparence
      </div>

      <label className="selection-menu-label">
        Décalage (cases):
        <ValidatedInput 
          value={currentSize} 
          onCommit={handleSizeCommit} 
          step="0.5" min="0.5" 
          className="selection-menu-input" 
        />
        <small className="selection-menu-help-text">Distance de la ligne de cote</small>
      </label>
      
      <button onClick={() => onUpdate({ offset: -rawOffset })} className="action-btn-secondary">
        {isInverted ? '⬆ Passer Au-dessus' : '⬇ Passer En-dessous'}
      </button>
    </div>
  );
}
function MomentMenu({ moment, onUpdate }) {
  return (
    <div className="selection-menu-grid">
      <label className="selection-menu-label">
        Valeur (N.m):
        <ValidatedInput value={moment.value} onCommit={(v) => onUpdate({ value: Math.max(0, parseFloat(v)) })} className="selection-menu-input" />
      </label>
      <button onClick={() => onUpdate({ direction: moment.direction * -1 })} className="action-btn-secondary">Inverser Sens</button>
    </div>
  );
}

function LoadMenu({ load, onUpdate }) {
  return (
    <div className="selection-menu-grid">
      <label className="selection-menu-label">
        Valeur (N/m):
        <ValidatedInput value={load.value} onCommit={(v) => onUpdate({ value: parseFloat(v) })} className="selection-menu-input" />
      </label>
    </div>
  );
}

function SupportMenu({ support, onUpdate, type }) {
  return (
    <div className="selection-menu-grid">
      <label className="selection-menu-label">
        Rotation (°):
        <ValidatedInput value={support.angle || 0} onCommit={(v) => onUpdate({ angle: parseFloat(v) })} className="selection-menu-input" />
      </label>
      <div style={{display:'flex', gap:5}}>
         <button onClick={() => onUpdate({ angle: 0 })} className="action-btn-secondary">0°</button>
         <button onClick={() => onUpdate({ angle: 90 })} className="action-btn-secondary">90°</button>
         <button onClick={() => onUpdate({ angle: -90 })} className="action-btn-secondary">-90°</button>
      </div>
    </div>
  );
}

function AngleMenu({ angle, onUpdate }) {
  const handleApply = (val) => {
    const v = parseFloat(val);
    if (!isNaN(v)) {
      onUpdate({ value: v });
    }
  };

  return (
    <div className="selection-menu-grid">
      <label className="selection-menu-label">
        Définir l'angle (°):
        <ValidatedInput value="" onCommit={handleApply} className="selection-menu-input" />
      </label>
      <div style={{display:'flex', gap:5}}>
        <button onClick={() => onUpdate({ value: 90 })} className="action-btn-secondary">90°</button>
        <button onClick={() => onUpdate({ value: 180 })} className="action-btn-secondary">180°</button>
        <button onClick={() => onUpdate({ value: 45 })} className="action-btn-secondary">45°</button>
      </div>
    </div>
  );
}

// Menu de secours pour éditer les coordonnées brutes si aucun type spécifique
function BeamCoordsMenu({ object, onUpdate }) {
  const isBeam = object.x1 !== undefined;
  if (!isBeam) return <div>Propriétés non éditables.</div>;

  const handleCoord = (key, val) => onUpdate({ [key]: parseFloat(val) });

  return (
    <div className="selection-menu-grid">
      <label>X1: <ValidatedInput value={object.x1} onCommit={(v) => handleCoord('x1', v)} className="selection-menu-input"/></label>
      <label>Y1: <ValidatedInput value={object.y1} onCommit={(v) => handleCoord('y1', v)} className="selection-menu-input"/></label>
      <label>X2: <ValidatedInput value={object.x2} onCommit={(v) => handleCoord('x2', v)} className="selection-menu-input"/></label>
      <label>Y2: <ValidatedInput value={object.y2} onCommit={(v) => handleCoord('y2', v)} className="selection-menu-input"/></label>
    </div>
  );
}