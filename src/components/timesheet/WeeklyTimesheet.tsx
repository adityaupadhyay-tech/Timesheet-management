'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TimeEntry, Project } from '@/types'
import { ChevronLeft, ChevronRight, Edit, Trash2, Calendar, Clock } from 'lucide-react'

interface WeeklyTimesheetProps {
  entries: TimeEntry[]
  projects: Project[]
  onEditEntry: (entry: TimeEntry) => void
  onDeleteEntry: (entryId: string) => void
}

export default function WeeklyTimesheet({
  entries,
  projects,
  onEditEntry,
  onDeleteEntry
}: WeeklyTimesheetProps) {
  const [currentWeek, setCurrentWeek] = useState(() => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    return startOfWeek
  })

  const getWeekDays = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeek)
      date.setDate(currentWeek.getDate() + i)
      days.push(date)
    }
    return days
  }

  const getEntriesForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return entries.filter(entry => entry.date === dateStr)
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getProjectName = (projectId?: string) => {
    if (!projectId) return 'No Project'
    const project = projects.find(p => p.id === projectId)
    return project?.name || 'Unknown Project'
  }

  const getTotalHoursForDay = (date: Date) => {
    const dayEntries = getEntriesForDay(date)
    return dayEntries.reduce((total, entry) => total + entry.duration, 0)
  }

  const getTotalHoursForWeek = () => {
    return getWeekDays().reduce((total, day) => total + getTotalHoursForDay(day), 0)
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const weekDays = getWeekDays()

  return (
    <Card className="w-full border-0 shadow-sm bg-white/50 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Calendar className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">Weekly Timesheet</CardTitle>
              <p className="text-gray-600 text-sm">View and manage your weekly time entries</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
              className="h-9 w-9 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-gray-700 px-3 py-1 bg-gray-100 rounded-md">
              {weekDays[0].toLocaleDateString()} - {weekDays[6].toLocaleDateString()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('next')}
              className="h-9 w-9 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weekly Overview */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {weekDays.map((day) => {
            const dayEntries = getEntriesForDay(day)
            const totalHours = getTotalHoursForDay(day)
            const isToday = day.toDateString() === new Date().toDateString()
            
            return (
              <div 
                key={day.toISOString()} 
                className={`p-3 rounded-lg border text-center ${
                  isToday 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`text-xs font-medium mb-1 ${
                  isToday ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-bold ${
                  isToday ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {day.getDate()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatDuration(totalHours)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Entries List */}
        <div className="space-y-3">
          {weekDays.map((day) => {
            const dayEntries = getEntriesForDay(day)
            
            if (dayEntries.length === 0) {
              return (
                <div key={day.toISOString()} className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="font-medium">{day.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                  <p className="text-sm">No time entries for this day</p>
                </div>
              )
            }

            return (
              <div key={day.toISOString()} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h3 className="font-semibold text-gray-900">
                    {day.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h3>
                  <span className="text-sm text-gray-500">
                    Total: {formatDuration(getTotalHoursForDay(day))}
                  </span>
                </div>
                
                {dayEntries.map((entry) => (
                  <div key={entry.id} className="ml-5 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-blue-600">
                            {getProjectName(entry.projectId)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            entry.status === 'approved' ? 'bg-green-100 text-green-800' :
                            entry.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            entry.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(entry.startTime)} - {entry.endTime ? formatTime(entry.endTime) : 'Ongoing'}
                          </div>
                          <div className="font-medium text-gray-900">
                            {formatDuration(entry.duration)}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {entry.description}
                        </p>
                      </div>
                      
                      <div className="flex gap-1 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditEntry(entry)}
                          className="h-8 w-8 p-0 hover:bg-blue-50"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteEntry(entry.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* Weekly Summary */}
        <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-semibold text-gray-900">Weekly Total</span>
              <p className="text-sm text-gray-600">All time entries for this week</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-indigo-600">
                {formatDuration(getTotalHoursForWeek())}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
