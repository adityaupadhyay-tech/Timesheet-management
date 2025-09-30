import { supabase, handleSupabaseError, handleSupabaseSuccess } from './supabase'

// Company-related helper functions
export const getCompaniesWithStats = async () => {
  try {
    const { data, error } = await supabase.rpc('get_companies_with_stats')
    
    if (error) {
      return handleSupabaseError(error, 'fetching companies with stats')
    }
    
    return handleSupabaseSuccess(data, 'fetching companies with stats')
  } catch (error) {
    return handleSupabaseError(error, 'fetching companies with stats')
  }
}

export const getCompaniesForDashboard = async () => {
  try {
    // First try the RPC function
    const { data, error } = await supabase.rpc('get_companies_for_dashboard')
    
    if (error) {
      console.log('RPC function failed, falling back to regular query:', error)
      // Fallback to regular query if RPC function doesn't exist
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          name as company_name,
          description,
          status,
          city,
          state,
          postal_code,
          created_at
        `)
        .order('created_at', { ascending: false })
      
      if (fallbackError) {
        return handleSupabaseError(fallbackError, 'fetching companies for dashboard (fallback)')
      }
      
      return handleSupabaseSuccess(fallbackData, 'fetching companies for dashboard (fallback)')
    }
    
    return handleSupabaseSuccess(data, 'fetching companies for dashboard')
  } catch (error) {
    return handleSupabaseError(error, 'fetching companies for dashboard')
  }
}

export const getAllEmployeesDetailed = async () => {
  try {
    const { data, error } = await supabase.rpc('get_all_employees_detailed')
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching all employees detailed:', error)
    return { data: null, error: error.message }
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
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating company:', error)
    return { data: null, error: error.message }
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
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating company:', error)
    return { data: null, error: error.message }
  }
}

export const deleteCompany = async (companyId) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId)
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error deleting company:', error)
    return { data: null, error: error.message }
  }
}

export const getCompanyDetails = async (companyId) => {
  try {
    // Fetch departments for the company
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('*')
      .eq('company_id', companyId)
    
    if (deptError) throw deptError
    
    // Fetch locations for the company
    const { data: locations, error: locError } = await supabase
      .from('locations')
      .select('*')
      .eq('company_id', companyId)
    
    if (locError) throw locError
    
    return { data: { departments, locations }, error: null }
  } catch (error) {
    console.error('Error fetching company details:', error)
    return { data: null, error: error.message }
  }
}

export const fetchCompanyWithDetails = async (companyId) => {
  try {
    console.log('Fetching company details for ID:', companyId)
    
    // Check if Supabase is properly configured
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }
    
    // Step 1: Get employee IDs linked to this company
    const { data: employeeLinks, error: employeeLinksError } = await supabase
      .from('employee_companies')
      .select('employee_id')
      .eq('company_id', companyId)
    
    if (employeeLinksError) {
      console.error('Error fetching employee links:', employeeLinksError)
    }
    
    const employeeIds = employeeLinks ? employeeLinks.map(link => link.employee_id) : []
    console.log('Employee IDs for company:', employeeIds)
    
    // Step 2: Fetch company, locations, departments, and employees
    const fetchPromises = [
      supabase.from('companies').select('*').eq('id', companyId).single(),
      supabase.from('locations').select('*').eq('company_id', companyId),
      supabase.from('departments').select('*').eq('company_id', companyId)
    ]
    
    // Only fetch employees if we have employee IDs
    if (employeeIds.length > 0) {
      fetchPromises.push(
        supabase.from('employees').select('id, first_name, last_name, email').in('id', employeeIds)
      )
    } else {
      // Add a resolved promise with empty employees data
      fetchPromises.push(Promise.resolve({ data: [], error: null }))
    }
    
    const [
      companyRes,
      locationsRes,
      departmentsRes,
      employeesRes
    ] = await Promise.all(fetchPromises)

    console.log('Query results:', {
      company: companyRes,
      locations: locationsRes,
      departments: departmentsRes,
      employees: employeesRes
    })

    // Check for errors in each response
    if (companyRes.error) {
      console.error('Company query error:', companyRes.error)
      return handleSupabaseError(companyRes.error, 'fetching company details')
    }
    if (locationsRes.error) {
      console.error('Locations query error:', locationsRes.error)
      return handleSupabaseError(locationsRes.error, 'fetching company locations')
    }
    if (departmentsRes.error) {
      console.error('Departments query error:', departmentsRes.error)
      return handleSupabaseError(departmentsRes.error, 'fetching company departments')
    }
    if (employeesRes.error) {
      console.error('Employees query error:', employeesRes.error)
      return handleSupabaseError(employeesRes.error, 'fetching company employees')
    }

    const result = {
      company: companyRes.data,
      locations: locationsRes.data || [],
      departments: departmentsRes.data || [],
      employees: employeesRes.data || []
    }

    console.log('Returning company details:', result)
    return handleSupabaseSuccess(result, 'fetching company with details')
  } catch (error) {
    console.error('Error fetching company with details:', error)
    return handleSupabaseError(error, 'fetching company with details')
  }
}

export const addLocationForCompany = async (locationData, companyId) => {
  try {
    // Remove manager_id from location data since it's now handled separately
    const { manager_ids, ...cleanedLocationData } = locationData
    cleanedLocationData.company_id = companyId
    
    console.log('Adding location with data:', cleanedLocationData)
    
    const { data, error } = await supabase
      .from('locations')
      .insert([cleanedLocationData])
      .select()
    
    if (error) throw error
    
    // If managers were selected, add them to the location_managers table
    if (manager_ids && manager_ids.length > 0 && data && data[0]) {
      const locationId = data[0].id
      await addManagersToLocation(locationId, manager_ids)
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error adding location:', error)
    return { data: null, error: error.message }
  }
}

export const addDepartmentForCompany = async (departmentData, companyId) => {
  try {
    // Remove manager_id from department data since it's now handled separately
    const { manager_ids, ...cleanedDepartmentData } = departmentData
    cleanedDepartmentData.company_id = companyId
    
    console.log('Adding department with data:', cleanedDepartmentData)
    
    const { data, error } = await supabase
      .from('departments')
      .insert([cleanedDepartmentData])
      .select()
      
    if (error) throw error
    
    // If managers were selected, add them to the department_managers table
    if (manager_ids && manager_ids.length > 0 && data && data[0]) {
      const departmentId = data[0].id
      await addManagersToDepartment(departmentId, manager_ids)
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error adding department:', error)
    return { data: null, error: error.message }
  }
}

// Manager management functions for locations
export const getManagersForLocation = async (locationId) => {
  try {
    const { data, error } = await supabase
      .from('location_managers')
      .select(`
        employee_id,
        employees ( id, first_name, last_name, email )
      `)
      .eq('location_id', locationId)

    if (error) throw error
    return { data: data ? data.map(item => item.employees) : [], error: null }
  } catch (error) {
    console.error('Error fetching location managers:', error)
    return { data: [], error: error.message }
  }
}

export const addManagerToLocation = async (locationId, employeeId) => {
  try {
    const { error } = await supabase
      .from('location_managers')
      .insert({
        location_id: locationId,
        employee_id: employeeId
      })
    
    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error adding manager to location:', error)
    return { success: false, error: error.message }
  }
}

export const removeManagerFromLocation = async (locationId, employeeId) => {
  try {
    const { error } = await supabase
      .from('location_managers')
      .delete()
      .eq('location_id', locationId)
      .eq('employee_id', employeeId)
    
    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error removing manager from location:', error)
    return { success: false, error: error.message }
  }
}

export const addManagersToLocation = async (locationId, employeeIds) => {
  try {
    const insertData = employeeIds.map(employeeId => ({
      location_id: locationId,
      employee_id: employeeId
    }))
    
    const { error } = await supabase
      .from('location_managers')
      .insert(insertData)
    
    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error adding managers to location:', error)
    return { success: false, error: error.message }
  }
}

// Manager management functions for departments
export const getManagersForDepartment = async (departmentId) => {
  try {
    const { data, error } = await supabase
      .from('department_managers')
      .select(`
        employee_id,
        employees ( id, first_name, last_name, email )
      `)
      .eq('department_id', departmentId)

    if (error) throw error
    return { data: data ? data.map(item => item.employees) : [], error: null }
  } catch (error) {
    console.error('Error fetching department managers:', error)
    return { data: [], error: error.message }
  }
}

export const addManagerToDepartment = async (departmentId, employeeId) => {
  try {
    const { error } = await supabase
      .from('department_managers')
      .insert({
        department_id: departmentId,
        employee_id: employeeId
      })
    
    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error adding manager to department:', error)
    return { success: false, error: error.message }
  }
}

export const removeManagerFromDepartment = async (departmentId, employeeId) => {
  try {
    const { error } = await supabase
      .from('department_managers')
      .delete()
      .eq('department_id', departmentId)
      .eq('employee_id', employeeId)
    
    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error removing manager from department:', error)
    return { success: false, error: error.message }
  }
}

export const addManagersToDepartment = async (departmentId, employeeIds) => {
  try {
    const insertData = employeeIds.map(employeeId => ({
      department_id: departmentId,
      employee_id: employeeId
    }))
    
    const { error } = await supabase
      .from('department_managers')
      .insert(insertData)
    
    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error adding managers to department:', error)
    return { success: false, error: error.message }
  }
}

// Update functions for locations and departments
export const updateLocation = async (locationId, updatedData) => {
  try {
    console.log('Updating location with data:', updatedData)
    
    // Remove manager_ids from location data since it's handled separately
    const { manager_ids, ...cleanedLocationData } = updatedData
    
    const { data, error } = await supabase
      .from('locations')
      .update(cleanedLocationData)
      .eq('id', locationId)
      .select()
    
    if (error) throw error
    
    // If managers were updated, handle the manager assignments
    if (manager_ids !== undefined) {
      // First, remove all existing managers for this location
      await supabase
        .from('location_managers')
        .delete()
        .eq('location_id', locationId)
      
      // Then add the new managers if any
      if (manager_ids.length > 0) {
        await addManagersToLocation(locationId, manager_ids)
      }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error updating location:', error)
    return { data: null, error: error.message }
  }
}

export const updateDepartment = async (departmentId, updatedData) => {
  try {
    console.log('Updating department with data:', updatedData)
    
    // Remove manager_ids from department data since it's handled separately
    const { manager_ids, ...cleanedDepartmentData } = updatedData
    
    const { data, error } = await supabase
      .from('departments')
      .update(cleanedDepartmentData)
      .eq('id', departmentId)
      .select()
    
    if (error) throw error
    
    // If managers were updated, handle the manager assignments
    if (manager_ids !== undefined) {
      // First, remove all existing managers for this department
      await supabase
        .from('department_managers')
        .delete()
        .eq('department_id', departmentId)
      
      // Then add the new managers if any
      if (manager_ids.length > 0) {
        await addManagersToDepartment(departmentId, manager_ids)
      }
    }
    
    return { data, error: null }
  } catch (error) {
    console.error('Error updating department:', error)
    return { data: null, error: error.message }
  }
}

// Location management functions
export const createLocation = async (locationData) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .insert([locationData])
      .select()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating location:', error)
    return { data: null, error: error.message }
  }
}

// Department management functions
export const createDepartment = async (departmentData) => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .insert([departmentData])
      .select('*')
      .single()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating department:', error)
    return { data: null, error: error.message }
  }
}

export const getDepartments = async () => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name')
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching departments:', error)
    return { data: [], error: error.message }
  }
}

// Job role management functions
export const createJobRole = async (jobRoleData) => {
  try {
    const { data, error } = await supabase
      .from('job_roles')
      .insert([jobRoleData])
      .select()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating job role:', error)
    return { data: null, error: error.message }
  }
}

export const updateJobRole = async (jobRoleId, updatedData) => {
  try {
    const { data, error } = await supabase
      .from('job_roles')
      .update(updatedData)
      .eq('id', jobRoleId)
      .select()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating job role:', error)
    return { data: null, error: error.message }
  }
}

export const deleteJobRole = async (jobRoleId) => {
  try {
    const { data, error } = await supabase
      .from('job_roles')
      .delete()
      .eq('id', jobRoleId)
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error deleting job role:', error)
    return { data: null, error: error.message }
  }
}

// Employee management functions
export const createEmployee = async (employeeData) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert([employeeData])
      .select()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating employee:', error)
    return { data: null, error: error.message }
  }
}

export const updateEmployee = async (employeeId, updatedData) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .update(updatedData)
      .eq('id', employeeId)
      .select()
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating employee:', error)
    return { data: null, error: error.message }
  }
}

export const deleteEmployee = async (employeeId) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .delete()
      .eq('id', employeeId)
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error deleting employee:', error)
    return { data: null, error: error.message }
  }
}

// Search and filter functions
export const searchCompanies = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error searching companies:', error)
    return { data: null, error: error.message }
  }
}

export const searchEmployees = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        companies(name),
        departments(name),
        job_roles(title),
        locations(name)
      `)
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error searching employees:', error)
    return { data: null, error: error.message }
  }
}

// Dashboard statistics
export const getDashboardStats = async () => {
  try {
    // Get total counts
    const [companiesResult, employeesResult, departmentsResult, locationsResult] = await Promise.all([
      supabase.from('companies').select('id', { count: 'exact' }),
      supabase.from('employees').select('id', { count: 'exact' }),
      supabase.from('departments').select('id', { count: 'exact' }),
      supabase.from('locations').select('id', { count: 'exact' })
    ])

    const stats = {
      totalCompanies: companiesResult.count || 0,
      totalEmployees: employeesResult.count || 0,
      totalDepartments: departmentsResult.count || 0,
      totalLocations: locationsResult.count || 0
    }

    return { data: stats, error: null }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return { data: null, error: error.message }
  }
}
