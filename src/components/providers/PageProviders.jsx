"use client";

import { UserProvider } from '@/contexts/UserContext'
import { CompaniesProvider } from '@/contexts/CompaniesContext'

/**
 * Wrapper for pages that need UserProvider and CompaniesProvider
 * Load only when needed instead of globally
 */
export function AdminPageProviders({ children }) {
  return (
    <UserProvider>
      <CompaniesProvider>
        {children}
      </CompaniesProvider>
    </UserProvider>
  )
}

/**
 * Wrapper for pages that only need UserProvider
 */
export function UserPageProviders({ children }) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  )
}

