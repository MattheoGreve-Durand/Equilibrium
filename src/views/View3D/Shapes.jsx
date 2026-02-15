import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Text, Line, Billboard, Sphere } from '@react-three/drei';

// --- COULEURS CONSTANTES ---
const COLORS = {
  BEAM: '#334155',       // Ardoise
  BEAM_SELECTED: '#f97316', // Orange
  FORCE: '#ef4444',      // Rouge
  MOMENT: '#a855f7',     // Violet
  SUPPORT: '#475569',    // Gris sombre
  LOAD: '#3b82f6',       // Bleu
  TEXT: '#1e293b'
};

function ForceAngleArcs({ angles }) {
  const radius = 0.8; 
  const markerSize = 0.03; 

  // Si la force vient d'être créée et n'a pas encore été éditée, on applique les angles par défaut (vers le bas)
  const safeAngles = angles || { x: 0, y: 0, z: 270 };

  const { xy, yz, zx } = useMemo(() => {
    
    // Génère l'arc uniquement basé sur la valeur en degrés du menu
    const createArcData = (plane, angleDeg) => {
      const angle = angleDeg * Math.PI / 180;
      const points = [];
      const segments = 32;
      
      for (let i = 0; i <= segments; i++) {
        const theta = (angle * i) / segments;
        if (plane === 'XY') points.push([Math.cos(theta) * radius, Math.sin(theta) * radius, 0]);
        if (plane === 'YZ') points.push([0, Math.cos(theta) * radius, Math.sin(theta) * radius]);
        if (plane === 'ZX') points.push([Math.sin(theta) * radius, 0, Math.cos(theta) * radius]);
      }
      
      let startProj, endProj;
      if (plane === 'XY') { startProj = [radius, 0, 0]; endProj = [Math.cos(angle) * radius, Math.sin(angle) * radius, 0]; }
      if (plane === 'YZ') { startProj = [0, radius, 0]; endProj = [0, Math.cos(angle) * radius, Math.sin(angle) * radius]; }
      if (plane === 'ZX') { startProj = [0, 0, radius]; endProj = [Math.sin(angle) * radius, 0, Math.cos(angle) * radius]; }

      return { points, startProj, endProj, angleText: angleDeg.toFixed(1) + '°' };
    };

    return {
      xy: createArcData('XY', safeAngles.z), // L'angle Z tourne dans le plan XY
      yz: createArcData('YZ', safeAngles.x), // L'angle X tourne dans le plan YZ
      zx: createArcData('ZX', safeAngles.y)  // L'angle Y tourne dans le plan ZX
    };
  }, [safeAngles]); // Se met à jour uniquement si un angle du menu change

  const renderPlaneArc = (data, color) => (
    <group>
      <Line points={data.points} color={color} lineWidth={2} />
      <Line points={[[0,0,0], data.startProj]} color={color} lineWidth={1} dashed dashSize={0.05} gapSize={0.05} opacity={0.5} transparent />
      <Sphere position={data.startProj} args={[markerSize, 8, 8]}><meshBasicMaterial color={color} /></Sphere>
      <Line points={[[0,0,0], data.endProj]} color={color} lineWidth={1} dashed dashSize={0.05} gapSize={0.05} />
      <Sphere position={data.endProj} args={[markerSize, 8, 8]}><meshBasicMaterial color={color} /></Sphere>
      <Label3D position={[data.endProj[0]*1.1, data.endProj[1]*1.1, data.endProj[2]*1.1]} text={data.angleText} color={color} fontSize={0.15} />
    </group>
  );

  return (
    <group>
      <Line points={[[0,0,0], [radius * 1.3, 0, 0]]} color="#ef4444" lineWidth={1} transparent opacity={0.2} />
      <Line points={[[0,0,0], [0, radius * 1.3, 0]]} color="#22c55e" lineWidth={1} transparent opacity={0.2} />
      <Line points={[[0,0,0], [0, 0, radius * 1.3]]} color="#3b82f6" lineWidth={1} transparent opacity={0.2} />

      {renderPlaneArc(xy, "#ef4444")}
      {renderPlaneArc(yz, "#22c55e")}
      {renderPlaneArc(zx, "#3b82f6")}
    </group>
  );
}

