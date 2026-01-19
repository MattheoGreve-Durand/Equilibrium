import React from 'react';
import { Stage, Layer, Line, Circle, Group, Arrow, Text, Arc} from 'react-konva'

/**
 * Composant pour dessiner une force ponctuelle (F) en 2D avec sa valeur et son index.
 * @param {Object} f - Objet contenant {id, x, y, value}
 * @param {number} index - Index de la force pour la numérotation (F1, F2...)
 */
export function Force({ f, index, isSelected, onSelect, isToolActive }) {
  const isNegative = f.value < 0;
  const height = 50;
  const rotation = f.angle || 0; 

  return (
    <Group 
      x={f.x} y={f.y} rotation={rotation}
      // GESTION DU CLIC INTELLIGENTE
      onClick={(e) => {
        // Si un outil est actif, on laisse le clic passer au Stage (pour que l'outil fonctionne)
        if (isToolActive) return; 
        
        // Sinon, on capture le clic pour la sélection
        e.cancelBubble = true;
        if (onSelect) onSelect();
      }}
      // CURSEUR INTELLIGENT
      onMouseEnter={(e) => {
        if (isToolActive) return; // Pas de changement de curseur si on construit
        const container = e.target.getStage().container();
        container.style.cursor = "pointer";
      }}
      onMouseLeave={(e) => {
        if (isToolActive) return;
        const container = e.target.getStage().container();
        container.style.cursor = "default";
      }}
    >
      <Arrow
        points={isNegative ? [0, 0, 0, -height] : [0, -height, 0, 0]}
        pointerLength={10}
        pointerWidth={10}
        fill={isSelected ? "orange" : "red"}
        stroke={isSelected ? "orange" : "red"}
        strokeWidth={2}
        pointerAtBeginning={false}
        pointerAtEnd={true}
      />
      <Text
        x={-35}
        y={-height - 25}
        text={`F${index + 1} : ${f.value} N`}
        fill={isSelected ? "orange" : "red"}
        fontStyle="bold"
        fontSize={12}
        align="center"
        width={70}
        rotation={-rotation} 
      />
    </Group>
  );
}

/**
 * Composant pour dessiner une poutre (Beam) en 2D avec sa longueur calculée.
 * @param {Object} b - Objet contenant {id, x1, y1, x2, y2}
 * @param {number} index - Index de la poutre pour la numérotation
 */
export function Beam({ b, index, isSelected, onSelect, isToolActive }) {
  const dx = b.x2 - b.x1;
  const dy = b.y2 - b.y1;
  const lengthPx = Math.sqrt(dx * dx + dy * dy);
  const angleRad = Math.atan2(dy, dx);
  const angleDeg = (angleRad * 180) / Math.PI;
  const lengthM = (lengthPx / 50).toFixed(2);
  const midX = (b.x1 + b.x2) / 2;
  const midY = (b.y1 + b.y2) / 2;
  
  // Logique pour que le texte soit toujours lisible (pas à l'envers)
  let textAngle = angleDeg;
  let normalSign = 1;
  if (angleDeg > 90 || angleDeg < -90) {
    textAngle += 180;
    normalSign = -1;
  }
  
  const textOffset = 20; 
  const textX = midX + Math.cos(angleRad + Math.PI / 2) * textOffset * normalSign;
  const textY = midY + Math.sin(angleRad + Math.PI / 2) * textOffset * normalSign;

  return (
    <Group
      onClick={(e) => {
        // IMPORTANT : Si un outil est actif, on NE FAIT RIEN ici.
        // On ne met PAS e.cancelBubble = true, pour que le clic remonte au Stage.
        // Cela permet à forceTool.js de recevoir le clic et de calculer la distance.
        if (isToolActive) return; 

        e.cancelBubble = true; 
        if (onSelect) onSelect();
      }}
      
      onMouseEnter={(e) => {
        if (isToolActive) return;
        const container = e.target.getStage().container();
        container.style.cursor = "pointer";
      }}
      onMouseLeave={(e) => {
        if (isToolActive) return;
        const container = e.target.getStage().container();
        container.style.cursor = "default"; // Si un outil est actif, le Stage remettra "crosshair"
      }}
    >
      {/* HIGHLIGHT ORANGE (Seulement si sélectionné) */}
      {isSelected && (
        <Line
          points={[b.x1, b.y1, b.x2, b.y2]}
          stroke="orange"
          strokeWidth={8}
          opacity={0.8}
          lineCap="round"
        />
      )}

      {/* La Poutre Normale */}
      <Line
        points={[b.x1, b.y1, b.x2, b.y2]}
        stroke="#1e293b"
        strokeWidth={4}
        lineCap="square"
      />

      <Text
        x={textX}
        y={textY}
        text={`${lengthM} m`}
        rotation={textAngle}
        offsetX={50}
        offsetY={6}
        width={100}
        align="center"
        fill={isSelected ? "orange" : "#64748b"}
        fontSize={12}
        fontStyle={isSelected ? "bold italic" : "italic"}
      />
    </Group>
  );
}

