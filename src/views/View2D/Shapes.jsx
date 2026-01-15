import React from 'react';
import { Stage, Layer, Line, Circle, Group, Arrow, Text, Arc} from 'react-konva'

/**
 * Composant pour dessiner une force ponctuelle (F) en 2D avec sa valeur et son index.
 * @param {Object} f - Objet contenant {id, x, y, value}
 * @param {number} index - Index de la force pour la numérotation (F1, F2...)
 */
export function Force({ f, index }) {
  const isNegative = f.value < 0;
  const height = 50;

  return (
    <Group x={f.x} y={f.y}>
      <Arrow
        points={[0, -height, 0, 0]}
        pointerLength={10}
        pointerWidth={10}
        fill="red"
        stroke="red"
        strokeWidth={2}
        pointerAtBeginning={isNegative}
        pointerAtEnd={!isNegative}
      />
      <Text
        // On centre le texte horizontalement (x = -25 avec width = 50)
        x={-35}
        // Si la flèche pointe vers le haut (isNegative), on met le texte en dessous (y > 0)
        // Sinon, on le met au-dessus de la queue de la flèche (y < -height)
        y={isNegative ? 10 : -height - 20}
        text={`F${f.id} = ${f.value} N`}
        fill="red"
        fontStyle="bold"
        fontSize={12}
        align="center"
        width={70}
      />
    </Group>
  );
}

/**
 * Composant pour dessiner une poutre (Beam) en 2D avec sa longueur calculée.
 * @param {Object} b - Objet contenant {id, x1, y1, x2, y2}
 * @param {number} index - Index de la poutre pour la numérotation
 */
export function Beam({ b, index }) {
  const dx = b.x2 - b.x1;
  const dy = b.y2 - b.y1;
  const lengthPx = Math.sqrt(dx * dx + dy * dy);

  const angleRad = Math.atan2(dy, dx);
  const angleDeg = (angleRad * 180) / Math.PI;


  const lengthM = (lengthPx / 50).toFixed(2);

  const midX = (b.x1 + b.x2) / 2;
  const midY = (b.y1 + b.y2) / 2;

  // On ajoute 20px dans la direction perpendiculaire (+90° ou +PI/2)
  const textOffset = 20; 
  const textX = midX + Math.cos(angleRad + Math.PI / 2) * textOffset;
  const textY = midY + Math.sin(angleRad + Math.PI / 2) * textOffset;

  return (
    <Group>
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
        rotation={angleDeg}
        offsetX={50} // Moitié de la largeur (width=100)
        offsetY={6}  // Moitié de la hauteur de police approx
        width={100}
        align="center"
        fill="#64748b"
        fontSize={12}
        fontStyle="italic"
      />
    </Group>
  );
}

/**
 * Composant pour dessiner une charge répartie (q) inclinée en 2D.
 * @param {Object} l - Objet contenant {id, x1, y1, x2, y2, value}
 * @param {number} index - Index de la poutre pour la numérotation
 */
