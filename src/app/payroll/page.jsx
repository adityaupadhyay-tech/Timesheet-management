'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AccountBalance from '@mui/icons-material/AccountBalance'
import CalendarToday from '@mui/icons-material/CalendarToday'
import ArrowForward from '@mui/icons-material/ArrowForward'

export default function PayrollPage() {
  const router = useRouter()
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin',
    email: 'john.doe@company.com'
  })

  // Active section state
  const [activeSection, setActiveSection] = useState('paycycle')

  const navigateToPaycycleSetup = () => {
    router.push('/payroll/paycycle-setup')
  }

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payroll</h1>
          <p className="text-gray-600">Manage payroll processing, salary information, and compensation details</p>
        </div>

        {/* Navigation Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={navigateToPaycycleSetup}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <CalendarToday className="w-5 h-5 mr-2" />
                  Paycycle Setup
                </div>
                <ArrowForward className="w-4 h-4 text-gray-400" />
              </CardTitle>
              <CardDescription>Configure payroll cycle settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Set up pay frequency, processing days, and cycle dates for your companies.
              </p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              activeSection === 'reports' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => setActiveSection('reports')}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <AccountBalance className="w-5 h-5 mr-2" />
                Payroll Reports
              </CardTitle>
              <CardDescription>Generate reports and documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Create payroll summaries, tax reports, and year-end documentation.
              </p>
            </CardContent>
          </Card>
        </div>


        {activeSection === 'reports' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AccountBalance className="w-5 h-5 mr-2" />
                  Payroll Reports
                </CardTitle>
                <CardDescription>Generate comprehensive payroll reports and documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Payroll Summary</CardTitle>
                      <CardDescription>Generate monthly payroll reports</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Create detailed monthly payroll summaries including salaries, deductions, and taxes.
                      </p>
                      <Button className="w-full">Generate Report</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Tax Documentation</CardTitle>
                      <CardDescription>Generate tax forms and reports</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Generate W-2 forms, tax summaries, and year-end documentation for employees.
                      </p>
                      <Button className="w-full">Generate Tax Docs</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Payroll Analytics</CardTitle>
                      <CardDescription>View payroll trends and analytics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Analyze payroll trends, costs, and generate insights for better decision making.
                      </p>
                      <Button className="w-full">View Analytics</Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}
