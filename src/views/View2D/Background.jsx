import React from 'react';
import { Layer, Line, Circle, Group, Arrow, Text } from 'react-konva';

/**
 * Composant regroupant les éléments de décor et de repère.
 */
export function Grid({ dimensions, gridSize = 50 }) {
  const gridLines = [];
  
  if (dimensions.width > 0 && dimensions.height > 0) {
    // Lignes verticales
    for (let i = 0; i <= dimensions.width; i += gridSize) {
      gridLines.push(
        <Line key={`v-${i}`} points={[i, 0, i, dimensions.height]} stroke="#e2e8f0" strokeWidth={1} />
      );
    }
    // Lignes horizontales
    for (let j = 0; j <= dimensions.height; j += gridSize) {
      gridLines.push(
        <Line key={`h-${j}`} points={[0, j, dimensions.width, j]} stroke="#e2e8f0" strokeWidth={1} />
      );
    }
  }

  return <Layer>{gridLines}</Layer>;
}

export function Gizmo({ dimensions, gridSize = 50 }) {
  const axisLength = 50;
  const margin = 60;

  // Snapping du Gizmo sur la grille
  const originX = Math.round(margin / gridSize) * gridSize;
  const originY = Math.floor((dimensions.height - margin) / gridSize) * gridSize;

  if (dimensions.height <= 0) return null;

  return (
    <Group x={originX} y={originY}>
      {/* Axe X */}
      <Arrow points={[0, 0, axisLength, 0]} stroke="red" strokeWidth={2} pointerLength={6} pointerWidth={6} />
      <Text x={axisLength + 5} y={-5} text="X" fill="red" fontStyle="bold" />

      {/* Axe Y */}
      <Arrow points={[0, 0, 0, -axisLength]} stroke="green" strokeWidth={2} pointerLength={6} pointerWidth={6} />
      <Text x={-5} y={-axisLength - 15} text="Y" fill="green" fontStyle="bold" />
      
      <Circle radius={3} fill="#1f2937" />

      {/* Échelle visuelle (1 m) */}
      <Group x={gridSize*2}>
        <Line points={[0, 0, gridSize, 0]} stroke="#64748b" strokeWidth={2} />
        <Line points={[0, -3, 0, 3]} stroke="#64748b" strokeWidth={2} />
        <Line points={[gridSize, -3, gridSize, 3]} stroke="#64748b" strokeWidth={2} />
        <Text x={0} y={8} width={gridSize} align="center" text="1 m" fill="#64748b" fontSize={10} fontStyle="italic" />
      </Group>
    </Group>
  );
}