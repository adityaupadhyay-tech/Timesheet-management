"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  People,
  Add,
  Edit,
  FilterList,
  Clear,
  ChevronLeft,
  ChevronRight,
  Close,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import {
  getAllEmployeesWithAssignments,
  createEmployeeWithStructuredAssignments,
  updateEmployeeWithStructuredAssignments,
  getEmployeeDetailsForEdit,
  getAllCompanies,
  getAllJobRoles,
  getLocationsByCompany,
  getDepartmentsByCompany,
  getPaycyclesByCompany,
} from "@/lib/adminHelpers";

export default function EmployeeManagement() {
  // Employee data and loading states
  const [allEmployees, setAllEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Employee pagination and filters
  const [currentEmployeePage, setCurrentEmployeePage] = useState(1);
  const EMPLOYEES_PER_PAGE = 25;
  const [companyFilter, setCompanyFilter] = useState("");
  const [jobRoleFilter, setJobRoleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [showEmployeeFilters, setShowEmployeeFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  // Employee form state
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeFormData, setEmployeeFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [employeeFormErrors, setEmployeeFormErrors] = useState({});

  // Assignment state
  const [assignments, setAssignments] = useState([
    { companyId: "", jobRoleId: "", locationId: "", departmentIds: [""], paycycleId: "" },
  ]);
  const [assignmentDropdownData, setAssignmentDropdownData] = useState({});
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load employees on component mount
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const employeesResult = await getAllEmployeesWithAssignments();

      if (employeesResult.error) {
        console.error("Error loading employees:", employeesResult.error);
        setError(employeesResult.error);
      } else {
        setAllEmployees(employeesResult.data || []);
      }
    } catch (err) {
      setError("Failed to load employees");
      console.error("Error loading employees:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and paginate employees
  const getFilteredEmployees = () => {
    return allEmployees.filter((employee) => {
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
  };

  const getPaginatedEmployees = () => {
    const filtered = getFilteredEmployees();
    const startIndex = (currentEmployeePage - 1) * EMPLOYEES_PER_PAGE;
    const endIndex = startIndex + EMPLOYEES_PER_PAGE;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalEmployeePages = () => {
    const totalEmployees = getFilteredEmployees().length;
    return Math.ceil(totalEmployees / EMPLOYEES_PER_PAGE);
  };

  const toggleExpand = (employeeId) => {
    setExpandedRows((prev) => ({ ...prev, [employeeId]: !prev[employeeId] }));
  };

  const clearFilters = () => {
    setCompanyFilter("");
    setJobRoleFilter("");
    setDepartmentFilter("");
    setCurrentEmployeePage(1);
  };

  // Load dropdown data for assignments
  const loadInitialDropdownData = async () => {
    try {
      setLoadingDropdowns(true);
      const [companiesResult, jobRolesResult] = await Promise.all([
        getAllCompanies(),
        getAllJobRoles(),
      ]);

      setAssignmentDropdownData({
        companies: companiesResult.data || [],
        jobRoles: jobRolesResult.data || [],
        locations: [],
        departments: [],
        paycycles: [],
      });
    } catch (err) {
      console.error("Error loading dropdown data:", err);
      setError("Failed to load form data");
    } finally {
      setLoadingDropdowns(false);
    }
  };

  // Load locations, departments, and paycycles when company changes
  const loadCompanyDependentData = async (companyId) => {
    if (!companyId) return;

    try {
      const [locationsResult, departmentsResult, paycyclesResult] = await Promise.all([
        getLocationsByCompany(companyId),
        getDepartmentsByCompany(companyId),
        getPaycyclesByCompany(companyId),
      ]);

      console.log("Loaded paycycles for company:", companyId, paycyclesResult.data);

      setAssignmentDropdownData((prev) => ({
        ...prev,
        locations: locationsResult.data || [],
        departments: departmentsResult.data || [],
        paycycles: paycyclesResult.data || [],
      }));
    } catch (err) {
      console.error("Error loading company dependent data:", err);
    }
  };

  // Employee form functions
  const openAddEmployeeForm = async () => {
    setEditingEmployee(null);
    setEmployeeFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    });
    setAssignments([
      { companyId: "", jobRoleId: "", locationId: "", departmentIds: [""], paycycleId: "" },
    ]);
    setAssignmentDropdownData({});
    setEmployeeFormErrors({});
    setShowEmployeeForm(true);
    await loadInitialDropdownData();
  };

  const openEditEmployeeForm = async (employee) => {
    try {
      setEditingEmployee(employee);
      setShowEmployeeForm(true);
      setLoadingDropdowns(true);

      const { data: employeeDetails, error } = await getEmployeeDetailsForEdit(
        employee.id
      );

      if (error) {
        console.error("Error fetching employee details:", error);
        setError("Failed to load employee details");
        setShowEmployeeForm(false);
        return;
      }

      setEmployeeFormData({
        firstName: employeeDetails.first_name || "",
        lastName: employeeDetails.last_name || "",
        email: employeeDetails.email || "",
        phone: employeeDetails.phone || "",
      });

      // Set assignments from the fetched data
      if (
        employeeDetails.assignments &&
        employeeDetails.assignments.length > 0
      ) {
        const formattedAssignments = employeeDetails.assignments.map(
          (assignment) => ({
            companyId: assignment.company_id || "",
            jobRoleId: assignment.job_role_id || "",
            locationId: assignment.location_id || "",
            departmentIds: assignment.department_ids || [""],
            paycycleId: assignment.paycycle_id || "",
          })
        );
        setAssignments(formattedAssignments);

        // Load company-dependent data for the first assignment
        if (formattedAssignments[0]?.companyId) {
          await loadCompanyDependentData(formattedAssignments[0].companyId);
        }
      } else {
        setAssignments([
          { companyId: "", jobRoleId: "", locationId: "", departmentIds: [""], paycycleId: "" },
        ]);
      }

      // Load initial dropdown data (companies and job roles)
      await loadInitialDropdownData();
    } catch (err) {
      console.error("Error opening edit form:", err);
      setError("Failed to open employee form");
      setShowEmployeeForm(false);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const validateEmployeeForm = () => {
    const errors = {};

    if (!employeeFormData.firstName?.trim()) {
      errors.firstName = "First name is required";
    }

    if (!employeeFormData.lastName?.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!employeeFormData.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeFormData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Validate assignments
    const validAssignments = assignments.filter(
      (assignment) =>
        assignment.companyId && assignment.jobRoleId && assignment.locationId
    );

    if (validAssignments.length === 0) {
      errors.assignments = "At least one valid assignment is required";
    }

    setEmployeeFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmployeeSubmit = async () => {
    if (!validateEmployeeForm()) return;

    try {
      setIsSubmitting(true);

      let result;
      if (editingEmployee) {
        result = await updateEmployeeWithStructuredAssignments(
          editingEmployee.id,
          employeeFormData,
          assignments
        );
      } else {
        result = await createEmployeeWithStructuredAssignments(
          employeeFormData,
          assignments
        );
      }

      if (result.error) {
        setError(result.error);
      } else {
        setShowEmployeeForm(false);
        setEditingEmployee(null);
        setEmployeeFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
        });
        setAssignments([
          { companyId: "", jobRoleId: "", locationId: "", departmentIds: [""], paycycleId: "" },
        ]);
        setEmployeeFormErrors({});
        // Reload employees
        await loadEmployees();
      }
    } catch (err) {
      console.error("Error saving employee:", err);
      setError("Failed to save employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeEmployeeForm = () => {
    setShowEmployeeForm(false);
    setEditingEmployee(null);
    setEmployeeFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    });
    setAssignments([
      { companyId: "", jobRoleId: "", locationId: "", departmentIds: [""], paycycleId: "" },
    ]);
    setEmployeeFormErrors({});
    setAssignmentDropdownData({});
  };

  // Handle assignment changes
  const updateAssignment = (index, field, value) => {
    const newAssignments = [...assignments];
    newAssignments[index] = { ...newAssignments[index], [field]: value };

    // If company changes, clear location, departments, and paycycle and load new ones
    if (field === "companyId") {
      newAssignments[index].locationId = "";
      newAssignments[index].departmentIds = [""];
      newAssignments[index].paycycleId = "";
      loadCompanyDependentData(value);
    }

    setAssignments(newAssignments);
  };

  const addAssignment = () => {
    setAssignments([
      ...assignments,
      { companyId: "", jobRoleId: "", locationId: "", departmentIds: [""], paycycleId: "" },
    ]);
  };

  const removeAssignment = (index) => {
    if (assignments.length > 1) {
      setAssignments(assignments.filter((_, i) => i !== index));
    }
  };

  const updateDepartmentIds = (assignmentIndex, departmentIndex, value) => {
    const newAssignments = [...assignments];
    const newDepartmentIds = [...newAssignments[assignmentIndex].departmentIds];
    newDepartmentIds[departmentIndex] = value;
    newAssignments[assignmentIndex].departmentIds = newDepartmentIds;
    setAssignments(newAssignments);
  };

  const addDepartmentId = (assignmentIndex) => {
    const newAssignments = [...assignments];
    newAssignments[assignmentIndex].departmentIds.push("");
    setAssignments(newAssignments);
  };

  const removeDepartmentId = (assignmentIndex, departmentIndex) => {
    const newAssignments = [...assignments];
    const newDepartmentIds = newAssignments[
      assignmentIndex
    ].departmentIds.filter((_, i) => i !== departmentIndex);
    newAssignments[assignmentIndex].departmentIds = newDepartmentIds;
    setAssignments(newAssignments);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading employees...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <People className="mr-2" />
              All Employees ({getFilteredEmployees().length})
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={openAddEmployeeForm}>
                <Add className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEmployeeFilters(!showEmployeeFilters)}
              >
                {showEmployeeFilters ? (
                  <Clear className="w-4 h-4 mr-2" />
                ) : (
                  <FilterList className="w-4 h-4 mr-2" />
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
                                <ExpandLess className="w-4 h-4" />
                              ) : (
                                <ExpandMore className="w-4 h-4" />
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
                            {employee.company_assignments?.[0]?.job_title ||
                              "N/A"}
                            {employee.company_assignments?.length > 1 &&
                              ` +${employee.company_assignments.length - 1}`}
                          </td>
                          <td className="p-3 text-sm">
                            {employee.company_assignments?.[0]?.company_name ||
                              "N/A"}
                          </td>
                          <td className="p-3 text-sm">
                            {employee.department_assignments?.[0]
                              ?.department_name || "N/A"}
                          </td>
                          <td className="p-3 text-sm">
                            {employee.location_assignments?.[0]
                              ?.location_name || "N/A"}
                          </td>
                          <td className="p-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditEmployeeForm(employee)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </td>
                        </tr>

                        {expandedRows[employee.id] &&
                          (employee.company_assignments?.slice(1) || []).map(
                            (assignment, index) => (
                              <tr key={index} className="border-b bg-gray-50">
                                <td></td>
                                <td></td>
                                <td></td>
                                <td className="p-3 text-sm">
                                  {assignment.job_title || "N/A"}
                                </td>
                                <td className="p-3 text-sm">
                                  {assignment.company_name || "N/A"}
                                </td>
                                <td className="p-3 text-sm"></td>
                                <td className="p-3 text-sm"></td>
                                <td></td>
                              </tr>
                            )
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
                    Showing {(currentEmployeePage - 1) * EMPLOYEES_PER_PAGE + 1}{" "}
                    to{" "}
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
                      Page {currentEmployeePage} of {getTotalEmployeePages()}
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
                      disabled={currentEmployeePage === getTotalEmployeePages()}
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

      {/* Employee Form Modal */}
      {showEmployeeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">
                  {editingEmployee ? "Edit Employee" : "Add New Employee"}
                </h3>
                <Button variant="outline" size="sm" onClick={closeEmployeeForm}>
                  <Close className="w-4 h-4" />
                </Button>
              </div>

              {loadingDropdowns ? (
                <div className="text-center py-8">Loading form data...</div>
              ) : (
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="employee-first-name">First Name *</Label>
                      <Input
                        id="employee-first-name"
                        value={employeeFormData.firstName}
                        onChange={(e) =>
                          setEmployeeFormData({
                            ...employeeFormData,
                            firstName: e.target.value,
                          })
                        }
                        placeholder="Enter first name"
                        className={
                          employeeFormErrors.firstName ? "border-red-500" : ""
                        }
                      />
                      {employeeFormErrors.firstName && (
                        <p className="text-red-500 text-sm mt-1">
                          {employeeFormErrors.firstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="employee-last-name">Last Name *</Label>
                      <Input
                        id="employee-last-name"
                        value={employeeFormData.lastName}
                        onChange={(e) =>
                          setEmployeeFormData({
                            ...employeeFormData,
                            lastName: e.target.value,
                          })
                        }
                        placeholder="Enter last name"
                        className={
                          employeeFormErrors.lastName ? "border-red-500" : ""
                        }
                      />
                      {employeeFormErrors.lastName && (
                        <p className="text-red-500 text-sm mt-1">
                          {employeeFormErrors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="employee-email">Email *</Label>
                    <Input
                      id="employee-email"
                      type="email"
                      value={employeeFormData.email}
                      onChange={(e) =>
                        setEmployeeFormData({
                          ...employeeFormData,
                          email: e.target.value,
                        })
                      }
                      placeholder="Enter email address"
                      className={
                        employeeFormErrors.email ? "border-red-500" : ""
                      }
                    />
                    {employeeFormErrors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {employeeFormErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="employee-phone">Phone</Label>
                    <Input
                      id="employee-phone"
                      type="tel"
                      value={employeeFormData.phone}
                      onChange={(e) =>
                        setEmployeeFormData({
                          ...employeeFormData,
                          phone: e.target.value,
                        })
                      }
                      placeholder="Enter phone number"
                    />
                  </div>

                  {/* Assignments */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label>Assignments *</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addAssignment}
                      >
                        <Add className="w-4 h-4 mr-2" />
                        Add Assignment
                      </Button>
                    </div>

                    {assignments.map((assignment, assignmentIndex) => (
                      <div
                        key={assignmentIndex}
                        className="border rounded-lg p-4 mb-4 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">
                            Assignment {assignmentIndex + 1}
                          </h4>
                          {assignments.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeAssignment(assignmentIndex)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor={`company-${assignmentIndex}`}>
                              Company *
                            </Label>
                            <select
                              id={`company-${assignmentIndex}`}
                              value={assignment.companyId}
                              onChange={(e) =>
                                updateAssignment(
                                  assignmentIndex,
                                  "companyId",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border rounded"
                            >
                              <option value="">Select Company</option>
                              {assignmentDropdownData.companies?.map(
                                (company) => (
                                  <option key={company.id} value={company.id}>
                                    {company.name}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          <div>
                            <Label htmlFor={`job-role-${assignmentIndex}`}>
                              Job Role *
                            </Label>
                            <select
                              id={`job-role-${assignmentIndex}`}
                              value={assignment.jobRoleId}
                              onChange={(e) =>
                                updateAssignment(
                                  assignmentIndex,
                                  "jobRoleId",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border rounded"
                            >
                              <option value="">Select Job Role</option>
                              {assignmentDropdownData.jobRoles?.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {role.title}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <Label htmlFor={`location-${assignmentIndex}`}>
                              Location *
                            </Label>
                            <select
                              id={`location-${assignmentIndex}`}
                              value={assignment.locationId}
                              onChange={(e) =>
                                updateAssignment(
                                  assignmentIndex,
                                  "locationId",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border rounded"
                              disabled={!assignment.companyId}
                            >
                              <option value="">Select Location</option>
                              {assignmentDropdownData.locations?.map(
                                (location) => (
                                  <option key={location.id} value={location.id}>
                                    {location.name}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          <div>
                            <Label>Departments</Label>
                            {assignment.departmentIds.map(
                              (deptId, deptIndex) => (
                                <div
                                  key={deptIndex}
                                  className="flex gap-2 mb-2"
                                >
                                  <select
                                    value={deptId}
                                    onChange={(e) =>
                                      updateDepartmentIds(
                                        assignmentIndex,
                                        deptIndex,
                                        e.target.value
                                      )
                                    }
                                    className="flex-1 p-2 border rounded"
                                    disabled={!assignment.companyId}
                                  >
                                    <option value="">Select Department</option>
                                    {assignmentDropdownData.departments?.map(
                                      (dept) => (
                                        <option key={dept.id} value={dept.id}>
                                          {dept.name}
                                        </option>
                                      )
                                    )}
                                  </select>
                                  {assignment.departmentIds.length > 1 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        removeDepartmentId(
                                          assignmentIndex,
                                          deptIndex
                                        )
                                      }
                                    >
                                      <Close className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              )
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addDepartmentId(assignmentIndex)}
                              disabled={!assignment.companyId}
                            >
                              <Add className="w-4 h-4 mr-2" />
                              Add Department
                            </Button>
                          </div>

                          <div>
                            <Label htmlFor={`paycycle-${assignmentIndex}`}>
                              Paycycle
                            </Label>
                            <select
                              id={`paycycle-${assignmentIndex}`}
                              value={assignment.paycycleId || ""}
                              onChange={(e) =>
                                updateAssignment(
                                  assignmentIndex,
                                  "paycycleId",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border rounded"
                              disabled={!assignment.companyId}
                            >
                              <option value="">Select Paycycle (Optional)</option>
                              {assignmentDropdownData.paycycles?.map(
                                (paycycle) => (
                                  <option key={paycycle.id} value={paycycle.id}>
                                    {paycycle.name} ({paycycle.frequency})
                                  </option>
                                )
                              )}
                            </select>
                            {assignment.companyId && assignmentDropdownData.paycycles?.length === 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                No paycycles available for this company
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {employeeFormErrors.assignments && (
                      <p className="text-red-500 text-sm mb-4">
                        {employeeFormErrors.assignments}
                      </p>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      onClick={handleEmployeeSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? "Saving..."
                        : editingEmployee
                        ? "Update Employee"
                        : "Add Employee"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={closeEmployeeForm}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