/**
 * Composant pour dessiner une charge répartie (q) inclinée en 2D.
 * @param {Object} l - Objet contenant {id, x1, y1, x2, y2, value}
 * @param {number} index - Index de la poutre pour la numérotation
 */
export function DistributedLoad({ l, index, isSelected, onSelect, isToolActive }) {
  const height = 40;
  const spacing = 20;
  const isNegative = l.value < 0; 
  const color = isSelected ? "orange" : "blue";
  
  // 1. Géométrie
  const dx = l.x2 - l.x1;
  const dy = l.y2 - l.y1;
  const angle = Math.atan2(dy, dx);
  const length = Math.sqrt(dx * dx + dy * dy);

  // 2. Décalage (Barre au-dessus de la poutre)
  const offsetX = Math.cos(angle - Math.PI / 2) * height;
  const offsetY = Math.sin(angle - Math.PI / 2) * height;

  const topX1 = l.x1 + offsetX;
  const topY1 = l.y1 + offsetY;
  const topX2 = l.x2 + offsetX;
  const topY2 = l.y2 + offsetY;

  // 3. Génération des flèches
  const numArrows = Math.max(2, Math.floor(length / spacing));
  const arrows = [];
  
  for (let i = 0; i <= numArrows; i++) {
    const t = i / numArrows;
    
    // Coordonnées sur la barre du haut
    const tx = topX1 + t * (topX2 - topX1);
    const ty = topY1 + t * (topY2 - topY1);
    
    // Coordonnées sur la poutre
    const bx = l.x1 + t * dx;
    const by = l.y1 + t * dy;

    // CORRECTION ICI : Inversion des points au lieu d'inverser les têtes
    // Si positif : De la barre (Haut) vers la Poutre (Bas)
    // Si négatif : De la Poutre (Bas) vers la barre (Haut)
    const arrowPoints = isNegative 
      ? [bx, by, tx, ty] 
      : [tx, ty, bx, by];

    arrows.push(
        <Arrow
          key={`load-arrow-${i}`}
          points={arrowPoints}
          pointerLength={5}
          pointerWidth={5}
          fill={color}
          stroke={color}
          strokeWidth={1}
          
          // On garde toujours la flèche à la fin du tracé
          pointerAtEnd={true}
          pointerAtBeginning={false}
        />
    );
  }

  // 4. Texte
  const midX = (topX1 + topX2) / 2;
  const midY = (topY1 + topY2) / 2;
  const textOffset = 15;
  const textX = midX + Math.cos(angle - Math.PI / 2) * textOffset;
  const textY = midY + Math.sin(angle - Math.PI / 2) * textOffset;

  return (
    <Group
      onClick={(e) => {
        if (isToolActive) return;
        e.cancelBubble = true;
        if (onSelect) onSelect();
      }}
      onMouseEnter={(e) => {
        if (isToolActive) return;
        e.target.getStage().container().style.cursor = "pointer";
      }}
      onMouseLeave={(e) => {
        if (isToolActive) return;
        e.target.getStage().container().style.cursor = "default";
      }}
    >
      {/* Barre de liaison */}
      <Line
        points={isNegative ? [topX1, topY1+height, topX2, topY2+height]: [topX1, topY1, topX2, topY2]}
        stroke={color}
        strokeWidth={2}
      />
      
      {arrows}
      
      <Text
        x={textX}
        y={textY}
        text={`q${index+1} = ${l.value} N/m`}
        rotation={(angle * 180) / Math.PI}
        fill={color}
        fontStyle="bold"
        fontSize={12}
        align="center"
        width={100}
        offsetX={50}
        offsetY={7}
      />
    </Group>
  );
}

