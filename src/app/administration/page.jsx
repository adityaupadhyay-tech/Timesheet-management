'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdministrationPage() {
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin',
    email: 'john.doe@company.com'
  })

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Administration</h1>
        <p className="text-gray-600">System administration, configuration, and advanced management features</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
            <CardDescription>Configure system settings and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Manage system-wide settings, configurations, and application preferences.
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
      </div>
    </Layout>
  )
}
