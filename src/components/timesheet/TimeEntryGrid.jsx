'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from 'lucide-react'
import { 
  getCycleStartDate, 
  getCycleEndDate, 
  getCycleDates, 
  getGridDates,
  formatCyclePeriod, 
  getCycleTitle,
  getNextCycle,
  getPreviousCycle
} from '@/lib/cycleUtils'

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
  onGridDataChange,
  selectedCompany,
  timesheet,
  onSubmitTimesheet,
  onApproveTimesheet,
  onRejectTimesheet,
  validationTrigger,
  userRole = 'employee'
}) {
  const [localGridRows, setLocalGridRows] = useState([])
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [includeSaturday, setIncludeSaturday] = useState(false)
  const [includeSunday, setIncludeSunday] = useState(false)
  const [pendingAutoSaves, setPendingAutoSaves] = useState([])
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  
  // Get cycle information from selected company
  const cycleType = selectedCompany?.timesheetCycle || 'weekly'
  const cycleTitle = getCycleTitle(cycleType)
  const cyclePeriod = formatCyclePeriod(selectedDate, cycleType)
  
  // Get timesheet status and check if locked for editing
  const timesheetStatus = timesheet?.status || 'draft'
  const isTimesheetLocked = timesheetStatus === 'submitted' || timesheetStatus === 'approved'
  
  const saveTimeoutRef = useRef({})
  const lastWeekRef = useRef('')
  const lastEntriesRef = useRef([])
  const isInternalUpdateRef = useRef(false)

  // Memoize gridRows to prevent unnecessary re-renders
  const memoizedGridRows = useMemo(() => gridRows, [gridRows?.length, gridRows?.[0]?.id])
  
  // Sync local gridRows with parent gridRows when component mounts or parent changes
  useEffect(() => {
    if (memoizedGridRows && memoizedGridRows.length > 0 && !isInternalUpdateRef.current) {
      setLocalGridRows(memoizedGridRows)
    }
    isInternalUpdateRef.current = false
  }, [memoizedGridRows])

  // Clear Saturday and Sunday cells when those days are removed
  useEffect(() => {
    
    const weekStart = new Date(selectedDate)
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay())
    
    const saturdayDate = new Date(weekStart)
    saturdayDate.setDate(weekStart.getDate() + 6)
    const saturdayDateStr = saturdayDate.toISOString().split('T')[0]
    
    const sundayDate = new Date(weekStart)
    const sundayDateStr = sundayDate.toISOString().split('T')[0]
    
    isInternalUpdateRef.current = true
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
    
    if (isAutoSaving) {
      return
    }
    
    const weekStart = new Date(selectedDate)
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay())
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    
    const currentWeekKey = weekStart.toISOString().split('T')[0]
    
    setLocalGridRows(prevRows => {
      
      if (lastWeekRef.current === currentWeekKey && prevRows.length > 0) {
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

  const getCycleDays = () => {
    // Use getGridDates which handles monthly as weekly structure
    const gridDates = getGridDates(selectedDate, cycleType)
    
    // For daily cycle, return just the selected date
    if (cycleType === 'daily') {
      return [selectedDate]
    }
    
    // For weekly, bi-weekly, and monthly (which uses weekly structure), filter out weekends unless explicitly included
    if (cycleType === 'weekly' || cycleType === 'bi-weekly' || cycleType === 'monthly') {
      return gridDates.filter(date => {
        const dayOfWeek = date.getDay()
        if (dayOfWeek >= 1 && dayOfWeek <= 5) return true // Monday to Friday
        if (dayOfWeek === 6 && includeSaturday) return true // Saturday
        if (dayOfWeek === 0 && includeSunday) return true // Sunday
        return false
      })
    }
    
    return gridDates
  }

  const addNewRow = () => {
    const cycleEntries = {}
    const cycleDays = getCycleDays()
    
    cycleDays.forEach(date => {
      const dateStr = date.toISOString().split('T')[0]
      cycleEntries[dateStr] = { duration: '' }
    })
    
    const newRow = {
      id: `new-${Date.now()}`,
      projectId: '',
      description: '',
      weekEntries: cycleEntries, // Keep the same property name for compatibility
      status: 'draft',
      isNew: true
    }
    setLocalGridRows(prev => [...prev, newRow])
  }

  const clearRow = (id) => {
    if (confirm('Are you sure you want to clear this record? This will remove all data from this row.')) {
      const row = localGridRows.find(r => r.id === id)
      
      if (row) {
        Object.keys(row.weekEntries).forEach(date => {
          const dayEntry = row.weekEntries[date]
          if (dayEntry.duration && dayEntry.duration !== '') {
            const entriesToDelete = entries.filter((entry) => 
              entry.date === date &&
              (entry.projectId === row.projectId || 
               (entry.description === row.description && row.description !== '') ||
               (entry.description === 'Time entry' && (!row.description || row.description === '')))
            )
            entriesToDelete.forEach(entry => onDelete(entry.id))
          }
        })
      }
      
      const cycleEntries = {}
      const cycleDays = getCycleDays()
      
      cycleDays.forEach(date => {
        const dateStr = date.toISOString().split('T')[0]
        cycleEntries[dateStr] = { duration: '' }
      })
      
      setLocalGridRows(prev => prev.map(row => {
        if (row.id === id) {
          return {
            ...row,
            projectId: '',
            description: '',
            weekEntries: cycleEntries,
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
        Object.keys(row.weekEntries).forEach(date => {
          const dayEntry = row.weekEntries[date]
          if (dayEntry.duration && dayEntry.duration !== '') {
            const entriesToDelete = entries.filter((entry) => 
              entry.date === date &&
              (entry.projectId === row.projectId || 
               (entry.description === row.description && row.description !== '') ||
               (entry.description === 'Time entry' && (!row.description || row.description === '')))
            )
            entriesToDelete.forEach(entry => onDelete(entry.id))
          }
        })
      }
      
      setLocalGridRows(prev => prev.filter(r => r.id !== id))
    }
  }

  const saveRow = (row) => {
    
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
      setTimeout(() => {
        setLocalGridRows(currentGridRows => {
          const currentRow = currentGridRows.find(row => row.id === id)
          if (currentRow) {
            setPendingAutoSaves(prev => [...prev, {
              id,
              date,
              duration: formattedDuration,
              isNew: currentRow.isNew,
              projectId: currentRow.projectId,
              description: currentRow.description
            }])
          } else {
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

  // Cycle navigation functions
  const navigateCycle = (direction) => {
    const newDate = direction === 'next' 
      ? getNextCycle(selectedDate, cycleType)
      : getPreviousCycle(selectedDate, cycleType)
    setSelectedDate(newDate)
  }

  // Status helper functions
  const getStatusConfig = (status) => {
    switch (status) {
      case 'draft':
        return {
          icon: Clock,
          color: 'text-amber-600',
          bgColor: 'bg-amber-100',
          borderColor: 'border-amber-200',
          label: 'In Progress',
          indicatorColor: 'bg-gradient-to-r from-amber-400 to-orange-400', // Vibrant amber gradient
          indicatorText: 'In Progress'
        }
      case 'submitted':
        return {
          icon: Send,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200',
          label: 'Under Review',
          indicatorColor: 'bg-gradient-to-r from-blue-400 to-cyan-400', // Vibrant blue gradient
          indicatorText: 'Under Review'
        }
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-100',
          borderColor: 'border-emerald-200',
          label: 'Approved',
          indicatorColor: 'bg-gradient-to-r from-emerald-400 to-green-400', // Vibrant green gradient
          indicatorText: 'Approved'
        }
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-rose-600',
          bgColor: 'bg-rose-100',
          borderColor: 'border-rose-200',
          label: 'Needs Revision',
          indicatorColor: 'bg-gradient-to-r from-rose-400 to-red-400', // Vibrant red gradient
          indicatorText: 'Needs Revision'
        }
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200',
          label: 'Unknown',
          indicatorColor: 'bg-gray-400',
          indicatorText: 'Unknown'
        }
    }
  }

  const handleReject = () => {
    if (rejectionReason.trim() && onRejectTimesheet) {
      onRejectTimesheet(rejectionReason)
      setRejectionReason('')
      setShowRejectModal(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const cycleDays = getCycleDays()

  // Validation functions
  const validateRow = (row) => {
    const errors = {}
    
    if (!row.projectId || row.projectId === '') {
      errors.projectId = 'Project selection is required'
    }
    
    if (!row.description || row.description.trim() === '') {
      errors.description = 'Task description cannot be blank'
    }
    
    return errors
  }

  const validateAllRows = () => {
    const allErrors = {}
    let hasErrors = false
    
    localGridRows.forEach((row, index) => {
      const rowErrors = validateRow(row)
      if (Object.keys(rowErrors).length > 0) {
        allErrors[row.id] = rowErrors
        hasErrors = true
      }
    })
    
    setValidationErrors(allErrors)
    return !hasErrors
  }

  const clearRowValidation = (rowId) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[rowId]
      return newErrors
    })
  }

  const getRowValidationError = (rowId, field) => {
    return validationErrors[rowId]?.[field] || null
  }

  // Trigger validation when parent requests it
  useEffect(() => {
    if (validationTrigger > 0) {
      validateAllRows()
    }
  }, [validationTrigger])

  return (
    <Card className="w-full border-0 shadow-sm bg-white/50 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Title Section */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{cycleTitle} Time Entry Grid</CardTitle>
                {/* Enhanced Status Indicator */}
                {timesheet && (
                  <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-3 h-3 rounded-full ${getStatusConfig(timesheetStatus).indicatorColor} shadow-sm animate-pulse`}
                        title={`Status: ${getStatusConfig(timesheetStatus).indicatorText}`}
                      ></div>
                      <span className={`text-xs font-semibold ${getStatusConfig(timesheetStatus).color}`}>
                        {getStatusConfig(timesheetStatus).indicatorText}
                      </span>
                    </div>
                    {getStatusConfig(timesheetStatus).icon && (
                      <div className={`p-1 rounded-full ${getStatusConfig(timesheetStatus).bgColor}`}>
                        {(() => {
                          const IconComponent = getStatusConfig(timesheetStatus).icon
                          return <IconComponent className={`h-3 w-3 ${getStatusConfig(timesheetStatus).color}`} />
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* <p className="text-gray-600 text-xs sm:text-sm">
                Select project, add description, then enter time in hh:mm format for each day
                <span className="ml-2 text-xs text-blue-600 font-medium">
                  ({cycleType === 'semi-monthly' ? 'Twice per month' : cycleType === 'weekly' ? '7 days' : cycleType === 'bi-weekly' ? '14 days' : 'Monthly view'})
                </span>
              </p> */}
            </div>
          </div>
          
          {/* Date and Cycle Controls - Right side on desktop, below title on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 lg:flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">
                Date:
              </label>
              <DatePickerComponent
                value={selectedDate}
                onChange={setSelectedDate}
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateCycle('prev')}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs sm:text-sm font-medium text-gray-800 min-w-[120px] sm:min-w-[200px] text-center truncate">
                {cyclePeriod}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateCycle('next')}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Manager Actions - Only show for submitted timesheets */}
        {timesheet && timesheetStatus === 'submitted' && userRole === 'manager' && (
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
            <Button
              onClick={onApproveTimesheet}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 shadow-sm transition-all duration-200 w-full sm:w-auto"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
            <Button
              onClick={() => setShowRejectModal(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-amber-600 border-amber-200 hover:bg-amber-50 hover:border-amber-300 shadow-sm transition-all duration-200 w-full sm:w-auto"
            >
              <XCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Request Revision</span>
              <span className="sm:hidden">Request Revision</span>
            </Button>
          </div>
        )}
        
        {/* Revision feedback - only show if rejected */}
        {timesheet && timesheetStatus === 'rejected' && timesheet.rejectionReason && (
          <div className="mt-2 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-amber-100 rounded-full">
                <MessageSquare className="h-3 w-3 text-amber-600" />
              </div>
              <div>
                <span className="font-semibold text-amber-800 text-xs">Revision Notes: </span>
                <span className="text-amber-700 text-xs block mt-1">{timesheet.rejectionReason}</span>
              </div>
            </div>
          </div>
        )}
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
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 w-1/4 min-w-[150px] sm:min-w-[200px]">Project</th>
                <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-700 w-1/3 min-w-[180px] sm:min-w-[250px]">Description</th>
                {cycleDays.map((day) => (
                  <th key={day.toISOString()} className="text-center py-2 px-1 font-medium text-gray-700 w-16 sm:w-20 min-w-[60px] sm:min-w-[80px]">
                    <div className="text-xs text-gray-500 mb-1">
                      {getWeekdayShort(day)}
                    </div>
                    <div className="text-sm">
                      {day.getDate()}
                    </div>
                  </th>
                ))}
                <th className="text-left py-3 px-2 font-medium text-gray-700 w-16 sm:w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {localGridRows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-2 sm:px-4">
                    <div className="relative">
                      <select
                        value={row.projectId || ''}
                        onChange={(e) => {
                          selectProject(row.id, e.target.value)
                          clearRowValidation(row.id)
                        }}
                        disabled={isTimesheetLocked}
                        className={`w-full h-10 px-2 sm:px-3 py-2 text-xs sm:text-sm border rounded-lg focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md appearance-none ${
                          getRowValidationError(row.id, 'projectId')
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50'
                            : isTimesheetLocked 
                              ? 'bg-gray-100 cursor-not-allowed opacity-60 border-gray-200' 
                              : 'bg-white hover:bg-gray-50 cursor-pointer border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                        }`}
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
                    {getRowValidationError(row.id, 'projectId') && (
                      <div className="mt-1 flex items-center gap-1">
                        <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                        <span className="text-xs text-red-600 font-medium">
                          {getRowValidationError(row.id, 'projectId')}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-2 sm:px-4">
                    <div>
                      <textarea
                        value={row.description}
                        onChange={(e) => {
                          updateRow(row.id, 'description', e.target.value)
                          clearRowValidation(row.id)
                        }}
                        placeholder="Enter description..."
                        disabled={isTimesheetLocked}
                        className={`w-full px-2 sm:px-3 py-2 border rounded text-xs sm:text-sm focus:ring-2 min-h-[40px] resize-y transition-all duration-200 ${
                          getRowValidationError(row.id, 'description')
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50'
                            : isTimesheetLocked 
                              ? 'bg-gray-100 cursor-not-allowed opacity-60 border-gray-200' 
                              : 'cursor-text border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                        }`}
                        rows={2}
                      />
                      {getRowValidationError(row.id, 'description') && (
                        <div className="mt-1 flex items-center gap-1">
                          <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                          <span className="text-xs text-red-600 font-medium">
                            {getRowValidationError(row.id, 'description')}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  {cycleDays.map((day) => {
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
                          disabled={isTimesheetLocked}
                          className={`w-full px-1 sm:px-2 py-2 border border-gray-200 rounded text-xs sm:text-sm focus:border-blue-500 focus:ring-blue-500 text-center h-8 sm:h-10 ${
                            isTimesheetLocked 
                              ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                              : ''
                          }`}
                          placeholder="hh:mm"
                          title={isTimesheetLocked ? "Timesheet is locked for editing" : "Enter time in hh:mm format (e.g., 8, 12). Maximum time is 23:59."}
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
                        disabled={isTimesheetLocked}
                        className={`h-8 w-8 p-0 ${
                          isTimesheetLocked 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:bg-orange-50'
                        }`}
                        title={isTimesheetLocked ? "Timesheet is locked for editing" : "Clear Record"}
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRow(row.id)}
                        disabled={isTimesheetLocked}
                        className={`h-8 w-8 p-0 ${
                          isTimesheetLocked 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:bg-red-50'
                        }`}
                        title={isTimesheetLocked ? "Timesheet is locked for editing" : "Remove Row"}
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
                {cycleDays.map((day) => {
                  const dateStr = day.toISOString().split('T')[0]
                  const dailyTotalMinutes = getDailyTotal(dateStr)
                  const formattedTotal = formatMinutesToHHMM(dailyTotalMinutes)
                  
                  return (
                    <td key={dateStr} className="py-4 px-1 text-center">
                      <div className="font-semibold text-blue-600 text-xs sm:text-sm">
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={addNewRow}
              disabled={isTimesheetLocked}
              className={`flex items-center gap-2 ${
                isTimesheetLocked 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
              title={isTimesheetLocked ? "Timesheet is locked for editing" : "Add New Entry"}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add New Entry</span>
              <span className="sm:hidden">Add Entry</span>
            </Button>
          </div>
          
          {/* Weekend Toggle Buttons - Show for weekly, bi-weekly, and monthly cycles */}
          {(cycleType === 'weekly' || cycleType === 'bi-weekly' || cycleType === 'monthly') && (
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={includeSaturday ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const wasIncluded = includeSaturday
                  setIncludeSaturday(!includeSaturday)
                  if (wasIncluded) {
                  }
                }}
                className="flex items-center gap-2"
                title={includeSaturday ? "Remove Saturday (will clear all Saturday entries)" : "Add Saturday"}
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {includeSaturday ? "Remove Sat" : "Add Saturday"}
                </span>
                <span className="sm:hidden">
                  {includeSaturday ? "No Sat" : "Add Sat"}
                </span>
              </Button>
              
              <Button
                variant={includeSunday ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const wasIncluded = includeSunday
                  setIncludeSunday(!includeSunday)
                  if (wasIncluded) {
                  }
                }}
                className="flex items-center gap-2"
                title={includeSunday ? "Remove Sunday (will clear all Sunday entries)" : "Add Sunday"}
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {includeSunday ? "Remove Sun" : "Add Sunday"}
                </span>
                <span className="sm:hidden">
                  {includeSunday ? "No Sun" : "Add Sun"}
                </span>
              </Button>
            </div>
          )}
        </div>

        {/* Cycle Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-semibold text-gray-900">{cycleTitle} Total</span>
              <p className="text-sm text-gray-600">All time entries for this {cycleType === 'daily' ? 'day' : cycleType === 'monthly' ? 'month' : cycleType === 'bi-weekly' ? 'bi-week period' : 'week'}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-indigo-600">
                {formatMinutesToHHMM(getTotalMinutesForWeek()) || '00:00'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Revision Request Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Request Revision</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What needs to be revised?
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide specific feedback on what needs to be changed..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setShowRejectModal(false)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                className="bg-orange-600 hover:bg-orange-700"
                size="sm"
                disabled={!rejectionReason.trim()}
              >
                Request Revision
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}