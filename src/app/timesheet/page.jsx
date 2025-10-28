'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import Layout from '@/components/Layout'
import { TimesheetProvider, useTimesheet } from '@/contexts/TimesheetContext'
import TimeEntryGrid from '@/components/timesheet/TimeEntryGrid'
import TimesheetSummary from '@/components/timesheet/TimesheetSummary'
import ProjectOverview from '@/components/timesheet/ProjectOverview'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Send, Download, Calendar, FolderOpen, CheckCircle, Eye, Search, Filter, ArrowLeft, Clock, XCircle, CheckCircle2, User, ChevronDown, FileText, Trash2, AlertTriangle, X } from 'lucide-react'
import { formatCyclePeriod } from '@/lib/cycleUtils'
import PageHeader from '@/components/PageHeader'
import ScheduleIcon from '@mui/icons-material/Schedule'

// Dynamically import ExportModal since it's only shown conditionally
const ExportModal = dynamic(
  () => import('@/components/timesheet/ExportModal'),
  { ssr: false }
)

function TimesheetContent() {
  const {
    entries,
    projects,
    companies,
    selectedCompany,
    trackingState,
    currentTimesheet,
    addEntry,
    updateEntry,
    deleteEntry,
    setSelectedCompany,
    startTimer,
    stopTimer,
    submitTimesheet,
    getCurrentTime,
    approveTimesheet,
    rejectTimesheet
  } = useTimesheet()

  const [showExportModal, setShowExportModal] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [employeeEmail, setEmployeeEmail] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  // Helper function to validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  const [gridRows, setGridRows] = useState([])
  const [validationTrigger, setValidationTrigger] = useState(0)
  
  // View mode state - 'list' or 'detail'
  const [viewMode, setViewMode] = useState('list')
  const [selectedTimesheetView, setSelectedTimesheetView] = useState(null)
  const [originalCompany, setOriginalCompany] = useState(null)
  
  // Search and filter state for list view
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCompany, setFilterCompany] = useState('all')
  const [filterDateRange, setFilterDateRange] = useState('all')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  
  // Selection state
  const [selectedTimesheets, setSelectedTimesheets] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showActionDropdown, setShowActionDropdown] = useState(false)
  const [showRequestChangesModal, setShowRequestChangesModal] = useState(false)
  const [showDisposeWarning, setShowDisposeWarning] = useState(false)
  const [showDisposeModal, setShowDisposeModal] = useState(false)
  const [requestedChanges, setRequestedChanges] = useState('')
  const [disposeConfirmation, setDisposeConfirmation] = useState('')
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowActionDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  
  // Sample timesheets data (for admin view)
  const [submittedTimesheets] = useState([
    {
      id: 1,
      employeeName: 'John Doe',
      employeeEmail: 'john.doe@company.com',
      company: 'Acme Corporation',
      department: 'Engineering',
      cycle: 'weekly',
      period: 'Dec 16 - Dec 22, 2024',
      submittedDate: '2024-12-22',
      totalHours: 40.0,
      status: 'submitted',
      projects: 3
    },
    {
      id: 2,
      employeeName: 'Jane Smith',
      employeeEmail: 'jane.smith@company.com',
      company: 'Acme Corporation',
      department: 'Marketing',
      cycle: 'weekly',
      period: 'Dec 16 - Dec 22, 2024',
      submittedDate: '2024-12-21',
      totalHours: 38.5,
      status: 'approved',
      projects: 2
    },
    {
      id: 3,
      employeeName: 'Mike Johnson',
      employeeEmail: 'mike.j@company.com',
      company: 'TechFlow Systems',
      department: 'Sales',
      cycle: 'bi-weekly',
      period: 'Dec 16 - Dec 29, 2024',
      submittedDate: '2024-12-29',
      totalHours: 80.0,
      status: 'response_awaited',
      projects: 4
    },
    {
      id: 4,
      employeeName: 'Sarah Williams',
      employeeEmail: 'sarah.w@company.com',
      company: 'Acme Corporation',
      department: 'Engineering',
      cycle: 'weekly',
      period: 'Dec 9 - Dec 15, 2024',
      submittedDate: '2024-12-15',
      totalHours: 40.0,
      status: 'approved',
      projects: 2
    },
    {
      id: 5,
      employeeName: 'David Brown',
      employeeEmail: 'david.b@company.com',
      company: 'Global Logistics Inc',
      department: 'Operations',
      cycle: 'monthly',
      period: 'December 2024',
      submittedDate: '2024-12-31',
      totalHours: 160.0,
      status: 'submitted',
      projects: 5
    },
  ])

  const handleExportReport = () => {
    setShowExportModal(true)
  }

  const closeExportModal = () => {
    setShowExportModal(false)
  }

  const handleSubmitTimesheet = () => {
    // Validate all rows before showing confirmation modal
    const hasValidationErrors = validateTimesheetData()
    if (hasValidationErrors) {
      return // Don't show modal if there are validation errors
    }
    setShowSubmitModal(true)
  }

  const validateTimesheetData = () => {
    // Check if there's at least one row with complete data
    const hasValidRows = gridRows.some(row => {
      const hasRequiredFields = row.department && row.account && row.code
      const hasTimeEntries = row.weekEntries && Object.values(row.weekEntries).some(dayEntry => 
        dayEntry.duration && dayEntry.duration.trim() !== ''
      )
      return hasRequiredFields && hasTimeEntries
    })
    
    // If no valid rows found, trigger validation in the TimeEntryGrid
    if (!hasValidRows) {
      setValidationTrigger(prev => prev + 1)
    }
    
    return !hasValidRows // Return true if no valid rows found (has errors)
  }

  const confirmSubmitTimesheet = () => {
    if (!employeeEmail.trim()) {
      alert('Please enter your email address')
      return
    }
    
    if (!isValidEmail(employeeEmail)) {
      alert('Please enter a valid email address')
      return
    }
    
    // Filter out empty rows - only submit rows with actual data
    const rowsWithData = gridRows.filter(row => {
      // Check if row has department, account, and code
      const hasRequiredFields = row.department && row.account && row.code
      
      // Check if row has any time entries
      const hasTimeEntries = row.weekEntries && Object.values(row.weekEntries).some(dayEntry => 
        dayEntry.duration && dayEntry.duration.trim() !== ''
      )
      
      return hasRequiredFields && hasTimeEntries
    })
    
    if (rowsWithData.length === 0) {
      alert('No valid time entries found. Please add at least one row with department, account, code, and time entries.')
      return
    }
    
    console.log('Submitting timesheet with data:', {
      totalRows: gridRows.length,
      rowsWithData: rowsWithData.length,
      filteredRows: rowsWithData,
      employeeEmail
    })
    
    // TODO: Send filtered data to backend
    // For now, just show success message
    alert(`Timesheet submitted successfully!\n\nSubmitted ${rowsWithData.length} entries with data.\nDiscarded ${gridRows.length - rowsWithData.length} empty rows.`)
    
    submitTimesheet()
    setShowSubmitModal(false)
    setEmployeeEmail('') // Reset email field
  }

  const cancelSubmitTimesheet = () => {
    setShowSubmitModal(false)
    setEmployeeEmail('') // Reset email field
  }

  const handleGridDataChange = (newGridRows) => {
    setGridRows(newGridRows)
  }

  const handleCycleChange = (newCycle) => {
    if (selectedCompany) {
      const updatedCompany = { ...selectedCompany, timesheetCycle: newCycle }
      setSelectedCompany(updatedCompany)
    }
  }

  // Get unique companies for filter
  const getUniqueCompanies = () => {
    const companies = [...new Set(submittedTimesheets.map(ts => ts.company))]
    return companies.sort()
  }

  // Get date range based on filter selection
  const getDateRange = () => {
    const now = new Date()
    let startDate, endDate

    switch (filterDateRange) {
      case 'this_week':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()))
        endDate = new Date(now.setDate(now.getDate() - now.getDay() + 6))
        break
      case 'last_week':
        const lastWeekStart = new Date(now.setDate(now.getDate() - now.getDay() - 7))
        startDate = lastWeekStart
        endDate = new Date(lastWeekStart)
        endDate.setDate(lastWeekStart.getDate() + 6)
        break
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case 'custom':
        startDate = customStartDate ? new Date(customStartDate) : null
        endDate = customEndDate ? new Date(customEndDate) : null
        break
      default:
        return { startDate: null, endDate: null }
    }

    return { startDate, endDate }
  }

  // Filter timesheets
  const getFilteredTimesheets = () => {
    return submittedTimesheets.filter(ts => {
      const matchesSearch = 
        ts.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ts.employeeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ts.department.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = filterStatus === 'all' || ts.status === filterStatus
      const matchesCompany = filterCompany === 'all' || ts.company === filterCompany
      
      // Date range filter
      let matchesDateRange = true
      if (filterDateRange !== 'all') {
        const { startDate, endDate } = getDateRange()
        if (startDate && endDate) {
          const submittedDate = new Date(ts.submittedDate)
          matchesDateRange = submittedDate >= startDate && submittedDate <= endDate
        }
      }
      
      return matchesSearch && matchesStatus && matchesCompany && matchesDateRange
    })
  }

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('')
    setFilterStatus('all')
    setFilterCompany('all')
    setFilterDateRange('all')
    setCustomStartDate('')
    setCustomEndDate('')
  }

  // Selection handlers
  const handleSelectTimesheet = (timesheetId) => {
    setSelectedTimesheets(prev => {
      if (prev.includes(timesheetId)) {
        return prev.filter(id => id !== timesheetId)
      } else {
        return [...prev, timesheetId]
      }
    })
  }

  const handleSelectAll = () => {
    const filteredIds = getFilteredTimesheets().map(ts => ts.id)
    if (selectedTimesheets.length === filteredIds.length) {
      setSelectedTimesheets([])
    } else {
      setSelectedTimesheets(filteredIds)
    }
  }

  const isAllSelected = () => {
    const filteredIds = getFilteredTimesheets().map(ts => ts.id)
    return filteredIds.length > 0 && selectedTimesheets.length === filteredIds.length
  }

  // Process timesheets with action
  const handleTimesheetAction = (action) => {
    if (selectedTimesheets.length === 0) {
      alert('Please select at least one timesheet')
      return
    }
    
    setShowActionDropdown(false)
    
    // Open modal for request changes
    if (action === 'request_changes') {
      setShowRequestChangesModal(true)
      return
    }
    
    // Open warning for dispose
    if (action === 'dispose') {
      setShowDisposeWarning(true)
      return
    }
    
    setIsProcessing(true)
    
    // Simulate processing
    setTimeout(() => {
      const selectedCount = selectedTimesheets.length
      
      switch(action) {
        case 'approve':
          alert(`Approving ${selectedCount} timesheet${selectedCount > 1 ? 's' : ''}...`)
          break
          
        case 'export':
          alert(`Exporting ${selectedCount} timesheet${selectedCount > 1 ? 's' : ''}...`)
          break
          
        case 'download':
          alert(`Downloading ${selectedCount} timesheet${selectedCount > 1 ? 's' : ''}...`)
          break
          
        default:
          break
      }
      
      setSelectedTimesheets([])
      setIsProcessing(false)
    }, 1000)
  }

  // Handle request changes submission
  const handleRequestChanges = () => {
    if (!requestedChanges.trim()) {
      alert('Please specify what changes are needed')
      return
    }
    
    setIsProcessing(true)
    const selectedCount = selectedTimesheets.length
    
    setTimeout(() => {
      alert(`Requesting changes for ${selectedCount} timesheet${selectedCount > 1 ? 's' : ''}...\n\nChanges requested: ${requestedChanges}`)
      
      setSelectedTimesheets([])
      setRequestedChanges('')
      setShowRequestChangesModal(false)
      setIsProcessing(false)
    }, 1000)
  }

  // Proceed from warning to dispose modal
  const handleProceedToDispose = () => {
    setShowDisposeWarning(false)
    setDisposeConfirmation('')
    setShowDisposeModal(true)
  }

  // Handle dispose timesheets
  const handleDisposeTimesheets = () => {
    setIsProcessing(true)
    const selectedCount = selectedTimesheets.length
    
    setTimeout(() => {
      alert(`Disposing ${selectedCount} timesheet${selectedCount > 1 ? 's' : ''}...`)
      
      setSelectedTimesheets([])
      setShowDisposeModal(false)
      setIsProcessing(false)
    }, 1000)
  }

  // View timesheet details
  const handleViewTimesheet = (timesheet) => {
    setSelectedTimesheetView(timesheet)
    setViewMode('detail')
    
    // Save original company before changing it
    if (selectedCompany && !originalCompany) {
      setOriginalCompany(selectedCompany)
    }
    
    // Find the actual company object by name to get the correct ID
    const actualCompany = companies.find(company => company.name === timesheet.company)
    
    console.log('Viewing timesheet:', {
      timesheetCompany: timesheet.company,
      foundCompany: actualCompany,
      availableCompanies: companies.map(c => ({ id: c.id, name: c.name }))
    })
    
    if (actualCompany && timesheet.cycle) {
      const viewCompany = {
        ...actualCompany,  // Use the actual company object with correct ID
        timesheetCycle: timesheet.cycle
      }
      console.log('Setting selected company:', viewCompany)
      setSelectedCompany(viewCompany)
    } else if (timesheet.cycle) {
      // Fallback: if company not found, use current company but update cycle
      const viewCompany = {
        ...selectedCompany,
        timesheetCycle: timesheet.cycle
      }
      console.log('Using fallback company:', viewCompany)
      setSelectedCompany(viewCompany)
    }
  }

  // Back to list view
  const handleBackToList = () => {
    setViewMode('list')
    setSelectedTimesheetView(null)
    
    // Restore original company
    if (originalCompany) {
      setSelectedCompany(originalCompany)
      setOriginalCompany(null)
    }
  }

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      submitted: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: <Clock className="h-3 w-3" />
      },
      approved: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: <CheckCircle2 className="h-3 w-3" />
      },
      response_awaited: {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        icon: <XCircle className="h-3 w-3" />
      }
    }

    const config = statusConfig[status] || statusConfig.submitted

    const statusLabels = {
      submitted: 'Submitted',
      approved: 'Approved',
      response_awaited: 'Response Awaited'
    }

  return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon}
        {statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  // Render list view (all timesheets)
  const renderListView = () => (
    <div className="space-y-6">
      {/* Search and Filter Card */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <CardTitle>Search & Filter</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by employee name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="filterStatus" className="text-sm">Status</Label>
                <select
                  id="filterStatus"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="response_awaited">Response Awaited</option>
                </select>
              </div>

              {/* Company Filter */}
              <div className="space-y-2">
                <Label htmlFor="filterCompany" className="text-sm">Company</Label>
                <select
                  id="filterCompany"
                  value={filterCompany}
                  onChange={(e) => setFilterCompany(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Companies</option>
                  {getUniqueCompanies().map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <Label htmlFor="filterDateRange" className="text-sm">Date Range</Label>
                <select
                  id="filterDateRange"
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="this_week">This Week</option>
                  <option value="last_week">Last Week</option>
                  <option value="this_month">This Month</option>
                  <option value="last_month">Last Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              <div className="space-y-2">
                <Label className="text-sm invisible">Actions</Label>
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Custom Date Range */}
            {filterDateRange === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="customStartDate" className="text-sm">Start Date</Label>
                  <Input
                    id="customStartDate"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customEndDate" className="text-sm">End Date</Label>
                  <Input
                    id="customEndDate"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
            )}

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{getFilteredTimesheets().length}</span> of{' '}
              <span className="font-medium">{submittedTimesheets.length}</span> timesheets
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timesheets Table */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Submitted Timesheets</CardTitle>
          <CardDescription>
            View and manage timesheet submissions from employees
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {getFilteredTimesheets().length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-center w-12">
                      <input
                        type="checkbox"
                        checked={isAllSelected()}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cycle Allocated</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredTimesheets().map((timesheet) => (
                    <tr 
                      key={timesheet.id} 
                      onClick={() => handleSelectTimesheet(timesheet.id)}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedTimesheets.includes(timesheet.id) ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedTimesheets.includes(timesheet.id)}
                          onChange={() => handleSelectTimesheet(timesheet.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-medium">
                            {timesheet.employeeName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{timesheet.employeeName}</div>
                            <div className="text-xs text-gray-500">{timesheet.employeeEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{timesheet.company}</div>
                        <div className="text-xs text-gray-500">{timesheet.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {timesheet.cycle === 'bi-weekly' ? 'Bi-weekly' : 
                           timesheet.cycle === 'semi-monthly' ? 'Semi-monthly' :
                           timesheet.cycle.charAt(0).toUpperCase() + timesheet.cycle.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {timesheet.period}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{timesheet.submittedDate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{timesheet.totalHours}h</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(timesheet.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTimesheet(timesheet)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              {submittedTimesheets.length === 0 ? (
                <p className="text-sm">No timesheets submitted yet</p>
              ) : (
                <div>
                  <p className="text-sm mb-2">No timesheets match your search criteria</p>
                  <Button variant="outline" size="sm" onClick={clearFilters}>Clear Filters</Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // Render detail view (time entry grid)
  const renderDetailView = () => (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" onClick={handleBackToList}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Timesheets
          </Button>
        </div>
        
        {selectedTimesheetView && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">{selectedTimesheetView.employeeName}</span>
              </div>
              <div className="text-sm text-blue-700">
                {selectedTimesheetView.company} - {selectedTimesheetView.department}
              </div>
              <div className="text-sm text-blue-700">
                Period: {selectedTimesheetView.period}
              </div>
              {getStatusBadge(selectedTimesheetView.status)}
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="mb-6">
        <TimesheetSummary entries={entries} projects={projects} selectedDate={selectedDate} gridRows={gridRows} />
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
                onSave={addEntry}
                onUpdate={updateEntry}
                onDelete={deleteEntry}
                onStartTimer={startTimer}
                onStopTimer={stopTimer}
                isTracking={trackingState.isTracking}
                currentTime={trackingState.isTracking ? getCurrentTime() : '00:00:00'}
                onGridDataChange={handleGridDataChange}
                selectedCompany={selectedCompany}
                timesheet={currentTimesheet}
                onSubmitTimesheet={handleSubmitTimesheet}
                onApproveTimesheet={approveTimesheet}
                onRejectTimesheet={rejectTimesheet}
                validationTrigger={validationTrigger}
                userRole="admin" // TODO: Get from user context
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
    </>
  )

  // Main return
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto px-5 py-6">
        {viewMode === 'list' ? (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ScheduleIcon className="text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Timesheet Management</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedTimesheets.length > 0 
                      ? `${selectedTimesheets.length} timesheet${selectedTimesheets.length > 1 ? 's' : ''} selected`
                      : 'Review and manage employee timesheets'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedTimesheets.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTimesheets([])}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    Clear Selection
                  </Button>
                )}
                <div className="relative" ref={dropdownRef}>
                  <Button
                    onClick={() => setShowActionDropdown(!showActionDropdown)}
                    disabled={isProcessing || selectedTimesheets.length === 0}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-300 disabled:text-blue-100 disabled:cursor-not-allowed disabled:opacity-75"
                  >
                    {isProcessing ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Actions
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                  
                  {showActionDropdown && !isProcessing && selectedTimesheets.length > 0 && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                      <div className="py-1">
                        <button
                          onClick={() => handleTimesheetAction('approve')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve Timesheets
                        </button>
                        <button
                          onClick={() => handleTimesheetAction('request_changes')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Request Changes
                        </button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={() => handleTimesheetAction('export')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Export to Excel
                        </button>
                        <button
                          onClick={() => handleTimesheetAction('download')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download PDF
                        </button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={() => handleTimesheetAction('dispose')}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Dispose Timesheets
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <PageHeader 
            title="Timesheet Management"
            subtitle="Track and manage work hours and project time"
            icon={<ScheduleIcon />}
          />
        )}
        
        {/* Conditional rendering based on view mode */}
        {viewMode === 'list' ? renderListView() : renderDetailView()}

        {showExportModal && (
          <ExportModal
            entries={entries}
            projects={projects}
            onClose={closeExportModal}
          />
        )}

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
                    <h3 className="text-lg font-semibold text-gray-900">Sign Timesheet</h3>
                    <p className="text-sm text-gray-600">Enter your email to sign and submit</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-700 italic">
                      "I {selectedTimesheetView?.employeeName || 'Employee Name'}, hereby attest that the amounts reported on this worksheet are true and correct to the best of my knowledge."
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
                      <p className="text-sm font-medium text-amber-800">Ready to Sign?</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Your timesheet will be signed and sent for review. It cannot be edited after signing.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Hours:</span>
                      <span className="font-semibold text-gray-900">
                        {(() => {
                          // Helper function to convert HH:MM to minutes
                          const hhmmToMinutes = (hhmm) => {
                            if (!hhmm || hhmm === '') return 0
                            const [hours, minutes] = hhmm.split(':').map(Number)
                            if (isNaN(hours) || isNaN(minutes)) return 0
                            return hours * 60 + minutes
                          }
                          
                          // Calculate total minutes from gridRows
                          const totalMinutes = gridRows.reduce((total, row) => {
                            if (!row.weekEntries) return total
                            const rowTotal = Object.values(row.weekEntries).reduce((dayTotal, dayEntry) => 
                              dayTotal + hhmmToMinutes(dayEntry.duration), 0
                            )
                            return total + rowTotal
                          }, 0)
                          
                          // Convert minutes to hours with 1 decimal place
                          return (totalMinutes / 60).toFixed(1) + 'h'
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Period:</span>
                      <span className="font-semibold text-gray-900">
                        {selectedCompany?.timesheetCycle ? 
                          formatCyclePeriod(selectedDate, selectedCompany.timesheetCycle) :
                          (() => {
                            const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
                            const day = String(selectedDate.getDate()).padStart(2, '0')
                            const year = selectedDate.getFullYear()
                            return `${month}/${day}/${year}`
                          })()
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Company:</span>
                      <span className="font-semibold text-gray-900">{selectedCompany?.name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                <Button
                  onClick={cancelSubmitTimesheet}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmSubmitTimesheet}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={!employeeEmail.trim() || !isValidEmail(employeeEmail)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Sign and Submit
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Request Changes Modal */}
        {showRequestChangesModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <XCircle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Request Changes</h3>
                    <p className="text-sm text-gray-600">Specify needed changes</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="requestedChanges" className="text-sm font-medium mb-2 block">
                      What changes do you need? <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      id="requestedChanges"
                      value={requestedChanges}
                      onChange={(e) => setRequestedChanges(e.target.value)}
                      placeholder="Please describe the changes needed in detail..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[120px] resize-y"
                      rows={5}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Be specific about what needs to be corrected or updated.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="p-1 bg-orange-100 rounded-full">
                      <Clock className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-800">Response Awaited</p>
                      <p className="text-xs text-orange-700 mt-1">
                        Selected timesheets will be marked as "Response Awaited" and employees will be notified.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                <Button
                  onClick={() => {
                    setShowRequestChangesModal(false)
                    setRequestedChanges('')
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRequestChanges}
                  disabled={!requestedChanges.trim() || isProcessing}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Requesting...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Request Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Dispose Warning Modal */}
        {showDisposeWarning && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Warning: Dispose Timesheets</h3>
                    <p className="text-sm text-gray-600">Critical action confirmation</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-base font-bold text-red-800 mb-2">
                        ⚠️ CRITICAL ACTION
                      </p>
                      <p className="text-sm text-red-700">
                        You are about to permanently delete <span className="font-bold">{selectedTimesheets.length} timesheet{selectedTimesheets.length > 1 ? 's' : ''}</span>.
                      </p>
                      <p className="text-sm text-red-700 mt-2 font-semibold">
                        This action CANNOT be undone!
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <span className="font-semibold">Before proceeding:</span>
                    </p>
                    <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
                      <li>All timesheet data will be permanently deleted</li>
                      <li>Employee work records will be lost</li>
                      <li>This action cannot be reversed</li>
                    </ul>
                  </div>

                  {/* Confirmation Input */}
                  <div className="space-y-2">
                    <Label htmlFor="disposeConfirmation" className="text-sm font-medium">
                      To confirm, type <span className="font-bold text-red-600">DISPOSE</span> below:
                    </Label>
                    <Input
                      id="disposeConfirmation"
                      type="text"
                      value={disposeConfirmation}
                      onChange={(e) => setDisposeConfirmation(e.target.value)}
                      placeholder="Type DISPOSE to confirm"
                      className="border-red-300 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                <Button
                  onClick={() => {
                    setShowDisposeWarning(false)
                    setDisposeConfirmation('')
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleProceedToDispose}
                  disabled={disposeConfirmation !== 'DISPOSE'}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300 disabled:cursor-not-allowed disabled:opacity-75"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  I Understand, Proceed
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Dispose Timesheets Modal */}
        {showDisposeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Dispose Timesheets</h3>
                    <p className="text-sm text-gray-600">Permanently delete selected timesheets</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="p-1 bg-red-100 rounded-full flex-shrink-0 mt-0.5">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-red-800">Warning: This action cannot be undone!</p>
                      <p className="text-sm text-red-700 mt-1">
                        You are about to permanently delete {selectedTimesheets.length} timesheet{selectedTimesheets.length > 1 ? 's' : ''}. 
                        This will remove all associated data and cannot be recovered.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-700 font-medium mb-2">Selected Timesheets:</p>
                    <ul className="space-y-1">
                      {getFilteredTimesheets()
                        .filter(ts => selectedTimesheets.includes(ts.id))
                        .slice(0, 5)
                        .map((ts) => (
                          <li key={ts.id} className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            {ts.employeeName} - {ts.period}
                          </li>
                        ))}
                      {selectedTimesheets.length > 5 && (
                        <li className="text-sm text-gray-500 italic">
                          ... and {selectedTimesheets.length - 5} more
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                <Button
                  onClick={() => setShowDisposeModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDisposeTimesheets}
                  disabled={isProcessing}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Disposing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Dispose Timesheets
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TimesheetPage() {
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'Admin',
    email: 'john.doe@company.com'
  })

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <TimesheetProvider>
        <TimesheetContent />
      </TimesheetProvider>
    </Layout>
  )
}