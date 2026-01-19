/**
 * Générateur d'outil de support générique.
 * @param {string} methodName - Nom de la méthode dans DataContext (ex: 'addFixed')
 * @param {Object} options - Options de comportement (ex: snapToEnds)
 */
const createSupportTool = (methodName, { snapToEnds = false } = {}) => ({
  onClick: (point, toolState, setToolState, dataContext) => {
    const { beams } = dataContext;
    const addFunc = dataContext[methodName]; // Récupération dynamique de la fonction d'ajout
    
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

    // 2. Si une poutre est trouvée
    if (bestBeam && bestProj) {
      let finalX = bestProj.x;
      let finalY = bestProj.y;

      // --- LOGIQUE DE SNAPPING AUX EXTRÉMITÉS ---
      // Si activé, on force la position sur le bout de la poutre le plus proche du clic
      if (snapToEnds) {
        const d1 = Math.sqrt(Math.pow(point.x - bestBeam.x1, 2) + Math.pow(point.y - bestBeam.y1, 2));
        const d2 = Math.sqrt(Math.pow(point.x - bestBeam.x2, 2) + Math.pow(point.y - bestBeam.y2, 2));

        if (d1 < d2) {
          finalX = bestBeam.x1;
          finalY = bestBeam.y1;
        } else {
          finalX = bestBeam.x2;
          finalY = bestBeam.y2;
        }
      }

      addFunc({
        x: finalX,
        y: finalY,
        angle: 0, 
        beamId: bestBeam.id
      });
      return true; // Action terminée
    }
    return false; // Pas de poutre trouvée, on continue
  },
  getHelpText: () => snapToEnds 
    ? "Cliquez vers une extrémité de la poutre pour placer l'encastrement." 
    : "Cliquez sur la poutre pour placer l'appui."
});

// --- EXPORTS DES OUTILS ---

// Encastrement : Snap activé (True)
export const fixedTool = createSupportTool('addFixed', { snapToEnds: true });

// Appuis simples et rouleaux : Snap désactivé (False) pour permettre de les mettre au milieu
export const pinnedTool = createSupportTool('addPinned', { snapToEnds: false });
export const rollerTool = createSupportTool('addRolled', { snapToEnds: false });


// --- FONCTIONS UTILITAIRES ---

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