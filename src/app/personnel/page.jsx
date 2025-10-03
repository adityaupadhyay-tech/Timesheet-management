'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PersonnelPage() {
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin',
    email: 'john.doe@company.com'
  })

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Personnel</h1>
        <p className="text-gray-600">Manage employee information, organizational structure, and HR operations</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>View and manage employee information and contact details</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Access employee profiles, contact information, and organizational hierarchy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organizational Chart</CardTitle>
            <CardDescription>Visualize company structure and reporting relationships</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              View the organizational structure, departments, and reporting lines.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employee Records</CardTitle>
            <CardDescription>Manage employee files, documents, and HR records</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Access and manage employee files, contracts, performance records, and documentation.
            </p>
          </CardContent>
        </Card>
      </div>
      </div>
    </Layout>
  )
}
