'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  entries: TimeEntry[] // Company-specific entries only
  gridRows?: GridRow[] // Grid rows from parent to persist across tab switches
  onSave: (entry: Omit<TimeEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  onUpdate: (id: string, entry: Omit<TimeEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  onDelete: (id: string) => void
  onStartTimer: () => void
  onStopTimer: () => void
  isTracking: boolean
  currentTime?: string
  onSelectedDateChange?: (date: Date) => void
  onGridDataChange?: (gridRows: GridRow[]) => void // Add callback to pass grid data
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
  gridRows: parentGridRows = [],
  onSave,
  onUpdate,
  onDelete,
  onStartTimer,
  onStopTimer,
  isTracking,
  currentTime,
  onSelectedDateChange,
  onGridDataChange
}: TimeEntryGridProps) {
  const [gridRows, setGridRows] = useState<GridRow[]>(parentGridRows)
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date()
  })

  // Sync local gridRows with parent gridRows when component mounts or parent changes
  useEffect(() => {
    if (parentGridRows && parentGridRows.length > 0) {
      setGridRows(parentGridRows)
    }
  }, [parentGridRows])
  const [includeSaturday, setIncludeSaturday] = useState(false)
  const [includeSunday, setIncludeSunday] = useState(false)
  
  // Clear Saturday and Sunday cells when those days are removed
  useEffect(() => {
    console.log('Weekend clearing effect triggered:', { includeSaturday, includeSunday, selectedDate })
    
    // Calculate the actual date strings for Saturday and Sunday
    const weekStart = new Date(selectedDate)
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay())
    
    const saturdayDate = new Date(weekStart)
    saturdayDate.setDate(weekStart.getDate() + 6)
    const saturdayDateStr = saturdayDate.toISOString().split('T')[0]
    
    const sundayDate = new Date(weekStart)
    const sundayDateStr = sundayDate.toISOString().split('T')[0]
    
    console.log('Calculated dates:', { saturdayDateStr, sundayDateStr })
    
    // Clear grid rows for removed days
    setGridRows(prevRows => {
      return prevRows.map(row => {
        const updatedRow = { ...row }
        const updatedWeekEntries = { ...updatedRow.weekEntries }
        
        // Clear Saturday if not included
        if (!includeSaturday && updatedWeekEntries[saturdayDateStr]) {
          console.log(`Clearing Saturday (${saturdayDateStr}) for row ${row.id}:`, updatedWeekEntries[saturdayDateStr])
          updatedWeekEntries[saturdayDateStr] = { duration: '' }
        }
        
        // Clear Sunday if not included
        if (!includeSunday && updatedWeekEntries[sundayDateStr]) {
          console.log(`Clearing Sunday (${sundayDateStr}) for row ${row.id}:`, updatedWeekEntries[sundayDateStr])
          updatedWeekEntries[sundayDateStr] = { duration: '' }
        }
        
        return {
          ...updatedRow,
          weekEntries: updatedWeekEntries
        }
      })
    })
    
    // Clear pending auto-saves for removed days
    setPendingAutoSaves(prevSaves => {
      return prevSaves.filter(save => {
        const saveDate = new Date(save.date)
        const dayOfWeek = saveDate.getDay()
        
        // Keep saves for days that are still included
        if (dayOfWeek === 6 && !includeSaturday) return false // Remove Saturday saves
        if (dayOfWeek === 0 && !includeSunday) return false // Remove Sunday saves
        
        return true
      })
    })
  }, [includeSaturday, includeSunday, selectedDate])
  const saveTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({})
  const lastWeekRef = useRef<string>('')
  const lastEntriesRef = useRef<TimeEntry[]>([])
  const [pendingAutoSaves, setPendingAutoSaves] = useState<Array<{
    id: string
    date: string
    duration: string
    isNew: boolean
    projectId?: string
    description?: string
  }>>([])
  const [isAutoSaving, setIsAutoSaving] = useState(false)

  // Clear grid only when company changes (not when entries are added/updated)
  useEffect(() => {
    // Only clear grid if we have entries but no grid rows (indicating a company switch)
    // or if the entries array is completely different (different company)
    const hasEntries = entries && entries.length > 0
    const hasGridRows = gridRows && gridRows.length > 0
    const isCompanySwitch = hasEntries && !hasGridRows
    
    if (isCompanySwitch) {
      console.log('Company switch detected - clearing grid rows', {
        entriesCount: entries.length,
        gridRowsCount: gridRows.length
      })
      setGridRows([])
      setPendingAutoSaves([])
      lastWeekRef.current = ''
      lastEntriesRef.current = entries
    }
  }, [entries, gridRows]) // Only trigger when entries change and grid is empty

  // Initialize grid with existing entries when needed
  const initializeGridWithEntries = () => {
    if (!entries || entries.length === 0 || gridRows.length > 0) return

    const startOfWeek = new Date(selectedDate)
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    // Filter entries for the selected week
    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= startOfWeek && entryDate <= endOfWeek
    })

    if (weekEntries.length === 0) return

    // Group entries by project and description
    const groupedEntries: { [key: string]: TimeEntry[] } = {}
    weekEntries.forEach(entry => {
      const key = `${entry.projectId || 'no-project'}-${entry.description || 'no-description'}`
      if (!groupedEntries[key]) {
        groupedEntries[key] = []
      }
      groupedEntries[key].push(entry)
    })

    // Create grid rows from grouped entries
    const newGridRows: GridRow[] = Object.entries(groupedEntries).map(([key, entries]) => {
      const weekEntries: { [day: string]: { duration: string } } = {}
      
      // Initialize all days of the week
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]
        weekEntries[dateStr] = {
          duration: ''
        }
      }

      // Fill in the actual entries
      entries.forEach(entry => {
        const dateStr = entry.date
        const hours = Math.floor(entry.duration / 60)
        const minutes = entry.duration % 60
        const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        
        weekEntries[dateStr] = {
          duration
        }
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

    setGridRows(newGridRows)
    console.log('Initialized grid with existing entries:', newGridRows.length, 'rows')
  }

  // Initialize grid only when component mounts or when selectedDate changes (not when entries change)
  useEffect(() => {
    // Only initialize if grid is empty and we have entries
    if (gridRows.length === 0 && entries && entries.length > 0) {
      initializeGridWithEntries()
    }
  }, [selectedDate]) // Only trigger when selectedDate changes, not when entries change

  // Handle company switches by clearing grid and reinitializing
  useEffect(() => {
    // Check if this is a company switch by comparing entry counts
    const isCompanySwitch = entries.length !== lastEntriesRef.current.length && 
                           entries.length > 0 && 
                           lastEntriesRef.current.length > 0
    
    if (isCompanySwitch) {
      console.log('Company switch detected - clearing and reinitializing grid', {
        previousEntries: lastEntriesRef.current.length,
        currentEntries: entries.length
      })
      setGridRows([])
      setPendingAutoSaves([])
      lastWeekRef.current = ''
      lastEntriesRef.current = entries
      
      // Reinitialize with new company's entries
      setTimeout(() => {
        initializeGridWithEntries()
      }, 0)
    }
  }, [entries]) // Only trigger when entries change

  // Notify parent when selectedDate changes
  useEffect(() => {
    if (onSelectedDateChange) {
      onSelectedDateChange(selectedDate)
    }
  }, [selectedDate, onSelectedDateChange])

  // Notify parent when gridRows change
  useEffect(() => {
    if (onGridDataChange) {
      onGridDataChange(gridRows)
    }
  }, [gridRows, onGridDataChange])

  // Handle pending auto-saves
  useEffect(() => {
    if (pendingAutoSaves.length > 0) {
      console.log('Processing pending auto-saves:', pendingAutoSaves)
      console.log('Current entries count:', entries.length)
      setIsAutoSaving(true)
      pendingAutoSaves.forEach(({ id, date, duration, isNew, projectId, description }) => {
        const durationMinutes = hhmmToMinutes(duration)
        
        // Handle empty values - delete existing entry if it exists
        if (durationMinutes === 0 || duration === '' || duration === '0:00') {
          // Find and delete existing entry for this date and project
          const existingEntry = entries.find(entry => 
            entry.date === date && 
            entry.projectId === (projectId || undefined) &&
            entry.description === (description || 'Time entry')
          )
          
          if (existingEntry) {
            console.log(`Deleting entry for row ${id}, date ${date}:`, existingEntry.id)
            onDelete(existingEntry.id)
          }
          return // Skip the rest of the processing for empty values
        }
        
        if (durationMinutes > 0) {
          const entryData = {
            projectId: projectId || undefined,
            date,
            startTime: '09:00',
            endTime: '17:00',
            duration: durationMinutes,
            description: description || 'Time entry',
            status: 'draft' as const
          }

            // Check if there's already an existing entry for this specific date and project
            const existingEntry = entries.find(entry => 
              entry.date === date && 
              entry.projectId === entryData.projectId &&
              entry.description === entryData.description
            )

            const shouldCreateNew = isNew && !existingEntry
            const shouldUpdate = existingEntry || !isNew

            console.log(`Auto-saving entry for row ${id}:`, {
              isNew,
              existingEntry: existingEntry?.id,
              shouldCreateNew,
              shouldUpdate,
              entryData,
              entriesCount: entries.length
            })

            if (shouldCreateNew) {
              onSave(entryData)
            } else if (shouldUpdate && existingEntry) {
              onUpdate(existingEntry.id, entryData)
            } else if (shouldUpdate) {
              // Fallback: if we can't find existing entry but row is not new, try to save as new
              onSave(entryData)
            }
        }
      })
      setPendingAutoSaves([])
      setIsAutoSaving(false)
    }
  }, [pendingAutoSaves, entries, onSave, onUpdate, onDelete])

  // Initialize grid with current week's entries grouped by project/task
  useEffect(() => {
    console.log('Grid initialization effect triggered - entries:', entries.length, 'selectedDate:', selectedDate, 'isAutoSaving:', isAutoSaving)
    
    // Skip reinitialization if we're in the middle of auto-saving
    if (isAutoSaving) {
      console.log('Skipping grid reinitialization - auto-saving in progress')
      return
    }
    
    // Calculate the start of the week (Sunday) for the selected date
    const weekStart = new Date(selectedDate)
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay())
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    
    const currentWeekKey = weekStart.toISOString().split('T')[0]
    
    // Only reinitialize if we're actually changing weeks or if grid is empty
    setGridRows(prevRows => {
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

      console.log('Grid reinitialized with rows:', rows.length, rows.map(r => ({ id: r.id, isNew: r.isNew, projectId: r.projectId, description: r.description })))
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
      const row = gridRows.find(r => r.id === id)
      
      if (row) {
        // Delete all entries that were created from this row
        console.log(`Clearing row ${id} - Project: ${row.projectId}, Description: ${row.description}`)
        Object.keys(row.weekEntries).forEach(date => {
          const dayEntry = row.weekEntries[date]
          if (dayEntry.duration && dayEntry.duration !== '') {
            // Find and delete the corresponding entry from context
            // Use more flexible matching since projectId and description might have changed
            const entriesToDelete = entries.filter((entry: TimeEntry) => 
              entry.date === date &&
              (entry.projectId === row.projectId || 
               (entry.description === row.description && row.description !== '') ||
               (entry.description === 'Time entry' && (!row.description || row.description === '')))
            )
            console.log(`Found ${entriesToDelete.length} entries to delete for date ${date}`, {
              rowProjectId: row.projectId,
              rowDescription: row.description,
              matchingEntries: entriesToDelete.map((e: TimeEntry) => ({ id: e.id, projectId: e.projectId, description: e.description }))
            })
            entriesToDelete.forEach(entry => onDelete(entry.id))
          }
        })
      }
      
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
      const row = gridRows.find(r => r.id === id)
      
      if (row) {
        // Delete all entries that were created from this row
        console.log(`Removing row ${id} - Project: ${row.projectId}, Description: ${row.description}`)
        Object.keys(row.weekEntries).forEach(date => {
          const dayEntry = row.weekEntries[date]
          if (dayEntry.duration && dayEntry.duration !== '') {
            // Find and delete the corresponding entry from context
            // Use more flexible matching since projectId and description might have changed
            const entriesToDelete = entries.filter((entry: TimeEntry) => 
              entry.date === date &&
              (entry.projectId === row.projectId || 
               (entry.description === row.description && row.description !== '') ||
               (entry.description === 'Time entry' && (!row.description || row.description === '')))
            )
            console.log(`Found ${entriesToDelete.length} entries to delete for date ${date}`, {
              rowProjectId: row.projectId,
              rowDescription: row.description,
              matchingEntries: entriesToDelete.map((e: TimeEntry) => ({ id: e.id, projectId: e.projectId, description: e.description }))
            })
            entriesToDelete.forEach(entry => onDelete(entry.id))
          }
        })
      }
      
      // Remove the row completely - no minimum row constraint
      setGridRows(prev => prev.filter(r => r.id !== id))
    }
  }

  const saveRow = (row: GridRow) => {
    console.log(`saveRow called for row ${row.id}:`, {
      description: row.description,
      weekEntries: row.weekEntries,
      isNew: row.isNew
    })
    
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
            description: row.description || 'Time entry', // Use default description if none provided
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
            saveRow(updatedRow)
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
    
    console.log(`updateDayEntry called:`, { id, date, duration, formattedDuration, isOnChange })
    
    setGridRows(prev => prev.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row }
        if (!updatedRow.weekEntries[date]) {
          updatedRow.weekEntries[date] = { duration: '' }
        }
        
        updatedRow.weekEntries[date].duration = formattedDuration
        
        // Queue individual day entry auto-save with debouncing for real-time updates
        if (formattedDuration && formattedDuration !== '') {
          const debounceKey = `${id}-${date}`
          if (saveTimeoutRef.current[debounceKey]) {
            clearTimeout(saveTimeoutRef.current[debounceKey])
          }
          
          saveTimeoutRef.current[debounceKey] = setTimeout(() => {
            console.log(`Debounced auto-save for row ${id}, date ${date}, duration ${formattedDuration}`)
            // Use the current row data from the closure instead of accessing gridRows state
            setPendingAutoSaves(prev => [...prev, {
              id,
              date,
              duration: formattedDuration,
              isNew: updatedRow.isNew,
              projectId: updatedRow.projectId,
              description: updatedRow.description
            }])
          }, 2000) // 2 second debounce for real-time updates
        }
        
        return updatedRow
      }
      return row
    }))

    // Queue auto-save for real-time updates
    // Only queue on blur (when user finishes editing) to avoid too frequent saves
    if (!isOnChange && formattedDuration && formattedDuration !== '') {
      console.log(`Queuing auto-save for row ${id}, date ${date}, duration ${formattedDuration}, isOnChange: ${isOnChange}`)
      // Use setTimeout to ensure we get the updated state after the setGridRows has been processed
      setTimeout(() => {
        setGridRows(currentGridRows => {
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
          return currentGridRows // Return unchanged
        })
      }, 0)
    }
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

  const selectProject = (rowId: string, projectId: string) => {
    updateRow(rowId, 'projectId', projectId)
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
    
    // During typing (onChange), just return the cleaned input without conversion
    if (isOnChange) {
      return cleaned
    }
    
    // Only auto-format on blur (Enter/Tab), not during typing
    if (!cleaned.includes(':')) {
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
        // Four digits: "1212" -> "12:12"
        const hours = parseInt(cleaned.slice(0, 2))
        const minutes = parseInt(cleaned.slice(2, 4))
        
        // Validate and format
        if (hours > 23) {
          cleaned = '23:59'
        } else if (minutes > 59) {
          cleaned = hours.toString().padStart(2, '0') + ':59'
        } else {
          cleaned = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0')
        }
      } else if (cleaned.length >= 5) {
        // Five or more digits: "12305" -> "12:05" (last 2 as minutes)
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
    
    // Always validate and limit the formatted input
    if (cleaned.includes(':')) {
      const parts = cleaned.split(':')
      if (parts.length === 2) {
        let hours = parseInt(parts[0]) || 0
        let minutes = parseInt(parts[1]) || 0
        
        // Cap minutes at 59
        if (minutes > 59) {
          minutes = 59
        }
        
        // Cap hours at 23 (prevent exceeding 23:59)
        if (hours > 23) {
          hours = 23
          minutes = 59
        }
        
        // Format with leading zeros
        cleaned = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0')
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
                              // Even if the value didn't change, trigger auto-save on blur
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
                            
                            // Only prevent non-numeric, non-colon, non-allowed keys
                            if (!isNumber && !isColon && !allowedKeys.includes(e.key) && !isCtrlKey) {
                              e.preventDefault()
                            }
                          }}
                          className="w-full px-2 py-2 border border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 text-center h-10"
                          placeholder="hh:mm"
                          title="Enter time in hh:mm format (e.g., 8:30, 12:45). Maximum time is 23:59."
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