/**
 * Poutre 3D (Beam) - VERSION CYLINDRE
 * @param {Array} start - [x, y, z]
 * @param {Array} end - [x, y, z]
 * @param {number} diameter - Diamètre de la section
 */
export function Beam3D({ start, end, diameter = 0.2, isSelected, onClick }) {
  const { position, rotation, length, direction } = useMemo(() => {
    const p1 = new THREE.Vector3(...start);
    const p2 = new THREE.Vector3(...end);
    const dist = p1.distanceTo(p2);
    
    // Position centrale
    const mid = p1.clone().add(p2).multiplyScalar(0.5);
    
    // Orientation
    const dir = p2.clone().sub(p1).normalize();
    const quaternion = new THREE.Quaternion();
    
    // Alignement du cylindre (axe Y par défaut) sur le vecteur direction
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    
    return { 
      position: mid, 
      rotation: new THREE.Euler().setFromQuaternion(quaternion), 
      length: dist,
      direction: dir
    };
  }, [start, end]);

  const radius = diameter / 2;

  return (
    <group onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}>
      {/* Corps de la poutre */}
      <mesh position={position} rotation={rotation}>
        <cylinderGeometry args={[radius, radius, length, 32]} />
        <meshStandardMaterial 
          color={isSelected ? COLORS.BEAM_SELECTED : COLORS.BEAM} 
          roughness={0.2} 
          metalness={0.5} 
        />
      </mesh>
      
      {/* Affichage de la longueur (Texte flottant) */}
      <Billboard position={[position.x, position.y + diameter/2 + 0.1, position.z]}>
        <Text
          fontSize={0.25}
          color={isSelected ? COLORS.BEAM_SELECTED : "black"}
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.02}
          outlineColor="white"
        >
          {length.toFixed(2)} m
        </Text>
      </Billboard>
    </group>
  );
}

/**
 * Force 3D
 * Une flèche (Cylindre + Cône) orientée.
 * @param {Array} position - [x, y, z]
 * @param {Array} direction - [x, y, z] (vecteur normalisé ou non)
 * @param {number} value - Valeur en Newtons
 */
export function Force3D({ position, direction = [0, -1, 0], angles, value, isSelected, onClick }) {
  const totalLen = 1.0; 
  const coneHeight = 0.25; 
  const cylinderRadius = 0.03;  
  const coneRadius = 0.1;       
  const cylinderHeight = totalLen - coneHeight; 
  const color = isSelected ? COLORS.BEAM_SELECTED : COLORS.FORCE;

  const rotation = useMemo(() => {
    const dirVec = new THREE.Vector3(...direction).normalize();
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirVec);
    return new THREE.Euler().setFromQuaternion(quaternion);
  }, [direction]);

  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}>
      
      {/* On passe "angles" au lieu de "direction" */}
      {isSelected && <ForceAngleArcs angles={angles} />}

      <group rotation={rotation}>
        <group position={[0, -totalLen, 0]}>
          <mesh position={[0, cylinderHeight / 2, 0]}>
            <cylinderGeometry args={[cylinderRadius, cylinderRadius, cylinderHeight, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, cylinderHeight + coneHeight / 2, 0]}>
            <coneGeometry args={[coneRadius, coneHeight, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
        <Label3D position={[0, -totalLen - 0.3, 0]} text={`F: ${value} N`} color={color} />
      </group>

    </group>
  );
}

/**
 * Moment 3D
 * Représenté par un Torus (anneau) partiel et un Cône.
 */
