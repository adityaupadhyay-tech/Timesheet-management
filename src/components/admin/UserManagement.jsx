"use client";

import React, { useState, useEffect } from "react";
import { useSupabase } from "@/contexts/SupabaseContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import People from "@mui/icons-material/People";
import Plus from "@mui/icons-material/Add";
import ListFilter from "@mui/icons-material/FilterList";
import ListX from "@mui/icons-material/Clear";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";
import {
  getCompaniesWithStats,
  getCompaniesForDashboard,
  getAllEmployeesWithAssignments,
  createEmployeeWithStructuredAssignments,
  deleteEmployee,
} from "@/lib/adminHelpers";
import { getCompaniesForDropdown, getLocationsForCompany, getDepartmentsForCompany } from "@/lib/adminHelpers";

export default function UserManagement() {
  const { user } = useSupabase();
  const [allEmployees, setAllEmployees] = useState([]);
  const [currentEmployeePage, setCurrentEmployeePage] = useState(1);
  const [showEmployeeFilters, setShowEmployeeFilters] = useState(false);
  const [companyFilter, setCompanyFilter] = useState("");
  const [jobRoleFilter, setJobRoleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Edit employee state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [editAssignment, setEditAssignment] = useState({
    job_role: '',
    company_id: '',
    department_id: '',
    location_id: ''
  });
  const [dropdownData, setDropdownData] = useState({
    companies: [],
    locations: [],
    departments: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete employee state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [deleteEmailInput, setDeleteEmailInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const EMPLOYEES_PER_PAGE = 20;

  // Fetch employees data
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const result = await getAllEmployeesWithAssignments();
        
        if (result.error) {
          console.error("Error fetching employees:", result.error);
          setAllEmployees([]);
        } else {
          // Handle both array and object responses
          const employees = Array.isArray(result.data) ? result.data : (result.data || []);
          setAllEmployees(employees);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        setAllEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const getFilteredEmployees = () => {
    // Ensure allEmployees is an array before filtering
    if (!Array.isArray(allEmployees)) {
      return [];
    }
    
    return allEmployees.filter((employee) => {
      const companyMatch = !companyFilter || 
        employee.assignments?.some(assignment => 
          assignment.company?.name?.toLowerCase().includes(companyFilter.toLowerCase())
        );
      
      const jobRoleMatch = !jobRoleFilter || 
        employee.assignments?.some(assignment => 
          assignment.job_role?.toLowerCase().includes(jobRoleFilter.toLowerCase())
        );
      
      const departmentMatch = !departmentFilter || 
        employee.assignments?.some(assignment => 
          assignment.department?.name?.toLowerCase().includes(departmentFilter.toLowerCase())
        );

      return companyMatch && jobRoleMatch && departmentMatch;
    });
  };

  const getPaginatedEmployees = () => {
    const filtered = getFilteredEmployees();
    const startIndex = (currentEmployeePage - 1) * EMPLOYEES_PER_PAGE;
    return filtered.slice(startIndex, startIndex + EMPLOYEES_PER_PAGE);
  };

  const getTotalEmployeePages = () => {
    return Math.ceil(getFilteredEmployees().length / EMPLOYEES_PER_PAGE);
  };

  const toggleExpand = (employeeId) => {
    setExpandedRows(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

  const clearFilters = () => {
    setCompanyFilter("");
    setJobRoleFilter("");
    setDepartmentFilter("");
  };

  const openDeleteModal = (employee) => {
    setDeletingEmployee(employee);
    setDeleteEmailInput('');
    setShowDeleteModal(true);
  };

  const handleDeleteEmployee = async () => {
    if (!deletingEmployee) return;

    // Verify email matches
    if (deleteEmailInput.trim() !== deletingEmployee.email) {
      alert("Email does not match. Please enter the correct email address.");
      return;
    }

    try {
      setIsDeleting(true);
      await deleteEmployee(deletingEmployee.id);
      setAllEmployees(prev => prev.filter(emp => emp.id !== deletingEmployee.id));
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setDeletingEmployee(null);
      setDeleteEmailInput('');
      
      alert("Employee deleted successfully!");
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Error deleting employee. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      // Load companies
      const companiesResult = await getCompaniesForDashboard();
      const companies = companiesResult.data || [];
      
      setDropdownData(prev => ({
        ...prev,
        companies
      }));
    } catch (error) {
      console.error("Error loading dropdown data:", error);
    }
  };

  const loadCompanySpecificData = async (companyId) => {
    if (!companyId) return;
    
    try {
      // Load locations and departments for the selected company
      const [locationsResult, departmentsResult] = await Promise.all([
        getLocationsForCompany(companyId),
        getDepartmentsForCompany(companyId)
      ]);
      
      setDropdownData(prev => ({
        ...prev,
        locations: locationsResult.data || [],
        departments: departmentsResult.data || []
      }));
    } catch (error) {
      console.error("Error loading company specific data:", error);
    }
  };

  const openEditModal = async (employee) => {
    setEditingEmployee(employee);
    setEditFormData({
      firstName: employee.first_name || '',
      lastName: employee.last_name || '',
      email: employee.email || '',
      phone: employee.phone || ''
    });

    // Set assignment data from the first assignment
    const firstAssignment = employee.assignments?.[0];
    const assignmentData = {
      job_role: firstAssignment?.job_role || '',
      company_id: firstAssignment?.company?.id || '',
      department_id: firstAssignment?.department?.id || '',
      location_id: firstAssignment?.location?.id || ''
    };
    setEditAssignment(assignmentData);

    // Load dropdown data
    await loadDropdownData();
    
    // Load company-specific data if company is selected
    if (assignmentData.company_id) {
      await loadCompanySpecificData(assignmentData.company_id);
    }

    setShowEditModal(true);
  };

  const handleEditEmployee = async () => {
    if (!editingEmployee) return;

    // Basic validation
    if (!editFormData.firstName.trim() || !editFormData.lastName.trim() || !editFormData.email.trim()) {
      alert("Please fill in all required fields (First Name, Last Name, Email)");
      return;
    }

    if (!editAssignment.job_role.trim() || !editAssignment.company_id) {
      alert("Please fill in Job Role and Company");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Update employee data
      const { data, error } = await supabase
        .from('employees')
        .update({
          first_name: editFormData.firstName.trim(),
          last_name: editFormData.lastName.trim(),
          email: editFormData.email.trim(),
          phone: editFormData.phone.trim() || null
        })
        .eq('id', editingEmployee.id);

      if (error) {
        throw error;
      }

      // Update or create assignment
      const firstAssignment = editingEmployee.assignments?.[0];
      if (firstAssignment) {
        // Update existing assignment
        const { error: assignmentError } = await supabase
          .from('employee_assignments')
          .update({
            job_role: editAssignment.job_role.trim(),
            company_id: editAssignment.company_id,
            department_id: editAssignment.department_id || null,
            location_id: editAssignment.location_id || null
          })
          .eq('employee_id', editingEmployee.id)
          .eq('company_id', firstAssignment.company?.id);

        if (assignmentError) {
          throw assignmentError;
        }
      } else {
        // Create new assignment
        const { error: assignmentError } = await supabase
          .from('employee_assignments')
          .insert([{
            employee_id: editingEmployee.id,
            company_id: editAssignment.company_id,
            job_role: editAssignment.job_role.trim(),
            department_id: editAssignment.department_id || null,
            location_id: editAssignment.location_id || null
          }]);

        if (assignmentError) {
          throw assignmentError;
        }
      }

      // Refresh employees data to get updated information
      const result = await getAllEmployeesWithAssignments();
      if (!result.error) {
        const employees = Array.isArray(result.data) ? result.data : (result.data || []);
        setAllEmployees(employees);
      }

      // Close modal and reset form
      setShowEditModal(false);
      setEditingEmployee(null);
      setEditFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      });
      setEditAssignment({
        job_role: '',
        company_id: '',
        department_id: '',
        location_id: ''
      });
      
      alert("Employee updated successfully!");
    } catch (error) {
      console.error("Error updating employee:", error);
      alert("Error updating employee. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <People className="mr-2" />
              All Employees ({getFilteredEmployees().length})
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => alert("Add Employee functionality coming soon!")}>
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEmployeeFilters(!showEmployeeFilters)}
              >
                {showEmployeeFilters ? (
                  <ListX className="w-4 h-4 mr-2" />
                ) : (
                  <ListFilter className="w-4 h-4 mr-2" />
                )}
                {showEmployeeFilters ? "Hide Filters" : "Show Filters"}
              </Button>
              {(companyFilter || jobRoleFilter || departmentFilter) && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {showEmployeeFilters && (
          <div className="px-6 pb-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="company-filter">Company</Label>
                <Input
                  id="company-filter"
                  placeholder="Filter by company..."
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="job-filter">Job Role</Label>
                <Input
                  id="job-filter"
                  placeholder="Filter by job role..."
                  value={jobRoleFilter}
                  onChange={(e) => setJobRoleFilter(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dept-filter">Department</Label>
                <Input
                  id="dept-filter"
                  placeholder="Filter by department..."
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <CardContent>
          {getPaginatedEmployees().length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <People className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No Employees Found</p>
              <p className="text-sm">
                {allEmployees.length === 0
                  ? "Connect your Supabase database to see employees here."
                  : "No employees match your current filters."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 w-10"></th>
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Email</th>
                      <th className="text-left p-3">Job Title</th>
                      <th className="text-left p-3">Company</th>
                      <th className="text-left p-3">Department</th>
                      <th className="text-left p-3">Location</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginatedEmployees().map((employee) => (
                      <React.Fragment key={employee.id}>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="p-3 align-top">
                            <button
                              onClick={() => toggleExpand(employee.id)}
                              className="p-2 hover:bg-gray-100 rounded transition-colors"
                            >
                              {expandedRows[employee.id] ? (
                                <ExpandLess className="w-4 h-4 text-gray-600" />
                              ) : (
                                <ExpandMore className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                          </td>
                          <td className="p-3">
                            <div className="font-medium">
                              {employee.first_name} {employee.last_name}
                            </div>
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {employee.email}
                          </td>
                          <td className="p-3 text-sm">
                            {employee.assignments?.[0]?.job_role || "N/A"}
                          </td>
                          <td className="p-3 text-sm">
                            {employee.assignments?.[0]?.company?.name || "N/A"}
                          </td>
                          <td className="p-3 text-sm">
                            {employee.assignments?.[0]?.department?.name || "N/A"}
                          </td>
                          <td className="p-3 text-sm">
                            {employee.assignments?.[0]?.location?.name || "N/A"}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openEditModal(employee)}
                                      className="h-8 px-3 text-xs"
                                    >
                                      <Edit className="w-3 h-3 mr-1" />
                                      Edit
                                    </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDeleteModal(employee)}
                                className="h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Delete className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {expandedRows[employee.id] && (
                          <tr className="bg-gray-50">
                            <td></td>
                            <td colSpan="7" className="p-3">
                              <div className="space-y-3">
                                <h4 className="font-medium text-sm">Employee Details</h4>
                                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 text-sm">
                                  <div>
                                    <span className="font-medium text-gray-700">Phone:</span>
                                    <span className="ml-2 text-gray-600">{employee.phone || "N/A"}</span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">Hire Date:</span>
                                    <span className="ml-2 text-gray-600">
                                      {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : "N/A"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">Status:</span>
                                    <span className="ml-2 text-gray-600">{employee.status || "Active"}</span>
                                  </div>
                                </div>
                                
                                {employee.assignments && employee.assignments.length > 0 && (
                                  <div>
                                    <h5 className="font-medium text-sm mb-2">Assignments</h5>
                                    <div className="space-y-2">
                                      {employee.assignments.map((assignment, index) => (
                                        <div key={index} className="bg-white p-3 rounded border text-sm">
                                          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                                            <div>
                                              <span className="font-medium text-gray-700">Company:</span>
                                              <span className="ml-2 text-gray-600">{assignment.company?.name || "N/A"}</span>
                                            </div>
                                            <div>
                                              <span className="font-medium text-gray-700">Job Role:</span>
                                              <span className="ml-2 text-gray-600">{assignment.job_role || "N/A"}</span>
                                            </div>
                                            <div>
                                              <span className="font-medium text-gray-700">Department:</span>
                                              <span className="ml-2 text-gray-600">{assignment.department?.name || "N/A"}</span>
                                            </div>
                                            <div>
                                              <span className="font-medium text-gray-700">Location:</span>
                                              <span className="ml-2 text-gray-600">{assignment.location?.name || "N/A"}</span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {getTotalEmployeePages() > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    {(currentEmployeePage - 1) * EMPLOYEES_PER_PAGE + 1} to{" "}
                    {Math.min(
                      currentEmployeePage * EMPLOYEES_PER_PAGE,
                      getFilteredEmployees().length
                    )}{" "}
                    of {getFilteredEmployees().length} employees
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentEmployeePage(
                          Math.max(1, currentEmployeePage - 1)
                        )
                      }
                      disabled={currentEmployeePage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="px-3 py-2 text-sm">
                      Page {currentEmployeePage} of{" "}
                      {getTotalEmployeePages()}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentEmployeePage(
                          Math.min(
                            getTotalEmployeePages(),
                            currentEmployeePage + 1
                          )
                        )
                      }
                      disabled={
                        currentEmployeePage === getTotalEmployeePages()
                      }
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Employee Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">
                  Edit Employee: {editingEmployee?.first_name} {editingEmployee?.last_name}
                </h3>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingEmployee(null);
                    setEditFormData({
                      firstName: '',
                      lastName: '',
                      email: '',
                      phone: ''
                    });
                    setEditAssignment({
                      job_role: '',
                      company_id: '',
                      department_id: '',
                      location_id: ''
                    });
                    setDropdownData({
                      companies: [],
                      locations: [],
                      departments: []
                    });
                  }}
                >
                  Close
                </Button>
              </div>

              <div className="space-y-4">
                {/* Employee Information Section */}
                <div className="border-b pb-4">
                  <h4 className="text-lg font-medium mb-4">Employee Information</h4>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* First Name */}
                    <div>
                      <Label htmlFor="edit-first-name">First Name *</Label>
                      <Input
                        id="edit-first-name"
                        value={editFormData.firstName}
                        onChange={(e) => setEditFormData(prev => ({
                          ...prev,
                          firstName: e.target.value
                        }))}
                        placeholder="Enter first name"
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <Label htmlFor="edit-last-name">Last Name *</Label>
                      <Input
                        id="edit-last-name"
                        value={editFormData.lastName}
                        onChange={(e) => setEditFormData(prev => ({
                          ...prev,
                          lastName: e.target.value
                        }))}
                        placeholder="Enter last name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="edit-email">Email *</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData(prev => ({
                          ...prev,
                          email: e.target.value
                        }))}
                        placeholder="Enter email address"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <Label htmlFor="edit-phone">Phone</Label>
                      <Input
                        id="edit-phone"
                        type="tel"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData(prev => ({
                          ...prev,
                          phone: e.target.value
                        }))}
                        placeholder="Enter phone number (optional)"
                      />
                    </div>
                  </div>
                </div>

                {/* Assignment Information Section */}
                <div>
                  <h4 className="text-lg font-medium mb-4">Assignment Information</h4>
                  
                  {/* Current Assignment Display */}
                  {editingEmployee?.assignments?.[0] ? (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="text-sm font-medium text-blue-900 mb-2">Current Assignment</h5>
                      <div className="grid gap-2 text-sm">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 w-20">Company:</span>
                          <span className="text-gray-600">{editingEmployee.assignments[0].company?.name || "N/A"}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 w-20">Job Role:</span>
                          <span className="text-gray-600">{editingEmployee.assignments[0].job_role || "N/A"}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 w-20">Department:</span>
                          <span className="text-gray-600">{editingEmployee.assignments[0].department?.name || "N/A"}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 w-20">Location:</span>
                          <span className="text-gray-600">{editingEmployee.assignments[0].location?.name || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Current Assignment</h5>
                      <p className="text-sm text-gray-600 italic">No assignment found. Create a new assignment below.</p>
                    </div>
                  )}
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Job Role */}
                    <div>
                      <Label htmlFor="edit-job-role">Job Role *</Label>
                      <Input
                        id="edit-job-role"
                        value={editAssignment.job_role}
                        onChange={(e) => setEditAssignment(prev => ({
                          ...prev,
                          job_role: e.target.value
                        }))}
                        placeholder="e.g., Software Developer, Manager"
                      />
                    </div>

                    {/* Company */}
                    <div>
                      <Label htmlFor="edit-company">Company *</Label>
                      <div className="relative">
                        <select
                          id="edit-company"
                          value={editAssignment.company_id}
                          onChange={async (e) => {
                            const companyId = e.target.value;
                            setEditAssignment(prev => ({
                              ...prev,
                              company_id: companyId,
                              department_id: '',
                              location_id: ''
                            }));
                            
                            // Load company-specific data
                            if (companyId) {
                              await loadCompanySpecificData(companyId);
                            }
                          }}
                          className="w-full border rounded px-3 py-2 pr-10 appearance-none bg-white cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select a company</option>
                          {dropdownData.companies.map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.name}
                            </option>
                          ))}
                        </select>
                        <ExpandMore className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                      </div>
                    </div>

                    {/* Department */}
                    <div>
                      <Label htmlFor="edit-department">Department</Label>
                      <div className="relative">
                        <select
                          id="edit-department"
                          value={editAssignment.department_id}
                          onChange={(e) => setEditAssignment(prev => ({
                            ...prev,
                            department_id: e.target.value
                          }))}
                          className="w-full border rounded px-3 py-2 pr-10 appearance-none bg-white cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={!editAssignment.company_id}
                        >
                          <option value="">Select a department (optional)</option>
                          {dropdownData.departments.map((department) => (
                            <option key={department.id} value={department.id}>
                              {department.name}
                            </option>
                          ))}
                        </select>
                        <ExpandMore className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <Label htmlFor="edit-location">Location</Label>
                      <div className="relative">
                        <select
                          id="edit-location"
                          value={editAssignment.location_id}
                          onChange={(e) => setEditAssignment(prev => ({
                            ...prev,
                            location_id: e.target.value
                          }))}
                          className="w-full border rounded px-3 py-2 pr-10 appearance-none bg-white cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={!editAssignment.company_id}
                        >
                          <option value="">Select a location (optional)</option>
                          {dropdownData.locations.map((location) => (
                            <option key={location.id} value={location.id}>
                              {location.name}
                            </option>
                          ))}
                        </select>
                        <ExpandMore className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingEmployee(null);
                      setEditFormData({
                        firstName: '',
                        lastName: '',
                        email: '',
                        phone: ''
                      });
                      setEditAssignment({
                        job_role: '',
                        company_id: '',
                        department_id: '',
                        location_id: ''
                      });
                      setDropdownData({
                        companies: [],
                        locations: [],
                        departments: []
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEditEmployee}
                    disabled={isSubmitting || !editFormData.firstName.trim() || !editFormData.lastName.trim() || !editFormData.email.trim() || !editAssignment.job_role.trim() || !editAssignment.company_id}
                  >
                    {isSubmitting ? "Updating..." : "Update Employee"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Employee Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-red-600">
                  Delete Employee
                </h3>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingEmployee(null);
                    setDeleteEmailInput('');
                  }}
                >
                  Close
                </Button>
              </div>

              <div className="space-y-4">
                {/* Warning Message */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Delete className="w-5 h-5 text-red-600 mr-2" />
                    <h4 className="text-lg font-medium text-red-800">Warning</h4>
                  </div>
                  <p className="text-red-700 text-sm">
                    This action cannot be undone. Deleting this employee will permanently remove all their data from the system.
                  </p>
                </div>

                {/* Employee Information */}
                {deletingEmployee && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-800 mb-2">Employee to be deleted:</h5>
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">{deletingEmployee.first_name} {deletingEmployee.last_name}</div>
                      <div>Email: {deletingEmployee.email}</div>
                      {deletingEmployee.phone && <div>Phone: {deletingEmployee.phone}</div>}
                    </div>
                  </div>
                )}

                {/* Email Verification */}
                <div>
                  <Label htmlFor="delete-email-verification" className="text-red-700 font-medium">
                    To confirm deletion, please enter the employee's email address:
                  </Label>
                  <Input
                    id="delete-email-verification"
                    type="email"
                    value={deleteEmailInput}
                    onChange={(e) => setDeleteEmailInput(e.target.value)}
                    placeholder="Enter employee's email address"
                    className="mt-2 border-red-300 focus:border-red-500 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You must enter the exact email address to proceed with deletion.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletingEmployee(null);
                      setDeleteEmailInput('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteEmployee}
                    disabled={isDeleting || !deleteEmailInput.trim() || (deletingEmployee && deleteEmailInput.trim() !== deletingEmployee.email)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? "Deleting..." : "Delete Employee"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

