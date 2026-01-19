export const loadTool = {
  /**
   * Création d'une charge répartie sur une poutre.
   * Clic 1 : Point de départ (snap sur poutre)
   * Clic 2 : Point d'arrivée (snap sur même poutre)
   */
  onClick: (point, toolState, setToolState, dataContext) => {
    const { beams, addLoad } = dataContext;
    const CLICK_TOLERANCE = 20;

    // Fonction locale pour trouver la poutre la plus proche
    const findClosestBeam = (p) => {
      let best = { dist: Infinity, beam: null, proj: null };
      beams.forEach((beam) => {
        const proj = getProjectedPointOnLine(p, beam);
        const dist = Math.sqrt(Math.pow(p.x - proj.x, 2) + Math.pow(p.y - proj.y, 2));
        if (dist < CLICK_TOLERANCE && dist < best.dist) {
          if (isPointOnSegment(proj, beam)) {
            best = { dist, beam, proj };
          }
        }
      });
      return best;
    };

    // --- ETAPE 1 : PREMIER POINT ---
    if (!toolState.step) {
      const { beam, proj } = findClosestBeam(point);
      
      if (beam && proj) {
        // On sauvegarde la poutre et le premier point
        setToolState({ 
          step: 1, 
          beamId: beam.id, 
          p1: proj 
        });
      } else {
        console.log("Veuillez cliquer sur une poutre.");
      }
      return false; // Pas fini
    } 
    
    // --- ETAPE 2 : SECOND POINT ---
    else {
      const { beam, proj } = findClosestBeam(point);

      // On vérifie qu'on est bien sur la MÊME poutre
      if (beam && proj && beam.id === toolState.beamId) {
        addLoad({
          x1: toolState.p1.x,
          y1: toolState.p1.y,
          x2: proj.x,
          y2: proj.y,
          value: 500, // N/m par défaut
          beamId: beam.id
        });
        return true; // Terminé
      } else {
        console.log("Le point de fin doit être sur la même poutre.");
        // On ne reset pas, on laisse l'utilisateur réessayer
        return false;
      }
    }
  },

  getHelpText: (toolState) => {
    return !toolState.step 
      ? "Cliquez sur une poutre pour commencer la charge" 
      : "Cliquez plus loin sur la même poutre pour finir la charge";
  }
};

// --- Helpers (Dupliqués pour l'indépendance du fichier) ---
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