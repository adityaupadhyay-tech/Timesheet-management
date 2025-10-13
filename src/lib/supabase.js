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

// Paycode-related helper functions
export const fetchPaycodesForCompany = async (companyId, paycodeType) => {
  try {
    const { data, error } = await supabase.rpc('get_paycodes_for_company', {
      selected_company_id: companyId,
      selected_type: paycodeType
    })
    
    if (error) {
      return handleSupabaseError(error, 'fetch paycodes for company')
    }
    
    return handleSupabaseSuccess(data, 'fetch paycodes for company')
  } catch (error) {
    return handleSupabaseError(error, 'fetch paycodes for company')
  }
}

export const savePaycodeConfiguration = async (companyId, paycodeStates) => {
  try {
    // Build records to upsert
    const recordsToUpsert = paycodeStates.map(pc => ({
      company_id: companyId,
      paycode_id: pc.paycode_id,
      is_enabled: pc.is_enabled
    }))

    const { data, error } = await supabase
      .from('company_paycodes')
      .upsert(recordsToUpsert, {
        onConflict: 'company_id,paycode_id'
      })
      .select()
    
    if (error) {
      return handleSupabaseError(error, 'save paycode configuration')
    }
    
    return handleSupabaseSuccess(data, 'save paycode configuration')
  } catch (error) {
    return handleSupabaseError(error, 'save paycode configuration')
  }
}

export const updateAutoRestrictNewCodes = async (companyId, autoRestrict) => {
  try {
    // This updates the auto_restrict_new setting for all paycodes of a company
    // You might want to store this as a company-level setting instead
    const { data, error } = await supabase
      .from('company_paycodes')
      .update({ auto_restrict_new: autoRestrict })
      .eq('company_id', companyId)
      .select()
    
    if (error) {
      return handleSupabaseError(error, 'update auto-restrict setting')
    }
    
    return handleSupabaseSuccess(data, 'update auto-restrict setting')
  } catch (error) {
    return handleSupabaseError(error, 'update auto-restrict setting')
  }
}

export const createGlobalPaycode = async (paycodeData) => {
  try {
    // This creates a new paycode in the MASTER paycodes table
    // The paycode will be available to all companies but NOT automatically assigned
    // Companies must explicitly enable it via the company_paycodes table
    const { data, error } = await supabase
      .from('paycodes')
      .insert([{
        code: paycodeData.code,
        name: paycodeData.name,
        description: paycodeData.description,
        type: paycodeData.type
      }])
      .select()
    
    if (error) {
      return handleSupabaseError(error, 'create global paycode')
    }
    
    return handleSupabaseSuccess(data, 'create global paycode')
  } catch (error) {
    return handleSupabaseError(error, 'create global paycode')
  }
}