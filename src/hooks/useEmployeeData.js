import { useState, useCallback } from 'react';
import {
  getAllEmployeesWithAssignments,
  createEmployeeWithStructuredAssignments,
  updateEmployeeWithStructuredAssignments,
  getEmployeeDetailsForEdit,
} from '@/lib/adminHelpers';

/**
 * Custom hook for managing employee data operations
 */
export function useEmployeeData() {
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const employeesResult = await getAllEmployeesWithAssignments();

      if (employeesResult.error) {
        console.error('Error loading employees:', employeesResult.error);
        setError(employeesResult.error);
      } else {
        setAllEmployees(employeesResult.data || []);
      }
    } catch (err) {
      setError('Failed to load employees');
      console.error('Error loading employees:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEmployee = useCallback(async (employeeData, assignments) => {
    try {
      const result = await createEmployeeWithStructuredAssignments(
        employeeData,
        assignments
      );

      if (result.error) {
        return { success: false, error: result.error };
      }

      await loadEmployees(); // Reload employees
      return { success: true, data: result.data };
    } catch (err) {
      console.error('Error creating employee:', err);
      return { success: false, error: 'Failed to create employee' };
    }
  }, [loadEmployees]);

  const updateEmployee = useCallback(async (employeeId, employeeData, assignments) => {
    try {
      const result = await updateEmployeeWithStructuredAssignments(
        employeeId,
        employeeData,
        assignments
      );

      if (result.error) {
        return { success: false, error: result.error };
      }

      await loadEmployees(); // Reload employees
      return { success: true, data: result.data };
    } catch (err) {
      console.error('Error updating employee:', err);
      return { success: false, error: 'Failed to update employee' };
    }
  }, [loadEmployees]);

  const getEmployeeForEdit = useCallback(async (employeeId) => {
    try {
      const { data: employeeDetails, error } = await getEmployeeDetailsForEdit(
        employeeId
      );

      if (error) {
        console.error('Error fetching employee details:', error);
        return { success: false, error: 'Failed to load employee details' };
      }

      return { success: true, data: employeeDetails };
    } catch (err) {
      console.error('Error in getEmployeeForEdit:', err);
      return { success: false, error: 'Failed to load employee details' };
    }
  }, []);

  return {
    allEmployees,
    loading,
    error,
    loadEmployees,
    createEmployee,
    updateEmployee,
    getEmployeeForEdit,
  };
}

