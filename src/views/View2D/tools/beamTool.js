export const beamTool = {
  /**
   * Gère le clic pour l'outil POUTRE
   * @param {Object} point - Le point cliqué {x, y}
   * @param {Object} toolState - L'état temporaire actuel (ex: { step: 0, p1: null })
   * @param {Function} setToolState - Pour mettre à jour l'état temporaire
   * @param {Object} dataContext - Accès aux fonctions addBeam, addForce...
   * @returns {boolean} - true si l'action est terminée (on peut reset), false sinon
   */
  onClick: (point, toolState, setToolState, dataContext) => {
    const { beams, addBeam, addAngle } = dataContext;
    
    // 1. Snapping Intelligent
    // On cherche d'abord un NOEUD, sinon une PROJECTION sur une poutre
    const snapResult = findBestSnap(point, beams);
    const snappedPoint = snapResult.point;

    // ÉTAPE 1 : Premier clic
    if (!toolState.p1) {
      setToolState({ ...toolState, p1: snappedPoint });
      return false; 
    } 
    
    // ÉTAPE 2 : Deuxième clic
    else {
      // Sécurité longueur nulle
      if (snappedPoint.x === toolState.p1.x && snappedPoint.y === toolState.p1.y) {
        return false;
      }

      // 2. Création de la poutre
      const newBeamId = Date.now();
      const newBeam = {
        id: newBeamId,
        x1: toolState.p1.x,
        y1: toolState.p1.y,
        x2: snappedPoint.x,
        y2: snappedPoint.y
      };
      
      addBeam(newBeam);

      // 3. Création des Angles (Connexions Noeuds ET T-Junctions)
      
      // Connexion au DÉPART
      // On regarde si le point p1 touche une poutre (soit un noeud, soit le corps)
      const startBeam = findBeamTouchingPoint(toolState.p1, beams);
      if (startBeam) {
        addAngle({
          beamId1: startBeam.id,
          beamId2: newBeamId,
          cx: toolState.p1.x,
          cy: toolState.p1.y,
          value: null
        });
      }

      // Connexion à l'ARRIVÉE
      const endBeam = findBeamTouchingPoint(snappedPoint, beams);
      if (endBeam) {
        addAngle({
          beamId1: endBeam.id,
          beamId2: newBeamId,
          cx: snappedPoint.x,
          cy: snappedPoint.y,
          value: null
        });
      }

      return true;
    }
  },

  getHelpText: (toolState) => {
    return !toolState.p1 
      ? "Cliquez pour démarrer (Aimantation Noeuds & Segments)" 
      : "Cliquez pour finir la poutre";
  }
};

// --- FONCTIONS UTILITAIRES AVANCÉES ---

function findBestSnap(point, beams, nodeTolerance = 15, lineTolerance = 15) {
  // 1. Essayer de trouver un noeud (Priorité absolue)
  let bestNodeDist = Infinity;
  let bestNode = null;

  beams.forEach(b => {
    const d1 = dist(point, {x: b.x1, y: b.y1});
    if (d1 < nodeTolerance && d1 < bestNodeDist) { bestNodeDist = d1; bestNode = {x: b.x1, y: b.y1}; }
    
    const d2 = dist(point, {x: b.x2, y: b.y2});
    if (d2 < nodeTolerance && d2 < bestNodeDist) { bestNodeDist = d2; bestNode = {x: b.x2, y: b.y2}; }
  });

  if (bestNode) return { point: bestNode, type: 'NODE' };

  // 2. Sinon, essayer de trouver une projection sur une ligne
  let bestLineDist = Infinity;
  let bestProj = null;

  beams.forEach(b => {
    const proj = getProjectedPointOnLine(point, b);
    const d = dist(point, proj);
    if (d < lineTolerance && d < bestLineDist && isPointOnSegment(proj, b)) {
      bestLineDist = d;
      bestProj = proj;
    }
  });

  if (bestProj) return { point: { x: bestProj.x, y: bestProj.y }, type: 'LINE' };

  // 3. Sinon, return point brut
  return { point: point, type: 'FREE' };
}

/**
 * Trouve une poutre qui "contient" ce point (Noeud OU Segment)
 * Utile pour créer l'angle même au milieu d'une poutre.
 */
function findBeamTouchingPoint(point, beams, tolerance = 1) {
  return beams.find(b => {
    // Test Noeuds
    if (dist(point, {x: b.x1, y: b.y1}) < tolerance) return true;
    if (dist(point, {x: b.x2, y: b.y2}) < tolerance) return true;
    
    // Test Segment (Projection)
    const proj = getProjectedPointOnLine(point, b);
    const d = dist(point, proj);
    return (d < tolerance && isPointOnSegment(proj, b));
  });
}

// Helpers Math
function dist(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function getProjectedPointOnLine(point, beam) {
  const { x1, y1, x2, y2 } = beam;
  const ABx = x2 - x1;
  const ABy = y2 - y1;
  const APx = point.x - x1;
  const APy = point.y - y1;
  const abSquared = ABx * ABx + ABy * ABy;
  if (abSquared === 0) return { x: x1, y: y1, t: 0 };
  const t = (APx * ABx + APy * ABy) / abSquared;
  return { x: x1 + t * ABx, y: y1 + t * ABy, t: t };
}

function isPointOnSegment(proj, beam) {
  // Tolérance plus stricte ici pour éviter les faux positifs aux bouts
  return proj.t >= -0.01 && proj.t <= 1.01;
}