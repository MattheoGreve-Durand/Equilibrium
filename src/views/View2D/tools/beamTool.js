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
    
    // Snapping
    const snappedPoint = findClosestNode(point, beams);

    if (!toolState.p1) {
      setToolState({ ...toolState, p1: snappedPoint });
      return false; 
    } else {
      if (snappedPoint.x === toolState.p1.x && snappedPoint.y === toolState.p1.y) return false;

      // 1. Création poutre
      const newBeamId = Date.now();
      const newBeam = {
        id: newBeamId,
        x1: toolState.p1.x,
        y1: toolState.p1.y,
        x2: snappedPoint.x,
        y2: snappedPoint.y
      };
      
      console.log("1. Ajout Poutre : ", newBeamId);
      addBeam(newBeam);

      // 2. Détection Angle
      // On cherche si le point de départ touche une autre poutre
      const startNodeBeam = findBeamAtNode(toolState.p1, beams);
      
      if (startNodeBeam) {
        console.log("2. Connexion trouvée au départ avec poutre :", startNodeBeam.id);
        if (addAngle) {
            addAngle({
              beamId1: startNodeBeam.id,
              beamId2: newBeamId,
              cx: toolState.p1.x,
              cy: toolState.p1.y,
              value: null
            });
            console.log(">> Angle ajouté (Départ) !");
        } else {
            console.error("ERREUR : addAngle n'existe pas dans le contexte !");
        }
      }

      // On cherche si le point d'arrivée touche une autre poutre
      const endNodeBeam = findBeamAtNode(snappedPoint, beams);
      
      if (endNodeBeam) {
        console.log("3. Connexion trouvée à l'arrivée avec poutre :", endNodeBeam.id);
        if (addAngle) {
            addAngle({
              beamId1: endNodeBeam.id,
              beamId2: newBeamId,
              cx: snappedPoint.x,
              cy: snappedPoint.y,
              value: null
            });
            console.log(">> Angle ajouté (Arrivée) !");
        } else {
            console.error("ERREUR : addAngle n'existe pas dans le contexte !");
        }
      }

      return true;
    }
  },
  getHelpText: (toolState) => !toolState.p1 ? "Cliquez pour démarrer" : "Cliquez pour finir (Aimantation active)"
};

// --- Helpers ---
function findClosestNode(point, beams, tolerance = 15) {
  let bestDist = Infinity;
  let bestPoint = point;

  beams.forEach(b => {
    const d1 = Math.sqrt(Math.pow(point.x - b.x1, 2) + Math.pow(point.y - b.y1, 2));
    if (d1 < tolerance && d1 < bestDist) {
      bestDist = d1;
      bestPoint = { x: b.x1, y: b.y1 };
    }
    const d2 = Math.sqrt(Math.pow(point.x - b.x2, 2) + Math.pow(point.y - b.y2, 2));
    if (d2 < tolerance && d2 < bestDist) {
      bestDist = d2;
      bestPoint = { x: b.x2, y: b.y2 };
    }
  });
  return bestPoint;
}

function findBeamAtNode(node, beams, tolerance = 1) {
  // On cherche une poutre qui a ce noeud comme extrémité
  return beams.find(b => 
    (Math.abs(b.x1 - node.x) < tolerance && Math.abs(b.y1 - node.y) < tolerance) ||
    (Math.abs(b.x2 - node.x) < tolerance && Math.abs(b.y2 - node.y) < tolerance)
  );
}