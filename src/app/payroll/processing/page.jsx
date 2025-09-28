'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import PayCycleSelector from '@/components/PayCycleSelector'

function PayrollContent() {
  const [selectedPayCycle, setSelectedPayCycle] = useState(null)
  const [showWorksheet, setShowWorksheet] = useState(false)
  
  const [employees] = useState([
    { id: 'EMP-001', name: 'John Smith', dept: 'Engineering', rate: 75.00, status: 'Active', payType: 'Hourly', fullPartTime: 'Full-Time', standardHours: 40.00, reportedHours: 45.00, timeCardStatus: 'Signed', hours: { regular: 40, overtime: 5, double: 0, bonus: 0, commission: 0, vacation: 0, sick: 0, holiday: 0 }, entries: [
        { type: 'Earning', subType: 'Regular', code: '01-Reg hours', hours: 40, date: '9/19/2025' },
        { type: 'Earning', subType: 'Overtime', code: '02-OT hours', hours: 5, date: '9/19/2025' }
    ]},
    { id: 'EMP-002', name: 'Sarah Johnson', dept: 'Marketing', rate: 45.00, status: 'Active', payType: 'Salary', fullPartTime: 'Full-Time', standardHours: 40.00, reportedHours: 40.00, timeCardStatus: 'Missing', hours: { regular: 40, overtime: 0, double: 0, bonus: 0, commission: 0, vacation: 8, sick: 0, holiday: 0 }, entries: [
        { type: 'Earning', subType: 'Salary', code: '05-Salary', hours: 40, date: '9/19/2025' },
        { type: 'Earning', subType: 'Vacation', code: '10-Vacation', hours: 8, date: '9/18/2025' }
    ]},
    { id: 'EMP-003', name: 'Michael Brown', dept: 'Engineering', rate: 80.00, status: 'Active', payType: 'Hourly', fullPartTime: 'Full-Time', standardHours: 40.00, reportedHours: 0.00, timeCardStatus: 'Missing', hours: { regular: 40, overtime: 10, double: 0, bonus: 0, commission: 0, vacation: 0, sick: 0, holiday: 0 }, entries: [
         { type: 'Earning', subType: 'Regular', code: '01-Reg hours', hours: 40, date: '9/19/2025' },
         { type: 'Earning', subType: 'Overtime', code: '02-OT hours', hours: 10, date: '9/19/2025' },
         { type: 'Reimbursement', code: '09-Mileage-N', amount: 500, date: '9/19/2025' }
    ]},
    { id: 'EMP-004', name: 'Emily Davis', dept: 'HR', rate: 50.00, status: 'Active', payType: 'Salary', fullPartTime: 'Part-Time', standardHours: 20.00, reportedHours: 20.00, timeCardStatus: 'Signed', hours: { regular: 40, overtime: 0, double: 0, bonus: 0, commission: 0, vacation: 0, sick: 8, holiday: 0 }, entries: [
        { type: 'Earning', subType: 'Salary', code: '05-Salary', hours: 40, date: '9/19/2025' },
        { type: 'Earning', subType: 'Sick', code: '11-Sick', hours: 8, date: '9/17/2025' }
    ]},
  ])

  const [hourTypes] = useState(['regular', 'overtime', 'double', 'bonus', 'commission', 'vacation', 'sick', 'holiday'])
  const [groupEntries, setGroupEntries] = useState([])
  const [currentEdit, setCurrentEdit] = useState(null)
  const [activeView, setActiveView] = useState('grid') // 'grid' or 'standard'
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [showAutoGroupModal, setShowAutoGroupModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)

  const handlePayCycleSelection = (payCycle) => {
    setSelectedPayCycle(payCycle)
    setShowWorksheet(true)
  }

  const updateHoursFromGrid = (employeeId, hourType, value) => {
    // Implementation would go here
    console.log('Updating hours:', employeeId, hourType, value)
  }

  const renderTable = () => {
    return employees.map(employee => (
      <tr key={employee.id} className="bg-white border-b hover:bg-slate-50">
        <td className="p-4 w-4">
          <div className="flex items-center space-x-4">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            <button className="text-slate-400 hover:text-slate-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </td>
        <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
          {employee.name}<br />
          <span className="font-normal text-slate-500">{employee.id}</span>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
              {employee.status}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {employee.payType}
            </span>
          </div>
        </th>
        <td className="px-6 py-4">{employee.dept}</td>
        <td className="px-6 py-4">${employee.rate.toFixed(2)}</td>
        {hourTypes.map(type => (
          <td key={type} className="px-2 py-2">
            <input 
              type="number" 
              value={employee.hours[type] || 0} 
              onChange={(e) => updateHoursFromGrid(employee.id, type, e.target.value)}
              className="w-full p-2 text-center border border-transparent rounded-md bg-slate-100 transition-all duration-200 focus:outline-none focus:border-indigo-600 focus:bg-white focus:shadow-sm"
            />
          </td>
        ))}
      </tr>
    ))
  }

  const calculateSummary = () => {
    const totalEmployees = employees.length
    const regularHours = employees.reduce((sum, e) => sum + (e.hours.regular || 0), 0)
    const overtimeHours = employees.reduce((sum, e) => sum + (e.hours.overtime || 0), 0)
    const totalHours = employees.reduce((sum, e) => {
      return sum + Object.values(e.hours).reduce((a, b) => a + (b || 0), 0)
    }, 0)

    return { totalEmployees, regularHours, overtimeHours, totalHours }
  }

  const summary = calculateSummary()

  // Show Pay Cycle Selector if no pay cycle is selected
  if (!showWorksheet) {
    return <PayCycleSelector onContinue={handlePayCycleSelection} />
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto px-5 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Time Entry Worksheet: {selectedPayCycle ? `${selectedPayCycle.endDate} ${selectedPayCycle.type}` : '9/13/25 to 9/19/25'}
              </h1>
              <p className="mt-1 text-sm text-gray-500">Payroll time entry and management system</p>
              {selectedPayCycle && (
                <div className="mt-2 flex items-center gap-2">
                  <button 
                    onClick={() => setShowWorksheet(false)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                  >
                    ← Change Pay Cycle
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 flex-wrap">
              <div className="flex items-center space-x-1 p-1 bg-slate-200 rounded-lg">
                <button 
                  onClick={() => setActiveView('standard')}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-md ${activeView === 'standard' ? 'text-indigo-700 bg-white shadow-sm' : 'text-slate-600'}`}
                >
                  Standard Entry
                </button>
                <button 
                  onClick={() => setActiveView('grid')}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-md ${activeView === 'grid' ? 'text-indigo-700 bg-white shadow-sm' : 'text-slate-600'}`}
                >
                  Grid Entry
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Total Employees</p>
              <p className="text-2xl font-bold text-slate-800">{summary.totalEmployees}</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center space-x-4">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Regular Hours</p>
              <p className="text-2xl font-bold text-slate-800">{summary.regularHours}h</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center space-x-4">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Overtime Hours</p>
              <p className="text-2xl font-bold text-slate-800">{summary.overtimeHours}h</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center space-x-4">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Total Hours</p>
              <p className="text-2xl font-bold text-slate-800">{summary.totalHours}h</p>
            </div>
          </div>
        </div>

        {/* Worksheet Functions & Import Options Bar */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 mb-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-600 mr-2">Worksheet Functions:</span>
              <button className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md">Worksheet Note</button>
              <button 
                onClick={() => setShowReportModal(true)}
                className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
              >
                View Period Total
              </button>
              <div className="w-px h-6 bg-slate-200 mx-1"></div>
              <button className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md">Load Defaults</button>
              <button 
                onClick={() => setShowAutoGroupModal(true)}
                className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
              >
                Auto Group Entry
              </button>
              <button 
                onClick={() => setShowClearModal(true)}
                className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
              >
                Clear Worksheet
              </button>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Submit Payroll</button>
          </div>
          <div className="border-t border-slate-200 pt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-600 mr-2">Import Options:</span>
            <button className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md">Import From File</button>
            <button 
              onClick={() => setShowApproveModal(true)}
              className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
            >
              Approve Time Cards
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5">
            {activeView === 'grid' ? (
              <div>
                {/* Table Section */}
                <div className="p-4 flex flex-wrap gap-4 items-center justify-between">
                  <div className="relative w-full sm:w-auto sm:max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Search employees..." 
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex items-center space-x-2 flex-wrap">
                    <select className="w-full sm:w-auto border-slate-300 rounded-lg text-sm">
                      <option>All Pay Types</option>
                      <option>Salary</option>
                      <option>Hourly</option>
                      <option>Commission</option>
                    </select>
                    <select className="w-full sm:w-auto border-slate-300 rounded-lg text-sm">
                      <option>All Departments</option>
                      <option>Engineering</option>
                      <option>Marketing</option>
                      <option>HR</option>
                    </select>
                    <select className="w-full sm:w-auto border-slate-300 rounded-lg text-sm">
                      <option>Active Status</option>
                      <option>Inactive</option>
                    </select>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-700">Apply</button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-slate-700 px-4 pb-2">Employee Time Entries</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-500" style={{minWidth: '1200px'}}>
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                      <tr>
                        <th scope="col" className="p-4">
                          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                        </th>
                        <th scope="col" className="px-6 py-3">Employee</th>
                        <th scope="col" className="px-6 py-3">Dept</th>
                        <th scope="col" className="px-6 py-3">Rate</th>
                        <th scope="col" className="px-6 py-3 text-center">Regular</th>
                        <th scope="col" className="px-6 py-3 text-center">Overtime</th>
                        <th scope="col" className="px-6 py-3 text-center">Double</th>
                        <th scope="col" className="px-6 py-3 text-center">Bonus</th>
                        <th scope="col" className="px-6 py-3 text-center">Commission</th>
                        <th scope="col" className="px-6 py-3 text-center">Vacation</th>
                        <th scope="col" className="px-6 py-3 text-center">Sick</th>
                        <th scope="col" className="px-6 py-3 text-center">Holiday</th>
                      </tr>
                    </thead>
                    <tbody>
                      {renderTable()}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Standard Entry View - Left Column */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Available Departments</label>
                    <select className="w-full border-slate-300 rounded-lg">
                      <option>All Departments</option>
                      <option>Engineering</option>
                      <option>Marketing</option>
                      <option>HR</option>
                    </select>
                    <label className="block text-sm font-medium text-slate-700 mb-2 mt-4">Employee</label>
                    <select 
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className="w-full border-slate-300 rounded-lg"
                    >
                      <option value="">Select Employee</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                      ))}
                    </select>
                  </div>

                  {/* Add Entry Form */}
                  {selectedEmployee && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200">
                      <form onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-slate-800">Add Entry</h3>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Check Sequence</label>
                            <select className="w-full border-slate-300 rounded-lg text-sm">
                              <option>Single Check</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Entry Type</label>
                            <select className="w-full border-slate-300 rounded-lg text-sm">
                              <option>Earnings</option>
                              <option>Reimbursements</option>
                              <option>Deductions</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                            <select className="w-full border-slate-300 rounded-lg text-sm">
                              <option value="01-Reg hours">01-Reg hours</option>
                              <option value="02-OT hours">02-OT hours</option>
                              <option value="09-Mileage-N">09-Mileage-N</option>
                              <option value="05-Bonus">05-Bonus</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Hours</label>
                              <input type="number" placeholder="0.0" className="w-full border-slate-300 rounded-lg text-sm" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Rate</label>
                              <input type="number" placeholder="0.00" className="w-full border-slate-300 rounded-lg text-sm" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                            <input type="number" placeholder="0.00" className="w-full border-slate-300 rounded-lg text-sm bg-slate-200 cursor-not-allowed" disabled />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Line Entry Note</label>
                            <textarea rows="2" className="w-full border-slate-300 rounded-lg text-sm"></textarea>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <div className="flex items-center space-x-2">
                              <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Add</button>
                            </div>
                            <div>
                              <button type="button" className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">&lt; Prev</button>
                              <button type="button" className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Next &gt;</button>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                {/* Standard Entry View - Right Column */}
                <div className={`lg:col-span-2 space-y-6 ${selectedEmployee ? '' : 'hidden'}`}>
                  {selectedEmployee && (() => {
                    const emp = employees.find(e => e.id === selectedEmployee)
                    if (!emp) return null
                    
                    return (
                      <>
                        {/* Employee Information */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200">
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Employee Information</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                              {emp.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-slate-500">Employee Name</p>
                              <p className="font-semibold text-slate-800">{emp.name}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Department</p>
                              <p className="font-semibold text-slate-800">{emp.dept}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Standard Rate</p>
                              <p className="font-semibold text-slate-800">${emp.rate.toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Employee ID</p>
                              <p className="font-semibold text-slate-800">{emp.id}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Pay Type</p>
                              <p className="font-semibold text-slate-800">{emp.payType}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Pay Period</p>
                              <p className="font-semibold text-slate-800">9/13/25 - 9/19/25</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Recorded Entries */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-800">Recorded entries for <span className="font-bold">{emp.name}</span></h3>
                            <div className="flex items-center space-x-2">
                              <button className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Employee Info</button>
                              <button className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200">Employee Note</button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {emp.entries && emp.entries.length > 0 ? (
                              <>
                                <div className="grid grid-cols-5 gap-4 text-sm font-semibold text-slate-600 px-3 pb-2 border-b">
                                  <p>Entry Type</p><p>Code</p><p>Details</p><p className="text-right">Amount</p><p className="text-center">Edit</p>
                                </div>
                                {emp.entries.map((entry, index) => {
                                  const rate = entry.rateOverride || emp.rate
                                  const amount = entry.amount ? entry.amount : (entry.hours || 0) * rate
                                  return (
                                    <div key={index} className="p-3 rounded-lg hover:bg-slate-50 grid grid-cols-5 gap-4 text-sm items-center">
                                      <p>{entry.type}</p>
                                      <p>{entry.code}</p>
                                      <p>{entry.hours ? `${entry.hours.toFixed(2)} hrs @ $${rate.toFixed(2)}` : '-'}</p>
                                      <p className="text-right font-medium">${amount.toFixed(2)}</p>
                                      <p className="text-center flex justify-center space-x-2">
                                        <button className="text-slate-400 hover:text-indigo-600 p-1">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                        </button>
                                        <button className="text-slate-400 hover:text-red-600 p-1">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      </p>
                                    </div>
                                  )
                                })}
                                {(() => {
                                  const totalAmount = emp.entries.reduce((sum, entry) => {
                                    const rate = entry.rateOverride || emp.rate
                                    const amount = entry.amount ? entry.amount : (entry.hours || 0) * rate
                                    return sum + amount
                                  }, 0)
                                  return (
                                    <>
                                      <div className="grid grid-cols-5 gap-4 text-sm font-bold text-slate-800 px-3 pt-2 border-t mt-2">
                                        <p colSpan="3">Check Total</p>
                                        <p></p><p></p><p></p>
                                        <p className="text-right">${totalAmount.toFixed(2)}</p>
                                      </div>
                                      <div className="grid grid-cols-5 gap-4 text-sm font-bold text-slate-900 bg-slate-100 p-3 rounded-lg mt-2">
                                        <p colSpan="3">Employee Total</p>
                                        <p></p><p></p><p></p>
                                        <p className="text-right">${totalAmount.toFixed(2)}</p>
                                      </div>
                                    </>
                                  )
                                })()}
                              </>
                            ) : (
                              <p className="text-slate-500 text-sm">This employee has no active entries for the pay period.</p>
                            )}
                          </div>
                          <div className="mt-4 flex justify-end">
                            <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">Print</button>
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auto Group Entry Modal */}
      {showAutoGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Auto Group Entry</h2>
              <button onClick={() => setShowAutoGroupModal(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Group Criteria */}
                <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
                  <h3 className="font-semibold text-slate-700">Group Criteria</h3>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Status</label>
                    <select className="w-full mt-1 border-slate-300 rounded-lg text-sm"><option>All</option></select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Department</label>
                    <select className="w-full mt-1 border-slate-300 rounded-lg text-sm"><option>All</option></select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Full/Part Time</label>
                    <select className="w-full mt-1 border-slate-300 rounded-lg text-sm"><option>All</option></select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Pay Type</label>
                    <select className="w-full mt-1 border-slate-300 rounded-lg text-sm"><option>All</option></select>
                  </div>
                </div>
                {/* Add Entry */}
                <div className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-slate-700">Add Entry</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Check Sequence</label>
                      <select className="w-full mt-1 border-slate-300 rounded-lg text-sm"><option>Single Check</option></select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Entry Type</label>
                      <select className="w-full mt-1 border-slate-300 rounded-lg text-sm"><option>Earnings</option></select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Code</label>
                    <select className="w-full mt-1 border-slate-300 rounded-lg text-sm"><option value="01-Regular">01-Regular</option></select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Hours</label>
                      <input type="number" className="w-full mt-1 border-slate-300 rounded-lg text-sm" placeholder="0.0" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Rate</label>
                      <input type="number" className="w-full mt-1 border-slate-300 rounded-lg text-sm" placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Entry Note</label>
                    <textarea rows="2" className="w-full mt-1 border-slate-300 rounded-lg text-sm"></textarea>
                  </div>
                  <div className="text-right">
                    <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Add Entry</button>
                  </div>
                </div>
              </div>
              {/* Entries Table */}
              <div>
                <h3 className="font-semibold text-slate-700 mb-2">Group Entries for Pay Period</h3>
                <div className="border rounded-lg overflow-hidden">
                  <div className="table-container">
                    <table className="w-full text-sm min-w-0">
                      <thead className="bg-slate-50 text-xs text-slate-600 uppercase">
                        <tr>
                          <th className="p-3 text-left">Entry Type</th>
                          <th className="p-3 text-left">Code</th>
                          <th className="p-3 text-left">Amount</th>
                          <th className="p-3 text-center">Edit/Remove</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {/* JS will populate this */}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-center p-6 text-sm text-slate-500">
                    No group entries available for the pay period of 9/14/2025 to 9/20/2025.
                  </div>
                </div>
              </div>
            </div>
            {/* Modal Footer */}
            <div className="p-4 border-t bg-slate-50 rounded-b-xl flex justify-start">
              <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Accept Entries</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Approve Time Cards Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Employee Time Cards</h2>
              <button onClick={() => setShowApproveModal(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              <div className="border rounded-lg overflow-hidden">
                <div className="table-container">
                  <table className="w-full text-sm min-w-[1000px]">
                    <thead className="bg-slate-50 text-xs text-slate-600 uppercase">
                      <tr>
                        <th className="p-3 text-left">Home Department</th>
                        <th className="p-3 text-left">Employee</th>
                        <th className="p-3 text-left">Pay Type</th>
                        <th className="p-3 text-left">Full/Part Time</th>
                        <th className="p-3 text-left">EE Status</th>
                        <th className="p-3 text-right">Standard Hours</th>
                        <th className="p-3 text-right">Reported Hours</th>
                        <th className="p-3 text-left">Time Card Status</th>
                        <th className="p-3 text-center">Functions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {employees.map(emp => (
                        <tr key={emp.id}>
                          <td className="p-3">{emp.dept}</td>
                          <td className="p-3">{emp.name}</td>
                          <td className="p-3">{emp.payType}</td>
                          <td className="p-3">{emp.fullPartTime}</td>
                          <td className="p-3">{emp.status}</td>
                          <td className="p-3 text-right">{emp.standardHours.toFixed(2)}</td>
                          <td className="p-3 text-right">{emp.reportedHours.toFixed(2)}</td>
                          <td className={`p-3 font-medium ${emp.timeCardStatus === 'Signed' ? 'text-green-600' : 'text-orange-600'}`}>
                            {emp.timeCardStatus}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button className="text-slate-400 hover:text-green-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                              <button className="text-slate-400 hover:text-blue-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* Modal Footer */}
            <div className="p-4 border-t bg-slate-50 rounded-b-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <button className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">Approve all signed cards</button>
                <button className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">Skip all missing cards</button>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => setShowApproveModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg">Close Window</button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Import Approved Timecards</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pay Period Total Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Pay Period Total Report</h2>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              {/* Filters */}
              <div className="mb-4 p-4 bg-slate-50 rounded-lg border space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
                  <div>
                    <label className="text-xs font-medium text-slate-600">Department</label>
                    <select className="w-full mt-1 border-slate-300 rounded-lg text-sm"><option>All</option></select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-600">End Date Between</label>
                    <div className="flex items-center mt-1">
                      <input type="date" className="w-full border-slate-300 rounded-lg text-sm" />
                      <span className="mx-2 text-sm">AND</span>
                      <input type="date" className="w-full border-slate-300 rounded-lg text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Name</label>
                    <select className="w-full mt-1 border-slate-300 rounded-lg text-sm"><option>All</option></select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Account</label>
                    <select className="w-full mt-1 border-slate-300 rounded-lg text-sm"><option>All</option></select>
                  </div>
                </div>
                {/* Column Selection */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 border-t">
                  <span className="text-sm font-semibold text-slate-600">Groups:</span>
                  <label className="flex items-center space-x-2 text-sm"><input type="checkbox" defaultChecked /><span>Amount</span></label>
                  <label className="flex items-center space-x-2 text-sm"><input type="checkbox" defaultChecked /><span>Name</span></label>
                  <label className="flex items-center space-x-2 text-sm"><input type="checkbox" defaultChecked /><span>Entry Type</span></label>
                  <label className="flex items-center space-x-2 text-sm"><input type="checkbox" defaultChecked /><span>Department</span></label>
                  <label className="flex items-center space-x-2 text-sm"><input type="checkbox" defaultChecked /><span>End Date</span></label>
                  <label className="flex items-center space-x-2 text-sm"><input type="checkbox" defaultChecked /><span>Account</span></label>
                  <div className="flex-grow"></div>
                  <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Create Report</button>
                </div>
              </div>

              {/* Report Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="table-container max-h-[50vh]">
                  <table className="w-full text-sm min-w-[1000px]">
                    <thead className="bg-slate-100 text-xs text-slate-600 uppercase sticky top-0">
                      <tr>
                        <th className="p-3 text-right">Amount</th>
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Entry Type</th>
                        <th className="p-3 text-left">Department</th>
                        <th className="p-3 text-left">End Date</th>
                        <th className="p-3 text-left">Account</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {employees.map(emp => 
                        emp.entries.map((entry, idx) => {
                          const rate = entry.rateOverride || emp.rate
                          const amount = entry.amount ? entry.amount : (entry.hours || 0) * rate
                          return (
                            <tr key={`${emp.id}-${idx}`}>
                              <td className="p-3 text-right font-medium">${amount.toFixed(2)}</td>
                              <td className="p-3">{emp.name}</td>
                              <td className="p-3">{entry.type}</td>
                              <td className="p-3">{emp.dept}</td>
                              <td className="p-3">{entry.date}</td>
                              <td className="p-3 text-slate-500">(unassigned)</td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="text-center p-6 text-sm text-slate-500 hidden">
                  No employees selected or no data available for the selected period.
                </div>
              </div>
            </div>
            {/* Modal Footer */}
            <div className="p-4 border-t bg-slate-50 rounded-b-xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Export format:</label>
                <select className="border-slate-300 rounded-lg text-sm">
                  <option value="csv">(.csv) Comma Separated</option>
                  <option value="excel">(.xls) Excel</option>
                </select>
                <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg">Export</button>
              </div>
              <button className="text-sm text-indigo-600 hover:underline">Customize this report</button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Worksheet Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Confirm Action</h2>
              <button onClick={() => setShowClearModal(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">Please enter the password to clear all time entries from the worksheet.</p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input type="password" className="w-full border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <p className="text-red-500 text-xs mt-1 hidden">Incorrect password. Please try again.</p>
              </div>
            </div>
            {/* Modal Footer */}
            <div className="p-4 border-t bg-slate-50 rounded-b-xl flex justify-end space-x-2">
              <button onClick={() => setShowClearModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg">Cancel</button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">Clear Worksheet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PayrollPage() {
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin',
    email: 'john.doe@company.com'
  })

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <PayrollContent />
    </Layout>
  )
}
