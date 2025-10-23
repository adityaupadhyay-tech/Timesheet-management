'use client'

import { createContext, useContext, useState, memo } from 'react'

/**
 * @typedef {Object} User
 * @property {string} name
 * @property {UserRole} role
 * @property {string} email
 */

/**
 * @typedef {Object} UserContextType
 * @property {User} user
 * @property {function(User): void} setUser
 * @property {boolean} isLoading
 */

const UserContext = createContext(undefined)

/**
 * @typedef {Object} UserProviderProps
 * @property {React.ReactNode} children
 */

export const UserProvider = memo(function UserProvider({ children }) {
  const [user, setUser] = useState({
    name: 'John Doe',
    role: 'Employee', // Change to 'Admin', 'Manager', or 'Employee' to test different roles
    email: 'john.doe@company.com',
    company: {
      id: 'company-1',
      name: 'Acme Corporation',
      description: 'A modern software company',
      logo: '',
      color: '#3B82F6',
      isActive: true,
      timesheetCycle: 'weekly' // Default to weekly, can be changed during company setup
    }
  })
  const [isLoading] = useState(false)

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  )
})

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
