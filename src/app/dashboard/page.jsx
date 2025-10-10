'use client'

import { useState, useMemo, useCallback } from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ScheduleIcon from '@mui/icons-material/Schedule'
import BeachAccessIcon from '@mui/icons-material/BeachAccess'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import AddTaskIcon from '@mui/icons-material/AddTask'
import BarChartIcon from '@mui/icons-material/BarChart'
import PeopleIcon from '@mui/icons-material/People'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PageHeader from '@/components/PageHeader'
import DashboardIcon from '@mui/icons-material/Dashboard'

export default function DashboardPage() {
  // TODO: Get user data from authentication context/API
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin', // Change this to test different roles: 'admin', 'manager', 'employee'
    email: 'john.doe@company.com'
  })

  const getDashboardContent = useCallback(() => {
    switch (currentUser.role) {
      case 'admin':
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

      case 'manager':
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

      default: // employee
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <ScheduleIcon className="text-2xl text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">40h</div>
                <p className="text-xs text-muted-foreground">
                  +2h from last week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
                <BeachAccessIcon className="text-2xl text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15</div>
                <p className="text-xs text-muted-foreground">
                  Days remaining
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Project</CardTitle>
                <AddTaskIcon className="text-2xl text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Web App</div>
                <p className="text-xs text-muted-foreground">
                  75% complete
                </p>
              </CardContent>
            </Card>
          </div>
        )
    }
  }, [currentUser.role])

  const getQuickActions = useCallback(() => {
    const baseActions = [
      { label: 'Log Time', href: '/timesheet/new', icon: <ScheduleIcon /> },
      { label: 'Request Leave', href: '/leave/new', icon: <BeachAccessIcon /> },
    ]

    if (currentUser.role === 'admin') {
      return [
        ...baseActions,
        { label: 'Add User', href: '/users/new', icon: <PersonAddIcon /> },
        { label: 'Create Project', href: '/projects/new', icon: <AddTaskIcon /> },
        { label: 'View Reports', href: '/reports', icon: <BarChartIcon /> },
      ]
    }

    if (currentUser.role === 'manager') {
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
        />

        {/* Stats Cards */}
        <div className="mb-8">
          {getDashboardContent()}
        </div>

        {/* Quick Actions */}
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

        {/* Recent Activity */}
        <div>
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
      </div>
    </Layout>
  )
}