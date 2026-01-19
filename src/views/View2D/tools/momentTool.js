export const momentTool = {
  /**
   * Place un moment sur la poutre la plus proche.
   */
  onClick: (point, toolState, setToolState, dataContext) => {
    const { beams, addMoment } = dataContext;
    const CLICK_TOLERANCE = 15;

    let bestDist = Infinity;
    let bestBeam = null;
    let bestProj = null;

    // 1. Trouver la poutre la plus proche
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

    // 2. Si une poutre est trouvée, on ajoute le moment
    if (bestBeam && bestProj) {
      addMoment({
        x: bestProj.x,
        y: bestProj.y,
        value: 50, // Valeur par défaut positive
        direction: 1, // 1 = Anti-horaire (CCW), -1 = Horaire (CW)
        beamId: bestBeam.id
      });
      return true; // Outil terminé
    }

    return false;
  },

  getHelpText: () => "Cliquez sur une poutre pour ajouter un moment."
};

function getProjectedPointOnLine(point, beam) {
  const { x1, y1, x2, y2 } = beam;
  const ABx = x2 - x1;
  const ABy = y2 - y1;
  const APx = point.x - x1;
  const APy = point.y - y1;
  const abSquared = ABx * ABx + ABy * ABy;
  if (abSquared === 0) return { x: x1, y: y1 };
  const t = (APx * ABx + APy * ABy) / abSquared;
  return { x: x1 + t * ABx, y: y1 + t * ABy, t: t };
}

function isPointOnSegment(proj, beam) {
  return proj.t >= 0 && proj.t <= 1;
}