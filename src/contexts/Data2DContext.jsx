import React, { createContext, useContext, useState } from 'react'

const Data2DContext = createContext()

export function Data2DProvider({ children }) {
  // --- ÉTAT DES OUTILS ---
  // null = aucun outil, 'BEAM' = création poutre, 'FORCE' = création force...
  const [activeTool, setActiveTool] = useState(null) 

  // --- DONNÉES EXISTANTES ---
  const [beams, setBeams] = useState([])
  const [forces, setForces] = useState([])
  const [loads, setLoad] = useState([])
  const [moments, setMoment] = useState([])
  const [fixed, setFixed] = useState([])
  const [pinned, setPinned] = useState([])
  const [rolled, setRolled] = useState([])

  // Ajout avec timestamp pour ID unique
  const addBeam = (beam) => setBeams((b) => [...b, { id: Date.now(), ...beam }])
  const addForce = (force) => setForces((f) => [...f, { id: Date.now(), ...force }])
  const addLoad = (load) => setLoad((l) => [...l, { id: Date.now(), ...load }])
  const addMoment = (moment) => setMoment((m) => [...m, { id: Date.now(), ...moment }])
  const addFixed = (s) => setFixed((f) => [...f, { id: Date.now(), ...s }])
  const addPinned = (s) => setPinned((p) => [...p, { id: Date.now(), ...s }])
  const addRolled = (s) => setRolled((r) => [...r, { id: Date.now(), ...s }])

  const services = {
    activeTool, setActiveTool, // <-- Export de l'état de l'outil
    beams, forces, loads, moments, fixed, pinned, rolled,
    addBeam, addForce, addLoad, addMoment, addFixed, addPinned, addRolled
  }

  return (
    <Data2DContext.Provider value={services}>
      {children}
    </Data2DContext.Provider>
  )
}

export function useData2D() {
  return useContext(Data2DContext)
}

export default Data2DContext