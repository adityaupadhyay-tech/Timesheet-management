'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import { UserRole } from '@/types'
import { TimesheetProvider, useTimesheet } from '@/contexts/TimesheetContext'
import TimeEntryGrid from '@/components/timesheet/TimeEntryGrid'
import TimesheetSummary from '@/components/timesheet/TimesheetSummary'
import { Button } from '@/components/ui/button'
import { Send, Download } from 'lucide-react'
import { TimeEntry } from '@/types'
import ExportModal from '@/components/timesheet/ExportModal'

function TimesheetContent() {
  const {
    entries,
    projects,
    trackingState,
    addEntry,
    updateEntry,
    deleteEntry,
    startTimer,
    stopTimer,
    submitTimesheet,
    getCurrentTime
  } = useTimesheet()

  const [showExportModal, setShowExportModal] = useState(false)



  const handleExportReport = () => {
    setShowExportModal(true)
  }

  const closeExportModal = () => {
    setShowExportModal(false)
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto px-5 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Timesheet Management</h1>
              <p className="mt-2 text-gray-600">Track your work hours using the grid-based time entry system</p>
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
              <Button size="lg" onClick={submitTimesheet} className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Submit Timesheet
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6">
          <TimesheetSummary entries={entries} projects={projects} />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-5">
            <TimeEntryGrid
              projects={projects}
              entries={entries}
              onSave={addEntry}
              onUpdate={updateEntry}
              onDelete={deleteEntry}
              onStartTimer={startTimer}
              onStopTimer={stopTimer}
              isTracking={trackingState.isTracking}
              currentTime={trackingState.isTracking ? getCurrentTime() : undefined}
            />
          </div>
        </div>
      </div>



      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          entries={entries}
          projects={projects}
          onClose={closeExportModal}
        />
      )}
    </div>
  )
}



export default function TimesheetPage() {
  // TODO: Get user data from authentication context/API
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin' as UserRole,
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