/**
 * Composant pour dessiner un Moment (Couple) en 2D.
 * @param {Object} m - Objet contenant {id, x, y, value, direction}
 * @param {number} index - Index de la poutre pour la numérotation
 * direction: 1 pour Anti-horaire (CCW), -1 pour Horaire (CW)
 */
export function Moment({ m, index, isSelected, onSelect, isToolActive }) {
  const radius = 18;
  const isCCW = m.direction === 1; 
  const color = isSelected ? "orange" : "purple";

  const arcAngle = 280;

  const rotation = 130;

  const headAngleDeg = isCCW ? (rotation + arcAngle) : rotation;
  const headAngleRad = (headAngleDeg * Math.PI) / 180;

  const headX = radius * Math.cos(headAngleRad);
  const headY = radius * Math.sin(headAngleRad);

  const tangentAngle = isCCW ? headAngleRad + Math.PI / 2 : headAngleRad - Math.PI / 2;
  
  const arrowPoints = [
    headX - Math.cos(tangentAngle) * 0.1, // Point arrière minuscule pour donner la direction
    headY - Math.sin(tangentAngle) * 0.1,
    headX,
    headY
  ];

  return (
    <Group 
      x={m.x} y={m.y}
      onClick={(e) => {
        if (isToolActive) return;
        e.cancelBubble = true;
        if (onSelect) onSelect();
      }}
    >
      {/* Point central */}
      <Circle radius={2} fill={color} />

      <Arc
        innerRadius={radius}
        outerRadius={radius}
        angle={arcAngle}
        stroke={color}
        strokeWidth={3}
        rotation={rotation}

      />

      <Arrow
        points={arrowPoints}
        stroke={color}
        fill={color}
        strokeWidth={3}
        pointerLength={8}
        pointerWidth={8}
      />

      <Text
        x={-40}
        y={-radius - 25}
        width={80}
        align="center"
        text={`M${index + 1} : ${m.value} N.m`}
        fill={color}
        fontStyle="bold"
        fontSize={12}
      />
    </Group>
  );
}

/**
 * Composant Encastrement (Fixed Support).
 * @param {Object} s - {id, x, y, angle}
 */
export function FixedSupport({ s, index }) {
  const height = 30;
  const width = 10;
  const label = `E${index + 1}`;
  
  // CORRECTION CRITIQUE : Si s.angle n'existe pas, on force 0.
  // Cela empêche 'rotation' de valoir NaN et de casser le rendu.
  const angle = s.angle || 0;

  const hatches = [];
  for (let i = -height / 2; i <= height / 2; i += 5) {
    hatches.push(
      <Line
        key={`hatch-${i}`}
        points={[-width, i + 5, 0, i]}
        stroke="#334155"
        strokeWidth={1}
      />
    );
  }

  return (
    <Group x={s.x} y={s.y} rotation={angle}>
      <Line
        points={[0, -height / 2, 0, height / 2]}
        stroke="#334155"
        strokeWidth={3}
        lineCap="round"
      />
      
      {hatches}
      
      <Circle radius={3} fill="#334155" />

      <Text
        x={0}
        y={-height / 2 - 20}
        text={label}
        fill="#334155"
        fontSize={12}
        fontStyle="bold"
        
        rotation={-angle}
        
        align="center"
        width={40}
        offsetX={20}
      />
    </Group>
  );
}

/**
 * Composant Appui Rouleau (Roller Support).
 * Triangle sur deux roues. La pointe (x,y) est le contact.
 * @param {Object} s - {id, x, y}
 */
export function RollerSupport({ s, index }) {
  const size = 15; // Taille du triangle
  const label = `R${index + 1}`;

  return (
    <Group x={s.x} y={s.y}>
      {/* Triangle (Pointe en 0,0) */}
      <Line
        points={[-10, size, 10, size, 0, 0]}
        closed
        stroke="#334155"
        strokeWidth={2}
        fill="white" // Fond blanc pour cacher la grille derrière
      />

      {/* Roue Gauche */}
      <Circle
        x={-6}
        y={size + 4} // Juste en dessous de la base du triangle
        radius={4}
        stroke="#334155"
        strokeWidth={2}
        fill="white"
      />

      {/* Roue Droite */}
      <Circle
        x={6}
        y={size + 4}
        radius={4}
        stroke="#334155"
        strokeWidth={2}
        fill="white"
      />

      {/* Ligne de sol (optionnelle, pour le style) */}
      <Line
        points={[-15, size + 9, 15, size + 9]}
        stroke="#94a3b8"
        strokeWidth={2}
      />

      <Text
        x={15}
        y={0}
        text={label}
        fill="#334155"
        fontSize={12}
        fontStyle="bold"
      />
    </Group>
  );
}

