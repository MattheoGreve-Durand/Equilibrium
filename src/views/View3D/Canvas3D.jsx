import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Stats } from '@react-three/drei'

// Contexte et Hooks
import { useData3D } from '../../contexts/Data3DContext'
import { useMouseClick, useShiftKey } from './useShiftKey' 

// Composants
import ToolsOverlay from './ToolsOverlay'
import SelectionMenu from './SelectionMenu.jsx' 
import { Beam3D, Force3D, Moment3D, DistributedLoad3D, Support3D } from './Shapes'
import { WorldOrigin, ReferenceGrids, InfoPanel, ToolStatusPanel } from './Background'
import { getToolHelp } from './tools/indexTool'

export default function Canvas3D() {
  const { 
    beams, forces, moments, loads, supports, 
    activeTool, updateElement, deleteElement 
  } = useData3D();
  
  const [selection, setSelection] = useState(null);
  const [toolState, setToolState] = useState({});

  useEffect(() => {
    setToolState({});
  }, [activeTool]);
  
  // Utilisation du Hook personnalisé pour gérer Shift
  const isShiftPressed = useShiftKey();
  const isMouseDown = useMouseClick();
   

  const handleSelect = (id, type) => {
    // Si on bouge (Shift) ou qu'un outil est actif, on ne sélectionne pas
    if (activeTool || isShiftPressed) return; 
    setSelection({ id, type });
  };

  const handleMiss = () => {
    if (!activeTool && !isShiftPressed) setSelection(null);
  };

  const getSelectedObject = () => {
    if (!selection) return null;
    switch (selection.type) {
      case 'BEAM': return beams.find(b => b.id === selection.id);
      case 'FORCE': return forces.find(f => f.id === selection.id);
      case 'MOMENT': return moments.find(m => m.id === selection.id);
      case 'LOAD': return loads.find(l => l.id === selection.id);
      case 'SUPPORT': return supports.find(s => s.id === selection.id);
      default: return null;
    }
  };

  // Curseur dynamique : Main (Shift) > Croix (Outil) > Défaut
  const cursorStyle = activeTool ? 'crosshair' : isShiftPressed ? isMouseDown ? 'grabbing' : 'grab' :'default';

 return (
    <div className="three-wrapper" style={{ position: 'relative', cursor: cursorStyle }}> 
      
      {/* --- UI OVERLAYS --- */}
      <InfoPanel />
      
      <ToolStatusPanel 
        activeTool={activeTool}
        helpText={getToolHelp(activeTool, toolState)}
      />

      <SelectionMenu 
        selectedObject={getSelectedObject()}
        type={selection?.type}
        onUpdate={(props) => updateElement(selection.type, selection.id, props)}
        onDelete={(type, id) => { deleteElement(type, id); setSelection(null); }}
        onClose={() => setSelection(null)}
      />

      <Canvas camera={{ position: [6, 6, 8], fov: 50 }} shadows onPointerMissed={handleMiss}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <Environment preset="city" />
        
        <ReferenceGrids />
        <WorldOrigin />

        <OrbitControls makeDefault enabled={!activeTool || isShiftPressed} />
        <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={20} blur={2} />

        {/* On passe toolState et setToolState à l'overlay */}
        <ToolsOverlay 
          setSelection={setSelection} 
          toolState={toolState} 
          setToolState={setToolState} 
        />

        {beams.map((beam) => (
          <Beam3D key={beam.id} start={beam.start} end={beam.end} diameter={beam.diameter} isSelected={selection?.id === beam.id && selection?.type === 'BEAM'} onClick={() => handleSelect(beam.id, 'BEAM')} />
        ))}
        {forces.map((force) => (
          <Force3D key={force.id} position={force.position} direction={force.direction} value={force.value} isSelected={selection?.id === force.id && selection?.type === 'FORCE'} onClick={() => handleSelect(force.id, 'FORCE')} />
        ))}
        {moments.map((moment) => (
          <Moment3D key={moment.id} position={moment.position} axis={moment.axis} value={moment.value} isSelected={selection?.id === moment.id && selection?.type === 'MOMENT'} onClick={() => handleSelect(moment.id, 'MOMENT')} />
        ))}
        {loads.map((load) => (
          <DistributedLoad3D key={load.id} start={load.start} end={load.end} value={load.value} isSelected={selection?.id === load.id && selection?.type === 'LOAD'} onClick={() => handleSelect(load.id, 'LOAD')} />
        ))}
        {supports.map((support) => (
          <Support3D key={support.id} position={support.position} type={support.type} isSelected={selection?.id === support.id && selection?.type === 'SUPPORT'} onClick={() => handleSelect(support.id, 'SUPPORT')} />
        ))}

      </Canvas>
    </div>
  )
}