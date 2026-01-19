import { beamTool } from './beamTool';
import { forceTool } from './forceTool';
import { dimensionTool } from './dimensionTool';
import { momentTool } from './momentTool';
import { loadTool } from './loadTool';

// Registre des outils disponibles
const tools = {
  'BEAM': beamTool,
  'FORCE': forceTool, 
  'MOMENT': momentTool,
  'DIMENSION': dimensionTool,
  'LOAD': loadTool,
};

/**
 * Fonction principale qui redirige le clic vers le bon fichier outil
 */
export function handleToolClick(activeTool, point, toolState, setToolState, dataContext) {
  const tool = tools[activeTool];

  if (tool && tool.onClick) {
    const isFinished = tool.onClick(point, toolState, setToolState, dataContext);
    
    // Si l'outil nous dit qu'il a fini (return true), on reset tout
    if (isFinished) {
      setToolState({}); // On vide l'état temporaire
      dataContext.setActiveTool(null); // Décommentez si vous voulez quitter l'outil après usage
    }
  }
}

/**
 * Récupère le texte d'aide (ex: "Cliquez pour placer le point 1")
 */
export function getToolHelp(activeTool, toolState) {
  const tool = tools[activeTool];
  if (tool && tool.getHelpText) {
    return tool.getHelpText(toolState);
  }
  return "";
}