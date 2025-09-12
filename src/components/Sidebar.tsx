'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { UserRole } from '@/types'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ScheduleIcon from '@mui/icons-material/Schedule'
import BeachAccessIcon from '@mui/icons-material/BeachAccess'
import PeopleIcon from '@mui/icons-material/People'
import AssignmentIcon from '@mui/icons-material/Assignment'
import BarChartIcon from '@mui/icons-material/BarChart'
import SettingsIcon from '@mui/icons-material/Settings'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import CursorIcon from '@mui/icons-material/OpenWith'

interface SidebarProps {
  userRole: UserRole
  userName: string
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ userRole, userName, isOpen, onToggle }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logging out...')
    router.push('/login')
  }

  const getMenuItems = () => {
    const baseItems = [
      { href: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
      { href: '/timesheet', label: 'My Timesheet', icon: <ScheduleIcon /> },
      { href: '/leave', label: 'Leave Requests', icon: <BeachAccessIcon /> },
    ]

    if (userRole === 'admin') {
      return [
        ...baseItems,
        { href: '/users', label: 'User Management', icon: <PeopleIcon /> },
        { href: '/projects', label: 'Project Management', icon: <AssignmentIcon /> },
        { href: '/reports', label: 'Reports', icon: <BarChartIcon /> },
        // { href: '/magnetic-cursor', label: 'Magnetic Cursor', icon: <CursorIcon /> },
        { href: '/settings', label: 'System Settings', icon: <SettingsIcon /> },
      ]
    }

    if (userRole === 'manager') {
      return [
        ...baseItems,
        { href: '/team', label: 'Team Management', icon: <PeopleIcon /> },
        { href: '/approvals', label: 'Approvals', icon: <CheckCircleIcon /> },
        { href: '/reports', label: 'Team Reports', icon: <BarChartIcon /> },
      ]
    }

    return baseItems
  }

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
            <MenuIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {getMenuItems().map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                  }
                `}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                {isOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="border-t px-2 py-4">
          {/* User Info */}
          <div className="px-3 py-2">
            {isOpen ? (
              <div className="text-sm text-gray-700">
                <div className="font-medium truncate">{userName}</div>
                <div className="text-xs bg-gray-100 px-2 py-1 rounded-full font-medium mt-1 inline-block">
                  {userRole}
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="px-3 py-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className={`w-full ${!isOpen && 'px-2'}`}
            >
              {isOpen ? (
                <>
                  <LogoutIcon className="h-4 w-4 mr-2" />
                  Logout
                </>
              ) : (
                <LogoutIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
