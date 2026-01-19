import React, { createContext, useContext, useState } from 'react'
import { update } from 'three/examples/jsm/libs/tween.module.js'

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
  const [measurements, setMeasurements] = useState([]);

  // Ajout avec timestamp pour ID unique
  const addBeam = (beam) => setBeams((b) => [...b, { id: Date.now(), ...beam }])
  const addForce = (force) => setForces((f) => [...f, { id: Date.now(), ...force }])
  const addLoad = (load) => setLoad((l) => [...l, { id: Date.now(), ...load }])
  const addMoment = (moment) => setMoment((m) => [...m, { id: Date.now(), ...moment }])
  const addFixed = (s) => setFixed((f) => [...f, { id: Date.now(), ...s }])
  const addPinned = (s) => setPinned((p) => [...p, { id: Date.now(), ...s }])
  const addRolled = (s) => setRolled((r) => [...r, { id: Date.now(), ...s }])
  const addMeasurement = (m) => addItem(setMeasurements, m);

  const addItem = (setFunc, item) => setFunc(prev => [...prev, { id: Date.now(), ...item }])
  const updateItem = (setFunc, id, props) => setFunc(prev => prev.map(x => x.id === id ? { ...x, ...props } : x))
  const deleteItem = (setFunc, id) => setFunc(prev => prev.filter(x => x.id !== id))

  const updateElement = (type, id, newProps) => {
    switch (type) {
      case 'BEAM': updateItem(setBeams, id, newProps); break;
      case 'FORCE': updateItem(setForces, id, newProps); break;
      case 'MEASUREMENT': updateItem(setMeasurements, id, newProps); break;
      case 'MOMENT': updateItem(setMoment, id, newProps); break;
      case 'LOAD': updateItem(setLoad, id, newProps); break;
      // Ajoutez ici les futurs cas (MOMENT, LOAD, SUPPORT...)
      default: console.warn(`Type non supporté : ${type}`);
    }
  }

  const deleteElement = (type, id) => {
    switch (type) {
      case 'BEAM': deleteItem(setBeams, id); break;
      case 'FORCE': deleteItem(setForces, id); break;
      case 'MEASUREMENT': deleteItem(setMeasurements, id); break;
      case 'MOMENT': deleteItem(setMoment, id); break;
      case 'LOAD': deleteItem(setLoad, id); break;
      // Ajoutez ici les futurs cas
      default: console.warn(`Type non supporté : ${type}`);
    }
  }

  const services = {
    activeTool, setActiveTool, // <-- Export de l'état de l'outil
    beams, forces, loads, moments, fixed, pinned, rolled, measurements,
    addBeam, addForce, addLoad, addMoment, addFixed, addPinned, addRolled, addMeasurement,
    updateElement,
    deleteElement
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