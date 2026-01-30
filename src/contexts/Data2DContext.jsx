import React, { createContext, useContext, useState } from 'react'
import { generateStructure } from '../utils/structureGenerator';

const Data2DContext = createContext()

export function Data2DProvider({ children }) {
  // --- ÉTAT DES OUTILS ---
  // null = aucun outil, 'BEAM' = création poutre, 'FORCE' = création force...
  const [activeTool, setActiveTool] = useState(null) 

  const deleteManyElements = (items) => {
    // items est un tableau de { id, type }
    if (!items || items.length === 0) return;

    // On trie les IDs par type pour faire des suppressions groupées
    const idsByType = items.reduce((acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item.id);
      return acc;
    }, {});

    // On applique les suppressions
    if (idsByType['BEAM']) setBeams(prev => prev.filter(b => !idsByType['BEAM'].includes(b.id)));
    if (idsByType['FORCE']) setForces(prev => prev.filter(f => !idsByType['FORCE'].includes(f.id)));
    if (idsByType['MOMENT']) setMoment(prev => prev.filter(m => !idsByType['MOMENT'].includes(m.id)));
    if (idsByType['LOAD']) setLoad(prev => prev.filter(l => !idsByType['LOAD'].includes(l.id)));
    if (idsByType['MEASUREMENT']) setMeasurements(prev => prev.filter(m => !idsByType['MEASUREMENT'].includes(m.id)));
    if (idsByType['ANGLE']) setAngles(prev => prev.filter(a => !idsByType['ANGLE'].includes(a.id)));
    
    // Supports
    if (idsByType['FIXED']) setFixed(prev => prev.filter(s => !idsByType['FIXED'].includes(s.id)));
    if (idsByType['PINNED']) setPinned(prev => prev.filter(s => !idsByType['PINNED'].includes(s.id)));
    if (idsByType['ROLLER']) setRolled(prev => prev.filter(s => !idsByType['ROLLER'].includes(s.id)));
  };
  
  // --- DONNÉES EXISTANTES ---
  const [beams, setBeams] = useState([])
  const [forces, setForces] = useState([])
  const [loads, setLoad] = useState([])
  const [moments, setMoment] = useState([])
  const [fixed, setFixed] = useState([])
  const [pinned, setPinned] = useState([])
  const [rolled, setRolled] = useState([])
  const [angles, setAngles] = useState([]);
  const [measurements, setMeasurements] = useState([]);

  // Ajout avec timestamp pour ID unique
  const addBeam = (beam) => setBeams((b) => [...b, { id: Date.now(), ...beam }])
  const addForce = (force) => setForces((f) => [...f, { id: Date.now(), ...force }])
  const addLoad = (load) => setLoad((l) => [...l, { id: Date.now(), ...load }])
  const addMoment = (moment) => setMoment((m) => [...m, { id: Date.now(), ...moment }])
  const addFixed = (s) => setFixed((f) => [...f, { id: Date.now(), ...s }])
  const addPinned = (s) => setPinned((p) => [...p, { id: Date.now(), ...s }])
  const addRolled = (s) => setRolled((r) => [...r, { id: Date.now(), ...s }])
  const addAngle = (angle) => addItem(setAngles, angle);
  const addMeasurement = (m) => addItem(setMeasurements, m);

  const addItem = (setFunc, item) => setFunc(prev => [...prev, { id: Date.now(), ...item }])
  const updateItem = (setFunc, id, props) => setFunc(prev => prev.map(x => x.id === id ? { ...x, ...props } : x))
  const deleteItem = (setFunc, id) => setFunc(prev => prev.filter(x => x.id !== id))

  

  const updateElement = (type, id, newProps) => {
    switch (type) {
      case 'BEAM': updateBeamWithNodes(id, newProps); break;
      case 'FORCE': updateItem(setForces, id, newProps); break;
      case 'MEASUREMENT': updateItem(setMeasurements, id, newProps); break;
      case 'MOMENT': updateItem(setMoment, id, newProps); break;
      case 'LOAD': updateItem(setLoad, id, newProps); break;
      case 'FIXED': updateItem(setFixed, id, newProps); break;
      case 'PINNED': updateItem(setPinned, id, newProps); break;
      case 'ROLLER': updateItem(setRolled, id, newProps); break;
      case 'ANGLE': 
        if (newProps.value !== undefined) {
           updateAngleValue(id, newProps.value);
        }
        updateItem(setAngles, id, newProps); 
        break;
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
      case 'FIXED': deleteItem(setFixed, id); break;
      case 'PINNED': deleteItem(setPinned, id); break;
      case 'ROLLER': deleteItem(setRolled, id); break;
      case 'ANGLE': deleteItem(setAngles, id); break;
      default: console.warn(`Type non supporté : ${type}`);
    }
  }

  const debugStructure = () => {
    // On passe l'état actuel complet au générateur
    const currentContext = { beams, forces, loads, moments, fixed, pinned, rolled };
    
    const jsonStructure = generateStructure(currentContext);
    
    console.log("--- STRUCTURE GÉNÉRÉE (Format Alix) ---");
    console.log(JSON.stringify(jsonStructure, null, 2)); // Affichage joli
    console.log("---------------------------------------");
    
    return jsonStructure;
  };

  const services = {
    activeTool, setActiveTool, // <-- Export de l'état de l'outil
    beams, forces, loads, moments, fixed, pinned, rolled, measurements, angles,
    addBeam, addForce, addLoad, addMoment, addFixed, addPinned, addRolled, addMeasurement, addAngle,
    updateElement,
    deleteElement,
    debugStructure,
    deleteManyElements
  }

  const updateBeamWithNodes = (id, newProps) => {
      setBeams(prevBeams => {
        // 1. Trouver l'ancienne version de la poutre pour comparer
        const oldBeam = prevBeams.find(b => b.id === id);
        if (!oldBeam) return prevBeams;
  
        // 2. Détecter quels points ont changé
        const x1Changed = newProps.x1 !== undefined && newProps.x1 !== oldBeam.x1;
        const y1Changed = newProps.y1 !== undefined && newProps.y1 !== oldBeam.y1;
        const x2Changed = newProps.x2 !== undefined && newProps.x2 !== oldBeam.x2;
        const y2Changed = newProps.y2 !== undefined && newProps.y2 !== oldBeam.y2;
  
        // 3. Appliquer la mise à jour sur TOUTES les poutres
        return prevBeams.map(b => {
          // Si c'est la poutre cible, on applique simplement les nouvelles props
          if (b.id === id) return { ...b, ...newProps };
  
          // Pour les autres poutres (b), on regarde si elles étaient connectées à l'ancienne position
          let updatedB = { ...b };
  
          // CAS 1 : Le Nœud 1 de la poutre modifiée a bougé
          if (x1Changed || y1Changed) {
            // Si b.p1 était connecté à oldBeam.p1 -> On le bouge
            if (b.x1 === oldBeam.x1 && b.y1 === oldBeam.y1) {
              if (x1Changed) updatedB.x1 = newProps.x1;
              if (y1Changed) updatedB.y1 = newProps.y1;
            }
            // Si b.p2 était connecté à oldBeam.p1 -> On le bouge
            if (b.x2 === oldBeam.x1 && b.y2 === oldBeam.y1) {
              if (x1Changed) updatedB.x2 = newProps.x1;
              if (y1Changed) updatedB.y2 = newProps.y1;
            }
          }
  
          // CAS 2 : Le Nœud 2 de la poutre modifiée a bougé
          if (x2Changed || y2Changed) {
            // Si b.p1 était connecté à oldBeam.p2
            if (b.x1 === oldBeam.x2 && b.y1 === oldBeam.y2) {
              if (x2Changed) updatedB.x1 = newProps.x2;
              if (y2Changed) updatedB.y1 = newProps.y2;
            }
            // Si b.p2 était connecté à oldBeam.p2
            if (b.x2 === oldBeam.x2 && b.y2 === oldBeam.y2) {
              if (x2Changed) updatedB.x2 = newProps.x2;
              if (y2Changed) updatedB.y2 = newProps.y2;
            }
          }
  
          return updatedB;
        });
      });
    };
  
    const updateAngleValue = (angleId, newDegrees) => {
      // 1. Trouver l'objet angle et les poutres concernées
      const angleObj = angles.find(a => a.id === angleId);
      if (!angleObj) return;
  
      const b1 = beams.find(b => b.id === angleObj.beamId1);
      const b2 = beams.find(b => b.id === angleObj.beamId2);
      if (!b1 || !b2) return;
  
      // 2. Identifier le nœud commun (Pivot)
      const cx = angleObj.cx;
      const cy = angleObj.cy;
  
      // 3. Calculer l'angle actuel de la Poutre 1 (Référence)
      // On doit savoir quel bout de b1 est le pivot
      const otherX1 = (Math.abs(b1.x1 - cx) < 1) ? b1.x2 : b1.x1;
      const otherY1 = (Math.abs(b1.y1 - cy) < 1) ? b1.y2 : b1.y1;
      const angle1 = Math.atan2(otherY1 - cy, otherX1 - cx);
  
      // 4. Calculer le nouvel angle absolu pour la Poutre 2
      // Angle Poutre 2 = Angle Poutre 1 + (Désiré en radians)
      // Note: On peut gérer le sens horaire/anti-horaire ici. 
      // Pour simplifier, on ajoute simplement la différence.
      const newRad = (newDegrees * Math.PI) / 180;
      const targetAngleAbs = angle1 + newRad; // ou minus selon le sens
  
      // 5. Calculer la longueur de la Poutre 2 pour la conserver
      const len2 = Math.sqrt(Math.pow(b2.x2 - b2.x1, 2) + Math.pow(b2.y2 - b2.y1, 2));
  
      // 6. Calculer la nouvelle position du bout libre de la Poutre 2
      const newEndX = cx + len2 * Math.cos(targetAngleAbs);
      const newEndY = cy + len2 * Math.sin(targetAngleAbs);
  
      // 7. Mettre à jour la Poutre 2
      // On doit savoir quel bout de b2 est le pivot pour bouger l'autre
      const isNode1Pivot = (Math.abs(b2.x1 - cx) < 1);
      
      updateElement('BEAM', b2.id, {
        x1: isNode1Pivot ? cx : newEndX,
        y1: isNode1Pivot ? cy : newEndY,
        x2: isNode1Pivot ? newEndX : cx,
        y2: isNode1Pivot ? newEndY : cy
      });
    };

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