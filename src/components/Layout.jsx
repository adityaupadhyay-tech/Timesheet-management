'use client'

import { memo, Suspense } from 'react'
import Sidebar from './Sidebar'
import MenuIcon from '@mui/icons-material/Menu'
import { useSidebar } from '@/contexts/SidebarContext'

/**
 * @typedef {Object} LayoutProps
 * @property {React.ReactNode} children
 * @property {UserRole} userRole
 * @property {string} userName
 */
const Layout = memo(function Layout({ children, userRole, userName }) {
  const { sidebarOpen, toggleSidebar } = useSidebar()

  // Sidebar state is controlled by user toggle
  // No auto-close behavior on resize

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Suspense fallback={<div className="w-16 lg:w-64 bg-white" />}>
        <Sidebar 
          userRole={userRole} 
          userName={userName} 
          isOpen={sidebarOpen} 
          onToggle={toggleSidebar} 
        />
      </Suspense>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Toggle sidebar"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Payplus 360</h1>
            </div>
            <div className="text-sm text-gray-700">
              <span className="font-medium">{userName}</span>
              <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full font-medium">
                {userRole}
              </span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
})

export default Layout