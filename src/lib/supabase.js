import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper functions for common operations
export const supabaseHelpers = {
  // Authentication helpers
  auth: {
    signUp: async (email, password, metadata = {}) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      return { data, error }
    },

    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { data, error }
    },

    signOut: async () => {
      const { error } = await supabase.auth.signOut()
      return { error }
    },

    getCurrentUser: async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      return { user, error }
    },

    onAuthStateChange: (callback) => {
      return supabase.auth.onAuthStateChange(callback)
    }
  },

  // Database helpers
  db: {
    // Generic CRUD operations
    select: async (table, columns = '*', filters = {}) => {
      let query = supabase.from(table).select(columns)
      
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
      
      const { data, error } = await query
      return { data, error }
    },

    insert: async (table, data) => {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
      return { data: result, error }
    },

    update: async (table, id, updates) => {
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
      return { data, error }
    },

    delete: async (table, id) => {
      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
      return { data, error }
    }
  },

  // Real-time subscriptions
  subscribe: (table, callback, filters = {}) => {
    let channel = supabase
      .channel(`${table}_changes`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: table,
          ...filters
        }, 
        callback
      )
      .subscribe()
    
    return channel
  },

  // Unsubscribe from real-time updates
  unsubscribe: (channel) => {
    return supabase.removeChannel(channel)
  }
}

export default supabase