/**
 * Composant Appui Simple (Pinned Support).
 * Triangle simple posé au sol. La pointe (x,y) est le contact.
 * @param {Object} s - {id, x, y}
 */
export function PinnedSupport({ s, index }) {
  const size = 15;
  const label = `A${index + 1}`;

  return (
    <Group x={s.x} y={s.y}>
      {/* Triangle (Pointe en 0,0) */}
      <Line
        points={[-10, size, 10, size, 0, 0]}
        closed
        stroke="#334155"
        strokeWidth={2}
        fill="white"
      />

      {/* Symbole du sol fixe (hachures plates sous le triangle) */}
      <Line
        points={[-15, size, 15, size]}
        stroke="#334155"
        strokeWidth={2}
      />
      {/* Petites hachures de sol */}
      <Group y={size}>
        <Line points={[-12, 0, -15, 5]} stroke="#94a3b8" strokeWidth={1} />
        <Line points={[-5, 0, -8, 5]} stroke="#94a3b8" strokeWidth={1} />
        <Line points={[2, 0, -1, 5]} stroke="#94a3b8" strokeWidth={1} />
        <Line points={[9, 0, 6, 5]} stroke="#94a3b8" strokeWidth={1} />
      </Group>

      <Text
        x={15}
        y={0}
        text={label}
        fill="#334155"
        fontSize={12}
        fontStyle="bold"
      />
    </Group>
  );
}

/**
 * Composant de Cotation (Dimension Line).
 * Dessine la distance entre (x1,y1) et (x2,y2) avec un décalage.
 */
export function DimensionLine({ d, index, isSelected, onSelect, isToolActive }) {
  const dx = d.x2 - d.x1;
  const dy = d.y2 - d.y1;
  const lengthPx = Math.sqrt(dx*dx + dy*dy);
  const lengthM = (lengthPx / 50).toFixed(2);
  const angleRad = Math.atan2(dy, dx);
  const angleDeg = (angleRad * 180) / Math.PI;

  // C'est ici que le menu agit : d.offset contrôle l'éloignement de la cote
  const offset = d.offset || 50;

  // Vecteur normal pour décaler les points
  const nx = -Math.sin(angleRad);
  const ny = Math.cos(angleRad);

  // Position de la flèche (décalée de 'offset')
  const offX1 = d.x1 + nx * offset;
  const offY1 = d.y1 + ny * offset;
  const offX2 = d.x2 + nx * offset;
  const offY2 = d.y2 + ny * offset;

  // Correction de l'angle du texte pour la lecture
  let textAngle = angleDeg;
  if (angleDeg > 90 || angleDeg < -90) textAngle += 180;

  const color = isSelected ? "orange" : "#475569"; 

  return (
    <Group
      onClick={(e) => {
        if (isToolActive) return;
        e.cancelBubble = true;
        if (onSelect) onSelect();
      }}
    >
      {/* Ligne pointillée 1 : Va du point d'origine jusqu'à la flèche (+ petit dépassement de 5px) */}
      <Line
        points={[d.x1, d.y1, offX1 + nx * 5, offY1 + ny * 5]} 
        stroke={color}
        strokeWidth={1}
        opacity={0.5}
        dash={[4, 4]} // Effet pointillé
      />

      {/* Ligne pointillée 2 */}
      <Line
        points={[d.x2, d.y2, offX2 + nx * 5, offY2 + ny * 5]}
        stroke={color}
        strokeWidth={1}
        opacity={0.5}
        dash={[4, 4]}
      />

      {/* Flèche double */}
      <Arrow
        points={[offX1, offY1, offX2, offY2]}
        stroke={color}
        fill={color}
        strokeWidth={1.5}
        pointerLength={6}
        pointerWidth={6}
        pointerAtBeginning={true}
        pointerAtEnd={true}
      />

      {/* Texte */}
      <Group x={(offX1 + offX2) / 2} y={(offY1 + offY2) / 2} rotation={textAngle}>
        <Text
          text={`${lengthM} m`}
          fontSize={12}
          fill={color}
          fontStyle="bold"
          align="center"
          offsetY={15}
          offsetX={30}
          width={60}
        />
      </Group>
    </Group>
  );
}