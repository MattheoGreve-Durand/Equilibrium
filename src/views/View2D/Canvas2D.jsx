import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Circle } from 'react-konva';
import { useData2D } from '../../contexts/Data2DContext';
import { Beam, DistributedLoad, Force, Moment, PinnedSupport, RollerSupport, FixedSupport } from './Shapes.jsx';
import { Grid, Gizmo } from './Background.jsx';

import { handleToolClick, getToolHelp } from './tools/indexTool.js'; 

export default function Canvas2D() {
  const dataContext = useData2D();
  const { 
    beams, forces, loads, moments, pinned, rolled, fixed, 
    activeTool 
  } = dataContext;
  
  const divRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // --- ÉTAT TEMPORAIRE GÉNÉRIQUE ---
  const [toolState, setToolState] = useState({});

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

  const handleStageClick = (e) => {
    if (!activeTool) return;

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();

    const gridSize = 15;
    const snappedPoint = {
      x: Math.round(pointer.x / gridSize) * gridSize,
      y: Math.round(pointer.y / gridSize) * gridSize
    };

    handleToolClick(activeTool, snappedPoint, toolState, setToolState, dataContext);
  };

  return (
    <div ref={divRef} className="konva-wrapper">
      {activeTool && (
        <div style={{position: 'absolute', bottom: 10, right: 10, background: 'rgba(255,255,255,0.8)', padding: '5px 10px', borderRadius: 4, zIndex: 10, fontSize: 12, border: '1px solid #ccc'}}>
          Mode: {activeTool} - {getToolHelp(activeTool, toolState)}
        </div>
      )}

      <Stage 
        width={dimensions.width} 
        height={dimensions.height}
        onClick={handleStageClick}
        style={{ cursor: activeTool ? 'crosshair' : 'default' }}
      >
        <Grid dimensions={dimensions} />
        <Layer>
          {beams.map((b, index) => <Beam key={b.id} b={b} index={index}/>)}
          {forces.map((f, index) => <Force key={f.id} f={f} index={index} />)}
          {loads.map((l, index) => <DistributedLoad key={l.id} l={l} index={index} />)}
          {moments.map((m, index) => <Moment key={m.id} m={m} index={index} />)}
          {fixed.map((s, i) => <FixedSupport key={s.id} s={s} index={i} />)}
          {rolled.map((s, i) => <RollerSupport key={s.id} s={s} index={i} />)}
          {pinned.map((s, i) => <PinnedSupport key={s.id} s={s} index={i} />)}


          {toolState.p1 && (
             <Circle x={toolState.p1.x} y={toolState.p1.y} radius={5} fill="orange" />
          )}

          <Gizmo dimensions={dimensions} />
        </Layer>
      </Stage>
    </div>
  );
}