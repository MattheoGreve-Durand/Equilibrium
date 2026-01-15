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
    // ÉTAPE 1 : Premier clic (Début de la poutre)
    if (!toolState.p1) {
      setToolState({ ...toolState, p1: point });
      return false; // L'action n'est pas finie, on attend le 2ème clic
    } 
    
    // ÉTAPE 2 : Deuxième clic (Fin de la poutre)
    else {
      dataContext.addBeam({
        x1: toolState.p1.x,
        y1: toolState.p1.y,
        x2: point.x,
        y2: point.y
      });
      return true;
    }
  },

  // Optionnel : Message d'aide à afficher dans l'interface
  getHelpText: (toolState) => {
    return !toolState.p1 ? "Cliquez pour démarrer la poutre" : "Cliquez pour finir la poutre";
  }
};