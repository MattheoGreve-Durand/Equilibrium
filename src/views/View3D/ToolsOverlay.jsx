import React, { useState, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Contexte et Logique Outils
import { useData3D } from '../../contexts/Data3DContext';
import { handle3DToolClick, handle3DToolMove } from './tools/indexTool';

// --- COMPOSANTS FANTÔMES ---

function GhostBeam({ start, end, diameter = 0.2 }) {
  const { position, rotation, length } = useMemo(() => {
    const p1 = new THREE.Vector3(start.x, start.y, start.z);
    const p2 = new THREE.Vector3(end.x, end.y, end.z);
    const dist = p1.distanceTo(p2);
    const mid = p1.clone().add(p2).multiplyScalar(0.5);
    const direction = p2.clone().sub(p1).normalize();
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    return { position: mid, rotation: new THREE.Euler().setFromQuaternion(quaternion), length: dist };
  }, [start, end]);
  const radius = diameter / 2;
  return ( 
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[radius, radius, length, 32]} />
      <meshBasicMaterial color="orange" opacity={0.4} transparent depthTest={false} />
    </mesh> 
  );
}

/**
 * Force Fantôme
 * Affiche une flèche transparente là où la force sera créée.
 */
function GhostForce({ position }) {
  // --- DIMENSIONS RÉDUITES (Identiques à Force3D) ---
  const coneHeight = 0.25;
  const cylinderHeight = 0.75; 
  const cylinderRadius = 0.03;
  const coneRadius = 0.1;

  return (
    <group position={position}>
       {/* Tige (Cylindre) */}
       {/* Positionnée au-dessus du cône */}
       <mesh position={[0, coneHeight + cylinderHeight / 2, 0]}>
         <cylinderGeometry args={[cylinderRadius, cylinderRadius, cylinderHeight, 8]} />
         <meshBasicMaterial color="red" opacity={0.5} transparent depthTest={false} />
       </mesh>
       
       {/* Pointe (Cône inversé) */}
       {/* La pointe touche le point de position (y=0 localement) */}
       <mesh position={[0, coneHeight / 2, 0]} rotation={[Math.PI, 0, 0]}> 
         <coneGeometry args={[coneRadius, coneHeight, 16]} />
         <meshBasicMaterial color="red" opacity={0.5} transparent depthTest={false} />
       </mesh>
    </group>
  )
}

// --- LOGIQUE OVERLAY ---

export default function ToolsOverlay({ setSelection }) {
  const { camera, raycaster, pointer } = useThree();
  const { activeTool, addBeam, addForce, beams } = useData3D();

  const [toolState, setToolState] = useState({});
  const [previewPoint, setPreviewPoint] = useState(null);

  // --- LOGIQUE DE SNAP SUR POUTRE (Interne à l'overlay pour le visuel) ---
  const getBeamSnap = (rawPoint) => {
    const CLICK_TOLERANCE = 0.5;
    let bestDist = Infinity;
    let bestPoint = null;

    const P = new THREE.Vector3(rawPoint.x, rawPoint.y, rawPoint.z);

    beams.forEach(beam => {
      const A = new THREE.Vector3(...beam.start);
      const B = new THREE.Vector3(...beam.end);
      const AB = new THREE.Vector3().subVectors(B, A);
      const AP = new THREE.Vector3().subVectors(P, A);
      const lenSq = AB.lengthSq();
      let t = (lenSq === 0) ? -1 : AP.dot(AB) / lenSq;
      t = Math.max(0, Math.min(1, t));
      const C = new THREE.Vector3().copy(A).add(AB.multiplyScalar(t));
      const dist = P.distanceTo(C);

      if (dist < CLICK_TOLERANCE && dist < bestDist) {
        bestDist = dist;
        bestPoint = C;
      }
    });
    return bestPoint;
  };

  // --- RAYCASTING INTELLIGENT ---
  const getSmartIntersection = (e, isShift) => {
    const planeXZ = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const planeXY = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const planeYZ = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);

    raycaster.setFromCamera(pointer, camera);
    const targets = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
    const hits = [
      raycaster.ray.intersectPlane(planeXZ, targets[0]),
      raycaster.ray.intersectPlane(planeXY, targets[1]),
      raycaster.ray.intersectPlane(planeYZ, targets[2])
    ];

    let bestPoint = null;
    let minDistance = Infinity;

    hits.forEach((hit, i) => {
      if (hit) {
        const dist = targets[i].distanceTo(camera.position);
        if (dist < minDistance) {
          minDistance = dist;
          bestPoint = targets[i];
        }
      }
    });

    if (!bestPoint) return null;

    if (isShift) {
      bestPoint.x = Math.round(bestPoint.x);
      bestPoint.y = Math.round(bestPoint.y);
      bestPoint.z = Math.round(bestPoint.z);
    } else {
      bestPoint.x = Math.round(bestPoint.x * 10) / 10;
      bestPoint.y = Math.round(bestPoint.y * 10) / 10;
      bestPoint.z = Math.round(bestPoint.z * 10) / 10;
    }

    return bestPoint;
  };

  // --- HANDLERS ---

  const handlePointerMove = (e) => {
    if (!activeTool) return;
    const point = getSmartIntersection(e, e.shiftKey);
    if (point) {
      setPreviewPoint(point);
      const contextData = { beams };
      handle3DToolMove(activeTool, point, toolState, setToolState, e.shiftKey, contextData);
    }
  };

  const handlePointerDown = (e) => {
    if (e.button !== 0 || !activeTool) return;
    e.stopPropagation();
    const point = getSmartIntersection(e, e.shiftKey);
    if (point) {
      const contextActions = { addBeam, addForce, beams };
      handle3DToolClick(activeTool, point, toolState, setToolState, contextActions, camera);
    }
  };

  if (!activeTool) return null;

 let forceGhostPos = null;
  if (activeTool === 'FORCE' && previewPoint) {
    const snap = getBeamSnap(previewPoint);
    if (snap) { forceGhostPos = [snap.x, snap.y, snap.z]; }
  }

  return (
    <>
      <mesh visible={false} onPointerMove={handlePointerMove} onPointerDown={handlePointerDown}>
        <planeGeometry args={[100, 100]} />
      </mesh>

      {/* CURSEUR DE SNAP GÉNÉRAL */}
      {previewPoint && (
        <mesh position={previewPoint}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="red" opacity={0.6} transparent depthTest={false} />
        </mesh>
      )}

      {/* --- VISUALISATION POUTRE --- */}
      {activeTool === 'BEAM' && toolState.startPoint && previewPoint && (
        <group>
          <mesh position={[toolState.startPoint.x, toolState.startPoint.y, toolState.startPoint.z]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color="orange" />
          </mesh>
          <GhostBeam start={toolState.startPoint} end={previewPoint} diameter={0.2} />
        </group>
      )}

      {/* --- VISUALISATION FORCE --- */}
      {activeTool === 'FORCE' && forceGhostPos && (
        <GhostForce position={forceGhostPos} />
      )}
    </>
  );
}