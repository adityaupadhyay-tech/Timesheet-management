'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function PayrollPage() {
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin',
    email: 'john.doe@company.com'
  })

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payroll</h1>
        <p className="text-gray-600">Manage payroll processing, salary information, and compensation details</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Payroll Processing</CardTitle>
            <CardDescription>Process employee salaries, bonuses, and deductions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Calculate and process monthly payroll, including overtime, bonuses, and tax deductions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Salary Information</CardTitle>
            <CardDescription>View and manage employee compensation details</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Access salary structures, pay grades, and compensation history for employees.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payroll Reports</CardTitle>
            <CardDescription>Generate payroll reports and tax documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Create payroll summaries, tax reports, and year-end documentation.
            </p>
          </CardContent>
        </Card>
      </div>
      </div>
    </Layout>
  )
}
