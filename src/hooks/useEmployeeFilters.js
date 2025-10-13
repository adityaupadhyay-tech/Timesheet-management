import { useState, useMemo } from 'react';

/**
 * Custom hook for managing employee filters and pagination
 */
export function useEmployeeFilters(employees) {
  const [currentPage, setCurrentPage] = useState(1);
  const [companyFilter, setCompanyFilter] = useState('');
  const [jobRoleFilter, setJobRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const ITEMS_PER_PAGE = 25;

  // Filter employees based on criteria
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      if (
        companyFilter &&
        !employee.company_name
          ?.toLowerCase()
          .includes(companyFilter.toLowerCase())
      ) {
        return false;
      }
      if (
        jobRoleFilter &&
        !employee.job_title?.toLowerCase().includes(jobRoleFilter.toLowerCase())
      ) {
        return false;
      }
      if (
        departmentFilter &&
        !employee.department_name
          ?.toLowerCase()
          .includes(departmentFilter.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [employees, companyFilter, jobRoleFilter, departmentFilter]);

  // Paginate filtered results
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredEmployees.slice(startIndex, endIndex);
  }, [filteredEmployees, currentPage]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  }, [filteredEmployees.length]);

  // Clear all filters
  const clearFilters = () => {
    setCompanyFilter('');
    setJobRoleFilter('');
    setDepartmentFilter('');
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = companyFilter || jobRoleFilter || departmentFilter;

  return {
    // Filter state
    companyFilter,
    setCompanyFilter,
    jobRoleFilter,
    setJobRoleFilter,
    departmentFilter,
    setDepartmentFilter,
    showFilters,
    setShowFilters,
    hasActiveFilters,
    clearFilters,

    // Pagination state
    currentPage,
    setCurrentPage,
    totalPages,
    
    // Computed data
    filteredEmployees,
    paginatedEmployees,
    ITEMS_PER_PAGE,
  };
}

