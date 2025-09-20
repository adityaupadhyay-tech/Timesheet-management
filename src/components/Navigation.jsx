'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
export default function Navigation({ userRole, userName }) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logging out...')
    router.push('/login')
  }

  const getMenuItems = () => {
    const baseItems = [
      { href: '/dashboard', label: 'Dashboard', icon: '📊' },
      { href: '/timesheet', label: 'My Timesheet', icon: '⏰' },
      { href: '/leave', label: 'Leave Requests', icon: '🏖️' },
    ]

    if (userRole === 'admin') {
      return [
        ...baseItems,
        { href: '/users', label: 'User Management', icon: '👥' },
        { href: '/projects', label: 'Project Management', icon: '📋' },
        { href: '/reports', label: 'Reports', icon: '📈' },
        { href: '/settings', label: 'System Settings', icon: '⚙️' },
      ]
    }

    if (userRole === 'manager') {
      return [
        ...baseItems,
        { href: '/team', label: 'Team Management', icon: '👥' },
        { href: '/approvals', label: 'Approvals', icon: '✅' },
        { href: '/reports', label: 'Team Reports', icon: '📈' },
      ]
    }

    return baseItems
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand - Left aligned */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <h1 className="text-xl font-display font-semibold text-gray-900">Timesheet Management</h1>
            </Link>
          </div>

          {/* Desktop Navigation - Center aligned */}
          <div className="hidden lg:flex items-center space-x-1">
            {getMenuItems().map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-body font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors"
              >
                <span className="text-base">{item.icon}</span>
                {item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu - Right aligned */}
          <div className="flex items-center space-x-4">
            {/* User Info - Hidden on smaller screens */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-sm font-body text-gray-700"><div><div><span>{userName}</span><span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full font-medium">
                  {userRole}
                </span></div></div>
            </div>
            
            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="font-body"
            >
              Logout
            </Button>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
              >
                <span className="sr-only">Open main menu</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
              {getMenuItems().map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-body font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}</span>
                </Link>
              ))}
              
              {/* Mobile User Info */}
              <div className="pt-4 border-t border-gray-200">
                <div className="px-3 py-2">
                  <div className="text-sm font-body text-gray-700"><div><div><span>{userName}</span><span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full font-medium">
                      {userRole}
                    </span></div></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
