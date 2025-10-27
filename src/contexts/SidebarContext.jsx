'use client'

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'

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
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Handle initial state based on screen size
  useEffect(() => {
    const checkScreenSize = () => {
      if (typeof window !== 'undefined') {
        // On desktop (lg and up), start with sidebar open
        // On mobile, start with sidebar closed
        const isDesktop = window.innerWidth >= 1024
        setSidebarOpen(isDesktop)
      }
    }

    // Only set initial state on mount, don't override user preferences on resize
    if (!isMounted) {
      checkScreenSize()
      setIsMounted(true)
    }

    // Listen for resize events but don't auto-toggle
    const handleResize = () => {
      // Only update if we're transitioning from mobile to desktop or vice versa
      // and the sidebar state doesn't match the expected state
      if (typeof window !== 'undefined') {
        const isDesktop = window.innerWidth >= 1024
        const shouldBeOpen = isDesktop
        if (sidebarOpen !== shouldBeOpen) {
          setSidebarOpen(shouldBeOpen)
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isMounted, sidebarOpen])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  const value = useMemo(() => ({
    sidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    isMounted
  }), [sidebarOpen, toggleSidebar, isMounted])

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
