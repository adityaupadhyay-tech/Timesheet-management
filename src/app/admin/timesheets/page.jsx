'use client';

import { useState } from 'react';
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
  Building
} from 'lucide-react';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useSupabase } from '@/contexts/SupabaseContext';

export default function AdminTimesheetsPage() {
  const { user } = useSupabase();
  const currentUser = user ? {
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin User',
    role: 'admin'
  } : {
    name: 'Admin User',
    role: 'admin'
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
      status: 'rejected',
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
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Selection state
  const [selectedTimesheets, setSelectedTimesheets] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Get unique companies
  const getUniqueCompanies = () => {
    const companies = [...new Set(timesheets.map(ts => ts.company))];
    return companies.sort();
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
      
      return matchesSearch && matchesStatus && matchesCompany;
    });
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterCompany('all');
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

  // Process timesheets
  const handleProcessTimesheets = () => {
    if (selectedTimesheets.length === 0) {
      alert('Please select at least one timesheet to process');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      const selectedCount = selectedTimesheets.length;
      alert(`Processing ${selectedCount} timesheet${selectedCount > 1 ? 's' : ''}...`);
      
      // Update status of selected timesheets to approved
      setTimesheets(prev => prev.map(ts => 
        selectedTimesheets.includes(ts.id) && ts.status === 'submitted'
          ? { ...ts, status: 'approved' }
          : ts
      ));
      
      setSelectedTimesheets([]);
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
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: <XCircle className="h-3 w-3" />
      }
    };

    const config = statusConfig[status] || statusConfig.submitted;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
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
              <Button
                onClick={handleProcessTimesheets}
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
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Process Timesheets
                  </>
                )}
              </Button>
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
                    className="pl-10"
                  />
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <option value="rejected">Rejected</option>
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
                        <tr key={timesheet.id} className={`hover:bg-gray-50 ${selectedTimesheets.includes(timesheet.id) ? 'bg-blue-50' : ''}`}>
                          <td className="px-4 py-4 text-center">
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
                          <td className="px-6 py-4 whitespace-nowrap text-right">
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
      </div>
    </Layout>
  );
}

