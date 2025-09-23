'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import { TimesheetProvider, useTimesheet } from '@/contexts/TimesheetContext'
import TimeEntryGrid from '@/components/timesheet/TimeEntryGrid'
import TimesheetSummary from '@/components/timesheet/TimesheetSummary'
import ProjectOverview from '@/components/timesheet/ProjectOverview'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Send, Download, Calendar, FolderOpen, CheckCircle } from 'lucide-react'
import ExportModal from '@/components/timesheet/ExportModal'
import { formatCyclePeriod } from '@/lib/cycleUtils'

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
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [gridRows, setGridRows] = useState([])
  const [validationTrigger, setValidationTrigger] = useState(0)

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
    let hasErrors = false
    
    // Check if there are any rows with missing project or description
    gridRows.forEach((row) => {
      if (!row.projectId || row.projectId === '') {
        hasErrors = true
      }
      if (!row.description || row.description.trim() === '') {
        hasErrors = true
      }
    })
    
    // If there are errors, trigger validation in the TimeEntryGrid
    if (hasErrors) {
      setValidationTrigger(prev => prev + 1)
    }
    
    return hasErrors
  }

  const confirmSubmitTimesheet = () => {
    submitTimesheet()
    setShowSubmitModal(false)
  }

  const cancelSubmitTimesheet = () => {
    setShowSubmitModal(false)
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

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto px-5 py-6">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Timesheet Management</h1>
              {selectedCompany && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  {selectedCompany.name}
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                size="lg" 
                className="flex items-center gap-2"
                onClick={handleExportReport}
              >
                <Download className="h-4 w-4" />
                Export Report
              </Button>
              {/* Submit Timesheet Button - Top Right */}
              {(!currentTimesheet || currentTimesheet.status === 'draft') && (
                <Button 
                  size="lg" 
                  className="flex items-center gap-2"
                  onClick={handleSubmitTimesheet}
                >
                  <Send className="h-4 w-4" />
                  Submit Timesheet
                </Button>
              )}
              {currentTimesheet && currentTimesheet.status === 'submitted' && (
                <Button 
                  size="lg" 
                  variant="outline"
                  className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  disabled
                >
                  <Send className="h-4 w-4" />
                  Under Review
                </Button>
              )}
              {currentTimesheet && currentTimesheet.status === 'rejected' && (
                <Button 
                  size="lg" 
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={handleSubmitTimesheet}
                >
                  <Send className="h-4 w-4" />
                  Submit Revision
                </Button>
              )}
              {currentTimesheet && currentTimesheet.status === 'approved' && (
                <Button 
                  size="lg" 
                  variant="outline"
                  className="flex items-center gap-2 bg-green-50 border-green-200 text-green-700"
                  disabled
                >
                  <CheckCircle className="h-4 w-4" />
                  Approved
                </Button>
              )}
            </div>
          </div>
          
          {/* Company Selector */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-semibold text-blue-900">Active Company:</span>
              </div>
              <div className="relative">
                <select
                  value={selectedCompany?.id || ''}
                  onChange={(e) => {
                    const company = companies.find(c => c.id === e.target.value)
                    setSelectedCompany(company || null)
                  }}
                  className="appearance-none px-4 py-2.5 pr-10 border border-blue-300 rounded-lg text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer min-w-[200px]"
                >
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {/* Cycle Selector - Right next to company selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-900">Timesheet Cycle:</span>
                <div className="relative">
                  <select
                    value={selectedCompany?.timesheetCycle || 'weekly'}
                    onChange={(e) => handleCycleChange(e.target.value)}
                    className="appearance-none px-3 py-2 pr-8 border border-blue-300 rounded-lg text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer min-w-[120px]"
                  >
                    <option value="semi-monthly">Semi-monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                  onSubmitTimesheet={submitTimesheet}
                  onApproveTimesheet={approveTimesheet}
                  onRejectTimesheet={rejectTimesheet}
                  validationTrigger={validationTrigger}
                  userRole="admin" // TODO: Get from user context
                />
              </TabsContent>
              
              <TabsContent value="projects" className="space-y-4">
                <ProjectOverview
                  projects={projects}
                  entries={entries}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

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
                  <h3 className="text-lg font-semibold text-gray-900">Submit Timesheet</h3>
                  <p className="text-sm text-gray-600">Confirm your submission</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="p-1 bg-amber-100 rounded-full">
                    <CheckCircle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-800">Ready to Submit?</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Your timesheet will be sent for review and cannot be edited after submission.
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
                        selectedDate.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })
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
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Timesheet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TimesheetPage() {
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin',
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