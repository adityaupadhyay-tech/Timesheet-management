'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ResourcesPage() {
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin',
    email: 'john.doe@company.com'
  })

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resources</h1>
        <p className="text-gray-600">Access company resources, documentation, and helpful materials</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Company Documents</CardTitle>
            <CardDescription>Access company policies, procedures, and official documents</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              View employee handbooks, company policies, procedures, and official documentation.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Training Materials</CardTitle>
            <CardDescription>Access training resources and educational content</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Find training videos, tutorials, and educational resources for professional development.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Forms & Templates</CardTitle>
            <CardDescription>Download forms, templates, and standard documents</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Access downloadable forms, templates, and standard document formats.
            </p>
          </CardContent>
        </Card>
      </div>
      </div>
    </Layout>
  )
}
