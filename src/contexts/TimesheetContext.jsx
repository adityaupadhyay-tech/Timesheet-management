'use client'

import { createContext, useContext, useState, useEffect } from 'react'

/**
 * @typedef {Object} TimesheetContextType
 * @property {TimeEntry[]} entries
 * @property {Project[]} projects
 * @property {Company[]} companies
 * @property {Company | null} selectedCompany
 * @property {TimeTrackingState} trackingState
 * @property {function(TimeEntry): void} addEntry
 * @property {function(string, Partial): void} updateEntry
 * @property {function(string): void} deleteEntry
 * @property {function(Company | null): void} setSelectedCompany
 * @property {function(): void} startTimer
 * @property {function(): void} stopTimer
 * @property {function(): void} submitTimesheet
 * @property {function(): string} getCurrentTime
 */

const TimesheetContext = createContext(undefined)

// Mock data for development
const mockCompanies = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    color: '#3B82F6',
    isActive: true
  },
  {
    id: '2',
    name: 'Design Studio Inc',
    color: '#10B981',
    isActive: true
  },
  {
    id: '3',
    name: 'Consulting Partners',
    color: '#F59E0B',
    isActive: true
  }
]

const mockProjects = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Redesigning the company website',
    startDate: '2024-01-01',
    status: 'active',
    color: '#3B82F6',
    companyId: '1'
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Building a new mobile application',
    startDate: '2024-01-15',
    status: 'active',
    color: '#10B981',
    companyId: '1'
  },
  {
    id: '3',
    name: 'Database Migration',
    description: 'Migrating to new database system',
    startDate: '2024-02-01',
    status: 'on-hold',
    color: '#F59E0B',
    companyId: '1'
  },
  {
    id: '4',
    name: 'Brand Identity Design',
    description: 'Creating new brand identity and guidelines',
    startDate: '2024-01-10',
    status: 'active',
    color: '#8B5CF6',
    companyId: '2'
  },
  {
    id: '5',
    name: 'Logo Redesign',
    description: 'Modernizing company logo and visual assets',
    startDate: '2024-01-20',
    status: 'completed',
    color: '#EF4444',
    companyId: '2'
  },
  {
    id: '6',
    name: 'Business Strategy Review',
    description: 'Comprehensive business strategy analysis',
    startDate: '2024-01-05',
    status: 'active',
    color: '#06B6D4',
    companyId: '3'
  }
]

// Empty mock entries - no default data
const mockEntries = []

/**
 * @typedef {Object} TimesheetProviderProps
 * @property {React.ReactNode} children
 */
export function TimesheetProvider({ children }) {
  const [allEntries, setAllEntries] = useState(mockEntries)
  const [allProjects] = useState(mockProjects)
  const [companies] = useState(mockCompanies)
  const [selectedCompany, setSelectedCompany] = useState(mockCompanies[0])
  const [trackingState, setTrackingState] = useState({
    isTracking: false,
    elapsedTime: 0
  })

  // Filter entries and projects based on selected company (company is required)
  const entries = selectedCompany 
    ? allEntries.filter(entry => entry.companyId === selectedCompany.id)
    : []
  
  const projects = selectedCompany
    ? allProjects.filter(project => project.companyId === selectedCompany.id)
    : []

  console.log('TimesheetContext - Company-specific data:', {
    selectedCompany: selectedCompany?.name,
    companyId: selectedCompany?.id,
    entriesCount: entries.length,
    projectsCount: projects.length
  })

  // Timer effect
  useEffect(() => {
    let interval

    if (trackingState.isTracking) {
      interval = setInterval(() => {
        setTrackingState(prev => ({
          ...prev,
          elapsedTime: prev.elapsedTime + 1
        }))
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [trackingState.isTracking])

  const addEntry = (entryData) => {
    if (!selectedCompany) {
      console.error('Cannot add entry: No company selected')
      return
    }

    const newEntry = {
      ...entryData,
      id: Date.now().toString(),
      userId: 'user1', // TODO: Get from auth context
      companyId: selectedCompany.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    console.log('TimesheetContext - addEntry called:', { entryData, newEntry, selectedCompany })
    setAllEntries(prev => {
      const updated = [...prev, newEntry]
      console.log('TimesheetContext - allEntries updated:', updated.length, 'entries')
      return updated
    })
  }

  const updateEntry = (id, updates) => {
    if (!selectedCompany) {
      console.error('Cannot update entry: No company selected')
      return
    }

    console.log('TimesheetContext - updateEntry called:', { id, updates, selectedCompany })
    setAllEntries(prev => {
      const updated = prev.map(entry => 
        entry.id === id 
          ? { ...entry, ...updates, companyId: selectedCompany.id, updatedAt: new Date().toISOString() }
          : entry
      )
      console.log('TimesheetContext - allEntries updated:', updated.length, 'entries')
      return updated
    })
  }

  const deleteEntry = (id) => {
    setAllEntries(prev => prev.filter(entry => entry.id !== id))
  }

  const startTimer = () => {
    setTrackingState({
      isTracking: true,
      startTime: new Date(),
      elapsedTime: 0
    })
  }

  const stopTimer = () => {
    setTrackingState({
      isTracking: false,
      elapsedTime: 0
    })
  }

  const submitTimesheet = () => {
    // TODO: Implement timesheet submission logic
    console.log('Submitting timesheet...')
  }

  const getCurrentTime = () => {
    const hours = Math.floor(trackingState.elapsedTime / 3600)
    const minutes = Math.floor((trackingState.elapsedTime % 3600) / 60)
    const seconds = trackingState.elapsedTime % 60

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const value = {
    entries,
    projects,
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
  }

  return (
    <TimesheetContext.Provider value={value}>
      {children}
    </TimesheetContext.Provider>
  )
}

export function useTimesheet() {
  const context = useContext(TimesheetContext)
  if (context === undefined) {
    throw new Error('useTimesheet must be used within a TimesheetProvider')
  }
  return context
}
