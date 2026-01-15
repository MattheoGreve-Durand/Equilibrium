import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Circle } from 'react-konva';
import { useData2D } from '../../contexts/Data2DContext';
import { 
  Beam, 
  DistributedLoad, 
  Force, 
  Moment, 
  PinnedSupport, 
  RollerSupport, 
  FixedSupport 
} from './Shapes.jsx';
import { 
  Grid, 
  Gizmo, 
  InfoPanel, 
  ToolStatusPanel 
} from './Background.jsx';
import SelectionMenu from './SelectionMenu.jsx';
import { handleToolClick, getToolHelp } from './tools/indexTool.js'; 

export default function Canvas2D() {
  const dataContext = useData2D();
  const { 
    beams, forces, loads, moments, pinned, rolled, fixed, 
    activeTool, updateElement, deleteElement 
  } = dataContext;
  
  const divRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // État de l'outil en cours (ex: premier point cliqué)
  const [toolState, setToolState] = useState({});
  
  // Point de prévisualisation pour le snapping (Shift)
  const [previewSnapPoint, setPreviewSnapPoint] = useState(null);

  // État de sélection générique { id, type }
  const [selection, setSelection] = useState(null);

  const isToolActive = activeTool !== null;

  // --- CORRECTION DU BUG ---
  // Réinitialise l'état temporaire quand l'outil change ou est annulé
  useEffect(() => {
    setToolState({});
    setPreviewSnapPoint(null);
  }, [activeTool]);

  // Redimensionnement automatique du canvas
  useEffect(() => {
    const updateSize = () => {
      if (divRef.current) {
        setDimensions({
          width: divRef.current.offsetWidth,
          height: divRef.current.offsetHeight,
        });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize(); 
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const getSelectedObject = () => {
    if (!selection) return null;
    switch (selection.type) {
      case 'BEAM': return beams.find(b => b.id === selection.id);
      case 'FORCE': return forces.find(f => f.id === selection.id);
      case 'LOAD': return loads.find(l => l.id === selection.id);
      case 'FIXED': return fixed.find(s => s.id === selection.id);
      case 'PINNED': return pinned.find(s => s.id === selection.id);
      case 'ROLLER': return rolled.find(s => s.id === selection.id);
      default: return null;
    }
  };

  const handleStageMouseMove = (e) => {
    if (!activeTool) {
      if (previewSnapPoint) setPreviewSnapPoint(null);
      return;
    }

    const pointer = e.target.getStage().getPointerPosition();
    
    if (e.evt.shiftKey && pointer) {
      const snapSize = 50;
      const snappedX = Math.round(pointer.x / snapSize) * snapSize;
      const snappedY = Math.round(pointer.y / snapSize) * snapSize;

      if (!previewSnapPoint || previewSnapPoint.x !== snappedX || previewSnapPoint.y !== snappedY) {
        setPreviewSnapPoint({ x: snappedX, y: snappedY });
      }
    } else {
      if (previewSnapPoint) setPreviewSnapPoint(null);
    }
  };

  const handleStageClick = (e) => {
    if (activeTool) {
      const isShiftPressed = e.evt.shiftKey;
      const pointer = e.target.getStage().getPointerPosition();
      const snapSize = isShiftPressed ? 50 : 1; 

      const finalPoint = {
        x: Math.round(pointer.x / snapSize) * snapSize,
        y: Math.round(pointer.y / snapSize) * snapSize
      };

      handleToolClick(activeTool, finalPoint, toolState, setToolState, dataContext);
      // On garde le previewSnapPoint à null pour éviter qu'il reste bloqué après un clic
      setPreviewSnapPoint(null);
      setSelection(null); 
      return;
    }

    if (e.target === e.target.getStage()) {
      setSelection(null);
    }
  };

  const handleObjectSelect = (id, type) => {
    if (!activeTool) {
      setSelection({ id, type });
    }
  };

  return (
    <div ref={divRef} className="konva-wrapper" style={{ position: 'relative' }}>
      
      <InfoPanel />
      
      <ToolStatusPanel 
        activeTool={activeTool} 
        helpText={getToolHelp(activeTool, toolState)} 
      />

      <SelectionMenu 
        selectedObject={getSelectedObject()}
        type={selection?.type}
        onUpdate={(props) => updateElement(selection.type, selection.id, props)}
        onDelete={() => {
           deleteElement(selection.type, selection.id);
           setSelection(null);
        }}
        onClose={() => setSelection(null)}
      />

      <Stage 
        width={dimensions.width} 
        height={dimensions.height}
        onClick={handleStageClick}
        onMouseMove={handleStageMouseMove}
        style={{ cursor: activeTool ? 'crosshair' : 'default' }}
      >
        <Grid dimensions={dimensions} gridSize={50} />
        
        <Layer>
          {beams.map((b, index) => (
            <Beam 
              key={b.id} b={b} index={index}
              isSelected={selection?.id === b.id && selection?.type === 'BEAM'}
              onSelect={() => handleObjectSelect(b.id, 'BEAM')}
              isToolActive={isToolActive}
            />
          ))}

          {forces.map((f, index) => (
            <Force 
              key={f.id} f={f} index={index}
              isSelected={selection?.id === f.id && selection?.type === 'FORCE'}
              onSelect={() => handleObjectSelect(f.id, 'FORCE')}
              isToolActive={isToolActive}
            />
          ))}

          {loads.map((l, index) => <DistributedLoad key={l.id} l={l} index={index} />)}
          {moments.map((m, index) => <Moment key={m.id} m={m} index={index} />)}
          {fixed.map((s, i) => <FixedSupport key={s.id} s={s} index={i} />)}
          {rolled.map((s, i) => <RollerSupport key={s.id} s={s} index={i} />)}
          {pinned.map((s, i) => <PinnedSupport key={s.id} s={s} index={i} />)}

          {previewSnapPoint && activeTool && (
             <Circle 
                x={previewSnapPoint.x} y={previewSnapPoint.y} 
                radius={6} fill="rgba(255, 165, 0, 0.4)" 
                stroke="orange" strokeWidth={1} listening={false} 
             />
          )}
          {toolState.p1 && (
             <Circle x={toolState.p1.x} y={toolState.p1.y} radius={5} fill="orange" />
          )}

          <Gizmo dimensions={dimensions} />
        </Layer>
      </Stage>
    </div>
  );
}