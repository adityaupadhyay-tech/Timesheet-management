'use client'

import { useMemo } from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/contexts/UserContext'
import PersonIcon from '@mui/icons-material/Person'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import SettingsIcon from '@mui/icons-material/Settings'
import DescriptionIcon from '@mui/icons-material/Description'
import InfoIcon from '@mui/icons-material/Info'
import WorkIcon from '@mui/icons-material/Work'
import GroupIcon from '@mui/icons-material/Group'
import ContactPhoneIcon from '@mui/icons-material/ContactPhone'
import EventIcon from '@mui/icons-material/Event'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ReceiptIcon from '@mui/icons-material/Receipt'
import Description from '@mui/icons-material/Description'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

export default function MyStuffPage() {
  const { user: currentUser } = useUser()

  // Sub-tabs for My Profile
  const profileTabs = useMemo(() => [
    { id: 'basic-info', label: 'Basic Information', icon: <InfoIcon /> },
    { id: 'job-status', label: 'Job Status', icon: <WorkIcon /> },
    { id: 'department', label: 'Department', icon: <GroupIcon /> },
    { id: 'personal-info', label: 'Personal Information', icon: <PersonIcon /> },
    { id: 'paid-leave', label: 'Paid Leave', icon: <EventIcon /> },
    { id: 'emergency-contact', label: 'Emergency Contact', icon: <ContactPhoneIcon /> },
    { id: 'performance-coaching', label: 'Performance Coaching', icon: <TrendingUpIcon /> }
  ], [])

  // Sub-tabs for My Payroll
  const payrollTabs = useMemo(() => [
    { id: 'earning-statement', label: 'Earning Statement', icon: <ReceiptIcon /> },
    { id: 'w2-register', label: 'W-2 Register', icon: <Description /> },
    { id: 'tax-settings', label: 'Tax Settings', icon: <AccountBalanceIcon /> },
    { id: 'direct-deposits', label: 'Direct Deposits', icon: <CreditCardIcon /> },
    { id: 'ytd-info', label: 'Year to Date Information', icon: <CalendarTodayIcon /> },
    { id: 'online-timecard', label: 'On-line Timecard', icon: <AccessTimeIcon /> },
    { id: 'sundial-clock', label: 'Sundial Time Clock', icon: <AccessTimeIcon /> }
  ], [])

  const sections = useMemo(() => {
    // For Admin and Manager roles only
    if (currentUser.role !== 'Employee') {
      return [
        {
          title: 'Personal Information',
          description: 'Update your profile details and contact information',
          icon: <PersonIcon className="h-8 w-8 text-blue-600" />,
          content: 'Manage your name, email, phone number, and other personal details.',
          color: 'hover:border-blue-500'
        },
        {
          title: 'Account Settings',
          description: 'Configure your account preferences and security settings',
          icon: <SettingsIcon className="h-8 w-8 text-purple-600" />,
          content: 'Change password, notification preferences, and privacy settings.',
          color: 'hover:border-purple-500'
        },
        {
          title: 'My Documents',
          description: 'Access and manage your personal documents',
          icon: <DescriptionIcon className="h-8 w-8 text-orange-600" />,
          content: 'View and download your personal documents, contracts, and certificates.',
          color: 'hover:border-orange-500'
        }
      ]
    }
    return []
  }, [currentUser.role])

  // Render Employee view with card-based layout
  if (currentUser.role === 'Employee') {
    return (
      <Layout userRole={currentUser.role} userName={currentUser.name}>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Stuff</h1>
            <p className="text-gray-600">Manage your personal information and payroll details</p>
          </div>

          <div className="space-y-8">
            {/* My Profile Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <PersonIcon className="mr-2 text-blue-600" />
                My Profile
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {profileTabs.map((tab) => (
                  <Card
                    key={tab.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => console.log(`Navigate to ${tab.label}`)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <span className="mr-2 text-gray-600">{tab.icon}</span>
                        {tab.label}
                      </CardTitle>
                      <CardDescription>
                        {tab.id === 'basic-info' && 'View and update your basic personal information'}
                        {tab.id === 'job-status' && 'Current employment status and job details'}
                        {tab.id === 'department' && 'Department assignment and team information'}
                        {tab.id === 'personal-info' && 'Manage your contact details and personal information'}
                        {tab.id === 'paid-leave' && 'View leave balance and paid time off history'}
                        {tab.id === 'emergency-contact' && 'Emergency contact information and details'}
                        {tab.id === 'performance-coaching' && 'Performance reviews and coaching sessions'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {tab.id === 'basic-info' && 'Update your name, employee ID, and basic information'}
                        {tab.id === 'job-status' && 'View current position, status, and employment details'}
                        {tab.id === 'department' && 'See your department, team, and reporting structure'}
                        {tab.id === 'personal-info' && 'Manage address, phone number, and personal details'}
                        {tab.id === 'paid-leave' && 'Track available leave balance and request time off'}
                        {tab.id === 'emergency-contact' && 'Add or update emergency contact information'}
                        {tab.id === 'performance-coaching' && 'Access performance reviews and coaching records'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* My Payroll Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <AttachMoneyIcon className="mr-2 text-green-600" />
                My Payroll
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {payrollTabs.map((tab) => (
                  <Card
                    key={tab.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => console.log(`Navigate to ${tab.label}`)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <span className="mr-2 text-gray-600">{tab.icon}</span>
                        {tab.label}
                      </CardTitle>
                      <CardDescription>
                        {tab.id === 'earning-statement' && 'View your payslips and earning statements'}
                        {tab.id === 'w2-register' && 'Access your W-2 tax forms and documents'}
                        {tab.id === 'tax-settings' && 'Manage tax preferences and withholdings'}
                        {tab.id === 'direct-deposits' && 'Configure direct deposit and bank accounts'}
                        {tab.id === 'ytd-info' && 'Year-to-date earnings and tax summary'}
                        {tab.id === 'online-timecard' && 'View and submit your timecard online'}
                        {tab.id === 'sundial-clock' && 'Clock in and out using Sundial time clock'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {tab.id === 'earning-statement' && 'Download and view detailed earning statements'}
                        {tab.id === 'w2-register' && 'Access all W-2 forms and tax documents'}
                        {tab.id === 'tax-settings' && 'Update tax withholdings and preferences'}
                        {tab.id === 'direct-deposits' && 'Manage bank accounts for direct deposit'}
                        {tab.id === 'ytd-info' && 'View cumulative earnings and deductions'}
                        {tab.id === 'online-timecard' && 'Enter and submit weekly timecard'}
                        {tab.id === 'sundial-clock' && 'Punch in and out of work'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Render Admin/Manager view with cards
  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Stuff</h1>
          <p className="text-gray-600">Manage your personal information, preferences, and account settings</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section, index) => (
            <Card key={index} className={`cursor-pointer transition-all border-2 ${section.color}`}>
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  {section.icon}
                  <CardTitle>{section.title}</CardTitle>
                </div>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  )
}
