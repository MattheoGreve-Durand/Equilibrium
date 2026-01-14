import React, { createContext, useContext, useState } from 'react'

const Data2DContext = createContext()

export function Data2DProvider({ children }) {
  // Minimal example data structure for beams and forces
  const [beams, setBeams] = useState([
    { id: 1, x1: 10, y1: 100, x2: 300, y2: 100 },
  ])
  const [forces, setForces] = useState([
    { id: 1, x: 50, y: 80, value: 10 },
  ])

  const addBeam = (beam) => setBeams((b) => [...b, { id: Date.now(), ...beam }])
  const addForce = (force) => setForces((f) => [...f, { id: Date.now(), ...force }])

  return (
    <Data2DContext.Provider value={{ beams, forces, addBeam, addForce }}>
      {children}
    </Data2DContext.Provider>
  )
}

export function useData2D() {
  const ctx = useContext(Data2DContext)
  if (!ctx) throw new Error('useData2D must be used within Data2DProvider')
  return ctx
}

export default Data2DContext
