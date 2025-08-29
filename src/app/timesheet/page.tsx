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
import { Send, Download, Clock, Calendar, BarChart3, X, FolderOpen, FileText, Save } from 'lucide-react'
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

  const [activeTab, setActiveTab] = useState('overview')
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  const handleEditEntry = (entry: TimeEntry) => {
    if (entry.status === 'approved') {
      alert('Cannot edit approved entries. Please contact your manager if changes are needed.')
      return
    }
    setEditingEntry(entry)
    setShowEditModal(true)
  }

  const handleUpdateEntry = (entryData: Omit<TimeEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (editingEntry) {
      updateEntry(editingEntry.id, entryData)
      setShowEditModal(false)
      setEditingEntry(null)
    }
  }

  const handleDeleteEntry = (entryId: string) => {
    if (confirm('Are you sure you want to delete this time entry?')) {
      deleteEntry(entryId)
    }
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingEntry(null)
  }

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
              <p className="mt-2 text-gray-600">Track your work hours and manage your timesheets efficiently</p>
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

      {/* Edit Modal */}
      {showEditModal && editingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Time Entry</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeEditModal}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6">
              <EditTimeEntryForm
                entry={editingEntry}
                projects={projects}
                onSave={handleUpdateEntry}
                onCancel={closeEditModal}
              />
            </div>
          </div>
        </div>
      )}

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

// Edit form component that pre-fills the data
function EditTimeEntryForm({ 
  entry, 
  projects, 
  onSave, 
  onCancel 
}: { 
  entry: TimeEntry
  projects: any[]
  onSave: (entry: Omit<TimeEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    date: entry.date,
    startTime: entry.startTime,
    endTime: entry.endTime || '',
    projectId: entry.projectId || '',
    description: entry.description
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.startTime || !formData.description) {
      alert('Please fill in all required fields')
      return
    }

    const startTime = new Date(`${formData.date}T${formData.startTime}`)
    const endTime = formData.endTime ? new Date(`${formData.date}T${formData.endTime}`) : undefined
    
    const duration = endTime 
      ? Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
      : 0

    onSave({
      projectId: formData.projectId || undefined,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime || undefined,
      duration,
      description: formData.description,
      status: entry.status // Preserve the current status
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date and Project Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full h-11 px-3 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Project (Optional)
          </label>
          <select
            className="w-full h-11 px-3 border border-gray-200 rounded-md bg-white focus:border-blue-500 focus:ring-blue-500 transition-colors"
            value={formData.projectId}
            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Time Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Start Time
          </label>
          <input
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="w-full h-11 px-3 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            End Time
          </label>
          <input
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            className="w-full h-11 px-3 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Description
        </label>
        <textarea
          className="w-full p-3 border border-gray-200 rounded-md h-24 resize-none focus:border-blue-500 focus:ring-blue-500 transition-colors"
          placeholder="What did you work on? Describe your activities..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          <Save className="h-4 w-4 mr-2" />
          Update Entry
        </Button>
        <Button 
          type="button" 
          onClick={onCancel}
          variant="outline"
          className="flex-1 h-12"
        >
          Cancel
        </Button>
      </div>
    </form>
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
