'use client'

import { createContext, useContext, useState, useCallback, useMemo, useLayoutEffect } from 'react'

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
  // Initialize based on screen size if available (client-side), otherwise false (SSR)
  // Using lazy initialization function to safely check window during SSR
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      // Use media query to match Tailwind's lg breakpoint (1024px)
      const mediaQuery = window.matchMedia('(min-width: 1024px)')
      return mediaQuery.matches
    }
    return false // Default for SSR
  })

  // Ensure state is synced with screen size on mount (only for initial load)
  // This handles cases where the lazy initializer didn't run correctly
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(min-width: 1024px)')
      // Always set initial state based on media query on mount
      // This ensures desktop starts open, mobile starts closed
      setSidebarOpen(mediaQuery.matches)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount to set initial state

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
