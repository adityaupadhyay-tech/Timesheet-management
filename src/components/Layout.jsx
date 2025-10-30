'use client'

import { memo, Suspense, useEffect, useRef } from 'react'
import Sidebar from './Sidebar'
import MenuIcon from '@mui/icons-material/Menu'
import { useSidebar } from '@/contexts/SidebarContext'
import { usePathname } from 'next/navigation'

/**
 * @typedef {Object} LayoutProps
 * @property {React.ReactNode} children
 * @property {UserRole} userRole
 * @property {string} userName
 */
const Layout = memo(function Layout({ children, userRole, userName }) {
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const pathname = usePathname()
  const contentRef = useRef(null)

  // Force manual scroll restoration to avoid browser overriding our logic
  useEffect(() => {
    if (typeof window === 'undefined') return
    try { window.history.scrollRestoration = 'manual' } catch {}
  }, [])

  // Preserve scroll position in main content across client-side route/search changes
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const key = `app-scroll:${pathname}${typeof window !== 'undefined' ? window.location.search : ''}`
    const winKey = `${key}:win`
    const onScroll = () => {
      try { sessionStorage.setItem(key, String(el.scrollTop)) } catch {}
    }
    const onWinScroll = () => {
      try { sessionStorage.setItem(winKey, String(window.scrollY || window.pageYOffset || 0)) } catch {}
    }
    el.addEventListener('scroll', onScroll)
    window.addEventListener('scroll', onWinScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [pathname])

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const key = `app-scroll:${pathname}${typeof window !== 'undefined' ? window.location.search : ''}`
    const winKey = `${key}:win`
    let saved = null
    let savedWin = null
    try { saved = sessionStorage.getItem(key) } catch {}
    try { savedWin = sessionStorage.getItem(winKey) } catch {}
    // Restore after DOM paints to avoid race with layout shifts
    const id = requestAnimationFrame(() => {
      if (saved !== null) {
        el.scrollTop = Number(saved) || 0
      }
      if (savedWin !== null) {
        window.scrollTo(0, Number(savedWin) || 0)
      }
    })
    return () => cancelAnimationFrame(id)
  }, [pathname])

  // Respond to explicit restore events (for query-only navigation where pathname is unchanged)
  useEffect(() => {
    const handler = () => {
      const el = contentRef.current
      if (!el) return
      const key = `app-scroll:${pathname}${typeof window !== 'undefined' ? window.location.search : ''}`
      const winKey = `${key}:win`
      let saved = null
      let savedWin = null
      try { saved = sessionStorage.getItem(key) } catch {}
      try { savedWin = sessionStorage.getItem(winKey) } catch {}
      if (saved !== null) {
        el.scrollTop = Number(saved) || 0
      }
      if (savedWin !== null) {
        window.scrollTo(0, Number(savedWin) || 0)
      }
    }
    window.addEventListener('app:restore-scroll', handler)
    return () => window.removeEventListener('app:restore-scroll', handler)
  }, [pathname])

  // On initial load and pageshow (including bfcache), restore scroll as well
  useEffect(() => {
    const restore = () => {
      const el = contentRef.current
      if (!el) return
      const key = `app-scroll:${pathname}${typeof window !== 'undefined' ? window.location.search : ''}`
      let saved = null
      try { saved = sessionStorage.getItem(key) } catch {}
      if (saved !== null) {
        // delay a bit to let layout settle
        setTimeout(() => { el.scrollTop = Number(saved) || 0 }, 0)
      }
    }
    window.addEventListener('load', restore)
    window.addEventListener('pageshow', restore)
    return () => {
      window.removeEventListener('load', restore)
      window.removeEventListener('pageshow', restore)
    }
  }, [pathname])

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
        <main ref={contentRef} className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
})

export default Layout