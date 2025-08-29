'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { TimeEntry, Project, TimeTrackingState } from '@/types'

interface TimesheetContextType {
  entries: TimeEntry[]
  projects: Project[]
  trackingState: TimeTrackingState
  addEntry: (entry: Omit<TimeEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
  updateEntry: (id: string, updates: Partial<TimeEntry>) => void
  deleteEntry: (id: string) => void
  startTimer: () => void
  stopTimer: () => void
  submitTimesheet: () => void
  getCurrentTime: () => string
}

const TimesheetContext = createContext<TimesheetContextType | undefined>(undefined)

// Mock data for development
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Redesigning the company website',
    startDate: '2024-01-01',
    status: 'active',
    color: '#3B82F6'
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Building a new mobile application',
    startDate: '2024-01-15',
    status: 'active',
    color: '#10B981'
  },
  {
    id: '3',
    name: 'Database Migration',
    description: 'Migrating to new database system',
    startDate: '2024-02-01',
    status: 'on-hold',
    color: '#F59E0B'
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
    updatedAt: '2024-01-15T12:00:00Z'
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
    updatedAt: '2024-01-15T17:00:00Z'
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
    updatedAt: '2024-01-16T11:30:00Z'
  }
]

export function TimesheetProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<TimeEntry[]>(mockEntries)
  const [projects] = useState<Project[]>(mockProjects)
  const [trackingState, setTrackingState] = useState<TimeTrackingState>({
    isTracking: false,
    elapsedTime: 0
  })

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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setEntries(prev => [...prev, newEntry])
  }

  const updateEntry = (id: string, updates: Partial<TimeEntry>) => {
    setEntries(prev => prev.map(entry => 
      entry.id === id 
        ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
        : entry
    ))
  }

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id))
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
    trackingState,
    addEntry,
    updateEntry,
    deleteEntry,
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
