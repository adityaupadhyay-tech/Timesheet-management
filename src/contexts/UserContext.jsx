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
    role: 'admin',
    email: 'john.doe@company.com'
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
