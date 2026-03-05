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
  const updatePos = (axis, val) => {
    const newPos = [...force.position];
    newPos[axis] = parseFloat(val);
    onUpdate({ position: newPos });
  };

  // --- CALCUL DES ANGLES PAR RAPPORT AUX COMPOSANTES ÉLÉMENTAIRES (angleTo) ---
  const dir = new THREE.Vector3(...force.direction).normalize();
  
  const xAxis = new THREE.Vector3(1, 0, 0);
  const yAxis = new THREE.Vector3(0, 1, 0);
  const zAxis = new THREE.Vector3(0, 0, 1);

  // THREE.MathUtils.radToDeg convertit les radians en degrés
  const angleX = THREE.MathUtils.radToDeg(dir.angleTo(xAxis)).toFixed(1);
  const angleY = THREE.MathUtils.radToDeg(dir.angleTo(yAxis)).toFixed(1);
  const angleZ = THREE.MathUtils.radToDeg(dir.angleTo(zAxis)).toFixed(1);

  // Fonction universelle pour appliquer un nouvel angle par rapport à un axe donné
  const applyAngle = (axisVec, val) => {
    const newDeg = parseFloat(val);
    if (isNaN(newDeg)) return;

    // angleTo() renvoie toujours un angle entre 0 et 180°
    const clampedDeg = Math.max(0, Math.min(180, newDeg));
    const newRad = THREE.MathUtils.degToRad(clampedDeg);
    
    const currentRad = dir.angleTo(axisVec);
    const delta = newRad - currentRad;

    // Calcul de l'axe de rotation perpendiculaire au vecteur et à l'axe ciblé
    let rotAxis = new THREE.Vector3().crossVectors(axisVec, dir);
    
    // Si la force est parfaitement alignée avec l'axe (cross produit = 0), on prend un axe arbitraire
    if (rotAxis.lengthSq() < 1e-5) {
      if (axisVec.x === 1) rotAxis.set(0, 1, 0);
      else if (axisVec.y === 1) rotAxis.set(0, 0, 1);
      else rotAxis.set(1, 0, 0);
    } else {
      rotAxis.normalize();
    }

    // On pivote le vecteur direction
    const newDir = dir.clone().applyAxisAngle(rotAxis, delta).normalize();

    // Nettoyage des erreurs de virgule flottante pour garder un vecteur propre
    if (Math.abs(newDir.x) < 1e-7) newDir.x = 0;
    if (Math.abs(newDir.y) < 1e-7) newDir.y = 0;
    if (Math.abs(newDir.z) < 1e-7) newDir.z = 0;

    onUpdate({ direction: newDir.toArray() });
  };

  return (
    <div className="selection-menu-grid">
      <label className="selection-menu-label">Valeur (N): <ValidatedInput value={force.value} onCommit={(v) => onUpdate({ value: parseFloat(v) })} className="selection-menu-input" /></label>
      
      <div className="menu-section-title">Position</div>
      <div className='selection-menu-validate-input-div'><label>X: <ValidatedInput value={force.position[0]} onCommit={(v) => updatePos(0, v)} className="selection-menu-input" /></label></div>
      <div className='selection-menu-validate-input-div'><label>Y: <ValidatedInput value={force.position[1]} onCommit={(v) => updatePos(1, v)} className="selection-menu-input" /></label></div>
      <div className='selection-menu-validate-input-div'><label>Z: <ValidatedInput value={force.position[2]} onCommit={(v) => updatePos(2, v)} className="selection-menu-input" /></label></div>

      <div className="menu-section-title" style={{ marginTop: 10 }}>Angles (0-180°)</div>
      
      <div className='selection-menu-validate-input-div'>
        <label>Angle / Axe X : <ValidatedInput value={angleX} onCommit={(v) => applyAngle(xAxis, v)} min="0" max="180" className="selection-menu-input" /></label>
      </div>
      <div className='selection-menu-validate-input-div'>
        <label>Angle / Axe Y : <ValidatedInput value={angleY} onCommit={(v) => applyAngle(yAxis, v)} min="0" max="180" className="selection-menu-input" /></label>
      </div>
      <div className='selection-menu-validate-input-div'>
        <label>Angle / Axe Z : <ValidatedInput value={angleZ} onCommit={(v) => applyAngle(zAxis, v)} min="0" max="180" className="selection-menu-input" /></label>
      </div>
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

export function MultiSelectionMenu({ count, onDelete, onClose }) {
  return (
    <div className="selection-menu-container">
      <div className="selection-menu-header">
        <strong>Sélection multiple</strong>
        <button onClick={onClose} className="selection-menu-close-btn">X</button>
      </div>
      <div className="selection-menu-content" style={{ padding: '15px 10px', textAlign: 'center' }}>
        {count} éléments sélectionnés.
      </div>
      <div className="selection-menu-footer">
        <button onClick={onDelete} className="selection-menu-delete-btn" style={{ width: '100%' }}>
          Supprimer la sélection
        </button>
      </div>
    </div>
  );
}