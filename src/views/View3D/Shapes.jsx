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

function ForceAngleArcs({ startPos, endPos }) {
  const radius = 1; 
  const markerSize = 0.03; 

  // On déduit simplement le vecteur de la force de [Début -> Fin]
  const v = useMemo(() => {
    const start = new THREE.Vector3(...startPos);
    const end = new THREE.Vector3(...endPos);
    return new THREE.Vector3().subVectors(end, start).normalize();
  }, [startPos, endPos]);
  
  const xAxis = new THREE.Vector3(-1, 0, 0);
  const yAxis = new THREE.Vector3(0, -1, 0);
  const zAxis = new THREE.Vector3(0, 0, -1);

  const renderArc = (axisVec, color, labelOffset = 1.1) => {
    const angle = v.angleTo(axisVec);
    // THREE.js gère la rotation parfaitement d'un vecteur à un autre sans calcul manuel
    const qBase = new THREE.Quaternion().setFromUnitVectors(v, axisVec);
    
    const points = [];
    const segments = 32;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      // .slerp() interpole la courbe 3D proprement
      const qInterp = new THREE.Quaternion().slerp(qBase, t);
      const pt = v.clone().applyQuaternion(qInterp).multiplyScalar(radius);
      points.push([pt.x, pt.y, pt.z]);
    }

    const startProj = v.clone().multiplyScalar(radius).toArray();
    const endProj = axisVec.clone().multiplyScalar(radius).toArray();
    const angleDeg = THREE.MathUtils.radToDeg(angle).toFixed(1) + '°';

    return (
      <group>
        <Line points={points} color={color} lineWidth={2} />
        
        <Line points={[[0,0,0], startProj]} color={color} lineWidth={1} dashed dashSize={0.05} gapSize={0.05} opacity={0.5} transparent />
        <Sphere position={startProj} args={[markerSize, 8, 8]}><meshBasicMaterial color={color} /></Sphere>
        
        <Line points={[[0,0,0], endProj]} color={color} lineWidth={1} dashed dashSize={0.05} gapSize={0.05} />
        <Sphere position={endProj} args={[markerSize, 8, 8]}><meshBasicMaterial color={color} /></Sphere>

        <Label3D position={[endProj[0]*labelOffset, endProj[1]*labelOffset, endProj[2]*labelOffset]} text={angleDeg} color={color} fontSize={0.15} />
      </group>
    );
  };

  return (
    // On centre tout le système d'arcs sur la position de DÉBUT (la queue de la flèche)
    <group position={startPos}>
      <Line points={[[0,0,0], [radius * 1.3, 0, 0]]} color="#ef4444" lineWidth={1} transparent opacity={0.2} />
      <Line points={[[0,0,0], [0, radius * 1.3, 0]]} color="#22c55e" lineWidth={1} transparent opacity={0.2} />
      <Line points={[[0,0,0], [0, 0, radius * 1.3]]} color="#3b82f6" lineWidth={1} transparent opacity={0.2} />

      {renderArc(xAxis, "#ef4444", 1.15)}
      {renderArc(yAxis, "#22c55e", 1.25)}
      {renderArc(zAxis, "#3b82f6", 1.35)}
    </group>
  );
}
/**
 * Poutre 3D (Beam) - VERSION CYLINDRE
 * @param {Array} start - [x, y, z]
 * @param {Array} end - [x, y, z]
 * @param {number} diameter - Diamètre de la section
 * @param {boolean} isSelectd - graphical indicator of being selected
 * @param {function} onClick - onClick
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
export function Force3D({ position, direction = [0, -1, 0], value, isSelected, onClick }) {
  const totalLen = 1.0; 
  const coneHeight = 0.25; 
  const cylinderRadius = 0.03;  
  const coneRadius = 0.1;       
  const cylinderHeight = totalLen - coneHeight; 
  const color = isSelected ? COLORS.BEAM_SELECTED : COLORS.FORCE;

  const dirVec = useMemo(() => new THREE.Vector3(...direction).normalize(), [direction]);

  const rotation = useMemo(() => {
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirVec);
    return new THREE.Euler().setFromQuaternion(quaternion);
  }, [dirVec]);

  // Calcul direct de la position de la queue de la force
  const tailPos = useMemo(() => {
    return dirVec.clone().multiplyScalar(-totalLen).toArray();
  }, [dirVec, totalLen]);

  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}>
      
      {/* On passe simplement les coordonnées de début (queue) et fin (pointe) au composant graphique */}
      {isSelected && <ForceAngleArcs startPos={[0, 0, 0]} endPos={tailPos} />}

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