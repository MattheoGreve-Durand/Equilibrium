import React, { createContext, useContext, useState } from 'react'

const Data3DContext = createContext()

export function Data3DProvider({ children }) {
  // Minimal placeholder 3D data
  const [objects, setObjects] = useState([
    { id: 1, type: 'beam', x: 0, y: 0, z: 0 },
  ])

  const addObject = (obj) => setObjects((o) => [...o, { id: Date.now(), ...obj }])

  return (
    <Data3DContext.Provider value={{ objects, addObject }}>
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
