'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePickerComponent } from '@/components/ui/date-picker'
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
  RotateCcw,
  ChevronDown,
  Briefcase
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
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date()
  })
  const [includeSaturday, setIncludeSaturday] = useState(false)
  const [includeSunday, setIncludeSunday] = useState(false)
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({})
  const [dropdownPositions, setDropdownPositions] = useState<{ [key: string]: { top: number, left: number, width: number } }>({})
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
  const saveTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({})
  const lastWeekRef = useRef<string>('')

  // Set up portal container
  useEffect(() => {
    setPortalContainer(document.body)
  }, [])

  // Initialize grid with current week's entries grouped by project/task
  useEffect(() => {
    // Calculate the start of the week (Sunday) for the selected date
    const weekStart = new Date(selectedDate)
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay())
    
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

      // Convert to array - start with existing entries
      const existingRows: GridRow[] = Object.values(groupedEntries)
      const rows: GridRow[] = []
      
      // Add existing rows
      existingRows.forEach(row => rows.push(row))
      
      // Add empty rows to reach 3 total rows by default
      const targetRows = 3
      for (let i = existingRows.length; i < targetRows; i++) {
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
  }, [entries, selectedDate])

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
    
    // Calculate the start of the week (Sunday) for the selected date
    const weekStart = new Date(selectedDate)
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay())
    
    // Monday (day 1)
    for (let dayOffset = 1; dayOffset <= 5; dayOffset++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + dayOffset)
      days.push(date)
    }
    
    // Conditionally include Saturday (day 6)
    if (includeSaturday) {
      const saturday = new Date(weekStart)
      saturday.setDate(weekStart.getDate() + 6)
      days.push(saturday)
    }
    
    // Conditionally include Sunday (day 0 - the start of the week)
    if (includeSunday) {
      const sunday = new Date(weekStart)
      days.push(sunday) // Add Sunday at the end
    }
    
    return days
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

  const removeRow = (id: string) => {
    const confirmed = confirm('Are you sure you want to completely remove this row? This action cannot be undone.')
    
    if (confirmed) {
      // If it's an existing entry (not new), also delete from backend
      const row = gridRows.find(r => r.id === id)
      
      if (row && !row.isNew) {
        onDelete(id)
      }
      
      // Remove the row completely - no minimum row constraint
      setGridRows(prev => prev.filter(r => r.id !== id))
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

  const updateDayEntry = (id: string, date: string, duration: string, isOnChange: boolean = true) => {
    // Validate and format the input
    const formattedDuration = validateAndFormatTimeInput(duration, isOnChange)
    
    setGridRows(prev => prev.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row }
        if (!updatedRow.weekEntries[date]) {
          updatedRow.weekEntries[date] = { duration: '' }
        }
        
        updatedRow.weekEntries[date].duration = formattedDuration
        
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

  const toggleDropdown = (rowId: string, buttonElement?: HTMLButtonElement) => {
    const isOpening = !openDropdowns[rowId]
    
    // Close all other dropdowns first
    setOpenDropdowns({ [rowId]: isOpening })
    
    if (isOpening && buttonElement) {
      const rect = buttonElement.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
      
      setDropdownPositions(prev => ({
        ...prev,
        [rowId]: {
          top: rect.bottom + scrollTop + 4,
          left: rect.left + scrollLeft,
          width: Math.max(rect.width, 200)
        }
      }))
    }
  }

  const closeDropdown = (rowId: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [rowId]: false
    }))
  }

  const selectProject = (rowId: string, projectId: string) => {
    updateRow(rowId, 'projectId', projectId)
    closeDropdown(rowId)
  }

  const getTotalMinutesForWeek = () => {
    const totalMinutes = gridRows.reduce((total, row) => {
      const rowTotal = Object.values(row.weekEntries).reduce((dayTotal, dayEntry) => 
        dayTotal + hhmmToMinutes(dayEntry.duration), 0
      )
      return total + rowTotal
    }, 0)
    return totalMinutes
  }

  const getDailyTotal = (date: string) => {
    const totalMinutes = gridRows.reduce((total, row) => {
      const dayEntry = row.weekEntries[date]
      return total + (dayEntry ? hhmmToMinutes(dayEntry.duration) : 0)
    }, 0)
    return totalMinutes
  }

  const formatMinutesToHHMM = (minutes: number) => {
    if (minutes <= 0) return ''
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const formatDateForDisplay = (date: Date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${month}/${day}/${year}`
  }

  const getWeekdayShort = (date: Date) => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return weekdays[date.getDay()]
  }

  const validateAndFormatTimeInput = (value: string, isOnChange: boolean = true) => {
    // Allow empty string for deletion
    if (value === '') return ''
    
    // Remove any non-digit and non-colon characters
    let cleaned = value.replace(/[^0-9:]/g, '')
    
    // Handle multiple colons - keep only the first one
    const colonIndex = cleaned.indexOf(':')
    if (colonIndex !== -1) {
      const beforeColon = cleaned.slice(0, colonIndex)
      const afterColon = cleaned.slice(colonIndex + 1).replace(/:/g, '')
      cleaned = beforeColon + ':' + afterColon
    }
    
    // Only auto-format on blur or when user stops typing, not during onChange
    if (!cleaned.includes(':') && !isOnChange) {
      if (cleaned.length === 1) {
        // Single digit: "8" -> "8:00"
        cleaned = cleaned + ':00'
      } else if (cleaned.length === 2) {
        // Two digits: "12" -> "12:00"
        cleaned = cleaned + ':00'
      } else if (cleaned.length === 3) {
        // Three digits: "830" -> "8:30"
        cleaned = cleaned.slice(0, 1) + ':' + cleaned.slice(1)
      } else if (cleaned.length === 4) {
        // Four digits: Check if it's a valid hour format
        const lastTwoDigits = parseInt(cleaned.slice(2, 4))
        
        // If last two digits are valid minutes (0-59), treat first two as hours
        if (lastTwoDigits <= 59) {
          // "1001" -> "10:01", "1200" -> "12:00", "0830" -> "08:30"
          cleaned = cleaned.slice(0, 2) + ':' + cleaned.slice(2)
        } else {
          // "1299" -> "1:29" (since 99 > 59 minutes)
          cleaned = cleaned.slice(0, 1) + ':' + cleaned.slice(1, 3)
        }
      } else if (cleaned.length >= 5) {
        // Five or more digits: "11305" -> "113:05"
        cleaned = cleaned.slice(0, 3) + ':' + cleaned.slice(3, 5)
      }
    }
    
    // Always validate and limit the formatted input
    if (cleaned.includes(':')) {
      const parts = cleaned.split(':')
      if (parts.length === 2) {
        let hours = parts[0]
        let minutes = parts[1]
        
        // Limit minutes to 2 digits and max 59
        if (minutes.length > 2) {
          minutes = minutes.slice(0, 2)
        }
        if (minutes.length === 2) {
          const m = parseInt(minutes)
          if (m > 59) minutes = '59'
        }
        
        // Allow hours to be any reasonable number (for work hours tracking)
        // Limit to 3 digits max (up to 999 hours)
        if (hours.length > 3) {
          hours = hours.slice(0, 3)
        }
        
        cleaned = hours + ':' + minutes
      }
    }
    
    return cleaned
  }

  const formatTimeOnBlur = (value: string) => {
    // Use the validation function with isOnChange=false to apply full formatting
    return validateAndFormatTimeInput(value, false)
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">
                Date:
              </label>
              <DatePickerComponent
                value={selectedDate}
                onChange={setSelectedDate}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Week:</span>
              <span className="text-sm font-medium text-gray-800">
                {weekDays[0] && formatDateForDisplay(weekDays[0])} - {weekDays[weekDays.length - 1] && formatDateForDisplay(weekDays[weekDays.length - 1])}
              </span>
            </div>
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
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full border-collapse">
                         <thead>
               <tr className="border-b border-gray-200">
                 <th className="text-left py-3 px-4 font-medium text-gray-700 w-1/4 min-w-[200px]">Project</th>
                 <th className="text-left py-3 px-4 font-medium text-gray-700 w-1/3 min-w-[250px]">Description</th>
                {weekDays.map((day) => (
                  <th key={day.toISOString()} className="text-center py-2 px-1 font-medium text-gray-700 w-20 min-w-[80px]">
                    <div className="text-xs text-gray-500 mb-1">
                      {getWeekdayShort(day)}
                    </div>
                    <div className="text-sm">
                      {day.getDate()}
                    </div>
                  </th>
                ))}
                <th className="text-left py-3 px-2 font-medium text-gray-700 w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {gridRows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                       <td className="py-4 px-4">
                    <div className="relative">
                       <button
                         type="button"
                         onClick={(e) => toggleDropdown(row.id, e.currentTarget)}
                         className="w-full h-10 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md group flex items-center justify-between"
                       >
                         <div className="flex items-center gap-2 flex-1 text-left">
                           <Briefcase className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                           <span className="text-gray-700 truncate">
                             {row.projectId ? getProjectName(row.projectId) : "Select Project"}
                           </span>
                         </div>
                         <ChevronDown 
                           className={`w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-all duration-200 ${
                             openDropdowns[row.id] ? 'rotate-180' : 'rotate-0'
                           }`} 
                         />
                       </button>
                       
                     </div>
                   </td>
                   <td className="py-4 px-4">
                     <textarea
                       value={row.description}
                       onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                       placeholder="Enter description..."
                       className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 min-h-[40px] resize-y cursor-text"
                       rows={2}
                     />
                   </td>
                  {weekDays.map((day) => {
                    const dateStr = day.toISOString().split('T')[0]
                    const dayEntry = row.weekEntries[dateStr] || { duration: '' }
                    
                    return (
                      <td key={dateStr} className="py-4 px-1 text-center">
                        <input
                          type="text"
                          value={dayEntry.duration || ''}
                          onChange={(e) => updateDayEntry(row.id, dateStr, e.target.value)}
                          onBlur={(e) => {
                            const formattedValue = formatTimeOnBlur(e.target.value)
                            if (formattedValue !== e.target.value) {
                              updateDayEntry(row.id, dateStr, formattedValue, false)
                            }
                          }}
                          onKeyDown={(e) => {
                            // Allow: backspace, delete, tab, escape, enter, home, end, left, right, up, down
                            const allowedKeys = [
                              'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                              'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
                            ]
                            
                            // Allow numbers and colon
                            const isNumber = e.key >= '0' && e.key <= '9'
                            const isColon = e.key === ':'
                            
                            // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
                            const isCtrlKey = e.ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())
                            
                            if (!isNumber && !isColon && !allowedKeys.includes(e.key) && !isCtrlKey) {
                              e.preventDefault()
                            }
                          }}
                          className="w-full px-2 py-2 border border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 text-center h-10"
                          placeholder="hh:mm"
                          title="Enter time in hh:mm format (e.g., 8:30, 12:45). You can type hours beyond 24 for tracking total work hours."
                          maxLength={6}
                        />
                      </td>
                    )
                  })}
                                     <td className="py-4 px-2">
                     <div className="flex items-center gap-1 justify-center">
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => clearRow(row.id)}
                         className="h-8 w-8 p-0 hover:bg-orange-50"
                         title="Clear Record"
                       >
                         <RotateCcw className="h-3 w-3" />
                       </Button>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => removeRow(row.id)}
                         className="h-8 w-8 p-0 hover:bg-red-50"
                         title="Remove Row"
                       >
                         <Trash2 className="h-3 w-3" />
                       </Button>
                     </div>
                   </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-300 bg-gray-50">
                <td className="py-4 px-4 font-semibold text-gray-900">Daily Totals</td>
                <td className="py-4 px-4"></td>
                {weekDays.map((day) => {
                  const dateStr = day.toISOString().split('T')[0]
                  const dailyTotalMinutes = getDailyTotal(dateStr)
                  const formattedTotal = formatMinutesToHHMM(dailyTotalMinutes)
                  
                  return (
                    <td key={dateStr} className="py-4 px-1 text-center">
                      <div className="font-semibold text-blue-600 text-sm">
                        {formattedTotal || '-'}
                      </div>
                    </td>
                  )
                })}
                <td className="py-4 px-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <div className="flex items-center gap-3">
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
          
          {/* Weekend Toggle Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant={includeSaturday ? "default" : "outline"}
              size="sm"
              onClick={() => setIncludeSaturday(!includeSaturday)}
              className="flex items-center gap-2"
              title={includeSaturday ? "Remove Saturday" : "Add Saturday"}
            >
              <Calendar className="h-4 w-4" />
              {includeSaturday ? "Remove Sat" : "Add Saturday"}
            </Button>
            
            <Button
              variant={includeSunday ? "default" : "outline"}
              size="sm"
              onClick={() => setIncludeSunday(!includeSunday)}
              className="flex items-center gap-2"
              title={includeSunday ? "Remove Sunday" : "Add Sunday"}
            >
              <Calendar className="h-4 w-4" />
              {includeSunday ? "Remove Sun" : "Add Sunday"}
            </Button>
          </div>
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
                {formatMinutesToHHMM(getTotalMinutesForWeek()) || '00:00'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Portal-rendered dropdowns */}
      {portalContainer && Object.entries(openDropdowns).map(([rowId, isOpen]) => 
        isOpen && dropdownPositions[rowId] ? createPortal(
          <>
            <div 
              className="fixed inset-0 z-[100]"
              onClick={() => closeDropdown(rowId)}
            ></div>
            <div 
              className="fixed z-[101] max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg"
              style={{
                top: `${dropdownPositions[rowId].top}px`,
                left: `${dropdownPositions[rowId].left}px`,
                width: `${dropdownPositions[rowId].width}px`,
                minWidth: '200px'
              }}
            >
              <div
                onClick={() => selectProject(rowId, '')}
                className="px-3 py-2 text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span className="font-medium">No Project</span>
                </div>
              </div>
              {projects.length === 0 ? (
                <div className="px-3 py-2 text-gray-500 text-center">
                  No projects available
                </div>
              ) : (
                projects.map((project, index) => (
                  <div
                    key={project.id}
                    onClick={() => selectProject(rowId, project.id)}
                    className="px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-3 h-3 rounded-full ${
                          index % 6 === 0 ? 'bg-blue-500' :
                          index % 6 === 1 ? 'bg-green-500' :
                          index % 6 === 2 ? 'bg-purple-500' :
                          index % 6 === 3 ? 'bg-orange-500' :
                          index % 6 === 4 ? 'bg-red-500' : 'bg-teal-500'
                        }`}
                      ></div>
                      <span className="font-medium text-gray-700">{project.name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>,
          portalContainer
        ) : null
      )}
    </Card>
  )
}
