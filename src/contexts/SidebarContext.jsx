'use client'

import { createContext, useContext, useState, useCallback, useMemo } from 'react'

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

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  const value = useMemo(() => ({
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen
  }), [sidebarOpen, toggleSidebar])

  return (
    <SidebarContext.Provider value={value}>
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
