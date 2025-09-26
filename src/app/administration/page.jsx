'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Building from '@mui/icons-material/Business'
import Users from '@mui/icons-material/People'
import Settings from '@mui/icons-material/Settings'
import BarChart from '@mui/icons-material/BarChart'
import CompanySetup from '@/components/admin/CompanySetup'

export default function AdministrationPage() {
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin',
    email: 'john.doe@company.com'
  })

  const [activeSection, setActiveSection] = useState('overview')

  const adminSections = [
    {
      id: 'overview',
      title: 'Overview',
      description: 'Administration overview and navigation',
      icon: <Settings />
    },
    {
      id: 'company',
      title: 'Company Setup',
      description: 'Setup company structure, locations, departments, and employees',
      icon: <Building />
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions',
      icon: <Users />
    },
    {
      id: 'monitoring',
      title: 'System Monitoring',
      description: 'Monitor system performance and usage statistics',
      icon: <BarChart />
    }
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'company':
        return <CompanySetup />
      case 'overview':
      default:
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection('company')}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2" />
                  Company Setup
                </CardTitle>
                <CardDescription>Setup company structure, locations, departments, and employees</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Configure your organization's structure including locations, departments, and employee assignments.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Create, modify, and manage user accounts, roles, and access permissions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Monitoring</CardTitle>
                <CardDescription>Monitor system performance and usage statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  View system performance metrics, usage statistics, and health monitoring.
                </p>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Administration</h1>
          <p className="text-gray-600">System administration, configuration, and advanced management features</p>
        </div>

        {/* Navigation Pills */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {adminSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </Layout>
  )
}
