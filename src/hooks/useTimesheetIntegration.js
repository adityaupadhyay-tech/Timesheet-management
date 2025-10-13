import { useState, useEffect, useCallback } from 'react';
import {
  getEmployeeTimesheets,
  getCompanyTimesheets,
  getTimesheetWithEntries,
  getOrCreateCurrentTimesheet,
  submitTimesheet as submitTimesheetAPI,
  approveTimesheet as approveTimesheetAPI,
  requestTimesheetRevision,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  getEmployeeProjects,
  getCompanyProjects,
  getEmployeeTimesheetContext,
  getPendingApprovalsForManager,
  getTimesheetDashboardSummary,
  bulkApproveTimesheets,
  bulkRequestRevisions
} from '@/lib/timesheetHelpers';

/**
 * Custom hook for integrated timesheet management
 * Connects timesheets with companies, employees, and administration
 */
export function useTimesheetIntegration(userId, userRole = 'employee') {
  const [timesheets, setTimesheets] = useState([]);
  const [currentTimesheet, setCurrentTimesheet] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employeeContext, setEmployeeContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load employee context (company, department, location, paycycle)
  const loadEmployeeContext = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await getEmployeeTimesheetContext(userId);
      
      if (error) {
        console.error('Error loading employee context:', error);
        setError(error);
        return;
      }

      setEmployeeContext(data);
      return data;
    } catch (err) {
      console.error('Error in loadEmployeeContext:', err);
      setError(err.message);
    }
  }, [userId]);

  // Load projects for employee
  const loadProjects = useCallback(async () => {
    if (!employeeContext) return;

    try {
      const companyId = employeeContext.company?.id;
      
      if (!companyId) return;

      // For employees, get assigned projects; for managers/admins, get all company projects
      const { data, error } = userRole === 'employee'
        ? await getEmployeeProjects(userId)
        : await getCompanyProjects(companyId);

      if (error) {
        console.error('Error loading projects:', error);
        return;
      }

      setProjects(data || []);
    } catch (err) {
      console.error('Error in loadProjects:', err);
    }
  }, [employeeContext, userId, userRole]);

  // Load timesheets
  const loadTimesheets = useCallback(async () => {
    if (!employeeContext) return;

    try {
      setLoading(true);
      
      const companyId = employeeContext.company?.id;
      if (!companyId) return;

      // Load timesheets based on user role
      const { data, error } = userRole === 'employee'
        ? await getEmployeeTimesheets(userId)
        : await getCompanyTimesheets(companyId);

      if (error) {
        console.error('Error loading timesheets:', error);
        setError(error);
        return;
      }

      setTimesheets(data || []);
    } catch (err) {
      console.error('Error in loadTimesheets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [employeeContext, userId, userRole]);

  // Get or create current timesheet
  const loadCurrentTimesheet = useCallback(async (cycleStartDate, cycleEndDate, cycleType) => {
    if (!employeeContext) return;

    try {
      const companyId = employeeContext.company?.id;
      if (!companyId) return;

      const { data, error } = await getOrCreateCurrentTimesheet(
        userId,
        companyId,
        cycleStartDate,
        cycleEndDate,
        cycleType
      );

      if (error) {
        console.error('Error getting current timesheet:', error);
        return;
      }

      setCurrentTimesheet(data);
      
      // Load entries for this timesheet
      if (data?.id) {
        await loadTimesheetEntries(data.id);
      }

      return data;
    } catch (err) {
      console.error('Error in loadCurrentTimesheet:', err);
    }
  }, [employeeContext, userId]);

  // Load time entries for a timesheet
  const loadTimesheetEntries = useCallback(async (timesheetId) => {
    try {
      const { data, error } = await getTimesheetWithEntries(timesheetId);

      if (error) {
        console.error('Error loading timesheet entries:', error);
        return;
      }

      if (data) {
        setTimeEntries(data.entries || []);
        setCurrentTimesheet(data.timesheet);
      }
    } catch (err) {
      console.error('Error in loadTimesheetEntries:', err);
    }
  }, []);

  // Create time entry
  const addTimeEntry = useCallback(async (entryData) => {
    if (!currentTimesheet || !employeeContext) return;

    try {
      const fullEntryData = {
        ...entryData,
        timesheet_id: currentTimesheet.id,
        employee_id: userId,
        company_id: employeeContext.company.id,
        department_id: employeeContext.department?.id,
        location_id: employeeContext.location?.id,
      };

      const { data, error } = await createTimeEntry(fullEntryData);

      if (error) {
        console.error('Error creating time entry:', error);
        return { success: false, error };
      }

      // Reload entries
      await loadTimesheetEntries(currentTimesheet.id);
      return { success: true, data };
    } catch (err) {
      console.error('Error in addTimeEntry:', err);
      return { success: false, error: err.message };
    }
  }, [currentTimesheet, employeeContext, userId, loadTimesheetEntries]);

  // Update time entry
  const updateEntry = useCallback(async (entryId, updates) => {
    try {
      const { data, error } = await updateTimeEntry(entryId, updates);

      if (error) {
        console.error('Error updating time entry:', error);
        return { success: false, error };
      }

      // Reload entries
      if (currentTimesheet?.id) {
        await loadTimesheetEntries(currentTimesheet.id);
      }

      return { success: true, data };
    } catch (err) {
      console.error('Error in updateEntry:', err);
      return { success: false, error: err.message };
    }
  }, [currentTimesheet, loadTimesheetEntries]);

  // Delete time entry
  const removeEntry = useCallback(async (entryId) => {
    try {
      const { success, error } = await deleteTimeEntry(entryId);

      if (!success) {
        console.error('Error deleting time entry:', error);
        return { success: false, error };
      }

      // Reload entries
      if (currentTimesheet?.id) {
        await loadTimesheetEntries(currentTimesheet.id);
      }

      return { success: true };
    } catch (err) {
      console.error('Error in removeEntry:', err);
      return { success: false, error: err.message };
    }
  }, [currentTimesheet, loadTimesheetEntries]);

  // Submit timesheet
  const submitTimesheet = useCallback(async () => {
    if (!currentTimesheet) return { success: false, error: 'No timesheet selected' };

    try {
      const { data, error } = await submitTimesheetAPI(currentTimesheet.id, userId);

      if (error) {
        return { success: false, error };
      }

      // Reload timesheets
      await loadTimesheets();
      await loadTimesheetEntries(currentTimesheet.id);

      return { success: true, data };
    } catch (err) {
      console.error('Error in submitTimesheet:', err);
      return { success: false, error: err.message };
    }
  }, [currentTimesheet, userId, loadTimesheets, loadTimesheetEntries]);

  // Approve timesheet (manager/admin)
  const approveTimesheet = useCallback(async (timesheetId) => {
    try {
      const { data, error } = await approveTimesheetAPI(timesheetId, userId);

      if (error) {
        return { success: false, error };
      }

      // Reload timesheets
      await loadTimesheets();

      return { success: true, data };
    } catch (err) {
      console.error('Error in approveTimesheet:', err);
      return { success: false, error: err.message };
    }
  }, [userId, loadTimesheets]);

  // Request revision (manager/admin)
  const requestRevision = useCallback(async (timesheetId, reason) => {
    try {
      const { data, error } = await requestTimesheetRevision(timesheetId, userId, reason);

      if (error) {
        return { success: false, error };
      }

      // Reload timesheets
      await loadTimesheets();

      return { success: true, data };
    } catch (err) {
      console.error('Error in requestRevision:', err);
      return { success: false, error: err.message };
    }
  }, [userId, loadTimesheets]);

  // Bulk operations
  const bulkApprove = useCallback(async (timesheetIds) => {
    try {
      const { data, error } = await bulkApproveTimesheets(timesheetIds, userId);

      if (error) {
        return { success: false, error };
      }

      // Reload timesheets
      await loadTimesheets();

      return { success: true, data };
    } catch (err) {
      console.error('Error in bulkApprove:', err);
      return { success: false, error: err.message };
    }
  }, [userId, loadTimesheets]);

  const bulkRequestRevision = useCallback(async (timesheetIds, reason) => {
    try {
      const { data, error } = await bulkRequestRevisions(timesheetIds, userId, reason);

      if (error) {
        return { success: false, error };
      }

      // Reload timesheets
      await loadTimesheets();

      return { success: true, data };
    } catch (err) {
      console.error('Error in bulkRequestRevision:', err);
      return { success: false, error: err.message };
    }
  }, [userId, loadTimesheets]);

  // Initialize on mount
  useEffect(() => {
    if (userId) {
      loadEmployeeContext();
    }
  }, [userId, loadEmployeeContext]);

  useEffect(() => {
    if (employeeContext) {
      loadProjects();
      loadTimesheets();
    }
  }, [employeeContext, loadProjects, loadTimesheets]);

  return {
    // Data
    timesheets,
    currentTimesheet,
    timeEntries,
    projects,
    employeeContext,
    loading,
    error,

    // Timesheet operations
    loadCurrentTimesheet,
    loadTimesheetEntries,
    submitTimesheet,
    approveTimesheet,
    requestRevision,

    // Time entry operations
    addTimeEntry,
    updateEntry,
    removeEntry,

    // Bulk operations
    bulkApprove,
    bulkRequestRevision,

    // Reload functions
    loadTimesheets,
    loadProjects,
  };
}

