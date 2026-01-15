import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import { useData2D } from '../../contexts/Data2DContext';
import { Beam, DistributedLoad, Force, Moment, PinnedSupport, RollerSupport, FixedSupport } from './Shapes.jsx';
import { Grid, Gizmo } from './Background.jsx'; // Import des nouveaux composants

export default function Canvas2D() {
  const { beams, forces, loads, moments, pinned, rolled, fixed } = useData2D(); //
  const divRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

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

  return (
    <div ref={divRef} className="konva-wrapper">
      <Stage width={dimensions.width} height={dimensions.height}>
        
        {/* Arrière-plan (Grille) */}
        <Grid dimensions={dimensions} />

        {/* Objets de modélisation et Gizmo */}
        <Layer>
          {beams.map((b, index) => <Beam key={b.id} b={b} index={index}/>)}
          {forces.map((f, index) => <Force key={f.id} f={f} index={index} />)}
          {loads.map((l, index) => <DistributedLoad key={l.id} l={l} index={index} />)}
          {moments.map((m, index) => <Moment key={m.id} m={m} index={index} />)}
          {fixed.map((s, i) => <FixedSupport key={s.id} s={s} index={i} />)}
          {rolled.map((s, i) => <RollerSupport key={s.id} s={s} index={i} />)}
          {pinned.map((s, i) => <PinnedSupport key={s.id} s={s} index={i} />)}

          <Gizmo dimensions={dimensions} />
        </Layer>
        
      </Stage>
    </div>
  );
}

