export const forceTool = {
  onClick: (point, toolState, setToolState, dataContext) => {
    const { beams, addForce } = dataContext;
    const CLICK_TOLERANCE = 15;

    let bestDist = Infinity;
    let bestBeam = null;
    let bestProj = null;

    beams.forEach((beam) => {
      const proj = getProjectedPointOnLine(point, beam);
      const dist = Math.sqrt(Math.pow(point.x - proj.x, 2) + Math.pow(point.y - proj.y, 2));

      if (dist < CLICK_TOLERANCE && dist < bestDist) {
        if (isPointOnSegment(proj, beam)) {
          bestDist = dist;
          bestBeam = beam;
          bestProj = proj;
        }
      }
    });

    if (bestBeam && bestProj) {
      const dx = bestBeam.x2 - bestBeam.x1;
      const dy = bestBeam.y2 - bestBeam.y1;
      const beamAngleRad = Math.atan2(dy, dx);
      const beamAngleDeg = (beamAngleRad * 180) / Math.PI;

      // CORRECTION : On ajoute 90 degrés pour être perpendiculaire à la poutre
      // On utilise un angle de base de 0 pour la flèche pointant vers le bas
      console.log({
        x: bestProj.x,
        y: bestProj.y,
        value: 100,
        angle: beamAngleDeg,
        beamId: bestBeam.id 
      })
      addForce({
        x: bestProj.x,
        y: bestProj.y,
        value: 100,
        angle: beamAngleDeg ,
        beamId: bestBeam.id 
      });

      return true;
    }
    return false;
  },
  getHelpText: () => "Cliquez sur une poutre pour y placer une force perpendiculaire."
};


// --- FONCTIONS UTILITAIRES MATHÉMATIQUES ---

/**
 * Calcule la projection orthogonale d'un point P sur la droite définie par la poutre.
 */
function getProjectedPointOnLine(point, beam) {
  const { x1, y1, x2, y2 } = beam;
  
  // Vecteur AB (Poutre)
  const ABx = x2 - x1;
  const ABy = y2 - y1;
  
  // Vecteur AP (Origine poutre -> Point cliqué)
  const APx = point.x - x1;
  const APy = point.y - y1;

  // Produit scalaire AP . AB / |AB|^2
  // Cela nous donne "t", la position relative sur le segment (0 = début, 1 = fin)
  const abSquared = ABx * ABx + ABy * ABy;
  if (abSquared === 0) return { x: x1, y: y1 }; // Poutre de longueur nulle

  const t = (APx * ABx + APy * ABy) / abSquared;

  // Le point projeté
  return {
    x: x1 + t * ABx,
    y: y1 + t * ABy,
    t: t // Utile pour savoir si on est hors du segment
  };
}

/**
 * Vérifie si le point projeté est bien entre les extrémités de la poutre.
 */
function isPointOnSegment(proj, beam) {
  // On accepte une petite marge d'erreur (ex: 0.0 à 1.0)
  return proj.t >= 0 && proj.t <= 1;
}