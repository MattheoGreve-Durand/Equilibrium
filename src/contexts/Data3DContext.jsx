import React, { createContext, useContext, useState } from 'react'

const Data3DContext = createContext()

export function Data3DProvider({ children }) {
  // --- ÉTAT DES OUTILS ---
  const [activeTool, setActiveTool] = useState(null);

  // --- DONNÉES 3D ---
  //{id: 1, start: [0,0,0], end: [1,0,0], diameter: 0.2}
  const [beams, setBeams] = useState([]);
  //{id:1, position: [0,0,0], direction: [0,-1,0], value: 100}
  const [forces, setForces] = useState([]);
  const [moments, setMoments] = useState([]);
  const [loads, setLoads] = useState([]);
  
  // Supports (On peut les grouper ou les séparer, ici groupés pour simplifier l'exemple 3D)
  const [supports, setSupports] = useState([]);

  // --- ACTIONS GÉNÉRIQUES ---
  const addItem = (setFunc, item) => setFunc(prev => [...prev, { id: Date.now(), ...item }]);
  const updateItem = (setFunc, id, props) => setFunc(prev => prev.map(x => x.id === id ? { ...x, ...props } : x));
  const deleteItem = (setFunc, id) => setFunc(prev => prev.filter(x => x.id !== id));

  // --- ACTIONS SPÉCIFIQUES (Miroir de la 2D) ---
  const addBeam = (beam) => addItem(setBeams, beam);
  const addForce = (force) => addItem(setForces, force);
  const addMoment = (moment) => addItem(setMoments, moment);
  const addLoad = (load) => addItem(setLoads, load);
  const addSupport = (support) => addItem(setSupports, support);

  const updateElement = (type, id, newProps) => {
    switch (type) {
      case 'BEAM': updateItem(setBeams, id, newProps); break;
      case 'FORCE': updateItem(setForces, id, newProps); break;
      case 'MOMENT': updateItem(setMoments, id, newProps); break;
      case 'LOAD': updateItem(setLoads, id, newProps); break;
      case 'SUPPORT': updateItem(setSupports, id, newProps); break;
      default: console.warn(`Type 3D non supporté : ${type}`);
    }
  };

  const deleteElement = (type, id) => {
    switch (type) {
      case 'BEAM': deleteItem(setBeams, id); break;
      case 'FORCE': deleteItem(setForces, id); break;
      case 'MOMENT': deleteItem(setMoments, id); break;
      case 'LOAD': deleteItem(setLoads, id); break;
      case 'SUPPORT': deleteItem(setSupports, id); break;
      default: console.warn(`Type 3D non supporté : ${type}`);
    }
  };
  
  // Suppression multiple (Ctrl+Select)
  const deleteManyElements = (items) => {
    if (!items || items.length === 0) return;
    const idsByType = items.reduce((acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item.id);
      return acc;
    }, {});

    if (idsByType['BEAM']) setBeams(prev => prev.filter(b => !idsByType['BEAM'].includes(b.id)));
    if (idsByType['FORCE']) setForces(prev => prev.filter(f => !idsByType['FORCE'].includes(f.id)));
    if (idsByType['MOMENT']) setMoments(prev => prev.filter(m => !idsByType['MOMENT'].includes(m.id)));
    if (idsByType['LOAD']) setLoads(prev => prev.filter(l => !idsByType['LOAD'].includes(l.id)));
    if (idsByType['SUPPORT']) setSupports(prev => prev.filter(s => !idsByType['SUPPORT'].includes(s.id)));
  };

  // --- SERVICE EXPORTÉ ---
  const services = {
    activeTool, setActiveTool,
    beams, forces, moments, loads, supports,
    addBeam, addForce, addMoment, addLoad, addSupport,
    updateElement, deleteElement, deleteManyElements
  };

  return (
    <Data3DContext.Provider value={services}>
      {children}
    </Data3DContext.Provider>
  )
}

export function useData3D() {
  const ctx = useContext(Data3DContext)
  if (!ctx) throw new Error('useData3D must be used within Data3DProvider')
  return ctx
}

export default Data3DContext