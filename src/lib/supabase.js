import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to handle Supabase errors
export const handleSupabaseError = (error, operation = 'operation') => {
  console.error(`Supabase ${operation} error:`, error)
  return {
    success: false,
    error: error.message || `Failed to perform ${operation}`,
    data: null
  }
}

// Helper function to handle successful responses
export const handleSupabaseSuccess = (data, operation = 'operation') => {
  return {
    success: true,
    error: null,
    data
  }
}

// Company-related helper functions
export const fetchCompaniesWithStats = async () => {
  try {
    const { data, error } = await supabase.rpc('get_companies_with_stats')
    
    if (error) {
      return handleSupabaseError(error, 'fetch companies with stats')
    }
    
    return handleSupabaseSuccess(data, 'fetch companies with stats')
  } catch (error) {
    return handleSupabaseError(error, 'fetch companies with stats')
  }
}

export const fetchAllEmployeesDetailed = async () => {
  try {
    const { data, error } = await supabase.rpc('get_all_employees_detailed')
    
    if (error) {
      return handleSupabaseError(error, 'fetch all employees detailed')
    }
    
    return handleSupabaseSuccess(data, 'fetch all employees detailed')
  } catch (error) {
    return handleSupabaseError(error, 'fetch all employees detailed')
  }
}

export const createCompany = async (companyData) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert([{
        name: companyData.name,
        description: companyData.description,
        status: companyData.status || 'active'
      }])
      .select()
    
    if (error) {
      return handleSupabaseError(error, 'create company')
    }
    
    return handleSupabaseSuccess(data, 'create company')
  } catch (error) {
    return handleSupabaseError(error, 'create company')
  }
}

export const updateCompany = async (companyId, updatedData) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update({
        name: updatedData.name,
        description: updatedData.description,
        status: updatedData.status
      })
      .eq('id', companyId)
      .select()
    
    if (error) {
      return handleSupabaseError(error, 'update company')
    }
    
    return handleSupabaseSuccess(data, 'update company')
  } catch (error) {
    return handleSupabaseError(error, 'update company')
  }
}

export const deleteCompany = async (companyId) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId)
    
    if (error) {
      return handleSupabaseError(error, 'delete company')
    }
    
    return handleSupabaseSuccess(data, 'delete company')
  } catch (error) {
    return handleSupabaseError(error, 'delete company')
  }
}

export const fetchCompanyDetails = async (companyId) => {
  try {
    // Fetch departments for the company
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('*')
      .eq('company_id', companyId)
    
    if (deptError) {
      return handleSupabaseError(deptError, 'fetch company departments')
    }
    
    // Fetch locations for the company
    const { data: locations, error: locError } = await supabase
      .from('locations')
      .select('*')
      .eq('company_id', companyId)
    
    if (locError) {
      return handleSupabaseError(locError, 'fetch company locations')
    }
    
    return handleSupabaseSuccess({ departments, locations }, 'fetch company details')
  } catch (error) {
    return handleSupabaseError(error, 'fetch company details')
  }
}
