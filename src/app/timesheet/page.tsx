'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import { UserRole } from '@/types'
import { TimesheetProvider, useTimesheet } from '@/contexts/TimesheetContext'
import TimeEntryGrid from '@/components/timesheet/TimeEntryGrid'
import TimesheetSummary from '@/components/timesheet/TimesheetSummary'
import ProjectOverview from '@/components/timesheet/ProjectOverview'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Send, Download, Calendar, FolderOpen } from 'lucide-react'
import { TimeEntry } from '@/types'
import ExportModal from '@/components/timesheet/ExportModal'

function TimesheetContent() {
  const {
    entries,
    allEntries,
    projects,
    allProjects,
    companies,
    selectedCompany,
    trackingState,
    addEntry,
    updateEntry,
    deleteEntry,
    setSelectedCompany,
    startTimer,
    stopTimer,
    submitTimesheet,
    getCurrentTime
  } = useTimesheet()

  const [showExportModal, setShowExportModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())



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
          
          {/* Company Selector */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Company:</span>
            <div className="relative">
              <select
                value={selectedCompany?.id || ''}
                onChange={(e) => {
                  const company = companies.find(c => c.id === e.target.value)
                  setSelectedCompany(company || null)
                }}
                className="appearance-none px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer min-w-[160px]"
              >
                <option value="">All Companies</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6">
          <TimesheetSummary entries={allEntries} projects={allProjects} selectedDate={selectedDate} />
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
                  onSave={addEntry}
                  onUpdate={updateEntry}
                  onDelete={deleteEntry}
                  onStartTimer={startTimer}
                  onStopTimer={stopTimer}
                  isTracking={trackingState.isTracking}
                  currentTime={trackingState.isTracking ? getCurrentTime() : undefined}
                  onSelectedDateChange={setSelectedDate}
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
