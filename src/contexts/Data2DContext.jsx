import React, { createContext, useContext, useState } from 'react'

const Data2DContext = createContext()

export function Data2DProvider({ children }) {
  // Minimal example data structure for beams and forces
  const [beams, setBeams] = useState([
    { id: 1, x1: 10, y1: 100, x2: 300, y2: 100, length: 100},
  ])

  const [forces, setForces] = useState([
    { id: 2, x: 50, y: 80, value: 10 },
  ])

  const [loads, setLoad] = useState([
    {id: 3, x1: 300, x2: 400, y1: 300, y2: 200, value: 200}
  ])

  const [moments, setMoment] = useState([
    {id: 3, x: 100, y: 200, value: 200, direction: true}
  ])

  const [fixed, setFixed] = useState([
    {id: 4, x: 500, y: 400}
  ])

  const [pinned, setPinned] = useState([
    {id: 5, x: 700, y: 200}
  ])

  const [rolled, setRolled] = useState([
    {id: 6, x: 900, y: 200}
  ])




  const addBeam = (beam) => setBeams((b) => [...b, { id: Date.now(), ...beam }])
  const addForce = (force) => setForces((f) => [...f, { id: Date.now(), ...force }])
  const addLoad = (load) => setLoad((l) => [...l, { id: Date.now(), ...load }])
  const addMoment = (moment) => setMoment((m) => [...m, { id: Date.now(), ...moment }])
  const addFixed = (fixed) => setFixed((f) => [...f, { id: Date.now(), ...fixed }])
  const addPinned = (pinned) => setPinned((p) => [...p, { id: Date.now(), ...pinned }])
  const addRolled = (rolled) => setRolled((r) => [...r, { id: Date.now(), ...rolled }])

  const services = { beams, forces, loads, moments, fixed, pinned, rolled, addBeam, addForce, addLoad, addMoment, addFixed, addPinned, addRolled}

  return (
    <Data2DContext.Provider value={services}>
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
