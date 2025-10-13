import { supabase, handleSupabaseError, handleSupabaseSuccess } from './supabase'

/**
 * Timesheet Management Helper Functions
 * Integrated with companies, employees, and administration
 */

// =====================================================
// PROJECT MANAGEMENT
// =====================================================

/**
 * Get all projects for a company
 */
export const getCompanyProjects = async (companyId) => {
  try {
    if (!companyId) {
      return { data: [], error: null }
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('company_id', companyId)
      .order('name')

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching company projects:', error)
    return { data: [], error: error.message }
  }
}

/**
 * Get projects assigned to an employee
 */
export const getEmployeeProjects = async (employeeId) => {
  try {
    const { data, error } = await supabase
      .from('project_assignments')
      .select(`
        id,
        role,
        hourly_rate,
        projects (
          id,
          name,
          description,
          code,
          status,
          color,
          company_id
        )
      `)
      .eq('employee_id', employeeId)

    if (error) throw error
    
    // Flatten the structure
    const projects = data?.map(assignment => ({
      ...assignment.projects,
      assignmentRole: assignment.role,
      hourlyRate: assignment.hourly_rate
    })) || []

    return { data: projects, error: null }
  } catch (error) {
    console.error('Error fetching employee projects:', error)
    return { data: [], error: error.message }
  }
}

/**
 * Create a new project
 */
export const createProject = async (projectData) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()

    if (error) throw error
    return { data: data?.[0], error: null }
  } catch (error) {
    console.error('Error creating project:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Assign project to employee
 */
export const assignProjectToEmployee = async (projectId, employeeId, role, hourlyRate) => {
  try {
    const { data, error } = await supabase
      .from('project_assignments')
      .insert([{
        project_id: projectId,
        employee_id: employeeId,
        role,
        hourly_rate: hourlyRate
      }])
      .select()

    if (error) throw error
    return { data: data?.[0], error: null }
  } catch (error) {
    console.error('Error assigning project:', error)
    return { data: null, error: error.message }
  }
}

// =====================================================
// TIMESHEET MANAGEMENT
// =====================================================

/**
 * Get employee timesheets
 */
export const getEmployeeTimesheets = async (employeeId) => {
  try {
    const { data, error} = await supabase
      .rpc('get_employee_timesheets', { p_employee_id: employeeId })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching employee timesheets:', error)
    return { data: [], error: error.message }
  }
}

/**
 * Get company timesheets (for managers/admins)
 */
export const getCompanyTimesheets = async (companyId) => {
  try {
    const { data, error } = await supabase
      .rpc('get_company_timesheets', { p_company_id: companyId })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching company timesheets:', error)
    return { data: [], error: error.message }
  }
}

/**
 * Get timesheet with all entries
 */
export const getTimesheetWithEntries = async (timesheetId) => {
  try {
    const { data, error } = await supabase
      .rpc('get_timesheet_with_entries', { p_timesheet_id: timesheetId })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching timesheet with entries:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Create or get current timesheet for employee
 */
export const getOrCreateCurrentTimesheet = async (employeeId, companyId, cycleStartDate, cycleEndDate, cycleType) => {
  try {
    // First, try to find existing timesheet
    const { data: existing, error: findError } = await supabase
      .from('timesheets')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('company_id', companyId)
      .eq('cycle_start_date', cycleStartDate)
      .eq('cycle_end_date', cycleEndDate)
      .single()

    if (existing) {
      return { data: existing, error: null }
    }

    // If not found, create new timesheet
    const { data: newTimesheet, error: createError } = await supabase
      .from('timesheets')
      .insert([{
        employee_id: employeeId,
        company_id: companyId,
        cycle_type: cycleType,
        cycle_start_date: cycleStartDate,
        cycle_end_date: cycleEndDate,
        status: 'draft'
      }])
      .select()
      .single()

    if (createError) throw createError
    return { data: newTimesheet, error: null }
  } catch (error) {
    console.error('Error getting/creating timesheet:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Submit timesheet
 */
export const submitTimesheet = async (timesheetId, employeeId) => {
  try {
    const { data, error } = await supabase
      .rpc('submit_timesheet', {
        p_timesheet_id: timesheetId,
        p_employee_id: employeeId
      })

    if (error) throw error
    
    if (!data.success) {
      throw new Error(data.error)
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error submitting timesheet:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Approve timesheet (manager/admin)
 */
export const approveTimesheet = async (timesheetId, approvedBy) => {
  try {
    const { data, error } = await supabase
      .rpc('approve_timesheet', {
        p_timesheet_id: timesheetId,
        p_approved_by: approvedBy
      })

    if (error) throw error
    
    if (!data.success) {
      throw new Error(data.error)
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error approving timesheet:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Request revision on timesheet (manager/admin)
 */
export const requestTimesheetRevision = async (timesheetId, rejectedBy, reason) => {
  try {
    const { data, error } = await supabase
      .rpc('request_timesheet_revision', {
        p_timesheet_id: timesheetId,
        p_rejected_by: rejectedBy,
        p_rejection_reason: reason
      })

    if (error) throw error
    
    if (!data.success) {
      throw new Error(data.error)
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error requesting revision:', error)
    return { data: null, error: error.message }
  }
}

// =====================================================
// TIME ENTRY MANAGEMENT
// =====================================================

/**
 * Create time entry
 */
export const createTimeEntry = async (entryData) => {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .insert([entryData])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating time entry:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Update time entry
 */
export const updateTimeEntry = async (entryId, updates) => {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .update(updates)
      .eq('id', entryId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating time entry:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Delete time entry
 */
export const deleteTimeEntry = async (entryId) => {
  try {
    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', entryId)

    if (error) throw error
    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting time entry:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get time entries for a timesheet
 */
export const getTimesheetEntries = async (timesheetId) => {
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .select(`
        *,
        projects (id, name, code, color)
      `)
      .eq('timesheet_id', timesheetId)
      .order('entry_date', { ascending: true })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching timesheet entries:', error)
    return { data: [], error: error.message }
  }
}

// =====================================================
// REPORTING & ANALYTICS
// =====================================================

/**
 * Get timesheet statistics for a company
 */
export const getCompanyTimesheetStats = async (companyId, startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('timesheet_overview')
      .select('*')
      .eq('company_id', companyId)
      .gte('cycle_start_date', startDate)
      .lte('cycle_end_date', endDate)

    if (error) throw error

    const stats = {
      totalTimesheets: data?.length || 0,
      submittedTimesheets: data?.filter(t => t.status === 'submitted').length || 0,
      approvedTimesheets: data?.filter(t => t.status === 'approved').length || 0,
      pendingTimesheets: data?.filter(t => t.status === 'response_awaited').length || 0,
      totalHours: data?.reduce((sum, t) => sum + (parseFloat(t.total_hours) || 0), 0) || 0,
      employees: [...new Set(data?.map(t => t.employee_id))].length
    }

    return { data: stats, error: null }
  } catch (error) {
    console.error('Error fetching timesheet stats:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get project hours summary
 */
export const getProjectHoursSummary = async (projectId, startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('time_entry_details')
      .select('*')
      .eq('project_id', projectId)
      .gte('entry_date', startDate)
      .lte('entry_date', endDate)

    if (error) throw error

    const summary = {
      totalEntries: data?.length || 0,
      totalMinutes: data?.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) || 0,
      totalHours: data?.reduce((sum, entry) => sum + (parseFloat(entry.duration_hours) || 0), 0) || 0,
      employees: [...new Set(data?.map(entry => entry.employee_id))].length,
      billableHours: data?.filter(entry => entry.is_billable)
        .reduce((sum, entry) => sum + (parseFloat(entry.duration_hours) || 0), 0) || 0
    }

    return { data: summary, error: null }
  } catch (error) {
    console.error('Error fetching project hours summary:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get employee hours by department
 */
export const getEmployeeHoursByDepartment = async (companyId, startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('time_entry_details')
      .select('department_name, duration_hours')
      .eq('company_id', companyId)
      .gte('entry_date', startDate)
      .lte('entry_date', endDate)

    if (error) throw error

    // Group by department
    const byDepartment = data?.reduce((acc, entry) => {
      const dept = entry.department_name || 'Unassigned'
      if (!acc[dept]) {
        acc[dept] = 0
      }
      acc[dept] += parseFloat(entry.duration_hours) || 0
      return acc
    }, {}) || {}

    return { data: byDepartment, error: null }
  } catch (error) {
    console.error('Error fetching hours by department:', error)
    return { data: null, error: error.message }
  }
}

// =====================================================
// BULK OPERATIONS
// =====================================================

/**
 * Bulk approve timesheets
 */
export const bulkApproveTimesheets = async (timesheetIds, approvedBy) => {
  try {
    const results = await Promise.all(
      timesheetIds.map(id => approveTimesheet(id, approvedBy))
    )

    const successful = results.filter(r => !r.error).length
    const failed = results.filter(r => r.error).length

    return {
      data: { successful, failed, total: timesheetIds.length },
      error: null
    }
  } catch (error) {
    console.error('Error bulk approving timesheets:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Bulk request revisions
 */
export const bulkRequestRevisions = async (timesheetIds, rejectedBy, reason) => {
  try {
    const results = await Promise.all(
      timesheetIds.map(id => requestTimesheetRevision(id, rejectedBy, reason))
    )

    const successful = results.filter(r => !r.error).length
    const failed = results.filter(r => r.error).length

    return {
      data: { successful, failed, total: timesheetIds.length },
      error: null
    }
  } catch (error) {
    console.error('Error bulk requesting revisions:', error)
    return { data: null, error: error.message }
  }
}

// =====================================================
// FILTERING & SEARCH
// =====================================================

/**
 * Search timesheets with filters
 */
export const searchTimesheets = async (filters = {}) => {
  try {
    let query = supabase
      .from('timesheet_overview')
      .select('*')

    // Apply filters
    if (filters.companyId) {
      query = query.eq('company_id', filters.companyId)
    }

    if (filters.employeeId) {
      query = query.eq('employee_id', filters.employeeId)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.departmentName) {
      query = query.eq('department_name', filters.departmentName)
    }

    if (filters.startDate) {
      query = query.gte('cycle_start_date', filters.startDate)
    }

    if (filters.endDate) {
      query = query.lte('cycle_end_date', filters.endDate)
    }

    if (filters.search) {
      query = query.or(`employee_name.ilike.%${filters.search}%,employee_email.ilike.%${filters.search}%`)
    }

    // Order by most recent
    query = query.order('cycle_start_date', { ascending: false })

    const { data, error } = await query

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error searching timesheets:', error)
    return { data: [], error: error.message }
  }
}

// =====================================================
// INTEGRATION HELPERS
// =====================================================

/**
 * Get employee's current company and paycycle info
 */
export const getEmployeeTimesheetContext = async (employeeId) => {
  try {
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select(`
        id,
        first_name,
        last_name,
        email,
        company_id,
        department_id,
        location_id,
        companies (id, name, status),
        departments (id, name),
        locations (id, name)
      `)
      .eq('id', employeeId)
      .single()

    if (empError) throw empError

    // Get employee's paycycle
    const { data: assignments, error: assignError } = await supabase
      .from('employee_companies')
      .select(`
        paycycle_id,
        paycycles (id, name, frequency, cycle_type)
      `)
      .eq('employee_id', employeeId)
      .eq('company_id', employee.company_id)
      .single()

    if (assignError) {
      console.warn('No paycycle assignment found:', assignError)
    }

    return {
      data: {
        employee,
        company: employee.companies,
        department: employee.departments,
        location: employee.locations,
        paycycle: assignments?.paycycles || null
      },
      error: null
    }
  } catch (error) {
    console.error('Error fetching employee timesheet context:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get pending timesheet approvals for a manager
 */
export const getPendingApprovalsForManager = async (managerId) => {
  try {
    // Get manager's company
    const { data: manager, error: mgError } = await supabase
      .from('employees')
      .select('company_id')
      .eq('id', managerId)
      .single()

    if (mgError) throw mgError

    // Get all submitted timesheets for manager's company
    const { data, error } = await supabase
      .from('timesheet_overview')
      .select('*')
      .eq('company_id', manager.company_id)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: true })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching pending approvals:', error)
    return { data: [], error: error.message }
  }
}

/**
 * Get timesheet summary for dashboard
 */
export const getTimesheetDashboardSummary = async (employeeId) => {
  try {
    const { data: timesheets, error } = await supabase
      .from('timesheets')
      .select('status, total_hours')
      .eq('employee_id', employeeId)

    if (error) throw error

    const summary = {
      draft: timesheets?.filter(t => t.status === 'draft').length || 0,
      submitted: timesheets?.filter(t => t.status === 'submitted').length || 0,
      approved: timesheets?.filter(t => t.status === 'approved').length || 0,
      rejected: timesheets?.filter(t => t.status === 'response_awaited').length || 0,
      totalHoursThisMonth: timesheets?.reduce((sum, t) => sum + (parseFloat(t.total_hours) || 0), 0) || 0
    }

    return { data: summary, error: null }
  } catch (error) {
    console.error('Error fetching dashboard summary:', error)
    return { data: null, error: error.message }
  }
}

