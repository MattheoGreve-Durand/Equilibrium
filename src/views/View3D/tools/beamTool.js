export const beamTool = {
  /**
   * Gestion du CLIC
   */
  onClick: (point, toolState, setToolState, dataContext) => {
    const { addBeam } = dataContext;

    // ÉTAPE 1 : Premier clic -> On définit le point de départ
    if (!toolState.startPoint) {
      setToolState({ 
        ...toolState, 
        startPoint: point // {x, y, z}
      });
      return false; // L'action n'est pas finie
    } 
    
    // ÉTAPE 2 : Deuxième clic -> On crée la poutre
    else {
      // Sécurité : Longueur nulle
      const dist = Math.sqrt(
        Math.pow(point.x - toolState.startPoint.x, 2) + 
        Math.pow(point.y - toolState.startPoint.y, 2) + 
        Math.pow(point.z - toolState.startPoint.z, 2)
      );
      
      if (dist < 0.01) return false;

      const newBeam = {
        start: [toolState.startPoint.x, toolState.startPoint.y, toolState.startPoint.z],
        end: [point.x, point.y, point.z],
        diameter: 0.2
      };

      addBeam(newBeam);

      // On retourne true pour dire "Action terminée", ce qui reset le toolState
      return true; 
    }
  },

  /**
   * Gestion du SURVOL (Move)
   * Sert principalement à mettre à jour le point de fin temporaire pour le preview
   */
  onMove: (point, toolState, setToolState, isShiftPressed) => {
    // Si on a déjà un point de départ, on met à jour le point courant (endPoint virtuel)
    // Cela permettra à l'interface d'afficher la poutre fantôme
    setToolState(prev => ({
      ...prev,
      currentPoint: point
    }));
  },

  /**
   * Helper pour l'affichage (texte d'aide)
   */
  getHelpText: (toolState) => {
    return !toolState.startPoint 
      ? "Cliquez pour définir le début de la poutre" 
      : "Cliquez pour définir la fin (Shift pour snapper)";
  }
};