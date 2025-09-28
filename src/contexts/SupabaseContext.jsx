'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseHelpers } from '@/lib/supabase'

const SupabaseContext = createContext({})

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

export const SupabaseProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    session,
    loading,
    supabase,
    helpers: supabaseHelpers,
    
    // Convenience methods
    signUp: supabaseHelpers.auth.signUp,
    signIn: supabaseHelpers.auth.signIn,
    signOut: supabaseHelpers.auth.signOut,
    
    // Database operations
    select: supabaseHelpers.db.select,
    insert: supabaseHelpers.db.insert,
    update: supabaseHelpers.db.update,
    delete: supabaseHelpers.db.delete,
    
    // Real-time subscriptions
    subscribe: supabaseHelpers.subscribe,
    unsubscribe: supabaseHelpers.unsubscribe
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}
