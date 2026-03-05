import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Stats } from '@react-three/drei'

// Contexte et Hooks
import { useData3D } from '../../contexts/Data3DContext'
import { useMouseClick, useShiftKey, useCtrlKey} from './useShiftKey' 

// Composants
import ToolsOverlay from './ToolsOverlay'
import SelectionMenu, {MultiSelectionMenu} from './SelectionMenu.jsx' 
import { Beam3D, Force3D, Moment3D, DistributedLoad3D, Support3D } from './Shapes'
import { WorldOrigin, ReferenceGrids, InfoPanel, ToolStatusPanel } from './Background'
import { getToolHelp } from './tools/indexTool'

export default function Canvas3D() {
  const { 
    beams, forces, moments, loads, supports, 
    activeTool, setActiveTool, updateElement, deleteElement
  } = useData3D();

  const [selections, setSelections] = useState([]);
  const [toolState, setToolState] = useState({});

  useEffect(() => {
    setToolState({});
  }, [activeTool]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Annulation générale
      if (e.key === 'Escape') {
        setActiveTool(null);
        setSelections([]); 
      }
      // Suppression de la sélection (Delete ou Retour arrière)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selections.length > 0) {
          // On boucle pour supprimer chaque élément sélectionné
          selections.forEach(sel => deleteElement(sel.type, sel.id));
          setSelections([]); // On vide la sélection
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool, selections, deleteElement]);
  
  // Utilisation du Hook personnalisé pour gérer Shift
  const isShiftPressed = useShiftKey();
  const isMouseDown = useMouseClick();
  const isCtrlPressed = useCtrlKey();
   

  const handleSelect = (id, type) => {
    if (activeTool || isShiftPressed) return; 

    if (isCtrlPressed) {
      // MULTI-SÉLECTION : Ajoute ou retire de la liste
      setSelections(prev => {
        const exists = prev.find(s => s.id === id && s.type === type);
        if (exists) {
          return prev.filter(s => !(s.id === id && s.type === type)); // Retire si déjà cliqué
        } else {
          return [...prev, { id, type }]; // Ajoute sinon
        }
      });
    } else {
      // SÉLECTION SIMPLE
      setSelections([{ id, type }]);
    }
  };

  const handleMiss = () => {
    if (!activeTool && !isShiftPressed) setSelections(null);
  };

  const getSelectedObject = () => {
    if (selections.length !== 1) return null; // Uniquement pour la sélection simple
    const sel = selections[0];
    switch (sel.type) {
      case 'BEAM': return beams.find(b => b.id === sel.id);
      case 'FORCE': return forces.find(f => f.id === sel.id);
      case 'MOMENT': return moments.find(m => m.id === sel.id);
      case 'LOAD': return loads.find(l => l.id === sel.id);
      case 'SUPPORT': return supports.find(s => s.id === sel.id);
      default: return null;
    }
  };
  const checkSelected = (id, type) => selections.some(s => s.id === id && s.type === type);

  // Curseur dynamique : Main (Shift) > Croix (Outil) > Défaut
  const cursorStyle = activeTool ? 'crosshair' : isShiftPressed ? isMouseDown ? 'grabbing' : 'grab' :'default';

 return (
    <div className="three-wrapper" style={{ position: 'relative', cursor: cursorStyle }}> 
      
      <InfoPanel />
      
      <ToolStatusPanel 
        activeTool={activeTool}
        helpText={getToolHelp(activeTool, toolState)}
      />

      {/* MENU POUR SÉLECTION UNIQUE */}
      {selections.length === 1 && (
        <SelectionMenu 
          selectedObject={getSelectedObject()}
          type={selections[0].type}
          onUpdate={(props) => updateElement(selections[0].type, selections[0].id, props)}
          onDelete={(type, id) => { deleteElement(type, id); setSelections([]); }}
          onClose={() => setSelections([])}
        />
      )}

      {/* MENU POUR SÉLECTION MULTIPLE */}
      {selections.length > 1 && (
        <MultiSelectionMenu 
          count={selections.length}
          onDelete={() => {
            selections.forEach(sel => deleteElement(sel.type, sel.id));
            setSelections([]);
          }}
          onClose={() => setSelections([])}
        />
      )}

      <Canvas camera={{ position: [6, 6, 8], fov: 50 }} shadows onPointerMissed={handleMiss}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <Environment preset="city" />
        
        <ReferenceGrids />
        <WorldOrigin />

        <OrbitControls makeDefault enabled={!activeTool || isShiftPressed} />
        <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={20} blur={2} />

        <ToolsOverlay 
          setSelection={setSelections} // Attention à la logique ici si ToolsOverlay écrase la sélection !
          toolState={toolState} 
          setToolState={setToolState} 
        />

        {beams.map((beam) => (
          <Beam3D key={beam.id} start={beam.start} end={beam.end} diameter={beam.diameter} isSelected={checkSelected(beam.id, 'BEAM')} onClick={() => handleSelect(beam.id, 'BEAM')} />
        ))}
        {forces.map((force) => (
          <Force3D key={force.id} position={force.position} direction={force.direction} value={force.value} isSelected={checkSelected(force.id, 'FORCE')} onClick={() => handleSelect(force.id, 'FORCE')} />
        ))}
        {moments.map((moment) => (
          <Moment3D key={moment.id} position={moment.position} axis={moment.axis} value={moment.value} isSelected={checkSelected(moment.id, 'MOMENT')} onClick={() => handleSelect(moment.id, 'MOMENT')} />
        ))}
        {loads.map((load) => (
          <DistributedLoad3D key={load.id} start={load.start} end={load.end} value={load.value} isSelected={checkSelected(load.id, 'LOAD')} onClick={() => handleSelect(load.id, 'LOAD')} />
        ))}
        {supports.map((support) => (
          <Support3D key={support.id} position={support.position} type={support.type} isSelected={checkSelected(support.id, 'SUPPORT')} onClick={() => handleSelect(support.id, 'SUPPORT')} />
        ))}

      </Canvas>
    </div>
  )
}