'use client'

import { useMemo, useState, useEffect, useRef, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/contexts/UserContext'
import { ArrowLeft, Save, Download, X, Filter, ChevronDown, ArrowUp, ArrowDown, ArrowUpDown, TrendingUp, TrendingDown, Calendar, Clock, Target, FolderOpen, Send, CheckCircle, XCircle, Play, Square, Plus, Trash2, Edit, FileText, RotateCcw, ChevronLeft, ChevronRight, AlertCircle, AlertTriangle, ThumbsUp, ThumbsDown, MessageSquare, Printer } from 'lucide-react'
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
import ScheduleIcon from '@mui/icons-material/Schedule'
import TimeEntryGrid from '@/components/timesheet/TimeEntryGrid'
import TimesheetSummary from '@/components/timesheet/TimesheetSummary'
import ProjectOverview from '@/components/timesheet/ProjectOverview'
import { 
  getCycleStartDate, 
  getCycleEndDate, 
  getCycleDates, 
  getGridDates,
  formatCyclePeriod, 
  getCycleTitle,
  getNextCycle,
  getPreviousCycle
} from '@/lib/cycleUtils'

function MyStuffContent() {
  const { user: currentUser } = useUser()
  const searchParams = useSearchParams()
  const [activeSection, setActiveSection] = useState(null)
  const hasInitializedSectionRef = useRef(false)
  
  // Initialize section from URL once
  useEffect(() => {
    if (hasInitializedSectionRef.current) return
    const section = searchParams.get('section')
    if (section && currentUser.role === 'Employee') {
      setActiveSection(section)
    }
    hasInitializedSectionRef.current = true
  }, [searchParams, currentUser.role])

  // Listen for sidebar-driven section changes without navigation
  useEffect(() => {
    const handler = (e) => {
      const sectionId = e?.detail
      // Allow null to clear the section and show main menu
      if (sectionId === null || sectionId === undefined) {
        setActiveSection(null)
        return
      }
      setActiveSection(sectionId)
      try {
        const params = new URLSearchParams(window.location.search)
        params.set('section', sectionId)
        const url = `/my-stuff?${params.toString()}`
        window.history.replaceState(window.history.state, '', url)
      } catch {}
    }
    window.addEventListener('app:set-my-stuff-section', handler)
    return () => window.removeEventListener('app:set-my-stuff-section', handler)
  }, [])

  // Update activeSection when URL search params change (including when section is removed)
  useEffect(() => {
    const section = searchParams.get('section')
    if (section && currentUser.role === 'Employee') {
      setActiveSection(section)
    } else if (!section) {
      // Clear section when no section parameter in URL
      setActiveSection(null)
    }
  }, [searchParams, currentUser.role])

  // Helper function to navigate to a section (updates both state and URL)
  const navigateToSection = (sectionId) => {
    setActiveSection(sectionId)
    try {
      const params = new URLSearchParams(window.location.search)
      params.set('section', sectionId)
      const url = `/my-stuff?${params.toString()}`
      window.history.pushState(window.history.state, '', url)
    } catch {}
  }
  
  // Basic Information form state
  const [basicInfo, setBasicInfo] = useState({
    company: 'Acme Corporation',
    firstName: 'John',
    lastName: 'Doe',
    address1: '123 Main Street',
    address2: 'Suite 100',
    city: 'Birmingham',
    state: 'Alabama',
    zipcode: '35201',
    homePhone: '(205) 555-0123',
    workPhone: '(205) 555-0124',
    workEmail: 'john.doe@acmecorp.com'
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
  
  // Tax Settings state
  const [taxSettings, setTaxSettings] = useState({
    federal: {
      exemptions: '2',
      extraWithholding: '0.00'
    },
    workState: {
      state: 'California',
      exemptions: '1',
      extraWithholding: '50.00',
      status: 'Married'
    },
    residentState: {
      state: 'California',
      exemptions: '2',
      extraWithholding: '0.00',
      status: 'Married',
      reciprocityMethod: 'Standard'
    }
  })
  
  // Year to Date Information state
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  
  // Online Timecard state
  const [gridRows, setGridRows] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [validationTrigger, setValidationTrigger] = useState(0)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [employeeEmail, setEmployeeEmail] = useState('')
  const [entries, setEntries] = useState([])
  const [projects, setProjects] = useState([])
  const [companies, setCompanies] = useState([])
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [trackingState, setTrackingState] = useState({ isTracking: false, startTime: null })
  const [currentTimesheet, setCurrentTimesheet] = useState(null)
  
  // Initialize sample data for timesheet components
  useEffect(() => {
    // Sample projects data
    setProjects([
      { id: 1, name: 'Project Alpha', department: 'Engineering', account: 'R&D', code: 'ALPHA' },
      { id: 2, name: 'Project Beta', department: 'Marketing', account: 'MKT', code: 'BETA' },
      { id: 3, name: 'Project Gamma', department: 'Sales', account: 'SALES', code: 'GAMMA' }
    ])
    
    // Sample companies data
    setCompanies([
      { id: 1, name: 'Acme Corporation', timesheetCycle: 'weekly' },
      { id: 2, name: 'TechFlow Systems', timesheetCycle: 'bi-weekly' }
    ])
    
    // Set default selected company
    setSelectedCompany({ id: 1, name: 'Acme Corporation', timesheetCycle: 'weekly' })
    
    // Sample entries data
    setEntries([
      { id: 1, date: '2024-12-16', duration: 480, department: 'Engineering', account: 'R&D', code: 'ALPHA' },
      { id: 2, date: '2024-12-17', duration: 420, department: 'Marketing', account: 'MKT', code: 'BETA' }
    ])
  }, [])
  const [ytdInfo, setYtdInfo] = useState({
    earnings: {
      regular: 45000.00,
      extraMoney: 3500.00,
      total: 48500.00
    },
    deductions: {
      directDeposit: 36000.00,
      eeInsPreTax: 2400.00,
      total: 38400.00
    },
    taxes: {
      alabama: 2250.00,
      federal: 7250.00,
      ficaOasdi: 3006.00,
      ficaMedicare: 703.25,
      total: 13209.25
    }
  })
  
  // Generate list of years (current year and 9 previous years)
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let i = 0; i < 10; i++) {
      years.push((currentYear - i).toString())
    }
    return years
  }, [])
  
  // Direct Deposit state
  const [directDeposits, setDirectDeposits] = useState([
    {
      id: 1,
      routingNumber: '123456789',
      account: '********1234',
      checkingSavings: 'Checking',
      amount: '500.00',
      amountPercent: 'Percent',
      code: 'A'
    },
    {
      id: 2,
      routingNumber: '987654321',
      account: '********5678',
      checkingSavings: 'Savings',
      amount: '300.00',
      amountPercent: 'Amount',
      code: 'B'
    },
    {
      id: 3,
      routingNumber: '',
      account: '',
      checkingSavings: '',
      amount: '',
      amountPercent: '',
      code: ''
    },
    {
      id: 4,
      routingNumber: '',
      account: '',
      checkingSavings: '',
      amount: '',
      amountPercent: '',
      code: ''
    },
    {
      id: 5,
      routingNumber: '',
      account: '',
      checkingSavings: '',
      amount: '',
      amountPercent: '',
      code: ''
    }
  ])

  // Direct Deposit management state
  const [showRemoveWarning, setShowRemoveWarning] = useState(false)
  const [depositToRemove, setDepositToRemove] = useState(null)
  const [nextDepositId, setNextDepositId] = useState(6)

  // Add new direct deposit
  const addDirectDeposit = () => {
    const newDeposit = {
      id: nextDepositId,
      routingNumber: '',
      account: '',
      checkingSavings: '',
      amount: '',
      amountPercent: '',
      code: ''
    }
    setDirectDeposits([...directDeposits, newDeposit])
    setNextDepositId(nextDepositId + 1)
  }

  // Remove direct deposit with warning
  const handleRemoveDeposit = (depositId) => {
    setDepositToRemove(depositId)
    setShowRemoveWarning(true)
    setEmployeeEmail('')
  }

  // Confirm removal after email verification
  const confirmRemoveDeposit = () => {
    if (employeeEmail.trim()) {
      setDirectDeposits(directDeposits.filter(deposit => deposit.id !== depositToRemove))
      setShowRemoveWarning(false)
      setDepositToRemove(null)
      setEmployeeEmail('')
    }
  }

  // Cancel removal
  const cancelRemoveDeposit = () => {
    setShowRemoveWarning(false)
    setDepositToRemove(null)
    setEmployeeEmail('')
  }

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
                placeholder="mm-dd-yyyy"
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>
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

  // Column visibility for Earning Statements
  const [earningVisibleCols, setEarningVisibleCols] = useState({
    date: true,
    gross: true,
    deductions: true,
    taxes: true,
    net: true,
  })
  const [showColumnMenu, setShowColumnMenu] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('earningVisibleCols')
      if (saved) {
        const parsed = JSON.parse(saved)
        setEarningVisibleCols(prev => ({ ...prev, ...parsed }))
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('earningVisibleCols', JSON.stringify(earningVisibleCols))
    } catch {}
  }, [earningVisibleCols])

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
  const hasActiveFilters = earningFilters.date || 
    earningFilters.grossMin || earningFilters.grossMax ||
    earningFilters.deductionsMin || earningFilters.deductionsMax ||
    earningFilters.taxesMin || earningFilters.taxesMax ||
    earningFilters.netMin || earningFilters.netMax
  
  // Check if a specific filter is active for Earning Statements
  const isFilterActive = (filterKey) => {
    switch (filterKey) {
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
  const hasActiveW2Filters = w2Filters.company || 
    w2Filters.yearMin || w2Filters.yearMax
  
  // Check if a specific filter is active for W-2 Register
  const isW2FilterActive = (filterKey) => {
    switch (filterKey) {
      case 'company':
        return !!w2Filters.company
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

  // W-2 column visibility state
  const [w2VisibleCols, setW2VisibleCols] = useState({
    company: true,
    year: true,
    w2: true,
    w2c: true,
  })
  const [showW2ColumnMenu, setShowW2ColumnMenu] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('w2VisibleCols')
      if (saved) setW2VisibleCols(prev => ({ ...prev, ...JSON.parse(saved) }))
    } catch {}
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('w2VisibleCols', JSON.stringify(w2VisibleCols))
    } catch {}
  }, [w2VisibleCols])
  
  // Clear W-2 filters
  const clearW2Filters = () => {
    setW2Filters({
      company: '',
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
      if (showColumnMenu && !event.target.closest('.columns-menu-container')) {
        setShowColumnMenu(false)
      }
      if (showW2ColumnMenu && !event.target.closest('.w2-columns-menu-container')) {
        setShowW2ColumnMenu(false)
      }
    }
    if (openFilter) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
    // Always listen when column menu is open
    if (showColumnMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
    if (showW2ColumnMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openFilter, showColumnMenu, showW2ColumnMenu])

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
          <div className="flex items-center justify-between relative">
            <div>
              <div className="flex items-center gap-4">
                <CardTitle>Earning Statements</CardTitle>
                <div className="flex items-center gap-2 text-gray-600">
                  <PersonIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">John Doe</span>
                </div>
              </div>
              <CardDescription>View and download your earning statements</CardDescription>
            </div>
            <div className="flex items-center gap-2">
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
              <div className="relative columns-menu-container">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowColumnMenu(prev => !prev)}
                  className="text-sm"
                >
                  Columns
                </Button>
                {showColumnMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
                    <div className="text-xs font-semibold text-gray-700 mb-2">Show Columns</div>
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={earningVisibleCols.date}
                          onChange={(e) => setEarningVisibleCols(v => ({ ...v, date: e.target.checked }))}
                        />
                        <span>Date</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={earningVisibleCols.gross}
                          onChange={(e) => setEarningVisibleCols(v => ({ ...v, gross: e.target.checked }))}
                        />
                        <span>Gross</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={earningVisibleCols.deductions}
                          onChange={(e) => setEarningVisibleCols(v => ({ ...v, deductions: e.target.checked }))}
                        />
                        <span>Deductions</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={earningVisibleCols.taxes}
                          onChange={(e) => setEarningVisibleCols(v => ({ ...v, taxes: e.target.checked }))}
                        />
                        <span>Taxes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={earningVisibleCols.net}
                          onChange={(e) => setEarningVisibleCols(v => ({ ...v, net: e.target.checked }))}
                        />
                        <span>Net</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  {earningVisibleCols.date && (
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
                  )}
                  {earningVisibleCols.gross && (
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
                  )}
                  {earningVisibleCols.deductions && (
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
                  )}
                  {earningVisibleCols.taxes && (
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
                  )}
                  {earningVisibleCols.net && (
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
                  )}
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
                    {earningVisibleCols.date && (
                    <td className="py-4 px-6 text-sm text-gray-900 align-middle">
                      {formatDateToMMDDYYYY(statement.date)}
                    </td>
                    )}
                    {earningVisibleCols.gross && (
                    <td className="py-4 px-6 text-sm text-right text-gray-900 font-medium align-middle tabular-nums">
                      {formatCurrency(statement.gross)}
                    </td>
                    )}
                    {earningVisibleCols.deductions && (
                    <td className="py-4 px-6 text-sm text-right text-gray-900 align-middle tabular-nums">
                      {formatCurrency(statement.deductions)}
                    </td>
                    )}
                    {earningVisibleCols.taxes && (
                    <td className="py-4 px-6 text-sm text-right text-gray-900 align-middle tabular-nums">
                      {formatCurrency(statement.taxes)}
                    </td>
                    )}
                    {earningVisibleCols.net && (
                    <td className="py-4 px-6 text-sm text-right text-gray-900 font-semibold align-middle tabular-nums">
                      {formatCurrency(statement.net)}
                    </td>
                    )}
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
          <div className="flex items-center justify-between relative">
            <div>
              <div className="flex items-center gap-4">
                <CardTitle>W-2 Forms</CardTitle>
                <div className="flex items-center gap-2 text-gray-600">
                  <PersonIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">John Doe</span>
                </div>
              </div>
              <CardDescription>View and download your W-2 and W-2c forms</CardDescription>
            </div>
            <div className="flex items-center gap-2">
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
              <div className="relative w2-columns-menu-container">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowW2ColumnMenu(prev => !prev)}
                  className="text-sm"
                >
                  Columns
                </Button>
                {showW2ColumnMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
                    <div className="text-xs font-semibold text-gray-700 mb-2">Show Columns</div>
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={w2VisibleCols.company}
                          onChange={(e) => setW2VisibleCols(v => ({ ...v, company: e.target.checked }))}
                        />
                        <span>Company</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={w2VisibleCols.year}
                          onChange={(e) => setW2VisibleCols(v => ({ ...v, year: e.target.checked }))}
                        />
                        <span>Year</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={w2VisibleCols.w2}
                          onChange={(e) => setW2VisibleCols(v => ({ ...v, w2: e.target.checked }))}
                        />
                        <span>W-2</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={w2VisibleCols.w2c}
                          onChange={(e) => setW2VisibleCols(v => ({ ...v, w2c: e.target.checked }))}
                        />
                        <span>W-2c</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  {w2VisibleCols.company && (
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
                  )}
                  {w2VisibleCols.year && (
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
                  )}
                  {w2VisibleCols.w2 && (
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider align-middle">
                    W-2
                  </th>
                  )}
                  {w2VisibleCols.w2c && (
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700 uppercase tracking-wider align-middle">
                    W-2c
                  </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredW2Statements.map((statement) => (
                  <tr 
                    key={statement.id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {w2VisibleCols.company && (
                    <td className="py-4 px-6 text-sm text-gray-900 align-middle">
                      {statement.company}
                    </td>
                    )}
                    {w2VisibleCols.year && (
                    <td className="py-4 px-6 text-sm text-gray-900 align-middle text-center tabular-nums">
                      {statement.year}
                    </td>
                    )}
                    {w2VisibleCols.w2 && (
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
                    )}
                    {w2VisibleCols.w2c && (
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
                    )}
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

        </CardContent>
      </Card>
    </div>
  )

  // Render Tax Settings form
  const renderTaxSettings = () => (
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
        <h2 className="text-2xl font-semibold text-gray-900">Tax Settings</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tax Withholding Information</CardTitle>
          <CardDescription>View your tax withholding settings and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Federal Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Federal</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="federalExemptions">Exemptions</Label>
                  <Input
                    id="federalExemptions"
                    value={taxSettings.federal.exemptions}
                    onChange={(e) => setTaxSettings({
                      ...taxSettings,
                      federal: { ...taxSettings.federal, exemptions: e.target.value }
                    })}
                    placeholder="Enter exemptions"
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="federalExtraWithholding">Extra Withholding</Label>
                  <Input
                    id="federalExtraWithholding"
                    value={taxSettings.federal.extraWithholding}
                    onChange={(e) => setTaxSettings({
                      ...taxSettings,
                      federal: { ...taxSettings.federal, extraWithholding: e.target.value }
                    })}
                    placeholder="Enter extra withholding"
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Work State Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Work State</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="workState">State</Label>
                  <Input
                    id="workState"
                    value={taxSettings.workState.state}
                    onChange={(e) => setTaxSettings({
                      ...taxSettings,
                      workState: { ...taxSettings.workState, state: e.target.value }
                    })}
                    placeholder="Enter state"
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workStateExemptions">Exemptions</Label>
                  <Input
                    id="workStateExemptions"
                    value={taxSettings.workState.exemptions}
                    onChange={(e) => setTaxSettings({
                      ...taxSettings,
                      workState: { ...taxSettings.workState, exemptions: e.target.value }
                    })}
                    placeholder="Enter exemptions"
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workStateExtraWithholding">Extra Withholding</Label>
                  <Input
                    id="workStateExtraWithholding"
                    value={taxSettings.workState.extraWithholding}
                    onChange={(e) => setTaxSettings({
                      ...taxSettings,
                      workState: { ...taxSettings.workState, extraWithholding: e.target.value }
                    })}
                    placeholder="Enter extra withholding"
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workStateStatus">Status</Label>
                  <Input
                    id="workStateStatus"
                    value={taxSettings.workState.status}
                    onChange={(e) => setTaxSettings({
                      ...taxSettings,
                      workState: { ...taxSettings.workState, status: e.target.value }
                    })}
                    placeholder="Enter status"
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Resident State Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Resident State</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="residentState">State</Label>
                  <Input
                    id="residentState"
                    value={taxSettings.residentState.state}
                    onChange={(e) => setTaxSettings({
                      ...taxSettings,
                      residentState: { ...taxSettings.residentState, state: e.target.value }
                    })}
                    placeholder="Enter state"
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="residentStateExemptions">Exemptions</Label>
                  <Input
                    id="residentStateExemptions"
                    value={taxSettings.residentState.exemptions}
                    onChange={(e) => setTaxSettings({
                      ...taxSettings,
                      residentState: { ...taxSettings.residentState, exemptions: e.target.value }
                    })}
                    placeholder="Enter exemptions"
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="residentStateExtraWithholding">Extra Withholding</Label>
                  <Input
                    id="residentStateExtraWithholding"
                    value={taxSettings.residentState.extraWithholding}
                    onChange={(e) => setTaxSettings({
                      ...taxSettings,
                      residentState: { ...taxSettings.residentState, extraWithholding: e.target.value }
                    })}
                    placeholder="Enter extra withholding"
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="residentStateStatus">Status</Label>
                  <Input
                    id="residentStateStatus"
                    value={taxSettings.residentState.status}
                    onChange={(e) => setTaxSettings({
                      ...taxSettings,
                      residentState: { ...taxSettings.residentState, status: e.target.value }
                    })}
                    placeholder="Enter status"
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reciprocityMethod">Reciprocity Method</Label>
                  <Input
                    id="reciprocityMethod"
                    value={taxSettings.residentState.reciprocityMethod}
                    onChange={(e) => setTaxSettings({
                      ...taxSettings,
                      residentState: { ...taxSettings.residentState, reciprocityMethod: e.target.value }
                    })}
                    placeholder="Enter reciprocity method"
                    disabled
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )

  // Render Direct Deposit form
  const renderDirectDeposit = () => (
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
        <h2 className="text-2xl font-semibold text-gray-900">Direct Deposit</h2>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Direct Deposit Information</CardTitle>
              <CardDescription>View your direct deposit accounts and settings</CardDescription>
            </div>
            {/* Add Direct Deposit button temporarily removed */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {directDeposits.map((deposit, index) => (
              <div key={deposit.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex-1">
                    {index + 1}{index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'} Direct Deposit
                  </h3>
                  {/* Remove button temporarily removed */}
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor={`routingNumber-${deposit.id}`}>Routing Number</Label>
                    <Input
                      id={`routingNumber-${deposit.id}`}
                      value={deposit.routingNumber || ''}
                      onChange={(e) => {
                        const updated = [...directDeposits]
                        const depositIndex = updated.findIndex(d => d.id === deposit.id)
                        updated[depositIndex] = { ...updated[depositIndex], routingNumber: e.target.value }
                        setDirectDeposits(updated)
                      }}
                      placeholder="Enter routing number"
                      disabled
                      className="bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`account-${deposit.id}`}>Account</Label>
                    <Input
                      id={`account-${deposit.id}`}
                      value={deposit.account || ''}
                      onChange={(e) => {
                        const updated = [...directDeposits]
                        const depositIndex = updated.findIndex(d => d.id === deposit.id)
                        updated[depositIndex] = { ...updated[depositIndex], account: e.target.value }
                        setDirectDeposits(updated)
                      }}
                      placeholder="Enter account number"
                      disabled
                      className="bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`checkingSavings-${deposit.id}`}>Checking/Savings</Label>
                    <Input
                      id={`checkingSavings-${deposit.id}`}
                      value={deposit.checkingSavings || ''}
                      onChange={(e) => {
                        const updated = [...directDeposits]
                        const depositIndex = updated.findIndex(d => d.id === deposit.id)
                        updated[depositIndex] = { ...updated[depositIndex], checkingSavings: e.target.value }
                        setDirectDeposits(updated)
                      }}
                      placeholder="Enter checking/savings"
                      disabled
                      className="bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`amount-${deposit.id}`}>Amount</Label>
                    <Input
                      id={`amount-${deposit.id}`}
                      value={deposit.amount || ''}
                      onChange={(e) => {
                        const updated = [...directDeposits]
                        const depositIndex = updated.findIndex(d => d.id === deposit.id)
                        updated[depositIndex] = { ...updated[depositIndex], amount: e.target.value }
                        setDirectDeposits(updated)
                      }}
                      placeholder="Enter amount"
                      disabled
                      className="bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`amountPercent-${deposit.id}`}>Amount/Percent</Label>
                    <Input
                      id={`amountPercent-${deposit.id}`}
                      value={deposit.amountPercent || ''}
                      onChange={(e) => {
                        const updated = [...directDeposits]
                        const depositIndex = updated.findIndex(d => d.id === deposit.id)
                        updated[depositIndex] = { ...updated[depositIndex], amountPercent: e.target.value }
                        setDirectDeposits(updated)
                      }}
                      placeholder="Enter amount/percent"
                      disabled
                      className="bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`code-${deposit.id}`}>Code</Label>
                    <Input
                      id={`code-${deposit.id}`}
                      value={deposit.code || ''}
                      onChange={(e) => {
                        const updated = [...directDeposits]
                        const depositIndex = updated.findIndex(d => d.id === deposit.id)
                        updated[depositIndex] = { ...updated[depositIndex], code: e.target.value }
                        setDirectDeposits(updated)
                      }}
                      placeholder="Enter code"
                      disabled
                      className="bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Remove Warning Modal */}
      {showRemoveWarning && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 w-screen h-screen bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9999]" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Remove Direct Deposit</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove this direct deposit? This action cannot be undone.
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeEmail">Employee Email</Label>
                <Input
                  id="employeeEmail"
                  type="email"
                  value={employeeEmail}
                  onChange={(e) => setEmployeeEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={cancelRemoveDeposit}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmRemoveDeposit}
                  disabled={!employeeEmail.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Remove Direct Deposit
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )

  // Render Year to Date Information
  const renderYearToDateInfo = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setActiveSection(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Year to Date Information</h2>
            <p className="text-sm text-gray-600 mt-1">Financial summary for {selectedYear}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="yearFilter" className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Year:
          </Label>
          <select
            id="yearFilter"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-10 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Earnings Section */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              Earnings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Regular</span>
                <span className="text-sm font-medium text-gray-900 tabular-nums">
                  {formatCurrency(ytdInfo.earnings.regular)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Extra Money</span>
                <span className="text-sm font-medium text-gray-900 tabular-nums">
                  {formatCurrency(ytdInfo.earnings.extraMoney)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200">
                <span className="text-base font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-green-600 tabular-nums">
                  {formatCurrency(ytdInfo.earnings.total)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deductions Section */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-orange-600" />
              </div>
              Deductions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Direct Deposit</span>
                <span className="text-sm font-medium text-gray-900 tabular-nums">
                  {formatCurrency(ytdInfo.deductions.directDeposit)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">EE Ins PreTax</span>
                <span className="text-sm font-medium text-gray-900 tabular-nums">
                  {formatCurrency(ytdInfo.deductions.eeInsPreTax)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200">
                <span className="text-base font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-orange-600 tabular-nums">
                  {formatCurrency(ytdInfo.deductions.total)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Taxes Section */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ReceiptIcon className="h-5 w-5 text-blue-600" />
              </div>
              Taxes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Alabama</span>
                <span className="text-sm font-medium text-gray-900 tabular-nums">
                  {formatCurrency(ytdInfo.taxes.alabama)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Federal</span>
                <span className="text-sm font-medium text-gray-900 tabular-nums">
                  {formatCurrency(ytdInfo.taxes.federal)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">FICA - OASDI</span>
                <span className="text-sm font-medium text-gray-900 tabular-nums">
                  {formatCurrency(ytdInfo.taxes.ficaOasdi)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">FICA - Medicare</span>
                <span className="text-sm font-medium text-gray-900 tabular-nums">
                  {formatCurrency(ytdInfo.taxes.ficaMedicare)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200">
                <span className="text-base font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-blue-600 tabular-nums">
                  {formatCurrency(ytdInfo.taxes.total)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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

        </CardContent>
      </Card>
    </div>
  )

  // Render Online Timecard
  const renderOnlineTimecard = () => (
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
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ScheduleIcon className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Online Timecard</h2>
            <p className="text-sm text-gray-600 mt-1">Track and submit your work hours</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6">
        <TimesheetSummary 
          entries={entries} 
          projects={projects} 
          selectedDate={selectedDate} 
          gridRows={gridRows} 
        />
      </div>

      {/* Main Content with Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-5">
          <Tabs defaultValue="timesheet" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="timesheet" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Time Entry
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Project Overview
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="timesheet" className="space-y-4">
              <TimeEntryGrid
                projects={projects}
                entries={entries}
                gridRows={gridRows}
                onSave={() => {}}
                onUpdate={() => {}}
                onDelete={() => {}}
                onStartTimer={() => {}}
                onStopTimer={() => {}}
                isTracking={trackingState.isTracking}
                currentTime={trackingState.isTracking ? '00:00:00' : '00:00:00'}
                onGridDataChange={setGridRows}
                selectedCompany={selectedCompany}
                timesheet={currentTimesheet}
                onSubmitTimesheet={() => setShowSubmitModal(true)}
                onApproveTimesheet={() => {}}
                onRejectTimesheet={() => {}}
                validationTrigger={validationTrigger}
                userRole="employee"
              />
            </TabsContent>
            
            <TabsContent value="projects" className="space-y-4">
              <ProjectOverview
                gridRows={gridRows}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Send className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Submit Timecard</h3>
                  <p className="text-sm text-gray-600">Enter your email to submit</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-700 italic">
                    "I hereby attest that the amounts reported on this timecard are true and correct to the best of my knowledge."
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee-email" className="text-sm font-medium text-gray-700">
                    Employee Email
                  </Label>
                  <Input
                    id="employee-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={employeeEmail}
                    onChange={(e) => setEmployeeEmail(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="p-1 bg-amber-100 rounded-full">
                    <CheckCircle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-800">Ready to Submit?</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Your timecard will be submitted for review. It cannot be edited after submission.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              <Button
                onClick={() => setShowSubmitModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  alert('Timecard submitted successfully!')
                  setShowSubmitModal(false)
                  setEmployeeEmail('')
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!employeeEmail.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Timecard
              </Button>
            </div>
          </div>
        </div>
      )}
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
                placeholder="mm-dd-yyyy"
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
                placeholder="mm-dd-yyyy"
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
                placeholder="mm-dd-yyyy"
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
                placeholder="mm-dd-yyyy"
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
                placeholder="mm-dd-yyyy"
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

        </CardContent>
      </Card>
    </div>
  )

  // Render Basic Information form
  const renderBasicInfoForm = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
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
        <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="p-1.5 bg-blue-100 rounded-md">
            <WorkIcon className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xs font-medium text-blue-700 uppercase tracking-wide">Company Name</div>
            <div className="text-sm font-semibold text-gray-900">{basicInfo.company || 'Not specified'}</div>
          </div>
        </div>
      </div>

      {/* Personal Details */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
          <CardDescription>Your personal information and contact details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Name Section */}
            <div className="grid gap-6 md:grid-cols-2">
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
            </div>

            {/* Contact Information */}
            <div className="grid gap-6 md:grid-cols-2">
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

            {/* Work Email */}
            <div className="grid gap-6 md:grid-cols-2">
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
              <div></div> {/* Empty div for alignment */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
          <CardDescription>Your residential address details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Address Lines */}
            <div className="space-y-4">
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
            </div>

            {/* City, State, Zip */}
            <div className="grid gap-6 md:grid-cols-3">
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
            </div>
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

    if (activeSection === 'tax-settings') {
      return (
        <Layout userRole={currentUser.role} userName={currentUser.name}>
          <div className="p-6">
            {renderTaxSettings()}
          </div>
        </Layout>
      )
    }

    if (activeSection === 'direct-deposits') {
      return (
        <Layout userRole={currentUser.role} userName={currentUser.name}>
          <div className="p-6">
            {renderDirectDeposit()}
          </div>
        </Layout>
      )
    }

    if (activeSection === 'ytd-info') {
      return (
        <Layout userRole={currentUser.role} userName={currentUser.name}>
          <div className="p-6">
            {renderYearToDateInfo()}
          </div>
        </Layout>
      )
    }

    if (activeSection === 'online-timecard') {
      return (
        <Layout userRole={currentUser.role} userName={currentUser.name}>
          <div className="p-6">
            {renderOnlineTimecard()}
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
                              navigateToSection(tab.id)
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
                      navigateToSection(tab.id)
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
