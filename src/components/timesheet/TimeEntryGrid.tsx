'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimeEntry, Project } from '@/types'
import { 
  Plus, 
  Save, 
  Trash2, 
  Edit, 
  Clock, 
  Calendar, 
  FolderOpen, 
  FileText,
  Play,
  Square,
  Check,
  X,
  RotateCcw
} from 'lucide-react'

interface TimeEntryGridProps {
  projects: Project[]
  entries: TimeEntry[]
  onSave: (entry: Omit<TimeEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  onUpdate: (id: string, entry: Omit<TimeEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  onDelete: (id: string) => void
  onStartTimer: () => void
  onStopTimer: () => void
  isTracking: boolean
  currentTime?: string
}

interface GridRow {
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
}

export default function TimeEntryGrid({
  projects,
  entries,
  onSave,
  onUpdate,
  onDelete,
  onStartTimer,
  onStopTimer,
  isTracking,
  currentTime
}: TimeEntryGridProps) {
  const [gridRows, setGridRows] = useState<GridRow[]>([])
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    return startOfWeek
  })
  const saveTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({})
  const lastWeekRef = useRef<string>('')

  // Initialize grid with current week's entries grouped by project/task
  useEffect(() => {
    const weekStart = selectedWeek
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    
    const currentWeekKey = weekStart.toISOString().split('T')[0]
    
    // Only reinitialize if we're actually changing weeks or if grid is empty
    setGridRows(prevRows => {
      if (lastWeekRef.current === currentWeekKey && prevRows.length > 0) {
        return prevRows
      }
      
      lastWeekRef.current = currentWeekKey

      const weekEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date)
        return entryDate >= weekStart && entryDate <= weekEnd
      })

      // Group entries by project and description
      const groupedEntries: { [key: string]: GridRow } = {}
      
      weekEntries.forEach(entry => {
        const key = `${entry.projectId || 'no-project'}-${entry.description}`
        
        if (!groupedEntries[key]) {
          groupedEntries[key] = {
            id: entry.id,
            projectId: entry.projectId || '',
            description: entry.description,
            weekEntries: {},
            status: entry.status,
            isNew: false
          }
        }
        
        // Add entry to the specific day
        groupedEntries[key].weekEntries[entry.date] = {
          duration: minutesToHHMM(entry.duration)
        }
      })

      // Convert to array and ensure we have exactly 5 rows
      const existingRows: GridRow[] = Object.values(groupedEntries)
      const rows: GridRow[] = []
      
      // Add existing rows
      existingRows.forEach(row => rows.push(row))
      
      // Add empty rows to reach 5 total rows
      for (let i = existingRows.length; i < 5; i++) {
        rows.push({
          id: `new-${Date.now()}-${i}`,
          projectId: '',
          description: '',
          weekEntries: {},
          status: 'draft',
          isNew: true
        })
      }

      return rows
    })
  }, [entries, selectedWeek])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(saveTimeoutRef.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout)
      })
    }
  }, [])

  const getWeekDays = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(selectedWeek)
      date.setDate(selectedWeek.getDate() + i)
      days.push(date)
    }
    return days
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(selectedWeek)
    newWeek.setDate(selectedWeek.getDate() + (direction === 'next' ? 7 : -7))
    setSelectedWeek(newWeek)
  }

  const addNewRow = () => {
    const newRow: GridRow = {
      id: `new-${Date.now()}`,
      projectId: '',
      description: '',
      weekEntries: {},
      status: 'draft',
      isNew: true
    }
    setGridRows(prev => [...prev, newRow])
  }

  const clearRow = (id: string) => {
    if (confirm('Are you sure you want to clear this record? This will remove all data from this row.')) {
      setGridRows(prev => prev.map(row => {
        if (row.id === id) {
          return {
            ...row,
            projectId: '',
            description: '',
            weekEntries: {},
            status: 'draft',
            isNew: true
          }
        }
        return row
      }))
    }
  }

  const saveRow = (row: GridRow) => {
    if (!row.description) {
      alert('Please fill in description')
      return
    }

    // Save each day's entry if it has duration data
    Object.entries(row.weekEntries).forEach(([date, dayEntry]) => {
      if (dayEntry.duration && dayEntry.duration !== '') {
        const durationMinutes = hhmmToMinutes(dayEntry.duration)
        if (durationMinutes > 0) {
          const entryData = {
            projectId: row.projectId || undefined,
            date,
            startTime: '09:00', // Default start time
            endTime: '17:00', // Default end time
            duration: durationMinutes,
            description: row.description,
            status: row.status
          }

          if (row.isNew) {
            onSave(entryData)
          } else {
            onUpdate(row.id, entryData)
          }
        }
      }
    })

    setGridRows(prev => prev.map(r => 
      r.id === row.id ? { ...r, isNew: false } : r
    ))
  }

  const deleteRow = (id: string) => {
    if (confirm('Are you sure you want to clear this record? This will remove all data from this row.')) {
      // If it's an existing entry (not new), also delete from backend
      const row = gridRows.find(r => r.id === id)
      if (row && !row.isNew) {
        onDelete(id)
      }
      
      // Clear the row data
      setGridRows(prev => prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            projectId: '',
            description: '',
            weekEntries: {},
            status: 'draft',
            isNew: true
          }
        }
        return r
      }))
    }
  }

  const updateRow = (id: string, field: keyof GridRow, value: string | number | boolean) => {
    setGridRows(prev => prev.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value }
        
        // Auto-save with debouncing for critical fields
        if (field === 'description' || field === 'projectId') {
          // Clear existing timeout for this row
          if (saveTimeoutRef.current[id]) {
            clearTimeout(saveTimeoutRef.current[id])
          }
          
          // Set new timeout for auto-save
          saveTimeoutRef.current[id] = setTimeout(() => {
            if (updatedRow.description) {
              saveRow(updatedRow)
            }
          }, 1000) // 1 second debounce
        }
        
        return updatedRow
      }
      return row
    }))
  }

  const updateDayEntry = (id: string, date: string, duration: string) => {
    setGridRows(prev => prev.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row }
        if (!updatedRow.weekEntries[date]) {
          updatedRow.weekEntries[date] = { duration: '' }
        }
        
        updatedRow.weekEntries[date].duration = duration
        
        // Auto-save with debouncing
        if (saveTimeoutRef.current[id]) {
          clearTimeout(saveTimeoutRef.current[id])
        }
        
        saveTimeoutRef.current[id] = setTimeout(() => {
          if (updatedRow.description) {
            saveRow(updatedRow)
          }
        }, 1000)
        
        return updatedRow
      }
      return row
    }))
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const minutesToHHMM = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const hhmmToMinutes = (hhmm: string) => {
    if (!hhmm || hhmm === '') return 0
    const [hours, minutes] = hhmm.split(':').map(Number)
    if (isNaN(hours) || isNaN(minutes)) return 0
    return hours * 60 + minutes
  }

  const getProjectName = (projectId: string) => {
    if (!projectId) return 'No Project'
    const project = projects.find(p => p.id === projectId)
    return project?.name || 'Unknown Project'
  }

  const getTotalHoursForWeek = () => {
    const totalMinutes = gridRows.reduce((total, row) => {
      const rowTotal = Object.values(row.weekEntries).reduce((dayTotal, dayEntry) => 
        dayTotal + hhmmToMinutes(dayEntry.duration), 0
      )
      return total + rowTotal
    }, 0)
    return totalMinutes / 60 // Convert to hours
  }

  const weekDays = getWeekDays()

  return (
    <Card className="w-full border-0 shadow-sm bg-white/50 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
                         <div>
               <CardTitle className="text-xl font-semibold text-gray-900">Time Entry Grid</CardTitle>
               <p className="text-gray-600 text-sm">Select project, add description, then enter time in hh:mm format for each day</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek('prev')}
              className="h-9 w-9 p-0"
            >
              ←
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
              →
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer Section */}
        {isTracking && currentTime && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-600">Timer is running</span>
              </div>
              <div className="text-center">
                <p className="text-2xl font-mono font-bold text-blue-600">{currentTime}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onStopTimer}
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Timer
              </Button>
            </div>
          </div>
        )}

        {/* Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
                         <thead>
               <tr className="border-b border-gray-200">
                 <th className="text-left py-3 px-4 font-medium text-gray-700">Project</th>
                 <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                {weekDays.map((day) => (
                  <th key={day.toISOString()} className="text-center py-3 px-2 font-medium text-gray-700 min-w-[120px]">
                    <div className="text-xs text-gray-500 mb-1">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-sm">
                      {day.getDate()}
                    </div>
                  </th>
                ))}
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {gridRows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                                     <td className="py-3 px-4">
                     <select
                       value={row.projectId}
                       onChange={(e) => updateRow(row.id, 'projectId', e.target.value)}
                       className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500"
                     >
                       <option value="">Select Project</option>
                       {projects.map((project) => (
                         <option key={project.id} value={project.id}>
                           {project.name}
                         </option>
                       ))}
                     </select>
                   </td>
                   <td className="py-3 px-4">
                     <input
                       type="text"
                       value={row.description}
                       onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                       placeholder="Enter description..."
                       className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500"
                     />
                   </td>
                  {weekDays.map((day) => {
                    const dateStr = day.toISOString().split('T')[0]
                    const dayEntry = row.weekEntries[dateStr] || { duration: '' }
                    
                    return (
                      <td key={dateStr} className="py-3 px-2 text-center">
                        <input
                          type="text"
                          value={dayEntry.duration || ''}
                          onChange={(e) => updateDayEntry(row.id, dateStr, e.target.value)}
                          className="w-full px-2 py-2 border border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 text-center"
                          placeholder="hh:mm"
                          pattern="[0-9]{1,2}:[0-9]{2}"
                          title="Enter time in hh:mm format (e.g., 8:30, 7:45)"
                        />
                      </td>
                    )
                  })}
                                     <td className="py-3 px-4">
                     <div className="flex items-center gap-1">
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => clearRow(row.id)}
                         className="h-8 w-8 p-0 hover:bg-orange-50"
                         title="Clear Record"
                       >
                         <RotateCcw className="h-3 w-3" />
                       </Button>
                     </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add New Entry Button */}
        <div className="flex justify-start pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={addNewRow}
            className="flex items-center gap-2"
          >
                         <Plus className="h-4 w-4" />
             Add New Entry
          </Button>
        </div>

        {/* Weekly Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-semibold text-gray-900">Weekly Total</span>
              <p className="text-sm text-gray-600">All time entries for this week</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-indigo-600">
                {getTotalHoursForWeek().toFixed(1)}h
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
