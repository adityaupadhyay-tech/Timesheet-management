'use client'

import { createContext, useContext, useState, ReactNode, memo } from 'react'
import { UserRole } from '@/types'

interface User {
  name: string
  role: UserRole
  email: string
}

interface UserContextType {
  user: User
  setUser: (user: User) => void
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider = memo(function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User>({
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
