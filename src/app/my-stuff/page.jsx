'use client'

import { useMemo, useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useUser } from '@/contexts/UserContext'
import { ArrowLeft, Save } from 'lucide-react'
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

function MyStuffContent() {
  const { user: currentUser } = useUser()
  const searchParams = useSearchParams()
  const [activeSection, setActiveSection] = useState(null)
  
  // Check for section parameter in URL
  useEffect(() => {
    const section = searchParams.get('section')
    if (section && currentUser.role === 'Employee') {
      setActiveSection(section)
    }
  }, [searchParams, currentUser.role])
  
  // Basic Information form state
  const [basicInfo, setBasicInfo] = useState({
    company: '',
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipcode: '',
    homePhone: '',
    workPhone: '',
    workEmail: ''
  })

  // Job Status form state
  const [jobStatus, setJobStatus] = useState({
    alternateId: '',
    occupation: '',
    workersCompCode: '',
    clientHireDate: '',
    companyHireDate: '',
    terminationDate: '',
    anniversaryDate: '',
    reviewDate: '',
    payRate: '',
    standardHours: ''
  })

  // Department form state
  const [department, setDepartment] = useState({
    department1: '',
    department1Percent: '',
    department2: '',
    department2Percent: '',
    department3: '',
    department3Percent: '',
    department4: '',
    department4Percent: ''
  })

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

  // Handle form save
  const handleSaveBasicInfo = () => {
    console.log('Saving basic info:', basicInfo)
    // TODO: Implement save logic
    alert('Basic information saved successfully!')
    setActiveSection(null)
  }

  const handleSaveJobStatus = () => {
    console.log('Saving job status:', jobStatus)
    // TODO: Implement save logic
    alert('Job status saved successfully!')
    setActiveSection(null)
  }

  const handleSaveDepartment = () => {
    console.log('Saving department:', department)
    // TODO: Implement save logic
    alert('Department information saved successfully!')
    setActiveSection(null)
  }

  // Render Department form
  const renderDepartmentForm = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => setActiveSection(null)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-2xl font-semibold text-gray-900">Department</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Assignment</CardTitle>
          <CardDescription>View your department assignments and percentages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="department1">Department 1</Label>
              <Input
                id="department1"
                value={department.department1}
                disabled
                placeholder="Enter department name"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department1Percent">Department 1 Percent</Label>
              <Input
                id="department1Percent"
                type="number"
                value={department.department1Percent}
                disabled
                placeholder="Enter percentage"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department2">Department 2</Label>
              <Input
                id="department2"
                value={department.department2}
                disabled
                placeholder="Enter department name"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department2Percent">Department 2 Percent</Label>
              <Input
                id="department2Percent"
                type="number"
                value={department.department2Percent}
                disabled
                placeholder="Enter percentage"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department3">Department 3</Label>
              <Input
                id="department3"
                value={department.department3}
                disabled
                placeholder="Enter department name"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department3Percent">Department 3 Percent</Label>
              <Input
                id="department3Percent"
                type="number"
                value={department.department3Percent}
                disabled
                placeholder="Enter percentage"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department4">Department 4</Label>
              <Input
                id="department4"
                value={department.department4}
                disabled
                placeholder="Enter department name"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department4Percent">Department 4 Percent</Label>
              <Input
                id="department4Percent"
                type="number"
                value={department.department4Percent}
                disabled
                placeholder="Enter percentage"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setActiveSection(null)}
            >
              Back to My Stuff
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Render Job Status form
  const renderJobStatusForm = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => setActiveSection(null)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-2xl font-semibold text-gray-900">Job Status</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employment Details</CardTitle>
          <CardDescription>View your job status and employment information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="alternateId">Alternate ID</Label>
              <Input
                id="alternateId"
                value={jobStatus.alternateId}
                disabled
                placeholder="Enter alternate ID"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={jobStatus.occupation}
                disabled
                placeholder="Enter occupation"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workersCompCode">Worker's Comp Code</Label>
              <Input
                id="workersCompCode"
                value={jobStatus.workersCompCode}
                disabled
                placeholder="Enter worker's comp code"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientHireDate">Client Hire Date</Label>
              <Input
                id="clientHireDate"
                type="date"
                value={jobStatus.clientHireDate}
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyHireDate">Company Hire Date</Label>
              <Input
                id="companyHireDate"
                type="date"
                value={jobStatus.companyHireDate}
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="terminationDate">Termination Date</Label>
              <Input
                id="terminationDate"
                type="date"
                value={jobStatus.terminationDate}
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anniversaryDate">Anniversary Date</Label>
              <Input
                id="anniversaryDate"
                type="date"
                value={jobStatus.anniversaryDate}
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewDate">Review Date</Label>
              <Input
                id="reviewDate"
                type="date"
                value={jobStatus.reviewDate}
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payRate">Pay Rate</Label>
              <Input
                id="payRate"
                type="number"
                value={jobStatus.payRate}
                disabled
                placeholder="Enter pay rate"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="standardHours">Standard Hours</Label>
              <Input
                id="standardHours"
                type="number"
                value={jobStatus.standardHours}
                disabled
                placeholder="Enter standard hours"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setActiveSection(null)}
            >
              Back to My Stuff
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Render Basic Information form
  const renderBasicInfoForm = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => setActiveSection(null)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-2xl font-semibold text-gray-900">Basic Information</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
          <CardDescription>Update your basic personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={basicInfo.company}
                disabled
                placeholder="Enter company name"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={basicInfo.firstName}
                disabled
                placeholder="Enter first name"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={basicInfo.lastName}
                disabled
                placeholder="Enter last name"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workEmail">Work Email</Label>
              <Input
                id="workEmail"
                type="email"
                value={basicInfo.workEmail}
                disabled
                placeholder="Enter work email"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address1">Address Line 1</Label>
              <Input
                id="address1"
                value={basicInfo.address1}
                disabled
                placeholder="Enter street address"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address2">Address Line 2</Label>
              <Input
                id="address2"
                value={basicInfo.address2}
                disabled
                placeholder="Apartment, suite, etc. (optional)"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={basicInfo.city}
                disabled
                placeholder="Enter city"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={basicInfo.state}
                disabled
                placeholder="Enter state"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipcode">Zip Code</Label>
              <Input
                id="zipcode"
                value={basicInfo.zipcode}
                disabled
                placeholder="Enter zip code"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="homePhone">Home Phone</Label>
              <Input
                id="homePhone"
                type="tel"
                value={basicInfo.homePhone}
                disabled
                placeholder="Enter home phone"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workPhone">Work Phone</Label>
              <Input
                id="workPhone"
                type="tel"
                value={basicInfo.workPhone}
                disabled
                placeholder="Enter work phone"
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setActiveSection(null)}
            >
              Back to My Stuff
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // Render Employee view with card-based layout
  if (currentUser.role === 'Employee') {
    // Show form if a section is active
    if (activeSection === 'basic-info') {
      return (
        <Layout userRole={currentUser.role} userName={currentUser.name}>
          <div className="p-6">
            {renderBasicInfoForm()}
          </div>
        </Layout>
      )
    }

    if (activeSection === 'job-status') {
      return (
        <Layout userRole={currentUser.role} userName={currentUser.name}>
          <div className="p-6">
            {renderJobStatusForm()}
          </div>
        </Layout>
      )
    }

    if (activeSection === 'department') {
      return (
        <Layout userRole={currentUser.role} userName={currentUser.name}>
          <div className="p-6">
            {renderDepartmentForm()}
          </div>
        </Layout>
      )
    }

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
                    className={`cursor-pointer hover:shadow-md transition-all ${
                      activeSection === tab.id
                        ? 'border-2 border-blue-500 bg-blue-50'
                        : ''
                    }`}
                    onClick={() => {
                      if (tab.id === 'basic-info') {
                        setActiveSection('basic-info')
                      } else if (tab.id === 'job-status') {
                        setActiveSection('job-status')
                      } else if (tab.id === 'department') {
                        setActiveSection('department')
                      } else {
                        console.log(`Navigate to ${tab.label}`)
                      }
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <span className="mr-2 text-gray-600 w-5 flex-shrink-0">{tab.icon}</span>
                        <span className="text-left">{tab.label}</span>
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
                        <span className="mr-2 text-gray-600 w-5 flex-shrink-0">{tab.icon}</span>
                        <span className="text-left">{tab.label}</span>
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

export default function MyStuffPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyStuffContent />
    </Suspense>
  )
}
