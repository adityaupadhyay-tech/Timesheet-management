'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { TimeEntry, Project, TimeTrackingState, Company } from '@/types'

interface TimesheetContextType {
  entries: TimeEntry[]
  projects: Project[]
  companies: Company[]
  selectedCompany: Company | null
  trackingState: TimeTrackingState
  addEntry: (entry: Omit<TimeEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  updateEntry: (id: string, updates: Partial<TimeEntry>) => void
  deleteEntry: (id: string) => void
  setSelectedCompany: (company: Company | null) => void
  startTimer: () => void
  stopTimer: () => void
  submitTimesheet: () => void
  getCurrentTime: () => string
}

const TimesheetContext = createContext<TimesheetContextType | undefined>(undefined)

// Mock data for development
const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    description: 'Leading technology solutions provider',
    color: '#3B82F6',
    isActive: true
  },
  {
    id: '2',
    name: 'Design Studio Inc',
    description: 'Creative design and branding agency',
    color: '#10B981',
    isActive: true
  },
  {
    id: '3',
    name: 'Consulting Partners',
    description: 'Business consulting and advisory services',
    color: '#F59E0B',
    isActive: true
  }
]

const mockProjects: Project[] = [
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

const mockEntries: TimeEntry[] = [
  {
    id: '1',
    userId: 'user1',
    projectId: '1',
    date: '2024-01-15',
    startTime: '09:00',
    endTime: '12:00',
    duration: 180,
    description: 'Worked on homepage layout and responsive design',
    status: 'approved',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    companyId: '1'
  },
  {
    id: '2',
    userId: 'user1',
    projectId: '1',
    date: '2024-01-15',
    startTime: '13:00',
    endTime: '17:00',
    duration: 240,
    description: 'Implemented user authentication system',
    status: 'approved',
    createdAt: '2024-01-15T13:00:00Z',
    updatedAt: '2024-01-15T17:00:00Z',
    companyId: '1'
  },
  {
    id: '3',
    userId: 'user1',
    projectId: '2',
    date: '2024-01-16',
    startTime: '09:00',
    endTime: '11:30',
    duration: 150,
    description: 'Set up React Native project structure',
    status: 'submitted',
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T11:30:00Z',
    companyId: '1'
  },
  {
    id: '4',
    userId: 'user1',
    projectId: '4',
    date: '2024-01-17',
    startTime: '10:00',
    endTime: '15:00',
    duration: 300,
    description: 'Created brand guidelines and color palette',
    status: 'approved',
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T15:00:00Z',
    companyId: '2'
  },
  {
    id: '5',
    userId: 'user1',
    projectId: '6',
    date: '2024-01-18',
    startTime: '09:00',
    endTime: '12:00',
    duration: 180,
    description: 'Analyzed current business processes and workflows',
    status: 'submitted',
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: '2024-01-18T12:00:00Z',
    companyId: '3'
  }
]

export function TimesheetProvider({ children }: { children: ReactNode }) {
  const [allEntries, setAllEntries] = useState<TimeEntry[]>(mockEntries)
  const [allProjects] = useState<Project[]>(mockProjects)
  const [companies] = useState<Company[]>(mockCompanies)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(mockCompanies[0])
  const [trackingState, setTrackingState] = useState<TimeTrackingState>({
    isTracking: false,
    elapsedTime: 0
  })

  // Filter entries and projects based on selected company
  const entries = selectedCompany 
    ? allEntries.filter(entry => entry.companyId === selectedCompany.id)
    : allEntries
  
  const projects = selectedCompany
    ? allProjects.filter(project => project.companyId === selectedCompany.id)
    : allProjects

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout

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

  const addEntry = (entryData: Omit<TimeEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newEntry: TimeEntry = {
      ...entryData,
      id: Date.now().toString(),
      userId: 'user1', // TODO: Get from auth context
      companyId: selectedCompany?.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setAllEntries(prev => [...prev, newEntry])
  }

  const updateEntry = (id: string, updates: Partial<TimeEntry>) => {
    setAllEntries(prev => prev.map(entry => 
      entry.id === id 
        ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
        : entry
    ))
  }

  const deleteEntry = (id: string) => {
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

  const value: TimesheetContextType = {
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
