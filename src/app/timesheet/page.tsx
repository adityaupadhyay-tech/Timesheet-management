'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import { UserRole } from '@/types'
import { TimesheetProvider, useTimesheet } from '@/contexts/TimesheetContext'
import TimeEntryForm from '@/components/timesheet/TimeEntryForm'
import WeeklyTimesheet from '@/components/timesheet/WeeklyTimesheet'
import TimesheetSummary from '@/components/timesheet/TimesheetSummary'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Send, Download, Clock, Calendar, BarChart3 } from 'lucide-react'

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

  const [activeTab, setActiveTab] = useState('overview')

  const handleEditEntry = (entry: any) => {
    // TODO: Implement edit modal/form
    console.log('Edit entry:', entry)
  }

  const handleDeleteEntry = (entryId: string) => {
    if (confirm('Are you sure you want to delete this time entry?')) {
      deleteEntry(entryId)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto px-5 py-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Timesheet Management</h1>
              <p className="mt-2 text-gray-600">Track your work hours and manage your timesheets efficiently</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" size="lg" className="flex items-center gap-2">
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200">
              <div className="px-5 py-4">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
                  <TabsTrigger 
                    value="overview" 
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="log-time"
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Clock className="h-4 w-4" />
                    Log Time
                  </TabsTrigger>
                  <TabsTrigger 
                    value="weekly"
                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Calendar className="h-4 w-4" />
                    Weekly View
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="p-5">
              <TabsContent value="overview" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <TimeEntryForm
                      projects={projects}
                      onSave={addEntry}
                      onStartTimer={startTimer}
                      onStopTimer={stopTimer}
                      isTracking={trackingState.isTracking}
                      currentTime={trackingState.isTracking ? getCurrentTime() : undefined}
                    />
                  </div>
                  <div className="space-y-6">
                    <WeeklyTimesheet
                      entries={entries}
                      projects={projects}
                      onEditEntry={handleEditEntry}
                      onDeleteEntry={handleDeleteEntry}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="log-time" className="space-y-6 mt-0">
                <div className="max-w-2xl mx-auto">
                  <TimeEntryForm
                    projects={projects}
                    onSave={addEntry}
                    onStartTimer={startTimer}
                    onStopTimer={stopTimer}
                    isTracking={trackingState.isTracking}
                    currentTime={trackingState.isTracking ? getCurrentTime() : undefined}
                  />
                </div>
              </TabsContent>

              <TabsContent value="weekly" className="space-y-6 mt-0">
                <WeeklyTimesheet
                  entries={entries}
                  projects={projects}
                  onEditEntry={handleEditEntry}
                  onDeleteEntry={handleDeleteEntry}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
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
