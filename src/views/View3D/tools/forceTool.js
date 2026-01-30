import * as THREE from 'three';

export const forceTool = {
  /**
   * Survol (Move) : On cherche la poutre la plus proche pour afficher le fantôme.
   */
  onMove: (point, toolState, setToolState, isShiftPressed, dataContext) => {
    // Si dataContext n'est pas passé dans onMove (dépend de l'implémentation dans indexTool/ToolsOverlay),
    // on devra peut-être le récupérer autrement.
    // MAIS : Dans ToolsOverlay, nous n'avons pas passé 'beams' à onMove. 
    // CORRECTION RAPIDE : On va assumer que le calcul de snap se fait ici ou dans l'Overlay.
    // Pour simplifier l'architecture actuelle sans tout refaire, on va calculer le snap dans l'Overlay 
    // ou passer les poutres. 
    
    // Pour l'instant, stockons juste le point brut. 
    // L'intelligence de snap sera faite dans ToolsOverlay pour l'affichage,
    // ou alors on accepte que le point soit libre si on ne touche pas de poutre.
    setToolState({ position: point });
  },

  /**
   * Clic : On valide la position et on crée la force.
   */
  onClick: (point, toolState, setToolState, dataContext) => {
    const { addForce, beams } = dataContext;
    
    // 1. Chercher la poutre la plus proche du clic
    const snap = findClosestBeam(point, beams);

    if (snap) {
      addForce({
        position: [snap.point.x, snap.point.y, snap.point.z],
        direction: [0, -1, 0], // Par défaut vers le bas
        value: 100,            // Valeur par défaut
        beamId: snap.beam.id
      });
      return true; // Fini
    } else {
      // Si on clique dans le vide, on peut soit ne rien faire, soit placer une force "libre"
      // Pour la RDM, on préfère souvent forcer le placement sur une poutre.
      console.log("Veuillez cliquer sur une poutre.");
      return false; 
    }
  },

  getHelpText: () => "Cliquez sur une poutre pour ajouter une force verticale."
};

// --- UTILITAIRE DE SNAP 3D ---

function findClosestBeam(point, beams) {
  const CLICK_TOLERANCE = 0.5; // Tolérance en mètres (unités 3D)
  let bestDist = Infinity;
  let bestResult = null;

  const P = new THREE.Vector3(point.x, point.y, point.z);

  beams.forEach(beam => {
    const A = new THREE.Vector3(...beam.start);
    const B = new THREE.Vector3(...beam.end);
    
    // Projection du point P sur le segment AB
    const AB = new THREE.Vector3().subVectors(B, A);
    const AP = new THREE.Vector3().subVectors(P, A);
    
    const lenSq = AB.lengthSq();
    let t = (lenSq === 0) ? -1 : AP.dot(AB) / lenSq;
    
    // Clamping pour rester sur le segment
    t = Math.max(0, Math.min(1, t));
    
    // Point projeté C
    const C = new THREE.Vector3().copy(A).add(AB.multiplyScalar(t));
    
    const dist = P.distanceTo(C);

    if (dist < CLICK_TOLERANCE && dist < bestDist) {
      bestDist = dist;
      bestResult = { point: C, beam: beam };
    }
  });

  return bestResult;
}