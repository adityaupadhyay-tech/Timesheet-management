'use client'

import { useMemo, useCallback, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import ScheduleIcon from '@mui/icons-material/Schedule'
import BeachAccessIcon from '@mui/icons-material/BeachAccess'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import AddTaskIcon from '@mui/icons-material/AddTask'
import BarChartIcon from '@mui/icons-material/BarChart'
import PeopleIcon from '@mui/icons-material/People'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PageHeader from '@/components/PageHeader'
import DashboardIcon from '@mui/icons-material/Dashboard'
import { useUser } from '@/contexts/UserContext'
import ReceiptIcon from '@mui/icons-material/Receipt'
import HistoryIcon from '@mui/icons-material/History'
import UpdateIcon from '@mui/icons-material/Update'
import FolderIcon from '@mui/icons-material/Folder'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import InfoIcon from '@mui/icons-material/Info'
import EventIcon from '@mui/icons-material/Event'
import CreditCardIcon from '@mui/icons-material/CreditCard'

export default function DashboardPage() {
  const { user: currentUser } = useUser()
  const router = useRouter()
  const [loginHistory, setLoginHistory] = useState([])
  const [companyName, setCompanyName] = useState('Acme Corporation')
  
  // Initialize and track login history
  useEffect(() => {
    // Load login history from localStorage
    const loadLoginHistory = () => {
      try {
        const stored = localStorage.getItem(`loginHistory_${currentUser.email || 'default'}`)
        if (stored) {
          const history = JSON.parse(stored)
          setLoginHistory(history)
        }
      } catch (error) {
        console.error('Error loading login history:', error)
      }
    }
    
    // Track current login
    const trackLogin = () => {
      const now = new Date()
      
      // Get timezone abbreviation (PST, EST, CST, etc.)
      const timezoneAbbr = Intl.DateTimeFormat('en-US', {
        timeZoneName: 'short'
      }).formatToParts(now).find(part => part.type === 'timeZoneName')?.value || ''
      
      // Get timezone offset
      const timezoneOffset = -now.getTimezoneOffset()
      const timezoneOffsetHours = Math.floor(Math.abs(timezoneOffset) / 60)
      const timezoneOffsetMinutes = Math.abs(timezoneOffset) % 60
      const timezoneSign = timezoneOffset >= 0 ? '+' : '-'
      const timezoneString = `${timezoneSign}${String(timezoneOffsetHours).padStart(2, '0')}:${String(timezoneOffsetMinutes).padStart(2, '0')}`
      
      // Format date as mm-dd-yyyy
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const year = now.getFullYear()
      const date = `${month}-${day}-${year}`
      
      // Format time as hh:mm:ss
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      const time = `${hours}:${minutes}:${seconds}`
      
      const loginData = {
        date,
        time,
        timezone: timezoneString,
        zone: timezoneAbbr,
        timestamp: now.toISOString() // Keep ISO string for backward compatibility and comparison
      }
      
      try {
        const stored = localStorage.getItem(`loginHistory_${currentUser.email || 'default'}`)
        let history = stored ? JSON.parse(stored) : []
        
        // Migrate old format (ISO strings) to new format if needed
        history = history.map(item => {
          if (typeof item === 'string') {
            const dateObj = new Date(item)
            const month = String(dateObj.getMonth() + 1).padStart(2, '0')
            const day = String(dateObj.getDate()).padStart(2, '0')
            const year = dateObj.getFullYear()
            const hours = String(dateObj.getHours()).padStart(2, '0')
            const minutes = String(dateObj.getMinutes()).padStart(2, '0')
            const seconds = String(dateObj.getSeconds()).padStart(2, '0')
            const timezoneOffset = -dateObj.getTimezoneOffset()
            const timezoneOffsetHours = Math.floor(Math.abs(timezoneOffset) / 60)
            const timezoneOffsetMinutes = Math.abs(timezoneOffset) % 60
            const timezoneSign = timezoneOffset >= 0 ? '+' : '-'
            const timezoneString = `${timezoneSign}${String(timezoneOffsetHours).padStart(2, '0')}:${String(timezoneOffsetMinutes).padStart(2, '0')}`
            
            // Get timezone abbreviation for migrated data
            const timezoneAbbr = Intl.DateTimeFormat('en-US', {
              timeZoneName: 'short'
            }).formatToParts(dateObj).find(part => part.type === 'timeZoneName')?.value || ''
            
            return {
              date: `${month}-${day}-${year}`,
              time: `${hours}:${minutes}:${seconds}`,
              timezone: timezoneString,
              zone: timezoneAbbr,
              timestamp: item
            }
          }
          return item
        })
        
        // Add current login if not already added (check last 5 minutes to avoid duplicates)
        const lastLogin = history[0]
        if (!lastLogin || (lastLogin.timestamp && new Date(loginData.timestamp) - new Date(lastLogin.timestamp) > 5 * 60 * 1000)) {
          history.unshift(loginData)
          // Keep only last 10 logins
          history = history.slice(0, 10)
          localStorage.setItem(`loginHistory_${currentUser.email || 'default'}`, JSON.stringify(history))
          setLoginHistory(history)
        }
      } catch (error) {
        console.error('Error tracking login:', error)
      }
    }
    
    loadLoginHistory()
    trackLogin()
  }, [currentUser.email])
  
  // Format login data for display
  const formatLoginInfo = (loginData) => {
    try {
      // Handle both old format (ISO string) and new format (object)
      if (typeof loginData === 'string') {
        // Legacy format - convert to new format
        const date = new Date(loginData)
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const year = date.getFullYear()
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        const timezoneOffset = -date.getTimezoneOffset()
        const timezoneOffsetHours = Math.floor(Math.abs(timezoneOffset) / 60)
        const timezoneOffsetMinutes = Math.abs(timezoneOffset) % 60
        const timezoneSign = timezoneOffset >= 0 ? '+' : '-'
        const timezoneString = `${timezoneSign}${String(timezoneOffsetHours).padStart(2, '0')}:${String(timezoneOffsetMinutes).padStart(2, '0')}`
        
        // Get timezone abbreviation
        const timezoneAbbr = Intl.DateTimeFormat('en-US', {
          timeZoneName: 'short'
        }).formatToParts(date).find(part => part.type === 'timeZoneName')?.value || ''
        
        return {
          date: `${month}-${day}-${year}`,
          time: `${hours}:${minutes}:${seconds}`,
          timezone: timezoneString,
          zone: timezoneAbbr
        }
      }
      
      // New format - return as is
      return {
        date: loginData.date || '',
        time: loginData.time || '',
        timezone: loginData.timezone || '',
        zone: loginData.zone || ''
      }
    } catch {
      return {
        date: '',
        time: '',
        timezone: '',
        zone: ''
      }
    }
  }
  
  // Navigate to my-stuff section
  const navigateToMyStuffSection = (sectionId) => {
    router.push(`/my-stuff?section=${sectionId}`)
  }

  const getDashboardContent = useCallback(() => {
    switch (currentUser.role) {
      case 'Admin':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <PeopleIcon className="text-2xl text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">156</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <AddTaskIcon className="text-2xl text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  8 completed this month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <CheckCircleIcon className="text-2xl text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">
                  Timesheets & Leave requests
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <div className="text-2xl text-green-500">💚</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.9%</div>
                <p className="text-xs text-muted-foreground">
                  Uptime this month
                </p>
              </CardContent>
            </Card>
          </div>
        )

      case 'Manager':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <PeopleIcon className="text-2xl text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  2 on leave this week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <CheckCircleIcon className="text-2xl text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  Timesheets & Leave requests
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Hours</CardTitle>
                <ScheduleIcon className="text-2xl text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">480</div>
                <p className="text-xs text-muted-foreground">
                  This week
                </p>
              </CardContent>
            </Card>
          </div>
        )

      case 'Employee':
      default: // fallback
        return null
    }
  }, [currentUser.role])

  const getQuickActions = useCallback(() => {
    const baseActions = [
      { label: 'Log Time', href: '/timesheet/new', icon: <ScheduleIcon /> },
      { label: 'Request Leave', href: '/leave/new', icon: <BeachAccessIcon /> },
    ]

    if (currentUser.role === 'Admin') {
      return [
        ...baseActions,
        { label: 'Add User', href: '/users/new', icon: <PersonAddIcon /> },
        { label: 'Create Project', href: '/projects/new', icon: <AddTaskIcon /> },
        { label: 'View Reports', href: '/reports', icon: <BarChartIcon /> },
      ]
    }

    if (currentUser.role === 'Manager') {
      return [
        ...baseActions,
        { label: 'Team Overview', href: '/team', icon: <PeopleIcon /> },
        { label: 'Review Approvals', href: '/approvals', icon: <CheckCircleIcon /> },
      ]
    }

    return baseActions
  }, [currentUser.role])

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
        <PageHeader 
          title="Dashboard"
          subtitle={`Welcome back, ${currentUser.name}! Here's what's happening today.`}
          icon={<DashboardIcon />}
          companyName={companyName}
        />

        {/* Stats Cards - Only for Admin and Manager */}
        {currentUser.role !== 'Employee' && (
          <div className="mb-8">
            {getDashboardContent()}
          </div>
        )}

        {/* Quick Actions - Only for Admin and Manager */}
        {currentUser.role !== 'Employee' && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {getQuickActions().map((action) => (
                <Card key={action.label} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <div className="flex justify-center mb-2 text-gray-600">
                      {action.icon}
                    </div>
                    <p className="text-sm font-medium text-gray-900">{action.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Employee-specific sections */}
        {currentUser.role === 'Employee' && (
          <>
            <div className="grid gap-8 lg:grid-cols-3 mb-8">
              {/* Common Reports View */}
              <div className="lg:col-span-2">
                <Card className="border border-gray-200 shadow-md">
                  <CardHeader className="pb-4 border-l-4 pl-6 rounded-t-lg bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50" style={{ borderLeftColor: '#4F46E5' }}>
                    <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <BarChartIcon className="text-blue-600" />
                      Common Reports
                    </CardTitle>
                    <CardDescription className="text-base mt-1 text-gray-600">
                      Quick access to frequently used reports
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-2 min-h-[180px]">
                      <div className="flex flex-col items-center justify-center col-span-2 py-8 text-center">
                        <BarChartIcon className="text-4xl text-gray-300 mb-3" />
                        <p className="text-base font-medium text-gray-500">No reports to view</p>
                        <p className="text-sm text-gray-400 mt-1">Reports will appear here once available</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Last Updated View */}
              <div>
                <Card className="border border-gray-200 shadow-md">
                  <CardHeader className="pb-4 border-l-4 pl-6 rounded-t-lg bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50" style={{ borderLeftColor: '#4F46E5' }}>
                    <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <HistoryIcon className="text-blue-600" />
                      Last Updated
                    </CardTitle>
                    <CardDescription className="text-base mt-1 text-gray-600">
                      Previous login times
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2">
                      {loginHistory.length > 0 ? (
                        loginHistory.slice(0, 10).map((loginTime, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors flex-shrink-0"
                          >
                            <div className="p-1.5 bg-blue-100 rounded-full flex-shrink-0">
                              <UpdateIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {index === 0 ? 'Current Session' : `Login ${index + 1}`}
                              </p>
                              {(() => {
                                const loginInfo = formatLoginInfo(loginTime)
                                return (
                                  <div className="text-xs text-gray-600 space-y-0.5">
                                    <p>Date: {loginInfo.date}</p>
                                    <p>Time: {loginInfo.time}</p>
                                    <p>Timezone: {loginInfo.timezone} ({loginInfo.zone})</p>
                                  </div>
                                )
                              })()}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No login history available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Commonly Used Menu Items */}
            <div className="mb-8">
              <Card className="border border-gray-200 shadow-md">
                <CardHeader className="pb-4 border-l-4 pl-6 rounded-t-lg bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50" style={{ borderLeftColor: '#4F46E5' }}>
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FolderIcon className="text-blue-600" />
                    Commonly Used Menu Items
                  </CardTitle>
                  <CardDescription className="text-base mt-1 text-gray-600">
                    Quick access to frequently visited sections
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[
                      { id: 'online-timecard', label: 'Online Timecard', icon: <AccessTimeIcon className="text-blue-600" />, description: 'Log your work hours', section: 'online-timecard' },
                      { id: 'basic-info', label: 'Basic Information', icon: <InfoIcon className="text-blue-600" />, description: 'Update your personal details', section: 'basic-info' },
                      { id: 'earning-statement', label: 'Earning Statement', icon: <ReceiptIcon className="text-blue-600" />, description: 'View your pay stubs', section: 'earning-statement' },
                      { id: 'paid-leave', label: 'Paid Leave', icon: <EventIcon className="text-blue-600" />, description: 'Manage your time off', section: 'paid-leave' },
                      { id: 'direct-deposits', label: 'Direct Deposits', icon: <CreditCardIcon className="text-blue-600" />, description: 'Manage your bank accounts', section: 'direct-deposits' },
                      { id: 'resources', label: 'Resources', icon: <FolderIcon className="text-blue-600" />, description: 'Access company resources', href: '/resources' }
                    ].map((item) => (
                      <Card
                        key={item.id}
                        className="cursor-pointer hover:shadow-md transition-all border border-gray-200 hover:border-blue-300"
                        onClick={() => {
                          if (item.href) {
                            router.push(item.href)
                          } else if (item.section) {
                            navigateToMyStuffSection(item.section)
                          }
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                              {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1">{item.label}</h3>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Recent Activity - Only for Admin and Manager */}
        {currentUser.role !== 'Employee' && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Time logged for Project Alpha - 8 hours</span>
                    <span className="text-xs text-gray-400">2 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Leave request approved for next week</span>
                    <span className="text-xs text-gray-400">1 day ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Timesheet submitted for review</span>
                    <span className="text-xs text-gray-400">3 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}