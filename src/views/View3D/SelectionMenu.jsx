import React, { useState, useEffect } from 'react';
import '../canvas.css'; // On partage le CSS avec la vue 2D
import * as THREE from 'three';

/**
 * Composant Input avec Validation (Copie conforme de la version 2D)
 */
function ValidatedInput({ value, onCommit, type = "number", step, min, max, className, style }) {
  const [localValue, setLocalValue] = useState(value !== undefined ? value : "");

  useEffect(() => {
    setLocalValue(value !== undefined ? value : "");
  }, [value]);

  const handleCommit = () => {
    if (localValue === "" || localValue === undefined) return;
    onCommit(localValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCommit();
  };

  return (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'center', width: '100%' }}>
      <input
        type={type} step={step} min={min} max={max}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={className}
        style={{ ...style, flex: 1 }}
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
 * Menu Principal de Sélection 3D
 */
export default function SelectionMenu({ selectedObject, type, onUpdate, onDelete, onClose }) {
  if (!selectedObject || !type) return null;

  const renderContent = () => {
    switch (type) {
      case 'BEAM': return <BeamMenu beam={selectedObject} onUpdate={onUpdate} />;
      case 'FORCE': return <ForceMenu force={selectedObject} onUpdate={onUpdate} />;
      case 'MOMENT': return <MomentMenu moment={selectedObject} onUpdate={onUpdate} />;
      case 'LOAD': return <LoadMenu load={selectedObject} onUpdate={onUpdate} />;
      case 'SUPPORT': return <SupportMenu support={selectedObject} onUpdate={onUpdate} />;
      default: return <div className="selection-menu-id-text">Propriétés non éditables.</div>;
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
        {/* CORRECTION ICI : Utilisation de la prop 'type' */}
        <button onClick={() => onDelete(type, selectedObject.id)} className="selection-menu-delete-btn">Supprimer</button>
        <div className="selection-menu-id-text">ID: {selectedObject.id}</div>
      </div>
    </div>
  );
}

// --- SOUS-MENUS SPÉCIFIQUES ---

function BeamMenu({ beam, onUpdate }) {
  // 1. Calcul de la longueur actuelle
  const getLength = () => {
    const dx = beam.end[0] - beam.start[0];
    const dy = beam.end[1] - beam.start[1];
    const dz = beam.end[2] - beam.start[2];
    return Math.sqrt(dx*dx + dy*dy + dz*dz);
  };
  
  const currentLength = getLength().toFixed(2);

  // 2. Fonction pour mettre à jour la longueur tout en gardant la direction
  const handleLengthCommit = (val) => {
    const newLen = parseFloat(val);
    if (isNaN(newLen) || newLen <= 0) return;

    const dx = beam.end[0] - beam.start[0];
    const dy = beam.end[1] - beam.start[1];
    const dz = beam.end[2] - beam.start[2];
    const oldLen = Math.sqrt(dx*dx + dy*dy + dz*dz);

    if (oldLen === 0) return; // Évite division par zéro

    // Ratio d'homothétie
    const ratio = newLen / oldLen;

    // Nouveau point de fin = Start + (Vecteur * ratio)
    const newEnd = [
      beam.start[0] + dx * ratio,
      beam.start[1] + dy * ratio,
      beam.start[2] + dz * ratio
    ];

    onUpdate({ end: newEnd });
  };

  const updateCoord = (field, axisIndex, val) => {
    const newArr = [...beam[field]];
    newArr[axisIndex] = parseFloat(val);
    onUpdate({ [field]: newArr });
  };

  return (
    <div className="selection-menu-grid">
      <div className="menu-section-title">Géométrie</div>
      
      {/* NOUVEAU CHAMP LONGUEUR */}
      <label className="selection-menu-label">
        Longueur (m):
        <ValidatedInput 
          value={currentLength} 
          onCommit={handleLengthCommit} 
          step="0.1" min="0.1" 
          className="selection-menu-input" 
        />
      </label>

      <label className="selection-menu-label">
        Diamètre (m):
        <ValidatedInput 
          value={beam.diameter || 0.2} 
          onCommit={(v) => onUpdate({ diameter: parseFloat(v) })} 
          step="0.05" min="0.01" 
          className="selection-menu-input" 
        />
      </label>

      {/* STRUCTURE PRÉSERVÉE (DIVS SÉPARÉES) POUR ÉVITER LE DÉBORDEMENT */}
      <div className="menu-section-title" style={{ marginTop: 10 }}>Point de Départ (Start)</div>
        <div className='selection-menu-validate-input-div'>
          <label>X: <ValidatedInput value={beam.start[0]} onCommit={(v) => updateCoord('start', 0, v)} className="selection-menu-input" /></label>
        </div>
        <div className='selection-menu-validate-input-div'>
          <label>Y: <ValidatedInput value={beam.start[1]} onCommit={(v) => updateCoord('start', 1, v)} className="selection-menu-input" /></label>
        </div>
        <div className='selection-menu-validate-input-div'>
          <label>Z: <ValidatedInput value={beam.start[2]} onCommit={(v) => updateCoord('start', 2, v)} className="selection-menu-input" /></label>
        </div>
      

      <div className="menu-section-title" style={{ marginTop: 10 }}>Point d'Arrivée (End)</div>
      <div className='selection-menu-validate-input-div'>
        <label>X: <ValidatedInput value={beam.end[0]} onCommit={(v) => updateCoord('end', 0, v)} className="selection-menu-input" /></label>
      </div>
      <div className='selection-menu-validate-input-div'>
        <label>Y: <ValidatedInput value={beam.end[1]} onCommit={(v) => updateCoord('end', 1, v)} className="selection-menu-input" /></label>
      </div>  
      <div className='selection-menu-validate-input-div'>  
        <label>Z: <ValidatedInput value={beam.end[2]} onCommit={(v) => updateCoord('end', 2, v)} className="selection-menu-input" /></label>
      </div>
    </div>
  );
}
function ForceMenu({ force, onUpdate }) {
  // --- GESTION POSITION ---
  const updatePos = (axis, val) => {
    const newPos = [...force.position];
    newPos[axis] = parseFloat(val);
    onUpdate({ position: newPos });
  };

  // --- GESTION VECTEUR DIRECTION ---
  const updateDir = (axis, val) => {
    const newDir = [...force.direction];
    newDir[axis] = parseFloat(val);
    onUpdate({ direction: newDir });
  };

  // --- GESTION ANGLES EULER (NOUVEAU) ---
  
  // 1. Lire les angles actuels depuis le vecteur direction
  const getEulerFromDir = (dir) => {
    const v = new THREE.Vector3(...dir).normalize();
    // On prend la même référence que Force3D : (0, 1, 0)
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), v);
    const e = new THREE.Euler().setFromQuaternion(q);
    return {
      x: (e.x * 180 / Math.PI).toFixed(1),
      y: (e.y * 180 / Math.PI).toFixed(1),
      z: (e.z * 180 / Math.PI).toFixed(1)
    };
  };

  const currentEuler = getEulerFromDir(force.direction);

  // 2. Appliquer les nouveaux angles pour générer un vecteur
  const applyRotation = (axis, val) => {
    const deg = parseFloat(val);
    if (isNaN(deg)) return;

    // On récupère les valeurs actuelles pour les autres axes
    const e = new THREE.Euler(
      (axis === 'x' ? deg : parseFloat(currentEuler.x)) * Math.PI / 180,
      (axis === 'y' ? deg : parseFloat(currentEuler.y)) * Math.PI / 180,
      (axis === 'z' ? deg : parseFloat(currentEuler.z)) * Math.PI / 180,
      'XYZ'
    );

    // On tourne le vecteur de référence (0, 1, 0)
    const v = new THREE.Vector3(0, 1, 0);
    v.applyEuler(e);

    onUpdate({ direction: [v.x, v.y, v.z] });
  };

  return (
    <div className="selection-menu-grid">
      <label className="selection-menu-label">Valeur (N): <ValidatedInput value={force.value} onCommit={(v) => onUpdate({ value: parseFloat(v) })} className="selection-menu-input" /></label>
      
      {/* SECTION POSITION */}
      <div className="menu-section-title">Position</div>
      <div className='selection-menu-validate-input-div'><label>X: <ValidatedInput value={force.position[0]} onCommit={(v) => updatePos(0, v)} className="selection-menu-input" /></label></div>
      <div className='selection-menu-validate-input-div'><label>Y: <ValidatedInput value={force.position[1]} onCommit={(v) => updatePos(1, v)} className="selection-menu-input" /></label></div>
      <div className='selection-menu-validate-input-div'><label>Z: <ValidatedInput value={force.position[2]} onCommit={(v) => updatePos(2, v)} className="selection-menu-input" /></label></div>

      {/* SECTION ROTATION (NOUVEAU) */}
      <div className="menu-section-title" style={{ marginTop: 10 }}>Rotation (°)</div>
      <div className='selection-menu-validate-input-div'>
        <label>X: <ValidatedInput value={currentEuler.x} onCommit={(v) => applyRotation('x', v)} className="selection-menu-input" /></label>
      </div>
      <div className='selection-menu-validate-input-div'>
        <label>Y: <ValidatedInput value={currentEuler.y} onCommit={(v) => applyRotation('y', v)} className="selection-menu-input" /></label>
      </div>
      <div className='selection-menu-validate-input-div'>
        <label>Z: <ValidatedInput value={currentEuler.z} onCommit={(v) => applyRotation('z', v)} className="selection-menu-input" /></label>
      </div>

      {/* SECTION VECTEUR BRUT (Optionnel, on peut le garder pour les experts) */}
      <div className="menu-section-title" style={{ marginTop: 10 }}>Vecteur Direction</div>
      <div className='selection-menu-validate-input-div'><label>Vx: <ValidatedInput value={force.direction[0].toFixed(3)} onCommit={(v) => updateDir(0, v)} className="selection-menu-input" /></label></div>
      <div className='selection-menu-validate-input-div'><label>Vy: <ValidatedInput value={force.direction[1].toFixed(3)} onCommit={(v) => updateDir(1, v)} className="selection-menu-input" /></label></div>
      <div className='selection-menu-validate-input-div'><label>Vz: <ValidatedInput value={force.direction[2].toFixed(3)} onCommit={(v) => updateDir(2, v)} className="selection-menu-input" /></label></div>
    </div>
  );
}
function MomentMenu({ moment, onUpdate }) {
  return (
    <div className="selection-menu-grid">
       <label className="selection-menu-label">Valeur (Nm): <ValidatedInput value={moment.value} onCommit={(v) => onUpdate({ value: parseFloat(v) })} className="selection-menu-input" /></label>
    </div>
  );
}

function LoadMenu({ load, onUpdate }) {
  return (
    <div className="selection-menu-grid">
       <label className="selection-menu-label">Valeur (N/m): <ValidatedInput value={load.value} onCommit={(v) => onUpdate({ value: parseFloat(v) })} className="selection-menu-input" /></label>
    </div>
  );
}

function SupportMenu({ support, onUpdate }) {
  return (
    <div className="selection-menu-grid">
      <label className="selection-menu-label">
        Type:
        <select 
          value={support.type} 
          onChange={(e) => onUpdate({ type: e.target.value })} 
          className="selection-menu-input" 
          style={{ width: '100%' }}
        >
          <option value="FIXED">Encastrement (Fixed)</option>
          <option value="PINNED">Rotule (Pinned)</option>
          <option value="ROLLER">Rouleau (Roller)</option>
        </select>
      </label>
    </div>
  );
}