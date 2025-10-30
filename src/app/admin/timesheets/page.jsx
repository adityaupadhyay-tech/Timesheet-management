'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Layout from '@/components/Layout';
import PageHeader from '@/components/PageHeader';
import { 
  Eye, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText,
  Calendar,
  User,
  Building,
  ChevronDown,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useSupabase } from '@/contexts/SupabaseContext';

export default function AdminTimesheetsPage() {
  const { user } = useSupabase();
  const currentUser = user ? {
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin User',
    role: 'Admin'
  } : {
    name: 'Admin User',
    role: 'Admin'
  };

  // Sample timesheets data
  const [timesheets, setTimesheets] = useState([
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
      company: 'Tech Solutions Inc',
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
      company: 'Global Enterprises',
      department: 'Operations',
      cycle: 'monthly',
      period: 'December 2024',
      submittedDate: '2024-12-31',
      totalHours: 160.0,
      status: 'submitted',
      projects: 5
    },
  ]);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Selection state
  const [selectedTimesheets, setSelectedTimesheets] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [showRequestChangesModal, setShowRequestChangesModal] = useState(false);
  const [showDisposeWarning, setShowDisposeWarning] = useState(false);
  const [showDisposeModal, setShowDisposeModal] = useState(false);
  const [requestedChanges, setRequestedChanges] = useState('');
  const [disposeConfirmation, setDisposeConfirmation] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowActionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get unique companies
  const getUniqueCompanies = () => {
    const companies = [...new Set(timesheets.map(ts => ts.company))];
    return companies.sort();
  };

  // Get date range based on filter selection
  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    switch (filterDateRange) {
      case 'this_week':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        endDate = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        break;
      case 'last_week':
        const lastWeekStart = new Date(now.setDate(now.getDate() - now.getDay() - 7));
        startDate = lastWeekStart;
        endDate = new Date(lastWeekStart);
        endDate.setDate(lastWeekStart.getDate() + 6);
        break;
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'custom':
        startDate = customStartDate ? new Date(customStartDate) : null;
        endDate = customEndDate ? new Date(customEndDate) : null;
        break;
      default:
        return { startDate: null, endDate: null };
    }

    return { startDate, endDate };
  };

  // Filter timesheets
  const getFilteredTimesheets = () => {
    return timesheets.filter(ts => {
      const matchesSearch = 
        ts.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ts.employeeEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ts.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || ts.status === filterStatus;
      const matchesCompany = filterCompany === 'all' || ts.company === filterCompany;
      
      // Date range filter
      let matchesDateRange = true;
      if (filterDateRange !== 'all') {
        const { startDate, endDate } = getDateRange();
        if (startDate && endDate) {
          const submittedDate = new Date(ts.submittedDate);
          matchesDateRange = submittedDate >= startDate && submittedDate <= endDate;
        }
      }
      
      return matchesSearch && matchesStatus && matchesCompany && matchesDateRange;
    });
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterCompany('all');
    setFilterDateRange('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  // View timesheet details
  const handleViewTimesheet = (timesheet) => {
    setSelectedTimesheet(timesheet);
    setIsViewDialogOpen(true);
  };

  // Selection handlers
  const handleSelectTimesheet = (timesheetId) => {
    setSelectedTimesheets(prev => {
      if (prev.includes(timesheetId)) {
        return prev.filter(id => id !== timesheetId);
      } else {
        return [...prev, timesheetId];
      }
    });
  };

  const handleSelectAll = () => {
    const filteredIds = getFilteredTimesheets().map(ts => ts.id);
    if (selectedTimesheets.length === filteredIds.length) {
      setSelectedTimesheets([]);
    } else {
      setSelectedTimesheets(filteredIds);
    }
  };

  const isAllSelected = () => {
    const filteredIds = getFilteredTimesheets().map(ts => ts.id);
    return filteredIds.length > 0 && selectedTimesheets.length === filteredIds.length;
  };

  // Process timesheets with action
  const handleTimesheetAction = (action) => {
    if (selectedTimesheets.length === 0) {
      alert('Please select at least one timesheet');
      return;
    }
    
    setShowActionDropdown(false);
    
    // Open modal for request changes
    if (action === 'request_changes') {
      setShowRequestChangesModal(true);
      return;
    }
    
    // Open warning for dispose
    if (action === 'dispose') {
      setShowDisposeWarning(true);
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      const selectedCount = selectedTimesheets.length;
      
      switch(action) {
        case 'approve':
          alert(`Approving ${selectedCount} timesheet${selectedCount > 1 ? 's' : ''}...`);
          setTimesheets(prev => prev.map(ts => 
            selectedTimesheets.includes(ts.id) && ts.status === 'submitted'
              ? { ...ts, status: 'approved' }
              : ts
          ));
          break;
          
        case 'export':
          alert(`Exporting ${selectedCount} timesheet${selectedCount > 1 ? 's' : ''}...`);
          // Export logic here
          break;
          
        case 'download':
          alert(`Downloading ${selectedCount} timesheet${selectedCount > 1 ? 's' : ''}...`);
          // Download logic here
          break;
          
        default:
          break;
      }
      
      setSelectedTimesheets([]);
      setIsProcessing(false);
    }, 1000);
  };

  // Handle request changes submission
  const handleRequestChanges = () => {
    if (!requestedChanges.trim()) {
      alert('Please specify what changes are needed');
      return;
    }
    
    setIsProcessing(true);
    const selectedCount = selectedTimesheets.length;
    
    setTimeout(() => {
      alert(`Requesting changes for ${selectedCount} timesheet${selectedCount > 1 ? 's' : ''}...\n\nChanges requested: ${requestedChanges}`);
      
      setTimesheets(prev => prev.map(ts => 
        selectedTimesheets.includes(ts.id) && ts.status === 'submitted'
          ? { ...ts, status: 'response_awaited' }
          : ts
      ));
      
      setSelectedTimesheets([]);
      setRequestedChanges('');
      setShowRequestChangesModal(false);
      setIsProcessing(false);
    }, 1000);
  };

  // Proceed from warning to dispose modal
  const handleProceedToDispose = () => {
    setShowDisposeWarning(false);
    setDisposeConfirmation('');
    setShowDisposeModal(true);
  };

  // Handle dispose timesheets
  const handleDisposeTimesheets = () => {
    setIsProcessing(true);
    const selectedCount = selectedTimesheets.length;
    
    setTimeout(() => {
      alert(`Disposing ${selectedCount} timesheet${selectedCount > 1 ? 's' : ''}...`);
      
      // Remove disposed timesheets from the list
      setTimesheets(prev => prev.filter(ts => !selectedTimesheets.includes(ts.id)));
      
      setSelectedTimesheets([]);
      setShowDisposeModal(false);
      setIsProcessing(false);
    }, 1000);
  };

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
    };

    const config = statusConfig[status] || statusConfig.submitted;
    
    const statusLabels = {
      submitted: 'Submitted',
      approved: 'Approved',
      response_awaited: 'Response Awaited'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon}
        {statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
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
                        <CheckCircle2 className="h-4 w-4" />
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
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="w-full"
                    >
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
                  <span className="font-medium">{timesheets.length}</span> timesheets
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timesheets Table */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Employee Timesheets</CardTitle>
              <CardDescription>
                View and manage timesheet submissions from all employees
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cycle Allocated
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Period
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hours
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Projects
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
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
                                <div className="text-sm font-medium text-gray-900">
                                  {timesheet.employeeName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {timesheet.employeeEmail}
                                </div>
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
                            <div className="text-sm text-gray-600">{timesheet.projects}</div>
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
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  {timesheets.length === 0 ? (
                    <p className="text-sm">No timesheets submitted yet</p>
                  ) : (
                    <div>
                      <p className="text-sm mb-2">No timesheets match your search criteria</p>
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* View Timesheet Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Timesheet Details
              </DialogTitle>
              <DialogDescription>
                Review employee timesheet submission
              </DialogDescription>
            </DialogHeader>
            
            {selectedTimesheet && (
              <div className="space-y-4 py-4">
                {/* Employee Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-xs text-gray-500">Employee</Label>
                    <div className="text-sm font-medium text-gray-900 mt-1">
                      {selectedTimesheet.employeeName}
                    </div>
                    <div className="text-xs text-gray-500">{selectedTimesheet.employeeEmail}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Company</Label>
                    <div className="text-sm font-medium text-gray-900 mt-1">
                      {selectedTimesheet.company}
                    </div>
                    <div className="text-xs text-gray-500">{selectedTimesheet.department}</div>
                  </div>
                </div>

                {/* Timesheet Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <Label className="text-xs text-gray-500">Cycle Allocated</Label>
                    </div>
                    <div className="text-sm font-medium">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {selectedTimesheet.cycle === 'bi-weekly' ? 'Bi-weekly' : 
                         selectedTimesheet.cycle === 'semi-monthly' ? 'Semi-monthly' :
                         selectedTimesheet.cycle.charAt(0).toUpperCase() + selectedTimesheet.cycle.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <Label className="text-xs text-gray-500">Period</Label>
                    </div>
                    <div className="text-sm font-medium">{selectedTimesheet.period}</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <Label className="text-xs text-gray-500">Total Hours</Label>
                    </div>
                    <div className="text-sm font-medium">{selectedTimesheet.totalHours}h</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <Label className="text-xs text-gray-500">Projects</Label>
                    </div>
                    <div className="text-sm font-medium">{selectedTimesheet.projects}</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <Label className="text-xs text-gray-500 mb-1 block">Status</Label>
                    <div>{getStatusBadge(selectedTimesheet.status)}</div>
                  </div>
                </div>

                {/* Submitted Date */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-xs text-blue-700">
                    Submitted on {selectedTimesheet.submittedDate}
                  </div>
                </div>

                {/* Action Buttons (if status is submitted) */}
                {selectedTimesheet.status === 'submitted' && (
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        alert('Timesheet rejected');
                        setIsViewDialogOpen(false);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        alert('Timesheet approved');
                        setIsViewDialogOpen(false);
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => alert('Download timesheet')}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Request Changes Modal */}
        <Dialog open={showRequestChangesModal} onOpenChange={setShowRequestChangesModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-orange-600" />
                Request Changes
              </DialogTitle>
              <DialogDescription>
                Specify what changes are needed for the selected timesheet{selectedTimesheets.length > 1 ? 's' : ''}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
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

              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div className="text-xs text-orange-800">
                    <p className="font-medium">Selected timesheets will be marked as "Response Awaited"</p>
                    <p className="mt-1">Employees will be notified to make the requested changes.</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRequestChangesModal(false);
                  setRequestedChanges('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRequestChanges}
                disabled={!requestedChanges.trim() || isProcessing}
                className="bg-orange-600 hover:bg-orange-700 text-white"
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
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dispose Warning Modal */}
        <Dialog open={showDisposeWarning} onOpenChange={setShowDisposeWarning}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                Warning: Dispose Timesheets
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-6">
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                  <div className="flex items-start gap-3">
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

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDisposeWarning(false);
                  setDisposeConfirmation('');
                }}
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
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dispose Timesheets Modal */}
        <Dialog open={showDisposeModal} onOpenChange={setShowDisposeModal}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                Dispose Timesheets
              </DialogTitle>
              <DialogDescription>
                This action will permanently delete the selected timesheet{selectedTimesheets.length > 1 ? 's' : ''}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
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

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDisposeModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDisposeTimesheets}
                disabled={isProcessing}
                className="bg-red-600 hover:bg-red-700 text-white"
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
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
    </Suspense>
  );
}

