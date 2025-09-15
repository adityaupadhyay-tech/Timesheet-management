'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimeEntry, Project } from '@/types'
import { Clock, Calendar, TrendingUp, Target, BarChart3 } from 'lucide-react'

interface TimesheetSummaryProps {
  entries: TimeEntry[]
  projects: Project[]
  selectedDate?: Date
  gridRows?: Array<{
    id: string
    projectId: string
    description: string
    weekEntries: {
      [day: string]: {
        duration: string // hh:mm format
      }
    }
    status: 'draft' | 'submitted' | 'approved' | 'rejected'
    isNew: boolean
  }>
}

export default function TimesheetSummary({ entries, projects, selectedDate, gridRows }: TimesheetSummaryProps) {
  console.log('TimesheetSummary - Received entries:', entries.length, entries)
  console.log('TimesheetSummary - Received projects:', projects.length, projects)
  
  // Force re-render when entries change by using a key based on entries length and content
  const entriesKey = entries.length + entries.reduce((sum, entry) => sum + entry.duration, 0) + (selectedDate?.getTime() || 0)

  const getCurrentWeekEntries = () => {
    const referenceDate = selectedDate || new Date()
    const startOfWeek = new Date(referenceDate)
    startOfWeek.setDate(referenceDate.getDate() - referenceDate.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    return entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= startOfWeek && entryDate <= endOfWeek
    })
  }

  const getCurrentMonthEntries = () => {
    const referenceDate = selectedDate || new Date()
    const startOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1)
    const endOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0)

    return entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= startOfMonth && entryDate <= endOfMonth
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getTotalHours = (entries: TimeEntry[]) => {
    return entries.reduce((total, entry) => total + entry.duration, 0)
  }

  const getProjectBreakdown = (entries: TimeEntry[]) => {
    const breakdown: { [key: string]: number } = {}
    
    entries.forEach(entry => {
      const projectName = entry.projectId 
        ? projects.find(p => p.id === entry.projectId)?.name || 'Unknown'
        : 'No Project'
      
      breakdown[projectName] = (breakdown[projectName] || 0) + entry.duration
    })

    return Object.entries(breakdown)
      .map(([name, minutes]) => ({ name, minutes, hours: minutes / 60 }))
      .sort((a, b) => b.minutes - a.minutes)
  }

  const getAverageHoursPerDay = (entries: TimeEntry[]) => {
    if (entries.length === 0) return 0
    
    const uniqueDays = new Set(entries.map(entry => entry.date))
    const totalHours = getTotalHours(entries) / 60
    return totalHours / uniqueDays.size
  }

  // Helper function to convert hh:mm to minutes
  const hhmmToMinutes = (hhmm: string) => {
    if (!hhmm || hhmm === '') return 0
    const [hours, minutes] = hhmm.split(':').map(Number)
    if (isNaN(hours) || isNaN(minutes)) return 0
    return hours * 60 + minutes
  }

  // Calculate totals from grid data
  const getGridTotalMinutes = () => {
    if (!gridRows || gridRows.length === 0) return 0
    
    return gridRows.reduce((total, row) => {
      const rowTotal = Object.values(row.weekEntries).reduce((dayTotal, dayEntry) => 
        dayTotal + hhmmToMinutes(dayEntry.duration), 0
      )
      return total + rowTotal
    }, 0)
  }

  const currentWeekEntries = getCurrentWeekEntries()
  const currentMonthEntries = getCurrentMonthEntries()
  
  // Use grid data if available, otherwise fall back to entries
  const gridTotalMinutes = getGridTotalMinutes()
  const weekHours = gridRows && gridRows.length > 0 ? gridTotalMinutes : getTotalHours(currentWeekEntries)
  const monthHours = gridRows && gridRows.length > 0 ? gridTotalMinutes : getTotalHours(currentMonthEntries)
  const weekProjectBreakdown = getProjectBreakdown(currentWeekEntries)
  const avgHoursPerDay = gridRows && gridRows.length > 0 ? (gridTotalMinutes / 60) / 7 : getAverageHoursPerDay(currentWeekEntries)

  console.log('TimesheetSummary - Calculations:', {
    selectedDate: selectedDate?.toISOString().split('T')[0] || 'current date',
    currentWeekEntries: currentWeekEntries.length,
    currentMonthEntries: currentMonthEntries.length,
    weekHours,
    monthHours,
    avgHoursPerDay,
    entriesKey,
    gridRowsCount: gridRows?.length || 0,
    gridTotalMinutes,
    usingGridData: gridRows && gridRows.length > 0,
    weekUsingGrid: gridRows && gridRows.length > 0,
    monthUsingGrid: gridRows && gridRows.length > 0
  })


    return (
      <div key={entriesKey} className="space-y-4">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Current Week Hours */}
      <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-sm font-medium text-gray-700">This Week</CardTitle>
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold text-gray-900">{formatDuration(weekHours)}</div>
          <p className="text-xs text-gray-600">
            {currentWeekEntries.length} entries • {Math.round((weekHours / 2400) * 100)}% of target
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min((weekHours / 2400) * 100, 100)}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Current Month Hours */}
      <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-sm font-medium text-gray-700">This Month</CardTitle>
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold text-gray-900">{formatDuration(monthHours)}</div>
          <p className="text-xs text-gray-600">
            {currentMonthEntries.length} entries • {Math.round(monthHours / 60)} hours logged
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-green-600 h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min((monthHours / 9600) * 100, 100)}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Average Hours Per Day */}
      <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-sm font-medium text-gray-700">Avg/Day</CardTitle>
          <div className="p-2 bg-purple-100 rounded-lg">
            <Clock className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold text-gray-900">{avgHoursPerDay.toFixed(1)}h</div>
          <p className="text-xs text-gray-600">
            This week average • {currentWeekEntries.length > 0 ? Math.ceil(avgHoursPerDay) : 0} hours target
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-purple-600 h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min((avgHoursPerDay / 8) * 100, 100)}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Target Hours */}
      <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-sm font-medium text-gray-700">Weekly Target</CardTitle>
          <div className="p-2 bg-orange-100 rounded-lg">
            <Target className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold text-gray-900">40h</div>
          <p className="text-xs text-gray-600">
            {weekHours >= 2400 ? '✅ Target met' : `${Math.round((weekHours / 2400) * 100)}% complete`}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                weekHours >= 2400 ? 'bg-green-600' : 'bg-orange-600'
              }`}
              style={{ width: `${Math.min((weekHours / 2400) * 100, 100)}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