export function DistributedLoad({ l, index }) {
  const height = 40;
  const spacing = 20;
  const isNegative = l.value < 0;
  const label = `q${index + 1}`;
  console.log(label);

  // 1. Calcul de l'angle et de la longueur
  const dx = l.x2 - l.x1;
  const dy = l.y2 - l.y1;
  const angle = Math.atan2(dy, dx);
  const length = Math.sqrt(dx * dx + dy * dy);

  // 2. Calcul du décalage perpendiculaire pour la barre bleue
  // La barre est toujours dessinée "au-dessus" (sens normal -90°)
  const offsetX = Math.cos(angle - Math.PI / 2) * height;
  const offsetY = Math.sin(angle - Math.PI / 2) * height;

  const topX1 = l.x1 + offsetX;
  const topY1 = l.y1 + offsetY;
  const topX2 = l.x2 + offsetX;
  const topY2 = l.y2 + offsetY;

  // 3. Calcul des flèches
  const numArrows = Math.max(1, Math.floor(length / spacing));
  const arrows = [];
  for (let i = 0; i <= numArrows; i++) {
    const t = i / numArrows;
    const ax1 = l.x1 + t * dx + offsetX;
    const ay1 = l.y1 + t * dy + offsetY;
    const ax2 = l.x1 + t * dx;
    const ay2 = l.y1 + t * dy;

    arrows.push(
        <Arrow
          key={`q-arrow-${l.id}-${i}`}
          points={[ax1, ay1, ax2, ay2]}
          pointerLength={8}
          pointerWidth={8}
          fill="blue"
          stroke="blue"
          strokeWidth={1}
          pointerAtBeginning={isNegative}
          pointerAtEnd={!isNegative}
        />
    );
  }

  // 4. Positionnement du texte
  // On le place toujours "au-dessus" de la barre bleue (donc à height + marge)
  const textDist = height + 25; 
  
  // Point central de la poutre
  const midX = (l.x1 + l.x2) / 2;
  const midY = (l.y1 + l.y2) / 2;

  // Vecteur normal unitaire
  const normX = Math.cos(angle - Math.PI / 2);
  const normY = Math.sin(angle - Math.PI / 2);

  // Position finale du centre du texte
  const textX = midX + normX * textDist;
  const textY = midY + normY * textDist;

  return (
    <Group>
      <Line
        points={[topX1, topY1, topX2, topY2]}
        stroke="blue"
        strokeWidth={2}
      />
      {arrows}
      
      <Text
        x={textX}
        y={textY}
        text={`${label}= ${l.value} N/m`}
        rotation={(angle * 180) / Math.PI}
        // C'est ici la clé : on définit le pivot au centre du bloc de texte
        offsetX={40} // Moitié de la largeur (width=80)
        offsetY={7}  // Moitié approximative de la hauteur de police
        width={80}
        align="center"
        fill="blue"
        fontStyle="bold"
        fontSize={12}
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
export function Moment({ m, index}) {
  const radius = 18;
  const isCCW = m.direction; // Positif = Anti-horaire

  // Angles cibles pour la pointe de la flèche
  const angleCCW = (5 * Math.PI) / 6; // 150 degrés
  const angleCW = (7 * Math.PI) / 6;  // 210 degrés
  
  // Petit décalage pour définir la queue de la flèche
  const step = 0.2; 

  // On calcule les points : [QUEUE_X, QUEUE_Y, TÊTE_X, TÊTE_Y]
  // La flèche pointe toujours vers le 2ème point.
  const arrowPoints = isCCW
    ? [
        // Sens CCW : on part d'un angle plus petit pour aller vers 150°
        radius * Math.cos(angleCCW - step),
        radius * Math.sin(angleCCW - step),
        radius * Math.cos(angleCCW),
        radius * Math.sin(angleCCW),
      ]
    : [
        // Sens CW : on part d'un angle plus grand pour aller vers 210°
        radius * Math.cos(angleCW + step),
        radius * Math.sin(angleCW + step),
        radius * Math.cos(angleCW),
        radius * Math.sin(angleCW),
      ];

  return (
    <Group x={m.x} y={m.y}>
      <Arc
        innerRadius={radius}
        outerRadius={radius}
        angle={280}
        stroke="purple"
        strokeWidth={3}
        rotation={220}
      />

      <Arrow
        points={arrowPoints}
        stroke="purple"
        fill="purple"
        strokeWidth={3}
        pointerLength={10}
        pointerWidth={10}
      />

      <Text
        x={-40}
        y={-radius - 20}
        width={80}
        align="center"
        text={`M${index+1} = ${m.value} Nm`}
        fill="purple"
        fontStyle="bold"
        fontSize={12}
      />
    </Group>
  );
}

/**
 * Composant Encastrement (Fixed Support).
 * Représenté par une ligne hachurée perpendiculaire à l'angle donné.
 * @param {Object} s - {id, x, y, angle} (angle en degrés)
 */
export function FixedSupport({ s, index }) {
  const height = 30; // Hauteur de la représentation du mur
  const width = 10;  // Largeur des hachures
  const label = `E${index + 1}`;

  // Génération des hachures
  const hatches = [];
  for (let i = -height / 2; i <= height / 2; i += 5) {
    hatches.push(
      <Line
        key={`hatch-${i}`}
        points={[-width, i + 5, 0, i]} // Diagonales vers la gauche
        stroke="#334155" // Slate 700
        strokeWidth={1}
      />
    );
  }

  return (
    <Group x={s.x} y={s.y} rotation={s.angle}>
      {/* Ligne principale (le mur) */}
      <Line
        points={[0, -height / 2, 0, height / 2]}
        stroke="#334155"
        strokeWidth={3}
        lineCap="round"
      />
      
      {/* Les hachures */}
      {hatches}

      {/* Point de contact */}
      <Circle radius={3} fill="#334155" />

      {/* Libellé */}
      <Text
        x={-25}
        y={-25}
        text={label}
        fill="#334155"
        fontSize={12}
        fontStyle="bold"
        rotation={-s.angle} // Pour que le texte reste droit
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