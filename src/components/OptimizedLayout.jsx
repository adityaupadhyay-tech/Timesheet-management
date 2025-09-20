'use client'

import { memo, useEffect } from 'react'
import OptimizedSidebar from './OptimizedSidebar'
import { useSidebar } from '@/contexts/SidebarContext'

) {
  const { sidebarOpen, toggleSidebar } = useSidebar()

  // Optimized resize handler with debouncing
  useEffect(() => {
    let timeoutId= () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        // Only auto-close on desktop if it was previously open on mobile
        if (window.innerWidth >= 1024 && sidebarOpen) {
          // Don't auto-close, let user control it
        }
      }, 150) // Debounce resize events
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [sidebarOpen])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <OptimizedSidebar 
        userRole="admin" // This will be provided by UserContext
        userName="John Doe" // This will be provided by UserContext
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar} 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b">
          <h1 className="text-lg font-semibold text-gray-900">Timesheet</h1>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
})

export default OptimizedLayout