export function Moment3D({ position, axis = [0, 0, 1], value, isSelected, onClick }) {
  const color = isSelected ? COLORS.BEAM_SELECTED : COLORS.MOMENT;
  
  // Rotation pour aligner l'axe du moment (Z par défaut)
  const rotation = useMemo(() => {
    const alignVector = new THREE.Vector3(...axis).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), alignVector);
    return new THREE.Euler().setFromQuaternion(q);
  }, [axis]);

  return (
    <group position={position} rotation={rotation} onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}>
      {/* Anneau (Arc) */}
      <mesh rotation={[0, 0, Math.PI / 2]}> 
        <torusGeometry args={[0.6, 0.05, 8, 24, Math.PI * 1.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Pointe de flèche sur l'anneau */}
      <mesh position={[0, -0.6, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.15, 0.3, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Label3D position={[0.8, 0.8, 0]} text={`M: ${value} Nm`} color={color} />
    </group>
  );
}

/**
 * Charge Répartie 3D
 * Une série de petites flèches ou un plan translucide au-dessus de la poutre.
 */
export function DistributedLoad3D({ start, end, value, isSelected }) {
  const color = isSelected ? COLORS.BEAM_SELECTED : COLORS.LOAD;
  const count = 5; // Nombre de flèches
  
  // Création des flèches interpolées
  const arrows = useMemo(() => {
    const arr = [];
    const p1 = new THREE.Vector3(...start);
    const p2 = new THREE.Vector3(...end);
    for (let i = 0; i <= count; i++) {
      const alpha = i / count;
      const pos = p1.clone().lerp(p2, alpha).toArray();
      arr.push(pos);
    }
    return arr;
  }, [start, end]);

  return (
    <group>
      {/* Barre horizontale reliant les flèches */}
      <Line points={[start.map((v, i) => v + (i===1?1:0)), end.map((v, i) => v + (i===1?1:0))]} color={color} lineWidth={2} />
      
      {arrows.map((pos, idx) => (
        <group key={idx} position={[pos[0], pos[1] + 1, pos[2]]}>
           {/* Petite flèche pointant vers le bas */}
           <mesh position={[0, -0.5, 0]}>
             <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
             <meshStandardMaterial color={color} />
           </mesh>
           <mesh position={[0, -1, 0]}>
             <coneGeometry args={[0.08, 0.2, 8]} rotation={[Math.PI, 0, 0]} />
             <meshStandardMaterial color={color} />
           </mesh>
        </group>
      ))}
      <Label3D position={[(start[0]+end[0])/2, (start[1]+end[1])/2 + 1.2, (start[2]+end[2])/2]} text={`q: ${value} N/m`} color={color} />
    </group>
  );
}

/**
 * Appuis (Supports)
 * Géométries simples pour représenter les appuis.
 */
export function Support3D({ position, type, isSelected }) {
  const color = isSelected ? COLORS.BEAM_SELECTED : COLORS.SUPPORT;
  
  return (
    <group position={position}>
      {type === 'FIXED' && (
        <mesh position={[0, -0.25, 0]}>
          <boxGeometry args={[0.6, 0.5, 0.6]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )}
      
      {type === 'PINNED' && (
        <mesh position={[0, -0.3, 0]}>
          <coneGeometry args={[0.3, 0.6, 4]} rotation={[0, Math.PI/4, 0]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )}

      {type === 'ROLLER' && (
        <group position={[0, -0.35, 0]}>
           <mesh>
             <sphereGeometry args={[0.25, 16, 16]} />
             <meshStandardMaterial color={color} />
           </mesh>
           <mesh position={[0, -0.25, 0]}>
             <boxGeometry args={[0.6, 0.1, 0.6]} />
             <meshStandardMaterial color="#94a3b8" />
           </mesh>
        </group>
      )}
    </group>
  );
}

// --- UTILITAIRES ---

function Label3D({ position, text, color }) {
  return (
    <Billboard position={position}>
      <Text
        fontSize={0.3}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#ffffff"
      >
        {text}
      </Text>
    </Billboard>
  );
}