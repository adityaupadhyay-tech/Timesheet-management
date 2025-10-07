'use client'

import { memo, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import OptimizedIcon from './ui/OptimizedIcon'



const OptimizedSidebar = memo(function OptimizedSidebar({ 
  userRole, 
  userName, 
  isOpen, 
  onToggle 
}) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    router.push('/login')
  }

  // Memoize menu items to prevent recalculation on every render
  const menuItems = useMemo(() => {
    return [
      { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { href: '/my-stuff', label: 'My stuff', icon: 'person' },
      { href: '/timesheet', label: 'Timesheet management', icon: 'schedule' },
      { href: '/pto-requests', label: 'PTO Requests', icon: 'beach' },
      { href: '/personnel', label: 'Personnel', icon: 'people' },
      { href: '/payroll', label: 'Payroll', icon: 'attach-money' },
      { href: '/tools', label: 'Tools', icon: 'build' },
      { href: '/resources', label: 'Resources', icon: 'folder' },
      { href: '/administration', label: 'Administration', icon: 'admin-panel-settings' },
    ]
  }, [])

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-lg z-50 transition-all duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isOpen ? 'w-64 translate-x-0' : 'w-16 -translate-x-full lg:translate-x-0'}
        ${!isOpen && 'lg:w-16'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          {isOpen ? (
            <Link href="/dashboard" className="flex items-center space-x-3">
              <h1 className="text-lg font-semibold text-gray-900">Timesheet</h1>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center justify-center w-full">
              <span className="text-xl font-semibold text-gray-900">T</span>
            </Link>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:flex hidden p-1"
          >
            <OptimizedIcon name="menu" className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                  ${!isOpen ? 'justify-center' : ''}
                `}
              >
                <OptimizedIcon 
                  name={item.icon} 
                  className={`h-5 w-5 ${!isOpen ? '' : 'mr-3'}`} 
                />
                {isOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t p-4">
          {isOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="p-1"
              >
                <OptimizedIcon name="logout" className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="p-1"
              >
                <OptimizedIcon name="logout" className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
})

export default OptimizedSidebar
