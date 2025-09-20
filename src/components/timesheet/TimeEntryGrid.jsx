'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePickerComponent } from '@/components/ui/date-picker'
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

export default function TimeEntryGrid({
  projects,
  entries,
  gridRows = [],
  onSave,
  onUpdate,
  onDelete,
  onStartTimer,
  onStopTimer,
  isTracking,
  currentTime,
  onSelectedDateChange,
  onGridDataChange
}) {
  const [localGridRows, setLocalGridRows] = useState([])
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [includeSaturday, setIncludeSaturday] = useState(false)
  const [includeSunday, setIncludeSunday] = useState(false)
  const [pendingAutoSaves, setPendingAutoSaves] = useState([])
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  
  const saveTimeoutRef = useRef({})
  const lastWeekRef = useRef('')
  const lastEntriesRef = useRef([])

  // Sync local gridRows with parent gridRows when component mounts or parent changes
  useEffect(() => {
    if (gridRows && gridRows.length > 0) {
      setLocalGridRows(gridRows)
    }
  }, [gridRows])

  // Clear Saturday and Sunday cells when those days are removed
  useEffect(() => {
    console.log('Weekend clearing effect triggered:', { includeSaturday, includeSunday, selectedDate })
    
    const weekStart = new Date(selectedDate)
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay())
    
    const saturdayDate = new Date(weekStart)
    saturdayDate.setDate(weekStart.getDate() + 6)
    const saturdayDateStr = saturdayDate.toISOString().split('T')[0]
    
    const sundayDate = new Date(weekStart)
    const sundayDateStr = sundayDate.toISOString().split('T')[0]
    
    setLocalGridRows(prevRows => {
      return prevRows.map(row => {
        const updatedRow = { ...row }
        const updatedWeekEntries = { ...updatedRow.weekEntries }
        
        if (!includeSaturday && updatedWeekEntries[saturdayDateStr]) {
          updatedWeekEntries[saturdayDateStr] = { duration: '' }
        }
        
        if (!includeSunday && updatedWeekEntries[sundayDateStr]) {
          updatedWeekEntries[sundayDateStr] = { duration: '' }
        }
        
        return {
          ...updatedRow,
          weekEntries: updatedWeekEntries
        }
      })
    })
    
    setPendingAutoSaves(prevSaves => {
      return prevSaves.filter(save => {
        const saveDate = new Date(save.date)
        const dayOfWeek = saveDate.getDay()
        
        if (dayOfWeek === 6 && !includeSaturday) return false
        if (dayOfWeek === 0 && !includeSunday) return false
        
        return true
      })
    })
  }, [includeSaturday, includeSunday, selectedDate])

  // Clear grid only when company changes
  useEffect(() => {
    const hasEntries = entries && entries.length > 0
    const hasGridRows = localGridRows && localGridRows.length > 0
    const isCompanySwitch = hasEntries && !hasGridRows
    
    if (isCompanySwitch) {
      console.log('Company switch detected - clearing grid rows')
      setLocalGridRows([])
      setPendingAutoSaves([])
      lastWeekRef.current = ''
      lastEntriesRef.current = entries
    }
  }, [entries, localGridRows])

  // Initialize grid with existing entries when needed
  const initializeGridWithEntries = () => {
    if (!entries || entries.length === 0 || localGridRows.length > 0) return

    const startOfWeek = new Date(selectedDate)
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= startOfWeek && entryDate <= endOfWeek
    })

    if (weekEntries.length === 0) return

    const groupedEntries = {}
    weekEntries.forEach(entry => {
      const key = `${entry.projectId || 'no-project'}-${entry.description || 'no-description'}`
      if (!groupedEntries[key]) {
        groupedEntries[key] = []
      }
      groupedEntries[key].push(entry)
    })

    const newGridRows = Object.entries(groupedEntries).map(([key, entries]) => {
      const weekEntries = {}
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        weekEntries[dateStr] = { duration: '' }
      }

      entries.forEach(entry => {
        const dateStr = entry.date
        const hours = Math.floor(entry.duration / 60)
        const minutes = entry.duration % 60
        const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        
        weekEntries[dateStr] = { duration }
      })

      return {
        id: `row-${Date.now()}-${Math.random()}`,
        projectId: entries[0].projectId || '',
        description: entries[0].description || '',
        weekEntries,
        status: 'draft',
        isNew: false
      }
    })

    setLocalGridRows(newGridRows)
    console.log('Initialized grid with existing entries:', newGridRows.length, 'rows')
  }

  useEffect(() => {
    if (localGridRows.length === 0 && entries && entries.length > 0) {
      initializeGridWithEntries()
    }
  }, [selectedDate])

  useEffect(() => {
    const isCompanySwitch = entries.length !== lastEntriesRef.current.length && 
                           entries.length > 0 && 
                           lastEntriesRef.current.length > 0
    
    if (isCompanySwitch) {
      console.log('Company switch detected - clearing and reinitializing grid')
      setLocalGridRows([])
      setPendingAutoSaves([])
      lastWeekRef.current = ''
      lastEntriesRef.current = entries
      
      setTimeout(() => {
        initializeGridWithEntries()
      }, 0)
    }
  }, [entries])

  useEffect(() => {
    if (onSelectedDateChange) {
      onSelectedDateChange(selectedDate)
    }
  }, [selectedDate, onSelectedDateChange])

  useEffect(() => {
    if (onGridDataChange) {
      onGridDataChange(localGridRows)
    }
  }, [localGridRows, onGridDataChange])

  // Handle pending auto-saves
  useEffect(() => {
    if (pendingAutoSaves.length > 0) {
      console.log('Processing pending auto-saves:', pendingAutoSaves)
      setIsAutoSaving(true)
      pendingAutoSaves.forEach(({ id, date, duration, isNew, projectId, description }) => {
        const durationMinutes = hhmmToMinutes(duration)
        
        if (durationMinutes === 0 || duration === '' || duration === '0:00') {
          const existingEntry = entries.find(entry => 
            entry.date === date && 
            entry.projectId === (projectId || undefined) &&
            entry.description === (description || 'Time entry')
          )
          
          if (existingEntry) {
            console.log(`Deleting entry for row ${id}, date ${date}:`, existingEntry.id)
            onDelete(existingEntry.id)
          }
          return
        }
        
        if (durationMinutes > 0) {
          const entryData = {
            projectId,
            startTime: '09:00',
            endTime: '17:00',
            duration,
            description: description || 'Time entry',
            status: 'draft'
          }

          const existingEntry = entries.find(entry => 
            entry.date === date && 
            entry.projectId === entryData.projectId &&
            entry.description === entryData.description
          )

          const shouldCreateNew = isNew && !existingEntry
          const shouldUpdate = existingEntry || !isNew

          if (shouldCreateNew) {
            onSave(entryData)
          } else if (shouldUpdate && existingEntry) {
            onUpdate(existingEntry.id, entryData)
          }
        }
      })
      setPendingAutoSaves([])
      setIsAutoSaving(false)
    }
  }, [pendingAutoSaves, entries, onSave, onUpdate, onDelete])

  // Initialize grid with current week's entries
  useEffect(() => {
    console.log('Grid initialization effect triggered - entries:', entries.length, 'selectedDate:', selectedDate, 'isAutoSaving:', isAutoSaving)
    
    if (isAutoSaving) {
      console.log('Skipping grid reinitialization - auto-saving in progress')
      return
    }
    
    const weekStart = new Date(selectedDate)
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay())
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    
    const currentWeekKey = weekStart.toISOString().split('T')[0]
    
    setLocalGridRows(prevRows => {
      console.log('Grid reinitialization check:', {
        lastWeek: lastWeekRef.current,
        currentWeek: currentWeekKey,
        prevRowsLength: prevRows.length,
        willReinitialize: !(lastWeekRef.current === currentWeekKey && prevRows.length > 0)
      })
      
      if (lastWeekRef.current === currentWeekKey && prevRows.length > 0) {
        console.log('Skipping grid reinitialization - same week and rows exist')
        return prevRows
      }
      
      lastWeekRef.current = currentWeekKey

      const weekEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date)
        return entryDate >= weekStart && entryDate <= weekEnd
      })

      const groupedEntries = {}
      
      weekEntries.forEach(entry => {
        const key = `${entry.projectId || 'no-project'}-${entry.description}`
        
        if (!groupedEntries[key]) {
          groupedEntries[key] = {
            id: `row-${Date.now()}-${Math.random()}`,
            projectId: entry.projectId || '',
            description: entry.description,
            weekEntries: {},
            status: 'draft',
            isNew: false
          }
        }
        
        groupedEntries[key].weekEntries[entry.date] = {
          duration: minutesToHHMM(entry.duration)
        }
      })

      const existingRows = Object.values(groupedEntries)
      const rows = []
      
      existingRows.forEach(row => rows.push(row))
      
      const targetRows = 3
      for (let i = existingRows.length; i < targetRows; i++) {
        const weekEntries = {}
        for (let j = 0; j < 7; j++) {
          const date = new Date(weekStart)
          date.setDate(weekStart.getDate() + j)
          const dateStr = date.toISOString().split('T')[0]
          weekEntries[dateStr] = { duration: '' }
        }
        
        rows.push({
          id: `new-${Date.now()}-${i}`,
          projectId: '',
          description: '',
          weekEntries,
          status: 'draft',
          isNew: false
        })
      }

      console.log('Grid reinitialized with rows:', rows.length)
      return rows
    })
  }, [entries, selectedDate, isAutoSaving])

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
    
    const weekStart = new Date(selectedDate)
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay())
    
    for (let dayOffset = 1; dayOffset <= 5; dayOffset++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + dayOffset)
      days.push(date)
    }
    
    if (includeSaturday) {
      const saturday = new Date(weekStart)
      saturday.setDate(weekStart.getDate() + 6)
      days.push(saturday)
    }
    
    if (includeSunday) {
      const sunday = new Date(weekStart)
      days.push(sunday)
    }
    
    return days
  }

  const addNewRow = () => {
    const weekEntries = {}
    const weekStart = new Date(selectedDate)
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay())
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      weekEntries[dateStr] = { duration: '' }
    }
    
    const newRow = {
      id: `new-${Date.now()}`,
      projectId: '',
      description: '',
      weekEntries,
      status: 'draft',
      isNew: true
    }
    setLocalGridRows(prev => [...prev, newRow])
  }

  const clearRow = (id) => {
    if (confirm('Are you sure you want to clear this record? This will remove all data from this row.')) {
      const row = localGridRows.find(r => r.id === id)
      
      if (row) {
        console.log(`Clearing row ${id} - Project: ${row.projectId}, Description: ${row.description}`)
        Object.keys(row.weekEntries).forEach(date => {
          const dayEntry = row.weekEntries[date]
          if (dayEntry.duration && dayEntry.duration !== '') {
            const entriesToDelete = entries.filter((entry) => 
              entry.date === date &&
              (entry.projectId === row.projectId || 
               (entry.description === row.description && row.description !== '') ||
               (entry.description === 'Time entry' && (!row.description || row.description === '')))
            )
            console.log(`Found ${entriesToDelete.length} entries to delete for date ${date}`)
            entriesToDelete.forEach(entry => onDelete(entry.id))
          }
        })
      }
      
      const weekEntries = {}
      const weekStart = new Date(selectedDate)
      weekStart.setDate(selectedDate.getDate() - selectedDate.getDay())
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart)
        date.setDate(weekStart.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        weekEntries[dateStr] = { duration: '' }
      }
      
      setLocalGridRows(prev => prev.map(row => {
        if (row.id === id) {
          return {
            ...row,
            projectId: '',
            description: '',
            weekEntries,
            status: 'draft',
            isNew: false
          }
        }
        return row
      }))
    }
  }

  const removeRow = (id) => {
    const confirmed = confirm('Are you sure you want to completely remove this row? This action cannot be undone.')
    
    if (confirmed) {
      const row = localGridRows.find(r => r.id === id)
      
      if (row) {
        console.log(`Removing row ${id} - Project: ${row.projectId}, Description: ${row.description}`)
        Object.keys(row.weekEntries).forEach(date => {
          const dayEntry = row.weekEntries[date]
          if (dayEntry.duration && dayEntry.duration !== '') {
            const entriesToDelete = entries.filter((entry) => 
              entry.date === date &&
              (entry.projectId === row.projectId || 
               (entry.description === row.description && row.description !== '') ||
               (entry.description === 'Time entry' && (!row.description || row.description === '')))
            )
            console.log(`Found ${entriesToDelete.length} entries to delete for date ${date}`)
            entriesToDelete.forEach(entry => onDelete(entry.id))
          }
        })
      }
      
      setLocalGridRows(prev => prev.filter(r => r.id !== id))
    }
  }

  const saveRow = (row) => {
    console.log(`saveRow called for row ${row.id}`)
    
    Object.entries(row.weekEntries).forEach(([date, dayEntry]) => {
      if (dayEntry.duration && dayEntry.duration !== '') {
        const durationMinutes = hhmmToMinutes(dayEntry.duration)
        if (durationMinutes > 0) {
          const entryData = {
            projectId: row.projectId,
            startTime: '09:00',
            endTime: '17:00',
            duration: dayEntry.duration,
            description: row.description || 'Time entry',
            status: row.status
          }

          console.log(`Saving entry for row ${row.id}, date ${date}:`, entryData)

          if (row.isNew) {
            onSave(entryData)
          } else {
            onUpdate(row.id, entryData)
          }
        }
      }
    })

    setLocalGridRows(prev => prev.map(r => 
      r.id === row.id ? { ...r, isNew: false } : r
    ))
  }

  const updateRow = (id, field, value) => {
    setLocalGridRows(prev => prev.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value }
        
        if (field === 'description' || field === 'projectId') {
          if (saveTimeoutRef.current[id]) {
            clearTimeout(saveTimeoutRef.current[id])
          }
          
          saveTimeoutRef.current[id] = setTimeout(() => {
            saveRow(updatedRow)
          }, 1000)
        }
        
        return updatedRow
      }
      return row
    }))
  }

  const updateDayEntry = (id, date, duration, isOnChange = true) => {
    const formattedDuration = validateAndFormatTimeInput(duration, isOnChange)
    
    console.log(`updateDayEntry called:`, { id, date, duration, formattedDuration, isOnChange })
    
    setLocalGridRows(prev => prev.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row }
        if (!updatedRow.weekEntries[date]) {
          updatedRow.weekEntries[date] = { duration: '' }
        }
        
        updatedRow.weekEntries[date].duration = formattedDuration
        
        if (formattedDuration && formattedDuration !== '') {
          const debounceKey = `${id}-${date}`
          if (saveTimeoutRef.current[debounceKey]) {
            clearTimeout(saveTimeoutRef.current[debounceKey])
          }
          
          saveTimeoutRef.current[debounceKey] = setTimeout(() => {
            console.log(`Debounced auto-save for row ${id}, date ${date}, duration ${formattedDuration}`)
            setPendingAutoSaves(prev => [...prev, {
              id,
              date,
              duration: formattedDuration,
              isNew: row.isNew,
              projectId: row.projectId,
              description: row.description
            }])
          }, 2000)
        }
        
        return updatedRow
      }
      return row
    }))

    if (!isOnChange && formattedDuration && formattedDuration !== '') {
      console.log(`Queuing auto-save for row ${id}, date ${date}, duration ${formattedDuration}, isOnChange: ${isOnChange}`)
      setTimeout(() => {
        setLocalGridRows(currentGridRows => {
          const currentRow = currentGridRows.find(row => row.id === id)
          if (currentRow) {
            console.log(`Adding to pending auto-saves:`, { id, date, duration: formattedDuration, isNew: currentRow.isNew })
            setPendingAutoSaves(prev => [...prev, {
              id,
              date,
              duration: formattedDuration,
              isNew: currentRow.isNew,
              projectId: currentRow.projectId,
              description: currentRow.description
            }])
          } else {
            console.log(`Row ${id} not found when queuing auto-save`)
          }
          return currentGridRows
        })
      }, 0)
    }
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const minutesToHHMM = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const hhmmToMinutes = (hhmm) => {
    if (!hhmm || hhmm === '') return 0
    const [hours, minutes] = hhmm.split(':').map(Number)
    if (isNaN(hours) || isNaN(minutes)) return 0
    return hours * 60 + minutes
  }

  const getProjectName = (projectId) => {
    if (!projectId) return 'No Project'
    const project = projects.find(p => p.id === projectId)
    return project?.name || 'Unknown Project'
  }

  const selectProject = (rowId, projectId) => {
    updateRow(rowId, 'projectId', projectId)
  }

  const getTotalMinutesForWeek = () => {
    const totalMinutes = localGridRows.reduce((total, row) => {
      const rowTotal = Object.values(row.weekEntries).reduce((dayTotal, dayEntry) => 
        dayTotal + hhmmToMinutes(dayEntry.duration), 0
      )
      return total + rowTotal
    }, 0)
    return totalMinutes
  }

  const getDailyTotal = (date) => {
    const totalMinutes = localGridRows.reduce((total, row) => {
      const dayEntry = row.weekEntries[date]
      return total + (dayEntry ? hhmmToMinutes(dayEntry.duration) : 0)
    }, 0)
    return totalMinutes
  }

  const formatMinutesToHHMM = (minutes) => {
    if (minutes <= 0) return ''
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const formatDateForDisplay = (date) => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${month}/${day}/${year}`
  }

  const getWeekdayShort = (date) => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return weekdays[date.getDay()]
  }

  const validateAndFormatTimeInput = (value, isOnChange = true) => {
    if (value === '') return ''
    
    let cleaned = value.replace(/[^0-9:]/g, '')
    
    const colonIndex = cleaned.indexOf(':')
    if (colonIndex !== -1) {
      const beforeColon = cleaned.slice(0, colonIndex)
      const afterColon = cleaned.slice(colonIndex + 1).replace(/:/g, '')
      cleaned = beforeColon + ':' + afterColon
    }
    
    if (isOnChange) {
      return cleaned
    }
    
    if (!cleaned.includes(':')) {
      if (cleaned.length === 1) {
        cleaned = cleaned + ':00'
      } else if (cleaned.length === 2) {
        cleaned = cleaned + ':00'
      } else if (cleaned.length === 3) {
        cleaned = cleaned.slice(0, 1) + ':' + cleaned.slice(1)
      } else if (cleaned.length === 4) {
        const hours = parseInt(cleaned.slice(0, 2))
        const minutes = parseInt(cleaned.slice(2, 4))
        
        if (hours > 23) {
          cleaned = '23:59'
        } else if (minutes > 59) {
          cleaned = hours.toString().padStart(2, '0') + ':59'
        } else {
          cleaned = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0')
        }
      } else if (cleaned.length >= 5) {
        const hours = parseInt(cleaned.slice(0, -2))
        const minutes = parseInt(cleaned.slice(-2))
        
        if (hours > 23) {
          cleaned = '23:59'
        } else if (minutes > 59) {
          cleaned = hours.toString().padStart(2, '0') + ':59'
        } else {
          cleaned = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0')
        }
      }
    }
    
    if (cleaned.includes(':')) {
      const parts = cleaned.split(':')
      if (parts.length === 2) {
        let hours = parseInt(parts[0]) || 0
        let minutes = parseInt(parts[1]) || 0
        
        if (minutes > 59) {
          minutes = 59
        }
        
        if (hours > 23) {
          hours = 23
          minutes = 59
        }
        
        cleaned = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0')
      }
    }
    
    return cleaned
  }

  const formatTimeOnBlur = (value) => {
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
              <span>Week:</span>
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
              {localGridRows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="relative">
                      <select
                        value={row.projectId || ''}
                        onChange={(e) => selectProject(row.id, e.target.value)}
                        className="w-full h-10 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md appearance-none cursor-pointer"
                      >
                        <option value="">Select Project</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
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
                            } else if (formattedValue && formattedValue !== '') {
                              updateDayEntry(row.id, dateStr, formattedValue, false)
                            }
                          }}
                          onKeyDown={(e) => {
                            const allowedKeys = [
                              'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                              'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
                            ]
                            
                            const isNumber = e.key >= '0' && e.key <= '9'
                            const isColon = e.key === ':'
                            const isCtrlKey = e.ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())
                            
                            if (!isNumber && !isColon && !allowedKeys.includes(e.key) && !isCtrlKey) {
                              e.preventDefault()
                            }
                          }}
                          className="w-full px-2 py-2 border border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 text-center h-10"
                          placeholder="hh:mm"
                          title="Enter time in hh:mm format (e.g., 8, 12). Maximum time is 23:59."
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
              onClick={() => {
                const wasIncluded = includeSaturday
                setIncludeSaturday(!includeSaturday)
                if (wasIncluded) {
                  console.log('Saturday removed - cells will be cleared')
                }
              }}
              className="flex items-center gap-2"
              title={includeSaturday ? "Remove Saturday (will clear all Saturday entries)" : "Add Saturday"}
            >
              <Calendar className="h-4 w-4" />
              {includeSaturday ? "Remove Sat" : "Add Saturday"}
            </Button>
            
            <Button
              variant={includeSunday ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const wasIncluded = includeSunday
                setIncludeSunday(!includeSunday)
                if (wasIncluded) {
                  console.log('Sunday removed - cells will be cleared')
                }
              }}
              className="flex items-center gap-2"
              title={includeSunday ? "Remove Sunday (will clear all Sunday entries)" : "Add Sunday"}
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
    </Card>
  )
}