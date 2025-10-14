import { useState, useCallback } from 'react';
import {
  getAllCompanies,
  getAllJobRoles,
  getLocationsByCompany,
  getDepartmentsByCompany,
  getPaycyclesByCompany,
} from '@/lib/adminHelpers';

/**
 * Custom hook for managing employee form state and validation
 */
export function useEmployeeForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [assignments, setAssignments] = useState([
    {
      companyId: '',
      jobRoleId: '',
      locationId: '',
      departmentIds: [''],
      paycycleId: '',
    },
  ]);

  const [formErrors, setFormErrors] = useState({});
  const [dropdownData, setDropdownData] = useState({
    companies: [],
    jobRoles: [],
    locations: [],
    departments: [],
    paycycles: [],
  });
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Load initial dropdown data (companies and job roles)
  const loadInitialDropdownData = useCallback(async () => {
    try {
      setLoadingDropdowns(true);
      const [companiesResult, jobRolesResult] = await Promise.all([
        getAllCompanies(),
        getAllJobRoles(),
      ]);

      setDropdownData((prev) => ({
        ...prev,
        companies: companiesResult.data || [],
        jobRoles: jobRolesResult.data || [],
      }));
    } catch (err) {
      console.error('Error loading dropdown data:', err);
    } finally {
      setLoadingDropdowns(false);
    }
  }, []);

  // Load company-dependent data (locations, departments, paycycles)
  const loadCompanyDependentData = useCallback(async (companyId) => {
    if (!companyId) return;

    try {
      const [locationsResult, departmentsResult, paycyclesResult] =
        await Promise.all([
          getLocationsByCompany(companyId),
          getDepartmentsByCompany(companyId),
          getPaycyclesByCompany(companyId),
        ]);

      setDropdownData((prev) => ({
        ...prev,
        locationsByCompany: {
          ...(prev.locationsByCompany || {}),
          [companyId]: locationsResult.data || [],
        },
        departmentsByCompany: {
          ...(prev.departmentsByCompany || {}),
          [companyId]: departmentsResult.data || [],
        },
        paycyclesByCompany: {
          ...(prev.paycyclesByCompany || {}),
          [companyId]: paycyclesResult.data || [],
        },
      }));
    } catch (err) {
      console.error('Error loading company dependent data:', err);
    }
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Validate assignments
    const validAssignments = assignments.filter(
      (assignment) =>
        assignment.companyId && assignment.jobRoleId && assignment.locationId
    );

    if (validAssignments.length === 0) {
      errors.assignments = 'At least one valid assignment is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, assignments]);

  // Update assignment
  const updateAssignment = useCallback((index, field, value) => {
    setAssignments((prev) => {
      const newAssignments = [...prev];
      newAssignments[index] = { ...newAssignments[index], [field]: value };

      // If company changes, clear related fields
      if (field === 'companyId') {
        newAssignments[index].locationId = '';
        newAssignments[index].departmentIds = [''];
        newAssignments[index].paycycleId = '';
      }

      return newAssignments;
    });
  }, []);

  // Add new assignment
  const addAssignment = useCallback(() => {
    setAssignments((prev) => [
      ...prev,
      {
        companyId: '',
        jobRoleId: '',
        locationId: '',
        departmentIds: [''],
        paycycleId: '',
      },
    ]);
  }, []);

  // Remove assignment
  const removeAssignment = useCallback((index) => {
    setAssignments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Update department IDs
  const updateDepartmentIds = useCallback((assignmentIndex, departmentIndex, value) => {
    setAssignments((prev) => {
      const newAssignments = [...prev];
      const newDepartmentIds = [...newAssignments[assignmentIndex].departmentIds];
      newDepartmentIds[departmentIndex] = value;
      newAssignments[assignmentIndex].departmentIds = newDepartmentIds;
      return newAssignments;
    });
  }, []);

  // Add department ID
  const addDepartmentId = useCallback((assignmentIndex) => {
    setAssignments((prev) => {
      const newAssignments = [...prev];
      newAssignments[assignmentIndex].departmentIds.push('');
      return newAssignments;
    });
  }, []);

  // Remove department ID
  const removeDepartmentId = useCallback((assignmentIndex, departmentIndex) => {
    setAssignments((prev) => {
      const newAssignments = [...prev];
      newAssignments[assignmentIndex].departmentIds = newAssignments[
        assignmentIndex
      ].departmentIds.filter((_, i) => i !== departmentIndex);
      return newAssignments;
    });
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    });
    setAssignments([
      {
        companyId: '',
        jobRoleId: '',
        locationId: '',
        departmentIds: [''],
        paycycleId: '',
      },
    ]);
    setFormErrors({});
    setDropdownData({
      companies: [],
      jobRoles: [],
      locations: [],
      departments: [],
      paycycles: [],
    });
  }, []);

  // Populate form with employee data (for editing)
  const populateForm = useCallback((employeeDetails) => {
    setFormData({
      firstName: employeeDetails.first_name || '',
      lastName: employeeDetails.last_name || '',
      email: employeeDetails.email || '',
      phone: employeeDetails.phone || '',
    });

    if (employeeDetails.assignments && employeeDetails.assignments.length > 0) {
      const formattedAssignments = employeeDetails.assignments.map(
        (assignment) => ({
          companyId: assignment.companyId || assignment.company_id || '',
          jobRoleId: assignment.jobRoleId || assignment.job_role_id || '',
          locationId: assignment.locationId || assignment.location_id || '',
          departmentIds: assignment.departmentIds || assignment.department_ids || [''],
          paycycleId: assignment.paycycleId || assignment.paycycle_id || '',
        })
      );
      setAssignments(formattedAssignments);
    }
  }, []);

  return {
    // Form data
    formData,
    setFormData,
    assignments,
    
    // Errors
    formErrors,
    
    // Dropdown data
    dropdownData,
    loadingDropdowns,
    
    // Methods
    validateForm,
    updateAssignment,
    addAssignment,
    removeAssignment,
    updateDepartmentIds,
    addDepartmentId,
    removeDepartmentId,
    loadInitialDropdownData,
    loadCompanyDependentData,
    resetForm,
    populateForm,
  };
}

