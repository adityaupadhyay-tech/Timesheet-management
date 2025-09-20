'use client'

import { createContext, useContext, useState, useEffect } from 'react'

/**
 * @typedef {Object} SidebarContextType
 * @property {boolean} sidebarOpen
 * @property {function(): void} toggleSidebar
 * @property {function(boolean): void} setSidebarOpen
 */

const SidebarContext = createContext(undefined)

/**
 * @typedef {Object} SidebarProviderProps
 * @property {React.ReactNode} children
 */
export function SidebarProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    console.log('Toggling sidebar from:', sidebarOpen, 'to:', !sidebarOpen)
    setSidebarOpen(!sidebarOpen)
  }

  // Debug: Log when sidebar state changes
  useEffect(() => {
    console.log('SidebarContext state changed:', sidebarOpen)
  }, [sidebarOpen])

  return (
    <SidebarContext.Provider value={{ sidebarOpen, toggleSidebar, setSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
