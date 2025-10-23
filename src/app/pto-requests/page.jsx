'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PTORequestsPage() {
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'Admin',
    email: 'john.doe@company.com'
  })

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PTO Requests</h1>
        <p className="text-gray-600">Manage paid time off requests, vacation days, and leave applications</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Submit PTO Request</CardTitle>
            <CardDescription>Request time off for vacation, sick leave, or personal time</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Submit new paid time off requests with dates, reason, and approval workflow.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My PTO History</CardTitle>
            <CardDescription>View your past and current PTO requests</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Track your leave history, approved requests, and remaining PTO balance.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PTO Calendar</CardTitle>
            <CardDescription>View team PTO schedule and availability</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              See team member time off to plan your own requests and avoid conflicts.
            </p>
          </CardContent>
        </Card>
      </div>
      </div>
    </Layout>
  )
}
