'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ToolsPage() {
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'Admin',
    email: 'john.doe@company.com'
  })

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tools</h1>
        <p className="text-gray-600">Access productivity tools, utilities, and helpful applications</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Time Tracking Tools</CardTitle>
            <CardDescription>Additional time tracking and productivity utilities</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Access advanced time tracking features, productivity analytics, and reporting tools.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Export/Import</CardTitle>
            <CardDescription>Export and import data in various formats</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Export timesheet data, import employee information, and manage data migrations.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Utilities</CardTitle>
            <CardDescription>System maintenance and configuration tools</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Access system diagnostics, configuration tools, and maintenance utilities.
            </p>
          </CardContent>
        </Card>
      </div>
      </div>
    </Layout>
  )
}
