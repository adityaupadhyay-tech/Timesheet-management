'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import AccountBalance from '@mui/icons-material/AccountBalance'
import CalendarToday from '@mui/icons-material/CalendarToday'
import Settings from '@mui/icons-material/Settings'
import PlayArrow from '@mui/icons-material/PlayArrow'
import Assessment from '@mui/icons-material/Assessment'
import VpnKey from '@mui/icons-material/VpnKey'
import VerifiedUser from '@mui/icons-material/VerifiedUser'
import Schedule from '@mui/icons-material/Schedule'
import Edit from '@mui/icons-material/Edit'
import CloudUpload from '@mui/icons-material/CloudUpload'
import Dashboard from '@mui/icons-material/Dashboard'
import Description from '@mui/icons-material/Description'
import Receipt from '@mui/icons-material/Receipt'
import PersonSearch from '@mui/icons-material/PersonSearch'
import ArrowForward from '@mui/icons-material/ArrowForward'
import PageHeader from '@/components/PageHeader'

export default function PayrollPage() {
  const router = useRouter()
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin',
    email: 'john.doe@company.com'
  })

  const navigateToPaycycleSetup = () => {
    router.push('/payroll/paycycle-setup')
  }

  const handleCardClick = (cardName) => {
    if (cardName === 'Paycycle Setup') {
      navigateToPaycycleSetup()
    } else {
      alert(`${cardName} - Coming Soon!`)
    }
  }

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
        <PageHeader 
          title="Payroll"
          subtitle="Manage payroll processing, salary information, and compensation details"
          icon={<AccountBalance />}
        />

        <div className="space-y-8">
          {/* Setup Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Setup
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCardClick('Paycode Access')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <VpnKey className="mr-2" />
                    Paycode Access
                  </CardTitle>
                  <CardDescription>
                    Manage paycode permissions and access controls
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Configure paycode access levels, permissions, and control settings for payroll processing.
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCardClick('Certified Setup')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <VerifiedUser className="mr-2" />
                    Certified Setup
                  </CardTitle>
                  <CardDescription>
                    Configure certified payroll settings and compliance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Set up certified payroll requirements, prevailing wage rules, and compliance settings.
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCardClick('Online Timecard Setup')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Schedule className="mr-2" />
                    Online Timecard Setup
                  </CardTitle>
                  <CardDescription>
                    Set up online timecard entry and validation rules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Configure online timecard system, entry rules, validation settings, and approval workflows.
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={navigateToPaycycleSetup}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarToday className="mr-2" />
                    Paycycle Setup
                  </CardTitle>
                  <CardDescription>
                    Configure payroll cycle settings and frequencies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Set up pay frequencies, processing schedules, and cycle dates for your companies.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Processing Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Processing
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCardClick('Entry Worksheet')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Edit className="mr-2" />
                    Entry Worksheet
                  </CardTitle>
                  <CardDescription>
                    Enter and manage payroll entries for processing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Create, edit, and manage payroll entries and worksheets for processing periods.
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCardClick('Export Pay Periods')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CloudUpload className="mr-2" />
                    Export Pay Periods
                  </CardTitle>
                  <CardDescription>
                    Export payroll data for specific pay periods
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Export payroll data, timesheets, and pay period information for external systems.
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCardClick('Sundial Manager Portal')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Dashboard className="mr-2" />
                    Sundial Manager Portal
                  </CardTitle>
                  <CardDescription>
                    Access Sundial manager dashboard and tools
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Access the Sundial manager portal for advanced payroll management and oversight.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reports Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Reports
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCardClick('Payroll Registers')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AccountBalance className="mr-2" />
                    Payroll Registers
                  </CardTitle>
                  <CardDescription>
                    Generate payroll register reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Generate detailed payroll registers with earnings, deductions, and net pay information.
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCardClick('WH-347 Reports')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Description className="mr-2" />
                    WH-347 Reports
                  </CardTitle>
                  <CardDescription>
                    Generate certified payroll WH-347 forms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Generate WH-347 certified payroll reports for federal projects and compliance.
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCardClick('Invoice Register')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Receipt className="mr-2" />
                    Invoice Register
                  </CardTitle>
                  <CardDescription>
                    View and manage payroll invoice registers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Track and manage payroll invoices, billing records, and financial registers.
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCardClick('Employee YTD Info')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PersonSearch className="mr-2" />
                    Employee YTD Info
                  </CardTitle>
                  <CardDescription>
                    View year-to-date employee payroll data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Access comprehensive year-to-date payroll information for all employees.
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCardClick('Payroll Direct Reports')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Assessment className="mr-2" />
                    Payroll Direct Reports
                  </CardTitle>
                  <CardDescription>
                    Generate direct payroll reports and analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Create direct payroll reports with detailed analytics and insights for decision making.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
