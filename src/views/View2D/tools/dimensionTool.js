/**
   * @param {Object} point - {x, y}
   * @param {Object} toolState - { p1: {x,y} }
   * @param {Function} setToolState
   * @param {Object} dataContext
*/
export const dimensionTool = {
  /**
   * Outil de cotation.
   * Clic 1 : Point de départ
   * Clic 2 : Point d'arrivée -> Crée la mesure
   */
  onClick: (point, toolState, setToolState, dataContext) => {
    if (!toolState.p1) {
      setToolState({ ...toolState, p1: point });
      return false; // Action non terminée
    } 
    
    else {
     
      dataContext.addMeasurement({
        x1: toolState.p1.x,
        y1: toolState.p1.y,
        x2: point.x,
        y2: point.y,
        offset: 50 
      });
      return true;
    }
  },

  getHelpText: (toolState) => {
    return !toolState.p1 
      ? "Cliquez sur le premier point à mesurer" 
      : "Cliquez sur le deuxième point pour placer la cote";
  }
};