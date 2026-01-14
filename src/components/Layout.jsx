import React from 'react'
import Header from './Header'
import './layout.css'

export default function Layout({ children }) {
  return (
    <div className="app-root">
      <Header />
      <main className="app-main">{children}</main>
    </div>  
  )
}
