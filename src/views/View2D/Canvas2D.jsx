import React, { useRef, useState, useEffect } from 'react'
import { Stage, Layer, Line, Circle, Group, Arrow, Text } from 'react-konva' // <-- Ajout de Arrow et Text
import { useData2D } from '../../contexts/Data2DContext'
import { Beam, Force } from './Shapes.jsx'

export default function Canvas2D() {
  const { beams, forces } = useData2D()
  const divRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Hook pour adapter la taille du canvas à la fenêtre
  useEffect(() => {
    const updateSize = () => {
      if (divRef.current) {
        setDimensions({
          width: divRef.current.offsetWidth,
          height: divRef.current.offsetHeight,
        })
      }
    }
    window.addEventListener('resize', updateSize)
    updateSize() 
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Configuration du repère
  const axisLength = 50
  const originOffset = 60 // Marge par rapport au bord bas-gauche
  
  // Position d'origine du repère (Bas-Gauche)
  const originX = originOffset
  const originY = dimensions.height - originOffset

  return (
    <div ref={divRef} className="konva-wrapper">
      <Stage width={dimensions.width} height={dimensions.height}>
        <Layer>
          
          {/* --- GRILLE DE FOND (Optionnelle) --- */}
          {/* Tu pourras ajouter une grille infinie ici plus tard */}


          {/* --- OBJETS (Poutres & Forces) --- */}

          {beams.map((b) => (
            <Beam b={b} />
          ))}

          {forces.map((f) => (
            <Force f={f} />
          ))}


          {/* --- REPÈRE X/Y (Fixe en bas à gauche) --- */}
          {dimensions.height > 0 && (
            <Group x={originX} y={originY}>
              <Arrow 
                points={[0, 0, axisLength, 0]} 
                stroke="red" 
                strokeWidth={2} 
                pointerLength={6} 
                pointerWidth={6} 
              />
              <Text 
                x={axisLength + 5} 
                y={-5} 
                text="X" 
                fill="red" 
                fontStyle="bold" 
              />

              <Arrow 
                points={[0, 0, 0, -axisLength]} 
                stroke="green" 
                strokeWidth={2} 
                pointerLength={6} 
                pointerWidth={6} 
              />
              <Text 
                x={-5} 
                y={-axisLength - 15} 
                text="Y" 
                fill="green" 
                fontStyle="bold" 
              />
              
              <Circle radius={3} fill="#1f2937" />
            </Group>
          )}

        </Layer>
      </Stage>
    </div>
  )
}