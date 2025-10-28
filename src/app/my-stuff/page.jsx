'use client'

import { useMemo, useState, useEffect, useRef, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useUser } from '@/contexts/UserContext'
import { ArrowLeft, Save, Download, X, Filter, ChevronDown, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { DatePickerComponent } from '@/components/ui/date-picker'
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

  // Personal Information form state
  const [personalInfo, setPersonalInfo] = useState({
    ssn: '***-**-1234',
    race: 'Asian',
    alienExp: 'Permanent Resident',
    veteranStatus: 'Not a Veteran',
    birthDate: '1985-06-15'
  })

  // Paid Leave form state
  const [paidLeave, setPaidLeave] = useState({
    ptoVacation: {
      asOfDate: '2025-02-10',
      resetDate: '2025-01-01',
      balanceForward: '40.00',
      accrued: '8.00',
      used: '16.00',
      adjustments: '0.00',
      totalBank: '32.00',
      available: '32.00'
    },
    pacWestSickLeave: {
      asOfDate: '2025-02-10',
      resetDate: '2025-01-01',
      balanceForward: '80.00',
      accrued: '0.00',
      used: '8.00',
      adjustments: '0.00',
      totalBank: '72.00',
      available: '72.00'
    }
  })

  // Historical paid leave usage
  const [historicalUsage] = useState([
    { checkDate: '2025-01-15', type: 'PTO/Vacation', hoursTaken: '8.0' },
    { checkDate: '2025-01-10', type: 'PTO/Vacation', hoursTaken: '4.0' },
    { checkDate: '2025-01-08', type: 'PTO/Vacation', hoursTaken: '4.0' },
    { checkDate: '2024-12-20', type: 'Pac West Sick Leave', hoursTaken: '8.0' },
    { checkDate: '2024-12-05', type: 'PTO/Vacation', hoursTaken: '16.0' },
    { checkDate: '2024-11-28', type: 'Pac West Sick Leave', hoursTaken: '4.0' },
    { checkDate: '2024-11-15', type: 'PTO/Vacation', hoursTaken: '8.0' },
    { checkDate: '2024-10-30', type: 'PTO/Vacation', hoursTaken: '8.0' }
  ])

  // Emergency Contact form state
  const [emergencyContact, setEmergencyContact] = useState({
    contact: '',
    relationship: '',
    phoneNumber: ''
  })

  // Earning Statement data
  const [earningStatements] = useState([
    {
      id: 1,
      employeeName: 'John Doe',
      date: '2025-02-15',
      gross: 4500.00,
      deductions: 450.00,
      taxes: 1125.00,
      net: 2925.00
    },
    {
      id: 2,
      employeeName: 'John Doe',
      date: '2025-02-01',
      gross: 4500.00,
      deductions: 450.00,
      taxes: 1125.00,
      net: 2925.00
    },
    {
      id: 3,
      employeeName: 'John Doe',
      date: '2025-01-15',
      gross: 4500.00,
      deductions: 450.00,
      taxes: 1125.00,
      net: 2925.00
    },
    {
      id: 4,
      employeeName: 'John Doe',
      date: '2025-01-01',
      gross: 4500.00,
      deductions: 450.00,
      taxes: 1125.00,
      net: 2925.00
    }
  ])

  // Earning Statement filters
  const [earningFilters, setEarningFilters] = useState({
    employeeName: '',
    date: null, // Date object for date picker
    grossMin: '',
    grossMax: '',
    deductionsMin: '',
    deductionsMax: '',
    taxesMin: '',
    taxesMax: '',
    netMin: '',
    netMax: ''
  })
  
  // Track which filter dropdown is open
  const [openFilter, setOpenFilter] = useState(null)
  // Track dropdown positions for fixed positioning
  const [dropdownPositions, setDropdownPositions] = useState({})
  const filterButtonRefs = useRef({})
  
  // Sort state for Earning Statements
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc') // 'asc' or 'desc'
  
  // W-2 Register data
  const [w2Statements, setW2Statements] = useState([
    {
      id: 1,
      company: 'Tech Solutions Inc',
      employee: 'John Doe',
      year: 2024,
      hasW2: true,
      hasW2c: false
    },
    {
      id: 2,
      company: 'Tech Solutions Inc',
      employee: 'John Doe',
      year: 2023,
      hasW2: true,
      hasW2c: true
    },
    {
      id: 3,
      company: 'Digital Innovations',
      employee: 'Jane Smith',
      year: 2024,
      hasW2: true,
      hasW2c: false
    },
    {
      id: 4,
      company: 'Digital Innovations',
      employee: 'Jane Smith',
      year: 2023,
      hasW2: true,
      hasW2c: false
    },
    {
      id: 5,
      company: 'Tech Solutions Inc',
      employee: 'Bob Johnson',
      year: 2024,
      hasW2: true,
      hasW2c: false
    }
  ])
  
  // W-2 Register filters
  const [w2Filters, setW2Filters] = useState({
    company: '',
    employee: '',
    yearMin: '',
    yearMax: ''
  })
  
  // Sort state for W-2 Register
  const [w2SortColumn, setW2SortColumn] = useState(null)
  const [w2SortDirection, setW2SortDirection] = useState('asc')
  
  // Handle opening filter and calculate position
  const handleFilterClick = (filterKey, event) => {
    if (openFilter === filterKey) {
      setOpenFilter(null)
      return
    }
    
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    
    // Calculate if dropdown should open on left or right
    const isRightAligned = ['gross', 'deductions', 'taxes', 'net'].includes(filterKey)
    
    setDropdownPositions({
      [filterKey]: {
        top: rect.bottom + 6,
        left: isRightAligned ? undefined : rect.left,
        right: isRightAligned ? window.innerWidth - rect.right : undefined
      }
    })
    
    setOpenFilter(filterKey)
  }
  
  // Handle opening filter for W-2 Register (separate to avoid conflicts)
  const handleW2FilterClick = (filterKey, event) => {
    if (openFilter === filterKey) {
      setOpenFilter(null)
      return
    }
    
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    
    // W-2 filters open on left side
    setDropdownPositions({
      [filterKey]: {
        top: rect.bottom + 6,
        left: rect.left,
        right: undefined
      }
    })
    
    setOpenFilter(filterKey)
  }
  
  // Close dropdown when clicking outside (checking both filter container and portal dropdowns)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openFilter) {
        // Check if click is outside filter container, portal dropdown, or date picker calendar
        const isInsideFilterContainer = event.target.closest('.filter-dropdown-container')
        const isInsidePortalDropdown = event.target.closest('[style*="z-index: 100"]')
        // Check for react-datepicker calendar and portal elements
        const isInsideDatePicker = event.target.closest('.react-datepicker') || 
                                   event.target.closest('.react-datepicker__portal') ||
                                   event.target.closest('[class*="react-datepicker"]') ||
                                   event.target.closest('.react-datepicker-popper') ||
                                   event.target.closest('[class*="react-datepicker-popper"]')
        
        // For date filter, don't close when interacting with date picker
        if (openFilter === 'date') {
          if (!isInsideFilterContainer && !isInsidePortalDropdown && !isInsideDatePicker) {
            setOpenFilter(null)
          }
        } else {
          // For other filters
          if (!isInsideFilterContainer && !isInsidePortalDropdown) {
            setOpenFilter(null)
          }
        }
      }
    }
    if (openFilter) {
      // Use mousedown instead of click to catch events earlier
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openFilter])

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

  const handleSavePaidLeave = () => {
    console.log('Saving paid leave:', paidLeave)
    // TODO: Implement save logic
    alert('Paid leave information saved successfully!')
    setActiveSection(null)
  }

  const renderPersonalInfoForm = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => setActiveSection(null)} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <h2 className="text-2xl font-semibold text-gray-900">Personal Information</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
          <CardDescription>View your personal information and demographics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ssn">SSN</Label>
              <Input
                id="ssn"
                value={personalInfo.ssn}
                onChange={(e) => setPersonalInfo({...personalInfo, ssn: e.target.value})}
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="race">Race</Label>
              <Input
                id="race"
                value={personalInfo.race}
                onChange={(e) => setPersonalInfo({...personalInfo, race: e.target.value})}
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alienExp">Alien Exp</Label>
              <Input
                id="alienExp"
                value={personalInfo.alienExp}
                onChange={(e) => setPersonalInfo({...personalInfo, alienExp: e.target.value})}
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="veteranStatus">Veteran Status</Label>
              <Input
                id="veteranStatus"
                value={personalInfo.veteranStatus}
                onChange={(e) => setPersonalInfo({...personalInfo, veteranStatus: e.target.value})}
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                type="text"
                value={formatDateToMMDDYYYY(personalInfo.birthDate)}
                onChange={(e) => setPersonalInfo({...personalInfo, birthDate: e.target.value})}
                placeholder="MM-dd-yyyy"
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setActiveSection(null)}>Back to My Stuff</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPaidLeaveForm = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => setActiveSection(null)} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <h2 className="text-2xl font-semibold text-gray-900">Paid Leave</h2>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        {/* PTO/Vacation Card */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <EventIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">PTO/Vacation</CardTitle>
                <CardDescription>Paid time off and vacation balance</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">As of Date</Label>
                <div className="text-sm font-mono text-gray-900">{formatDateToMMDDYYYY(paidLeave.ptoVacation.asOfDate)}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reset Date</Label>
                <div className="text-sm font-mono text-gray-900">{formatDateToMMDDYYYY(paidLeave.ptoVacation.resetDate)}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Balance Forward</Label>
                <div className="text-lg font-semibold text-gray-900">{paidLeave.ptoVacation.balanceForward} hrs</div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Accrued</Label>
                <div className="text-lg font-semibold text-green-600">+{paidLeave.ptoVacation.accrued} hrs</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Used</Label>
                <div className="text-lg font-semibold text-red-600">-{paidLeave.ptoVacation.used} hrs</div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Adjustments</Label>
                <div className="text-lg font-semibold text-gray-600">{paidLeave.ptoVacation.adjustments} hrs</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700">Available Balance</Label>
                <div className="text-2xl font-bold text-blue-600">{paidLeave.ptoVacation.available} hrs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pac West Sick Leave Card */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ContactPhoneIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Pac West Sick Leave</CardTitle>
                <CardDescription>Sick leave and medical time off</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">As of Date</Label>
                <div className="text-sm font-mono text-gray-900">{formatDateToMMDDYYYY(paidLeave.pacWestSickLeave.asOfDate)}</div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reset Date</Label>
                <div className="text-sm font-mono text-gray-900">{formatDateToMMDDYYYY(paidLeave.pacWestSickLeave.resetDate)}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Balance Forward</Label>
                <div className="text-lg font-semibold text-gray-900">{paidLeave.pacWestSickLeave.balanceForward} hrs</div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Accrued</Label>
                <div className="text-lg font-semibold text-green-600">+{paidLeave.pacWestSickLeave.accrued} hrs</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Used</Label>
                <div className="text-lg font-semibold text-red-600">-{paidLeave.pacWestSickLeave.used} hrs</div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Adjustments</Label>
                <div className="text-lg font-semibold text-gray-600">{paidLeave.pacWestSickLeave.adjustments} hrs</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700">Available Balance</Label>
                <div className="text-2xl font-bold text-green-600">{paidLeave.pacWestSickLeave.available} hrs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Total Available Leave</h3>
              <p className="text-sm text-gray-600">Combined balance across all leave types</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {(parseFloat(paidLeave.ptoVacation.available) + parseFloat(paidLeave.pacWestSickLeave.available)).toFixed(1)} hrs
              </div>
              <div className="text-sm text-gray-500">
                {paidLeave.ptoVacation.available} PTO + {paidLeave.pacWestSickLeave.available} Sick
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historical Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Leave Usage</CardTitle>
          <CardDescription>Your recent paid leave usage history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Check Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Hours Taken</th>
                </tr>
              </thead>
              <tbody>
                {historicalUsage.map((entry, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900 font-mono">{formatDateToMMDDYYYY(entry.checkDate)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.type === 'PTO/Vacation' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">{entry.hoursTaken} hrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {historicalUsage.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500 text-sm">No historical usage found</div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={() => setActiveSection(null)}>Back to My Stuff</Button>
      </div>
    </div>
  )

  // Handle PDF download
  const handleDownloadPDF = (statement) => {
    // TODO: Implement PDF download functionality
    console.log('Downloading PDF for statement:', statement)
    // For now, just show an alert
    alert(`Downloading PDF for statement dated ${formatDateToMMDDYYYY(statement.date)}`)
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  // Handle sorting for Earning Statements
  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new column with ascending by default
      setSortColumn(column)
      setSortDirection('asc')
    }
  }
  
  // Smart sort function based on column type for Earning Statements
  const getSortValue = (statement, column) => {
    switch (column) {
      case 'employeeName':
        // Text sorting - case insensitive
        return statement.employeeName.toLowerCase()
      case 'date':
        // Date sorting - convert to timestamp
        return new Date(statement.date).getTime()
      case 'gross':
      case 'deductions':
      case 'taxes':
      case 'net':
        // Numeric sorting
        return parseFloat(statement[column]) || 0
      default:
        return null
    }
  }
  
  // Handle sorting for W-2 Register
  const handleW2Sort = (column) => {
    if (w2SortColumn === column) {
      // Toggle direction if same column
      setW2SortDirection(w2SortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new column with ascending by default
      setW2SortColumn(column)
      setW2SortDirection('asc')
    }
  }
  
  // Smart sort function for W-2 Register
  const getW2SortValue = (statement, column) => {
    switch (column) {
      case 'company':
      case 'employee':
        // Text sorting - case insensitive
        return statement[column].toLowerCase()
      case 'year':
        // Numeric sorting for year
        return parseInt(statement.year) || 0
      default:
        return null
    }
  }
  
  // Filter and sort earning statements with smart filters
  const filteredEarningStatements = useMemo(() => {
    let results = earningStatements.filter((statement) => {
      // Employee Name filter (text search)
      if (earningFilters.employeeName && 
          !statement.employeeName.toLowerCase().includes(earningFilters.employeeName.toLowerCase())) {
        return false
      }

      // Date filter (exact date match)
      if (earningFilters.date) {
        const filterDate = new Date(earningFilters.date)
        const statementDate = new Date(statement.date)
        if (filterDate.toDateString() !== statementDate.toDateString()) {
          return false
        }
      }

      // Gross filter (numeric range)
      if (earningFilters.grossMin) {
        const minValue = parseFloat(earningFilters.grossMin)
        if (!isNaN(minValue) && statement.gross < minValue) {
          return false
        }
      }
      if (earningFilters.grossMax) {
        const maxValue = parseFloat(earningFilters.grossMax)
        if (!isNaN(maxValue) && statement.gross > maxValue) {
          return false
        }
      }

      // Deductions filter (numeric range)
      if (earningFilters.deductionsMin) {
        const minValue = parseFloat(earningFilters.deductionsMin)
        if (!isNaN(minValue) && statement.deductions < minValue) {
          return false
        }
      }
      if (earningFilters.deductionsMax) {
        const maxValue = parseFloat(earningFilters.deductionsMax)
        if (!isNaN(maxValue) && statement.deductions > maxValue) {
          return false
        }
      }

      // Taxes filter (numeric range)
      if (earningFilters.taxesMin) {
        const minValue = parseFloat(earningFilters.taxesMin)
        if (!isNaN(minValue) && statement.taxes < minValue) {
          return false
        }
      }
      if (earningFilters.taxesMax) {
        const maxValue = parseFloat(earningFilters.taxesMax)
        if (!isNaN(maxValue) && statement.taxes > maxValue) {
          return false
        }
      }

      // Net filter (numeric range)
      if (earningFilters.netMin) {
        const minValue = parseFloat(earningFilters.netMin)
        if (!isNaN(minValue) && statement.net < minValue) {
          return false
        }
      }
      if (earningFilters.netMax) {
        const maxValue = parseFloat(earningFilters.netMax)
        if (!isNaN(maxValue) && statement.net > maxValue) {
          return false
        }
      }

      return true
    })
    
    // Apply sorting if sortColumn is set
    if (sortColumn) {
      results = [...results].sort((a, b) => {
        const aValue = getSortValue(a, sortColumn)
        const bValue = getSortValue(b, sortColumn)
        
        if (aValue === null || bValue === null) return 0
        
        if (typeof aValue === 'string') {
          // String comparison
          if (sortDirection === 'asc') {
            return aValue.localeCompare(bValue)
          } else {
            return bValue.localeCompare(aValue)
          }
        } else {
          // Numeric/date comparison
          if (sortDirection === 'asc') {
            return aValue - bValue
          } else {
            return bValue - aValue
          }
        }
      })
    }
    
    return results
  }, [earningStatements, earningFilters, sortColumn, sortDirection])

  // Handle filter change for Earning Statements
  const handleFilterChange = (field, value) => {
    setEarningFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  // Handle filter change for W-2 Register
  const handleW2FilterChange = (field, value) => {
    setW2Filters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Clear all filters
  const clearFilters = () => {
    setEarningFilters({
      employeeName: '',
      date: null,
      grossMin: '',
      grossMax: '',
      deductionsMin: '',
      deductionsMax: '',
      taxesMin: '',
      taxesMax: '',
      netMin: '',
      netMax: ''
    })
  }
  
  // Check if any filter is active for Earning Statements
  const hasActiveFilters = earningFilters.employeeName || earningFilters.date || 
    earningFilters.grossMin || earningFilters.grossMax ||
    earningFilters.deductionsMin || earningFilters.deductionsMax ||
    earningFilters.taxesMin || earningFilters.taxesMax ||
    earningFilters.netMin || earningFilters.netMax
  
  // Check if a specific filter is active for Earning Statements
  const isFilterActive = (filterKey) => {
    switch (filterKey) {
      case 'employeeName':
        return !!earningFilters.employeeName
      case 'date':
        return !!earningFilters.date
      case 'gross':
        return !!(earningFilters.grossMin || earningFilters.grossMax)
      case 'deductions':
        return !!(earningFilters.deductionsMin || earningFilters.deductionsMax)
      case 'taxes':
        return !!(earningFilters.taxesMin || earningFilters.taxesMax)
      case 'net':
        return !!(earningFilters.netMin || earningFilters.netMax)
      default:
        return false
    }
  }
  
  // Check if any filter is active for W-2 Register
  const hasActiveW2Filters = w2Filters.company || w2Filters.employee || 
    w2Filters.yearMin || w2Filters.yearMax
  
  // Check if a specific filter is active for W-2 Register
  const isW2FilterActive = (filterKey) => {
    switch (filterKey) {
      case 'company':
        return !!w2Filters.company
      case 'employee':
        return !!w2Filters.employee
      case 'year':
        return !!(w2Filters.yearMin || w2Filters.yearMax)
      default:
        return false
    }
  }
  
  // Filter and sort W-2 statements
  const filteredW2Statements = useMemo(() => {
    let results = w2Statements.filter((statement) => {
      // Company filter (text search)
      if (w2Filters.company && 
          !statement.company.toLowerCase().includes(w2Filters.company.toLowerCase())) {
        return false
      }

      // Employee filter (text search)
      if (w2Filters.employee && 
          !statement.employee.toLowerCase().includes(w2Filters.employee.toLowerCase())) {
        return false
      }

      // Year filter (numeric range)
      if (w2Filters.yearMin) {
        const minValue = parseInt(w2Filters.yearMin)
        if (!isNaN(minValue) && statement.year < minValue) {
          return false
        }
      }
      if (w2Filters.yearMax) {
        const maxValue = parseInt(w2Filters.yearMax)
        if (!isNaN(maxValue) && statement.year > maxValue) {
          return false
        }
      }

      return true
    })
    
    // Apply sorting if sortColumn is set
    if (w2SortColumn) {
      results = [...results].sort((a, b) => {
        const aValue = getW2SortValue(a, w2SortColumn)
        const bValue = getW2SortValue(b, w2SortColumn)
        
        if (aValue === null || bValue === null) return 0
        
        if (typeof aValue === 'string') {
          // String comparison
          if (w2SortDirection === 'asc') {
            return aValue.localeCompare(bValue)
          } else {
            return bValue.localeCompare(aValue)
          }
        } else {
          // Numeric comparison
          if (w2SortDirection === 'asc') {
            return aValue - bValue
          } else {
            return bValue - aValue
          }
        }
      })
    }
    
    return results
  }, [w2Statements, w2Filters, w2SortColumn, w2SortDirection])
  
  // Clear W-2 filters
  const clearW2Filters = () => {
    setW2Filters({
      company: '',
      employee: '',
      yearMin: '',
      yearMax: ''
    })
  }
  
  // Handle clicking outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openFilter && !event.target.closest('.filter-dropdown-container')) {
        setOpenFilter(null)
      }
    }
    if (openFilter) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openFilter])

  // Render Earning Statement table
  const renderEarningStatement = () => (
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
        <h2 className="text-2xl font-semibold text-gray-900">Earning Statement</h2>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Earning Statements</CardTitle>
              <CardDescription>View and download your earning statements</CardDescription>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-sm"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider align-middle">
                    <div className="flex items-center gap-1.5">
                      <span>Employee Name</span>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleSort('employeeName')}
                          className={`inline-flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 transition-colors ${sortColumn === 'employeeName' ? 'text-blue-600' : 'text-gray-400'}`}
                          title={sortColumn === 'employeeName' ? `Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}` : 'Sort by employee name'}
                        >
                          {sortColumn === 'employeeName' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <div className="relative filter-dropdown-container inline-flex">
                          <button
                            onClick={(e) => handleFilterClick('employeeName', e)}
                            className={`inline-flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 transition-colors ${isFilterActive('employeeName') ? 'text-blue-600' : 'text-gray-400'}`}
                            title="Filter by employee name"
                          >
                            <Filter className="h-3.5 w-3.5" />
                          </button>
                        {typeof window !== 'undefined' && openFilter === 'employeeName' && createPortal(
                          <div 
                            className="fixed w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] p-3"
                            style={{
                              top: `${dropdownPositions.employeeName?.top || 0}px`,
                              left: dropdownPositions.employeeName?.left !== undefined ? `${dropdownPositions.employeeName.left}px` : 'auto',
                              right: dropdownPositions.employeeName?.right !== undefined ? `${dropdownPositions.employeeName.right}px` : 'auto'
                            }}
                          >
                            <div className="space-y-3">
                              <Label className="text-xs font-semibold text-gray-700">Filter by Name</Label>
                              <Input
                                type="text"
                                placeholder="Search name..."
                                value={earningFilters.employeeName}
                                onChange={(e) => handleFilterChange('employeeName', e.target.value)}
                                className="h-9 text-sm w-full"
                                autoFocus
                              />
                              {earningFilters.employeeName && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    handleFilterChange('employeeName', '')
                                    setOpenFilter(null)
                                  }}
                                  className="w-full h-8 text-xs"
                                >
                                  Clear
                                </Button>
                              )}
                            </div>
                          </div>,
                          document.body
                        )}
                        </div>
                      </div>
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider align-middle">
                    <div className="flex items-center gap-1.5">
                      <span>Date</span>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleSort('date')}
                          className={`inline-flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 transition-colors ${sortColumn === 'date' ? 'text-blue-600' : 'text-gray-400'}`}
                          title={sortColumn === 'date' ? `Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}` : 'Sort by date'}
                        >
                          {sortColumn === 'date' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <div className="relative filter-dropdown-container inline-flex">
                          <button
                            onClick={(e) => handleFilterClick('date', e)}
                            className={`inline-flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 transition-colors ${isFilterActive('date') ? 'text-blue-600' : 'text-gray-400'}`}
                            title="Filter by date"
                          >
                            <Filter className="h-3.5 w-3.5" />
                          </button>
                        {typeof window !== 'undefined' && openFilter === 'date' && createPortal(
                          <div 
                            className="fixed w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] p-3 overflow-visible"
                            style={{
                              top: `${dropdownPositions.date?.top || 0}px`,
                              left: dropdownPositions.date?.left !== undefined ? `${dropdownPositions.date.left}px` : 'auto',
                              right: dropdownPositions.date?.right !== undefined ? `${dropdownPositions.date.right}px` : 'auto'
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="space-y-3">
                              <Label className="text-xs font-semibold text-gray-700">Filter by Date</Label>
                              <div 
                                className="w-full"
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <DatePickerComponent
                                  value={earningFilters.date}
                                  onChange={(date) => {
                                    handleFilterChange('date', date)
                                    if (date) setOpenFilter(null)
                                  }}
                                  placeholder="Select date"
                                  className="h-9 text-sm w-full"
                                />
                              </div>
                              {earningFilters.date && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    handleFilterChange('date', null)
                                    setOpenFilter(null)
                                  }}
                                  className="w-full h-8 text-xs"
                                >
                                  Clear
                                </Button>
                              )}
                            </div>
                          </div>,
                          document.body
                        )}
                        </div>
                      </div>
                    </div>
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider align-middle">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span>Gross</span>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleSort('gross')}
                          className={`inline-flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 transition-colors ${sortColumn === 'gross' ? 'text-blue-600' : 'text-gray-400'}`}
                          title={sortColumn === 'gross' ? `Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}` : 'Sort by gross amount'}
                        >
                          {sortColumn === 'gross' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <div className="relative filter-dropdown-container inline-flex">
                          <button
                            onClick={(e) => handleFilterClick('gross', e)}
                            className={`inline-flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 transition-colors ${isFilterActive('gross') ? 'text-blue-600' : 'text-gray-400'}`}
                            title="Filter by gross amount"
                          >
                            <Filter className="h-3.5 w-3.5" />
                          </button>
                        {typeof window !== 'undefined' && openFilter === 'gross' && createPortal(
                          <div 
                            className="fixed w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] p-3 overflow-x-hidden"
                            style={{
                              top: `${dropdownPositions.gross?.top || 0}px`,
                              left: dropdownPositions.gross?.left !== undefined ? `${dropdownPositions.gross.left}px` : 'auto',
                              right: dropdownPositions.gross?.right !== undefined ? `${dropdownPositions.gross.right}px` : 'auto'
                            }}
                          >
                            <div className="space-y-3">
                              <Label className="text-xs font-semibold text-gray-700">Filter by Gross</Label>
                              <div className="flex gap-2">
                                <div className="flex-1 space-y-1.5 min-w-0">
                                  <Label className="text-xs text-gray-600 font-medium">Min</Label>
                                  <Input
                                    type="number"
                                    placeholder="Min"
                                    value={earningFilters.grossMin}
                                    onChange={(e) => handleFilterChange('grossMin', e.target.value)}
                                    className="h-9 text-sm w-full"
                                    autoFocus
                                  />
                                </div>
                                <div className="flex-1 space-y-1.5 min-w-0">
                                  <Label className="text-xs text-gray-600 font-medium">Max</Label>
                                  <Input
                                    type="number"
                                    placeholder="Max"
                                    value={earningFilters.grossMax}
                                    onChange={(e) => handleFilterChange('grossMax', e.target.value)}
                                    className="h-9 text-sm w-full"
                                  />
                                </div>
                              </div>
                              {(earningFilters.grossMin || earningFilters.grossMax) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    handleFilterChange('grossMin', '')
                                    handleFilterChange('grossMax', '')
                                    setOpenFilter(null)
                                  }}
                                  className="w-full h-8 text-xs"
                                >
                                  Clear
                                </Button>
                              )}
                            </div>
                          </div>,
                          document.body
                        )}
                        </div>
                      </div>
                    </div>
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider align-middle">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span>Deductions</span>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleSort('deductions')}
                          className={`inline-flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 transition-colors ${sortColumn === 'deductions' ? 'text-blue-600' : 'text-gray-400'}`}
                          title={sortColumn === 'deductions' ? `Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}` : 'Sort by deductions'}
                        >
                          {sortColumn === 'deductions' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <div className="relative filter-dropdown-container inline-flex">
                          <button
                            onClick={(e) => handleFilterClick('deductions', e)}
                            className={`inline-flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 transition-colors ${isFilterActive('deductions') ? 'text-blue-600' : 'text-gray-400'}`}
                            title="Filter by deductions"
                          >
                            <Filter className="h-3.5 w-3.5" />
                          </button>
                        {typeof window !== 'undefined' && openFilter === 'deductions' && createPortal(
                          <div 
                            className="fixed w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] p-3 overflow-x-hidden"
                            style={{
                              top: `${dropdownPositions.deductions?.top || 0}px`,
                              left: dropdownPositions.deductions?.left !== undefined ? `${dropdownPositions.deductions.left}px` : 'auto',
                              right: dropdownPositions.deductions?.right !== undefined ? `${dropdownPositions.deductions.right}px` : 'auto'
                            }}
                          >
                            <div className="space-y-3">
                              <Label className="text-xs font-semibold text-gray-700">Filter by Deductions</Label>
                              <div className="flex gap-2">
                                <div className="flex-1 space-y-1.5 min-w-0">
                                  <Label className="text-xs text-gray-600 font-medium">Min</Label>
                                  <Input
                                    type="number"
                                    placeholder="Min"
                                    value={earningFilters.deductionsMin}
                                    onChange={(e) => handleFilterChange('deductionsMin', e.target.value)}
                                    className="h-9 text-sm w-full"
                                    autoFocus
                                  />
                                </div>
                                <div className="flex-1 space-y-1.5 min-w-0">
                                  <Label className="text-xs text-gray-600 font-medium">Max</Label>
                                  <Input
                                    type="number"
                                    placeholder="Max"
                                    value={earningFilters.deductionsMax}
                                    onChange={(e) => handleFilterChange('deductionsMax', e.target.value)}
                                    className="h-9 text-sm w-full"
                                  />
                                </div>
                              </div>
                              {(earningFilters.deductionsMin || earningFilters.deductionsMax) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    handleFilterChange('deductionsMin', '')
                                    handleFilterChange('deductionsMax', '')
                                    setOpenFilter(null)
                                  }}
                                  className="w-full h-8 text-xs"
                                >
                                  Clear
                                </Button>
                              )}
                            </div>
                          </div>,
                          document.body
                        )}
                        </div>
                      </div>
                    </div>
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider align-middle">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span>Taxes</span>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleSort('taxes')}
                          className={`inline-flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 transition-colors ${sortColumn === 'taxes' ? 'text-blue-600' : 'text-gray-400'}`}
                          title={sortColumn === 'taxes' ? `Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}` : 'Sort by taxes'}
                        >
                          {sortColumn === 'taxes' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <div className="relative filter-dropdown-container inline-flex">
                          <button
                            onClick={(e) => handleFilterClick('taxes', e)}
                            className={`inline-flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 transition-colors ${isFilterActive('taxes') ? 'text-blue-600' : 'text-gray-400'}`}
                            title="Filter by taxes"
                          >
                            <Filter className="h-3.5 w-3.5" />
                          </button>
                        {typeof window !== 'undefined' && openFilter === 'taxes' && createPortal(
                          <div 
                            className="fixed w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] p-3 overflow-x-hidden"
                            style={{
                              top: `${dropdownPositions.taxes?.top || 0}px`,
                              left: dropdownPositions.taxes?.left !== undefined ? `${dropdownPositions.taxes.left}px` : 'auto',
                              right: dropdownPositions.taxes?.right !== undefined ? `${dropdownPositions.taxes.right}px` : 'auto'
                            }}
                          >
                            <div className="space-y-3">
                              <Label className="text-xs font-semibold text-gray-700">Filter by Taxes</Label>
                              <div className="flex gap-2">
                                <div className="flex-1 space-y-1.5 min-w-0">
                                  <Label className="text-xs text-gray-600 font-medium">Min</Label>
                                  <Input
                                    type="number"
                                    placeholder="Min"
                                    value={earningFilters.taxesMin}
                                    onChange={(e) => handleFilterChange('taxesMin', e.target.value)}
                                    className="h-9 text-sm w-full"
                                    autoFocus
                                  />
                                </div>
                                <div className="flex-1 space-y-1.5 min-w-0">
                                  <Label className="text-xs text-gray-600 font-medium">Max</Label>
                                  <Input
                                    type="number"
                                    placeholder="Max"
                                    value={earningFilters.taxesMax}
                                    onChange={(e) => handleFilterChange('taxesMax', e.target.value)}
                                    className="h-9 text-sm w-full"
                                  />
                                </div>
                              </div>
                              {(earningFilters.taxesMin || earningFilters.taxesMax) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    handleFilterChange('taxesMin', '')
                                    handleFilterChange('taxesMax', '')
                                    setOpenFilter(null)
                                  }}
                                  className="w-full h-8 text-xs"
                                >
                                  Clear
                                </Button>
                              )}
                            </div>
                          </div>,
                          document.body
                        )}
                        </div>
                      </div>
                    </div>
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider align-middle">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span>Net</span>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleSort('net')}
                          className={`inline-flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 transition-colors ${sortColumn === 'net' ? 'text-blue-600' : 'text-gray-400'}`}
                          title={sortColumn === 'net' ? `Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}` : 'Sort by net amount'}
                        >
                          {sortColumn === 'net' ? (
                            sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <div className="relative filter-dropdown-container inline-flex">
                          <button
                            onClick={(e) => handleFilterClick('net', e)}
                            className={`inline-flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 transition-colors ${isFilterActive('net') ? 'text-blue-600' : 'text-gray-400'}`}
                            title="Filter by net amount"
                          >
                            <Filter className="h-3.5 w-3.5" />
                          </button>
                        {typeof window !== 'undefined' && openFilter === 'net' && createPortal(
                          <div 
                            className="fixed w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] p-3 overflow-x-hidden"
                            style={{
                              top: `${dropdownPositions.net?.top || 0}px`,
                              left: dropdownPositions.net?.left !== undefined ? `${dropdownPositions.net.left}px` : 'auto',
                              right: dropdownPositions.net?.right !== undefined ? `${dropdownPositions.net.right}px` : 'auto'
                            }}
                          >
                            <div className="space-y-3">
                              <Label className="text-xs font-semibold text-gray-700">Filter by Net</Label>
                              <div className="flex gap-2">
                                <div className="flex-1 space-y-1.5 min-w-0">
                                  <Label className="text-xs text-gray-600 font-medium">Min</Label>
                                  <Input
                                    type="number"
                                    placeholder="Min"
                                    value={earningFilters.netMin}
                                    onChange={(e) => handleFilterChange('netMin', e.target.value)}
                                    className="h-9 text-sm w-full"
                                    autoFocus
                                  />
                                </div>
                                <div className="flex-1 space-y-1.5 min-w-0">
                                  <Label className="text-xs text-gray-600 font-medium">Max</Label>
                                  <Input
                                    type="number"
                                    placeholder="Max"
                                    value={earningFilters.netMax}
                                    onChange={(e) => handleFilterChange('netMax', e.target.value)}
                                    className="h-9 text-sm w-full"
                                  />
                                </div>
                              </div>
                              {(earningFilters.netMin || earningFilters.netMax) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    handleFilterChange('netMin', '')
                                    handleFilterChange('netMax', '')
                                    setOpenFilter(null)
                                  }}
                                  className="w-full h-8 text-xs"
                                >
                                  Clear
                                </Button>
                              )}
                            </div>
                          </div>,
                          document.body
                        )}
                        </div>
                      </div>
                    </div>
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider align-middle">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEarningStatements.map((statement) => (
                  <tr 
                    key={statement.id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6 text-sm text-gray-900 align-middle">
                      {statement.employeeName}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 align-middle">
                      {formatDateToMMDDYYYY(statement.date)}
                    </td>
                    <td className="py-4 px-6 text-sm text-right text-gray-900 font-medium align-middle tabular-nums">
                      {formatCurrency(statement.gross)}
                    </td>
                    <td className="py-4 px-6 text-sm text-right text-gray-900 align-middle tabular-nums">
                      {formatCurrency(statement.deductions)}
                    </td>
                    <td className="py-4 px-6 text-sm text-right text-gray-900 align-middle tabular-nums">
                      {formatCurrency(statement.taxes)}
                    </td>
                    <td className="py-4 px-6 text-sm text-right text-gray-900 font-semibold align-middle tabular-nums">
                      {formatCurrency(statement.net)}
                    </td>
                    <td className="py-4 px-6 text-center align-middle">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(statement)}
                        className="inline-flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">PDF</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEarningStatements.length === 0 && (
            <div className="text-center py-12">
              <ReceiptIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">
                {earningStatements.length === 0 
                  ? 'No earning statements found' 
                  : 'No earning statements match your filters'}
              </p>
            </div>
          )}

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

  // Handle W-2 PDF download
  const handleDownloadW2 = (statement) => {
    // TODO: Implement W-2 PDF download functionality
    console.log('Downloading W-2 PDF for statement:', statement)
    alert(`Downloading W-2 PDF for ${statement.company} - ${statement.year}`)
  }
  
  // Handle W-2c PDF download
  const handleDownloadW2c = (statement) => {
    // TODO: Implement W-2c PDF download functionality
    console.log('Downloading W-2c PDF for statement:', statement)
    alert(`Downloading W-2c PDF for ${statement.company} - ${statement.year}`)
  }
  
  // Render W-2 Register table
  const renderW2Register = () => (
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
        <h2 className="text-2xl font-semibold text-gray-900">W-2 Register</h2>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>W-2 Forms</CardTitle>
              <CardDescription>View and download your W-2 and W-2c forms</CardDescription>
            </div>
            {hasActiveW2Filters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearW2Filters}
                className="text-sm"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider align-middle">
                    <div className="flex items-center gap-1.5">
                      <span>Company</span>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleW2Sort('company')}
                          className={`inline-flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 transition-colors ${w2SortColumn === 'company' ? 'text-blue-600' : 'text-gray-400'}`}
                          title={w2SortColumn === 'company' ? `Sort ${w2SortDirection === 'asc' ? 'descending' : 'ascending'}` : 'Sort by company'}
                        >
                          {w2SortColumn === 'company' ? (
                            w2SortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <div className="relative filter-dropdown-container inline-flex">
                          <button
                            onClick={(e) => handleW2FilterClick('w2Company', e)}
                            className={`inline-flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 transition-colors ${isW2FilterActive('company') ? 'text-blue-600' : 'text-gray-400'}`}
                            title="Filter by company"
                          >
                            <Filter className="h-3.5 w-3.5" />
                          </button>
                        {typeof window !== 'undefined' && openFilter === 'w2Company' && createPortal(
                          <div 
                            className="fixed w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] p-3"
                            style={{
                              top: `${dropdownPositions.w2Company?.top || 0}px`,
                              left: dropdownPositions.w2Company?.left !== undefined ? `${dropdownPositions.w2Company.left}px` : 'auto',
                              right: dropdownPositions.w2Company?.right !== undefined ? `${dropdownPositions.w2Company.right}px` : 'auto'
                            }}
                          >
                            <div className="space-y-3">
                              <Label className="text-xs font-semibold text-gray-700">Filter by Company</Label>
                              <Input
                                type="text"
                                placeholder="Search company..."
                                value={w2Filters.company}
                                onChange={(e) => handleW2FilterChange('company', e.target.value)}
                                className="h-9 text-sm w-full"
                                autoFocus
                              />
                              {w2Filters.company && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    handleW2FilterChange('company', '')
                                    setOpenFilter(null)
                                  }}
                                  className="w-full h-8 text-xs"
                                >
                                  Clear
                                </Button>
                              )}
                            </div>
                          </div>,
                          document.body
                        )}
                        </div>
                      </div>
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider align-middle">
                    <div className="flex items-center gap-1.5">
                      <span>Employee</span>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleW2Sort('employee')}
                          className={`inline-flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 transition-colors ${w2SortColumn === 'employee' ? 'text-blue-600' : 'text-gray-400'}`}
                          title={w2SortColumn === 'employee' ? `Sort ${w2SortDirection === 'asc' ? 'descending' : 'ascending'}` : 'Sort by employee'}
                        >
                          {w2SortColumn === 'employee' ? (
                            w2SortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <div className="relative filter-dropdown-container inline-flex">
                          <button
                            onClick={(e) => handleW2FilterClick('w2Employee', e)}
                            className={`inline-flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 transition-colors ${isW2FilterActive('employee') ? 'text-blue-600' : 'text-gray-400'}`}
                            title="Filter by employee"
                          >
                            <Filter className="h-3.5 w-3.5" />
                          </button>
                        {typeof window !== 'undefined' && openFilter === 'w2Employee' && createPortal(
                          <div 
                            className="fixed w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] p-3"
                            style={{
                              top: `${dropdownPositions.w2Employee?.top || 0}px`,
                              left: dropdownPositions.w2Employee?.left !== undefined ? `${dropdownPositions.w2Employee.left}px` : 'auto',
                              right: dropdownPositions.w2Employee?.right !== undefined ? `${dropdownPositions.w2Employee.right}px` : 'auto'
                            }}
                          >
                            <div className="space-y-3">
                              <Label className="text-xs font-semibold text-gray-700">Filter by Employee</Label>
                              <Input
                                type="text"
                                placeholder="Search employee..."
                                value={w2Filters.employee}
                                onChange={(e) => handleW2FilterChange('employee', e.target.value)}
                                className="h-9 text-sm w-full"
                                autoFocus
                              />
                              {w2Filters.employee && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    handleW2FilterChange('employee', '')
                                    setOpenFilter(null)
                                  }}
                                  className="w-full h-8 text-xs"
                                >
                                  Clear
                                </Button>
                              )}
                            </div>
                          </div>,
                          document.body
                        )}
                        </div>
                      </div>
                    </div>
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider align-middle">
                    <div className="flex items-center gap-1.5 justify-center">
                      <span>Year</span>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleW2Sort('year')}
                          className={`inline-flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 transition-colors ${w2SortColumn === 'year' ? 'text-blue-600' : 'text-gray-400'}`}
                          title={w2SortColumn === 'year' ? `Sort ${w2SortDirection === 'asc' ? 'descending' : 'ascending'}` : 'Sort by year'}
                        >
                          {w2SortColumn === 'year' ? (
                            w2SortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <div className="relative filter-dropdown-container inline-flex">
                          <button
                            onClick={(e) => handleW2FilterClick('w2Year', e)}
                            className={`inline-flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 transition-colors ${isW2FilterActive('year') ? 'text-blue-600' : 'text-gray-400'}`}
                            title="Filter by year"
                          >
                            <Filter className="h-3.5 w-3.5" />
                          </button>
                        {typeof window !== 'undefined' && openFilter === 'w2Year' && createPortal(
                          <div 
                            className="fixed w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] p-3 overflow-x-hidden"
                            style={{
                              top: `${dropdownPositions.w2Year?.top || 0}px`,
                              left: dropdownPositions.w2Year?.left !== undefined ? `${dropdownPositions.w2Year.left}px` : 'auto',
                              right: dropdownPositions.w2Year?.right !== undefined ? `${dropdownPositions.w2Year.right}px` : 'auto'
                            }}
                          >
                            <div className="space-y-3">
                              <Label className="text-xs font-semibold text-gray-700">Filter by Year</Label>
                              <div className="flex gap-2">
                                <div className="flex-1 space-y-1.5 min-w-0">
                                  <Label className="text-xs text-gray-600 font-medium">Min</Label>
                                  <Input
                                    type="number"
                                    placeholder="Min Year"
                                    value={w2Filters.yearMin}
                                    onChange={(e) => handleW2FilterChange('yearMin', e.target.value)}
                                    className="h-9 text-sm w-full"
                                    autoFocus
                                  />
                                </div>
                                <div className="flex-1 space-y-1.5 min-w-0">
                                  <Label className="text-xs text-gray-600 font-medium">Max</Label>
                                  <Input
                                    type="number"
                                    placeholder="Max Year"
                                    value={w2Filters.yearMax}
                                    onChange={(e) => handleW2FilterChange('yearMax', e.target.value)}
                                    className="h-9 text-sm w-full"
                                  />
                                </div>
                              </div>
                              {(w2Filters.yearMin || w2Filters.yearMax) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    handleW2FilterChange('yearMin', '')
                                    handleW2FilterChange('yearMax', '')
                                    setOpenFilter(null)
                                  }}
                                  className="w-full h-8 text-xs"
                                >
                                  Clear
                                </Button>
                              )}
                            </div>
                          </div>,
                          document.body
                        )}
                        </div>
                      </div>
                    </div>
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider align-middle">
                    W-2
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider align-middle">
                    W-2c
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredW2Statements.map((statement) => (
                  <tr 
                    key={statement.id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6 text-sm text-gray-900 align-middle">
                      {statement.company}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 align-middle">
                      {statement.employee}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 align-middle text-center tabular-nums">
                      {statement.year}
                    </td>
                    <td className="py-4 px-6 text-center align-middle">
                      {statement.hasW2 ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadW2(statement)}
                          className="inline-flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          <span className="hidden sm:inline">PDF</span>
                        </Button>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center align-middle">
                      {statement.hasW2c ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadW2c(statement)}
                          className="inline-flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          <span className="hidden sm:inline">PDF</span>
                        </Button>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredW2Statements.length === 0 && (
            <div className="text-center py-12">
              <Description className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">
                {w2Statements.length === 0 
                  ? 'No W-2 forms found' 
                  : 'No W-2 forms match your filters'}
              </p>
            </div>
          )}

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

  // Render Emergency Contact form
  const renderEmergencyContactForm = () => (
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
        <h2 className="text-2xl font-semibold text-gray-900">Emergency Contact</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact Information</CardTitle>
          <CardDescription>View your emergency contact details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact">Contact</Label>
              <Input
                id="contact"
                value={emergencyContact.contact}
                onChange={(e) => setEmergencyContact({...emergencyContact, contact: e.target.value})}
                placeholder="Enter contact name"
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                value={emergencyContact.relationship}
                onChange={(e) => setEmergencyContact({...emergencyContact, relationship: e.target.value})}
                placeholder="Enter relationship"
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={emergencyContact.phoneNumber}
                onChange={(e) => setEmergencyContact({...emergencyContact, phoneNumber: e.target.value})}
                placeholder="Enter phone number"
                disabled
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

  // Helper function to format date to MM-dd-yyyy
  const formatDateToMMDDYYYY = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

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
                type="text"
                value={formatDateToMMDDYYYY(jobStatus.clientHireDate)}
                placeholder="MM-dd-yyyy"
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyHireDate">Company Hire Date</Label>
              <Input
                id="companyHireDate"
                type="text"
                value={formatDateToMMDDYYYY(jobStatus.companyHireDate)}
                placeholder="MM-dd-yyyy"
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="terminationDate">Termination Date</Label>
              <Input
                id="terminationDate"
                type="text"
                value={formatDateToMMDDYYYY(jobStatus.terminationDate)}
                placeholder="MM-dd-yyyy"
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="anniversaryDate">Anniversary Date</Label>
              <Input
                id="anniversaryDate"
                type="text"
                value={formatDateToMMDDYYYY(jobStatus.anniversaryDate)}
                placeholder="MM-dd-yyyy"
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewDate">Review Date</Label>
              <Input
                id="reviewDate"
                type="text"
                value={formatDateToMMDDYYYY(jobStatus.reviewDate)}
                placeholder="MM-dd-yyyy"
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

    if (activeSection === 'personal-info') {
      return (
        <Layout userRole={currentUser.role} userName={currentUser.name}>
          <div className="p-6">
            {renderPersonalInfoForm()}
          </div>
        </Layout>
      )
    }

    if (activeSection === 'paid-leave') {
      return (
        <Layout userRole={currentUser.role} userName={currentUser.name}>
          <div className="p-6">
            {renderPaidLeaveForm()}
          </div>
        </Layout>
      )
    }

    if (activeSection === 'emergency-contact') {
      return (
        <Layout userRole={currentUser.role} userName={currentUser.name}>
          <div className="p-6">
            {renderEmergencyContactForm()}
          </div>
        </Layout>
      )
    }

    if (activeSection === 'earning-statement') {
      return (
        <Layout userRole={currentUser.role} userName={currentUser.name}>
          <div className="p-6">
            {renderEarningStatement()}
          </div>
        </Layout>
      )
    }

    if (activeSection === 'w2-register') {
      return (
        <Layout userRole={currentUser.role} userName={currentUser.name}>
          <div className="p-6">
            {renderW2Register()}
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
                              } else if (tab.id === 'personal-info') {
                                setActiveSection('personal-info')
                              } else if (tab.id === 'paid-leave') {
                                setActiveSection('paid-leave')
                              } else if (tab.id === 'emergency-contact') {
                                setActiveSection('emergency-contact')
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
                    className={`cursor-pointer hover:shadow-md transition-all ${
                      activeSection === tab.id
                        ? 'border-2 border-blue-500 bg-blue-50'
                        : ''
                    }`}
                    onClick={() => {
                      if (tab.id === 'earning-statement') {
                        setActiveSection('earning-statement')
                      } else if (tab.id === 'w2-register') {
                        setActiveSection('w2-register')
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
