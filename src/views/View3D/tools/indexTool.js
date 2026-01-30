import { beamTool } from './beamTool';
import { forceTool } from './forceTool';

export const tools3D = {
  BEAM: beamTool,
  FORCE: forceTool, 
};

export const handle3DToolClick = (activeToolName, point, toolState, setToolState, dataContext, camera) => {
  const tool = tools3D[activeToolName];
  if (!tool) return;

  if (tool.onClick) {
    const isFinished = tool.onClick(point, toolState, setToolState, dataContext);
    if (isFinished) setToolState({});
  }
};

// Note : J'ai ajouté dataContext ici aussi pour pouvoir accéder aux 'beams' lors du mouvement si besoin
export const handle3DToolMove = (activeToolName, point, toolState, setToolState, isShiftPressed, dataContext) => {
  const tool = tools3D[activeToolName];
  if (!tool || !tool.onMove) return;

  tool.onMove(point, toolState, setToolState, isShiftPressed, dataContext);
};

export function getToolHelp(activeTool, toolState) {
  const tool = tools3D[activeTool];
  if (tool && tool.getHelpText) {
    return tool.getHelpText(toolState);
  }
  return "";
}