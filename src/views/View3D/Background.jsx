import React from 'react'
import * as THREE from 'three';
import { Grid, Text } from '@react-three/drei'

/**
 * Repère d'origine (Gizmo central)
 * Affiche les axes X (Rouge), Y (Vert), Z (Bleu) au point (0,0,0)
 */
export function WorldOrigin() {
  return (
    <group>
      {/* Axes Helper natif : X=Red, Y=Green, Z=Blue. Longueur = 5 unités */}
      <axesHelper args={[5]} />
      
      {/* Labels textuels au bout des axes */}
      <Text position={[5.2, 0, 0]} fontSize={0.3} color="#ef4444" anchorX="left">X</Text>
      <Text position={[0, 5.2, 0]} fontSize={0.3} color="#22c55e" anchorY="bottom">Y</Text>
      <Text position={[0, 0, 5.2]} fontSize={0.3} color="#3b82f6" anchorX="right">Z</Text>
    </group>
  )
}

/**
 * Les 3 Grilles de référence (XY, XZ, YZ)
 */
export function ReferenceGrids() {
  const commonProps = {
    cellSize: 1,
    sectionSize: 5,
    fadeDistance: 30,
    side: THREE.DoubleSide
  }

  return (
    <group>
      {/* --- SOL (XZ) : INFINI --- */}
      <Grid 
        position={[0, -0.01, 0]} 
        args={[20, 20]} 
        {...commonProps}
        infiniteGrid={true} // Le sol reste infini pour l'immersion
        cellColor="#cbd5e1" 
        sectionColor="#94a3b8" 
      />

      {/* --- MUR DU FOND (XY) : FINI --- */}
      <Grid 
        position={[0, 10, -0.01]} // Remonté de 10m (moitié de la hauteur) pour être posé sur le sol
        rotation={[Math.PI / 2, 0, 0]} 
        args={[20, 20]} // Taille fixe 20x20
        {...commonProps}
        infiniteGrid={true} // Désactivé pour éviter le bug graphique
        cellColor="#fca5a5" // Teinte Rouge pâle (Axe X)
        sectionColor="#ef4444" 
      />

      {/* --- MUR DE GAUCHE (YZ) : FINI --- */}
      <Grid 
        position={[-0.01, 10, 0]} // Remonté de 10m
        rotation={[0, 0, Math.PI / 2]} 
        args={[20, 20]} 
        {...commonProps}
        infiniteGrid={true} // Désactivé
        cellColor="#93c5fd" // Teinte Bleue pâle (Axe Z)
        sectionColor="#3b82f6" 
      />
    </group>
  )
}

/**
 * Panneau d'information HTML (Overlay) pour la 3D
 */
export function InfoPanel() {
  return (
    <div style={{
      position: 'absolute',
      top: 10,
      left: 10,
      zIndex: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: '10px',
      borderRadius: '6px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      fontFamily: 'sans-serif',
      fontSize: '12px',
      color: '#334155',
      pointerEvents: 'none',
      userSelect: 'none'
    }}>
      <h4 style={{ margin: '0 0 5px 0', textDecoration: 'underline' }}>Contrôles 3D</h4>
      <ul style={{ margin: 0, paddingLeft: '15px' }}>
        <li><strong>Clic Gauche</strong> : Rotation (Orbit)</li>
        <li><strong>Shift + Clic</strong> : Panoramique (Pan)</li>
        <li><strong>Shift (Outil)</strong> : Aimantation (Snap)</li>
        <li><strong>Molette</strong> : Zoom</li>
      </ul>
    </div>
  );
}

/**
 * Panneau d'état de l'outil actif.
 */
export function ToolStatusPanel({ activeTool, helpText }) {
  if (!activeTool) return null;

  return (
    <div style={{
      position: 'absolute', 
      bottom: 10, 
      right: 10, 
      background: '#fff', 
      padding: '8px 12px', 
      borderRadius: 4, 
      zIndex: 10, 
      fontSize: 12, 
      border: '2px solid #3b82f6', 
      fontWeight: 'bold', 
      color: '#1e293b',
      pointerEvents: 'none',
      userSelect: 'none'
    }}>
      Outil : {activeTool} <br/>
      <span style={{ fontWeight: 'normal', color: '#64748b' }}>
        {helpText}
      </span>
    </div>
  );
}