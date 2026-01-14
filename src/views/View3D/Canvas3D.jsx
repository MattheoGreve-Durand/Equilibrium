import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Environment } from '@react-three/drei'
import { useData3D } from '../../contexts/Data3DContext'

function Beam3D({ x, y, z }) {
  return (
    <mesh position={[x, y, z]} rotation={[0, 0, Math.PI / 2]}>
      {/* Une poutre cylindrique simple */}
      <cylinderGeometry args={[0.2, 0.2, 5, 32]} />
      <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.2} />
    </mesh>
  )
}

export default function Canvas3D() {
  const { objects } = useData3D()

  return (
    <div className="three-wrapper">
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }} shadows>
        {/* Environnement et Lumières */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <Environment preset="city" />

        {/* Aides visuelles */}
        <Grid infiniteGrid sectionSize={1} fadeDistance={25} cellColor="#cbd5e1" sectionColor="#94a3b8" />
        <OrbitControls makeDefault />

        {/* Objets de la scène */}
        {objects.map((obj) => (
          <Beam3D key={obj.id} x={obj.x} y={obj.y} z={obj.z} />
        ))}
        
        {/* Sol invisible pour capter les clics plus tard */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </Canvas>
    </div>
  )
}