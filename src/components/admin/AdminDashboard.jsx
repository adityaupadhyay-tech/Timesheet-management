"use client";

import React, { useState, useEffect } from "react";
import { useSupabase } from "@/contexts/SupabaseContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CompanyDetailView from "./CompanyDetailView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Building from "@mui/icons-material/Business";
import Edit from "@mui/icons-material/Edit";
import Search from "@mui/icons-material/Search";
import Clear from "@mui/icons-material/Clear";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
  Users,
  Clock,
} from "lucide-react";
import {
  getCompaniesWithStats,
  getCompaniesForDashboard,
  createCompany,
  updateCompany,
  deleteCompany,
  fetchCompanyWithDetails,
  addLocationForCompany,
  addDepartmentForCompany,
  updateLocation,
  updateDepartment,
  getManagersForLocation,
  addManagerToLocation,
  removeManagerFromLocation,
  addManagersToLocation,
  getManagersForDepartment,
  addManagerToDepartment,
  removeManagerFromDepartment,
  addManagersToDepartment,
  getDepartmentsByCompany,
  getLocationsByCompany,
  getAllEmployeesWithAssignments,
  getAllJobRoles,
  getJobRolesByCompany,
} from "../../lib/adminHelpers";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useSupabase();

  // State management
  const [companies, setCompanies] = useState([]);
  const [dashboardCompanies, setDashboardCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [activeTab, setActiveTab] = useState("companies");
  const [searchTerm, setSearchTerm] = useState("");

  // Manage tab filters
  const [manageFilters, setManageFilters] = useState({
    name: "",
    status: "all",
    minLocations: "",
    minDepartments: "",
    minEmployees: "",
  });

  // Manage tab state
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showEditCompany, setShowEditCompany] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [deletingCompany, setDeletingCompany] = useState(null);
  const [newCompany, setNewCompany] = useState({
    name: "",
    description: "",
    status: "active",
  });
  const [companyNameConfirmation, setCompanyNameConfirmation] = useState("");

  // Edit Company Tabs
  const [editCompanyActiveTab, setEditCompanyActiveTab] = useState("info");

  // Add Company Wizard
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardCompanyId, setWizardCompanyId] = useState(null);

  // Form validation
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Company details state (for edit view)
  const [companyDetails, setCompanyDetails] = useState({
    company: null,
    locations: [],
    departments: [],
    employees: [],
    jobRoles: [], // Available job roles for assignment
  });
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Location management state
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [showEditLocation, setShowEditLocation] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [newLocation, setNewLocation] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    manager_ids: [],
  });

  // Department management state
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [showEditDepartment, setShowEditDepartment] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    description: "",
    location_id: "",
    manager_ids: [],
  });

  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [selectedCompanyData, setSelectedCompanyData] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Employee assignment state
  const [showAssignEmployee, setShowAssignEmployee] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [employeeAssignments, setEmployeeAssignments] = useState({}); // Maps employee_id to {job_role_id, department_id, location_id, paycycle_id (UI only)}

  // Company detail view handler
  const handleCompanyClick = async (companyId) => {
    setIsLoadingDetails(true);
    setIsDetailViewOpen(true); // Open the modal immediately to show a loading state

    const { data, error } = await supabase.rpc("get_company_details_view", {
      p_company_id: companyId,
    });

    if (error) {
      console.error("Error fetching company details:", error);
      // Optionally, handle the error in the UI
      setIsDetailViewOpen(false);
    } else {
      setSelectedCompanyData(data);
    }

    setIsLoadingDetails(false);
  };

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load both types of company data in parallel
      const [companiesResult, dashboardResult] = await Promise.all([
        getCompaniesWithStats(),
        getCompaniesForDashboard(),
      ]);

      if (companiesResult.error) {
        console.error("Error loading companies:", companiesResult.error);
      } else {
        setCompanies(companiesResult.data || []);
      }

      if (dashboardResult.error) {
        console.error(
          "Error loading dashboard companies:",
          dashboardResult.error
        );
        if (!companiesResult.error) {
          setError(dashboardResult.error);
        }
      } else {
        setDashboardCompanies(dashboardResult.data || []);
      }
    } catch (err) {
      setError("Failed to load administration data");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Filter companies based on search term
  const filteredCompanies = dashboardCompanies.filter(
    (company) =>
      (company.company_name || company.name)
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      company.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter companies for Manage tab
  const getFilteredManageCompanies = () => {
    return companies.filter((company) => {
      // Name filter
      if (
        manageFilters.name &&
        !company.name.toLowerCase().includes(manageFilters.name.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (
        manageFilters.status !== "all" &&
        company.status !== manageFilters.status
      ) {
        return false;
      }

      // Min locations filter
      if (
        manageFilters.minLocations &&
        company.location_count < parseInt(manageFilters.minLocations)
      ) {
        return false;
      }

      // Min departments filter
      if (
        manageFilters.minDepartments &&
        company.department_count < parseInt(manageFilters.minDepartments)
      ) {
        return false;
      }

      // Min employees filter
      if (
        manageFilters.minEmployees &&
        company.employee_count < parseInt(manageFilters.minEmployees)
      ) {
        return false;
      }

      return true;
    });
  };

  const updateManageFilter = (field, value) => {
    setManageFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearManageFilters = () => {
    setManageFilters({
      name: "",
      status: "all",
      minLocations: "",
      minDepartments: "",
      minEmployees: "",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "on-hold":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  // CRUD operations for manage tab
  const handleAddCompany = async () => {
    if (!newCompany.name.trim()) return;

    try {
      setLoading(true);
      const result = await createCompany(newCompany);

      if (result.error) {
        setError(result.error);
      } else {
        setShowAddCompany(false);
        setNewCompany({ name: "", description: "", status: "active" });
        await loadData(); // Refresh data
      }
    } catch (err) {
      setError("Failed to add company");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCompany = async () => {
    if (!editingCompany) return;

    // Validate form
    const errors = validateCompanyForm(newCompany);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await updateCompany(editingCompany.id, newCompany);

      if (result.error) {
        setError(result.error);
      } else {
        setShowEditCompany(false);
        setEditingCompany(null);
        setNewCompany({ name: "", description: "", status: "active" });
        setFormErrors({});
        await loadData(); // Refresh data
      }
    } catch (err) {
      setError("Failed to update company");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!deletingCompany || companyNameConfirmation !== deletingCompany.name)
      return;

    try {
      setLoading(true);
      const result = await deleteCompany(deletingCompany.id);

      if (result.error) {
        setError(result.error);
      } else {
        setShowDeleteConfirm(false);
        setDeletingCompany(null);
        setCompanyNameConfirmation("");
        await loadData(); // Refresh data
      }
    } catch (err) {
      setError("Failed to delete company");
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validateCompanyForm = (company) => {
    const errors = {};

    if (!company.name?.trim()) {
      errors.name = "Company name is required";
    } else if (company.name.trim().length < 2) {
      errors.name = "Company name must be at least 2 characters";
    } else if (company.name.trim().length > 100) {
      errors.name = "Company name must be less than 100 characters";
    }

    if (company.description && company.description.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }

    return errors;
  };

  const validateLocationForm = (location) => {
    const errors = {};

    if (!location.name?.trim()) {
      errors.name = "Location name is required";
    } else if (location.name.trim().length < 2) {
      errors.name = "Location name must be at least 2 characters";
    }

    if (
      location.postal_code &&
      !/^\d{5}(-\d{4})?$/.test(location.postal_code)
    ) {
      errors.postal_code =
        "Please enter a valid postal code (e.g., 12345 or 12345-6789)";
    }

    return errors;
  };

  const validateDepartmentForm = (department) => {
    const errors = {};

    if (!department.name?.trim()) {
      errors.name = "Department name is required";
    } else if (department.name.trim().length < 2) {
      errors.name = "Department name must be at least 2 characters";
    }

    if (!department.location_id) {
      errors.location_id = "Please select a location for this department";
    }

    if (department.description && department.description.length > 300) {
      errors.description = "Description must be less than 300 characters";
    }

    return errors;
  };

  const openEditModal = async (company) => {
    setEditingCompany(company);
    setNewCompany({
      name: company.name,
      description: company.description || "",
      status: company.status,
    });
    setShowEditCompany(true);
    setEditCompanyActiveTab("info"); // Reset to first tab
    setFormErrors({}); // Clear any previous errors

    // Initialize with empty data first
    setCompanyDetails({
      company: company,
      locations: [],
      departments: [],
      employees: [],
      jobRoles: [],
    });

    // Fetch company details with locations, departments, and employees
    await fetchCompanyDetailsData(company.id);
  };

  const openDeleteModal = (company) => {
    setDeletingCompany(company);
    setCompanyNameConfirmation("");
    setShowDeleteConfirm(true);
  };

  const fetchCompanyDetailsData = async (companyId) => {
    try {
      setDetailsLoading(true);
      console.log("Fetching details for company ID:", companyId);

      const result = await fetchCompanyWithDetails(companyId);
      console.log("Fetch result:", result);

      if (result.success && result.data) {
        setCompanyDetails(result.data);
        setError(null); // Clear any previous errors
      } else {
        console.error("Error in result:", result.error);
        setError(result.error || "Failed to load company details");
      }
    } catch (err) {
      console.error("Exception in fetchCompanyDetailsData:", err);
      setError("Failed to load company details");
    } finally {
      setDetailsLoading(false);
    }
  };

  // Employee assignment functions
  const loadAvailableEmployees = async () => {
    try {
      if (!editingCompany || !editingCompany.id) {
        console.error("No company selected for employee assignment");
        setAvailableEmployees([]);
        return;
      }

      // Step 1: Fetch ALL employees from the database
      const { data: allEmployees, error: employeesError } = await supabase
        .from("employees")
        .select("id, first_name, last_name, email")
        .order("first_name");

      if (employeesError) {
        console.warn(
          "Database not configured or employees table not found. Using mock data for development."
        );
        console.log(
          "To use real data, ensure your Supabase database is set up. Go to Administration > User Management to add employees."
        );

        // Use mock data if database is not set up
        const mockEmployees = [
          {
            id: "emp-1",
            first_name: "Alice",
            last_name: "Johnson",
            email: "alice.johnson@example.com",
          },
          {
            id: "emp-2",
            first_name: "Bob",
            last_name: "Smith",
            email: "bob.smith@example.com",
          },
          {
            id: "emp-3",
            first_name: "Carol",
            last_name: "Williams",
            email: "carol.williams@example.com",
          },
          {
            id: "emp-4",
            first_name: "David",
            last_name: "Brown",
            email: "david.brown@example.com",
          },
          {
            id: "emp-5",
            first_name: "Emma",
            last_name: "Davis",
            email: "emma.davis@example.com",
          },
        ];

        setAvailableEmployees(mockEmployees);
        return;
      }

      // Step 2: Fetch employee IDs that are ALREADY assigned to THIS specific company
      const { data: assignedEmployees, error: assignedError } = await supabase
        .from("employee_companies")
        .select("employee_id")
        .eq("company_id", editingCompany.id);

      if (assignedError) {
        console.error("Error fetching assigned employees:", assignedError);
        // If we can't get assigned employees, show all to avoid blocking workflow
        setAvailableEmployees(allEmployees || []);
        return;
      }

      // Step 3: Create a Set of already-assigned employee IDs for O(1) lookup
      const assignedEmployeeIds = new Set(
        (assignedEmployees || []).map((ae) => ae.employee_id)
      );

      // Step 4: Filter OUT employees who are already assigned to this company
      // This is the critical step that prevents duplicate key errors
      const availableEmployees = (allEmployees || []).filter(
        (emp) => !assignedEmployeeIds.has(emp.id)
      );

      console.log(
        `[Employee Filter] Total: ${allEmployees?.length || 0}, ` +
          `Already assigned to "${editingCompany.name}": ${assignedEmployeeIds.size}, ` +
          `Available for assignment: ${availableEmployees.length}`
      );

      setAvailableEmployees(availableEmployees);
    } catch (err) {
      console.error("Error loading available employees:", err);
      setAvailableEmployees([]);
    }
  };

  const handleOpenAssignEmployee = async () => {
    setShowAssignEmployee(true);
    setSelectedEmployees([]);
    setEmployeeSearchTerm("");
    setEmployeeAssignments({});

    // Load available employees and job roles for this company
    await Promise.all([loadAvailableEmployees(), loadJobRolesForCompany()]);
  };

  const loadJobRolesForCompany = async () => {
    try {
      if (!editingCompany || !editingCompany.id) {
        console.warn("No company selected for loading job roles");
        setCompanyDetails((prev) => ({ ...prev, jobRoles: [] }));
        return;
      }

      const result = await getJobRolesByCompany(editingCompany.id);
      if (result.error) {
        console.error("Error loading job roles:", result.error);
        setCompanyDetails((prev) => ({ ...prev, jobRoles: [] }));
      } else {
        setCompanyDetails((prev) => ({ ...prev, jobRoles: result.data || [] }));
      }
    } catch (err) {
      console.error("Error loading job roles:", err);
      setCompanyDetails((prev) => ({ ...prev, jobRoles: [] }));
    }
  };

  const handleAssignEmployees = async () => {
    if (selectedEmployees.length === 0) {
      alert("Please select at least one employee to assign");
      return;
    }

    // Validate that all selected employees have job role, department, and location assigned
    const missingAssignments = selectedEmployees.filter((employeeId) => {
      const assignment = employeeAssignments[employeeId] || {};
      return (
        !assignment.job_role_id ||
        !assignment.department_id ||
        !assignment.location_id
      );
    });

    if (missingAssignments.length > 0) {
      const employees = missingAssignments
        .map((id) => {
          const emp = availableEmployees.find((e) => e.id === id);
          return emp ? `${emp.first_name} ${emp.last_name}` : "Unknown";
        })
        .join(", ");

      alert(
        `Please assign job role, department, and location for:\n${employees}`
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Check if using mock data (employee IDs start with 'emp-')
      const isMockData = selectedEmployees.some((id) => id.startsWith("emp-"));

      if (isMockData) {
        // Simulate assignment for mock data
        const assignmentSummary = selectedEmployees
          .map((employeeId) => {
            const employee = availableEmployees.find(
              (e) => e.id === employeeId
            );
            const assignment = employeeAssignments[employeeId] || {};
            const jobRole = companyDetails.jobRoles?.find(
              (j) => j.id === assignment.job_role_id
            );
            const dept = companyDetails.departments.find(
              (d) => d.id === assignment.department_id
            );
            const loc = companyDetails.locations.find(
              (l) => l.id === assignment.location_id
            );
            const paycycle = companyDetails.paycycles?.find(
              (p) => p.id === assignment.paycycle_id
            );

            return `• ${employee.first_name} ${employee.last_name}${
              jobRole ? ` as ${jobRole.title}` : ""
            }${dept ? ` → ${dept.name}` : ""}${loc ? ` @ ${loc.name}` : ""}${
              paycycle ? ` (${paycycle.name})` : ""
            }`;
          })
          .join("\n");

        alert(
          `Successfully assigned ${selectedEmployees.length} employee${
            selectedEmployees.length !== 1 ? "s" : ""
          } to ${
            editingCompany.name
          }:\n\n${assignmentSummary}\n\nNote: Using mock data. Connect to Supabase to persist changes.`
        );

        // Close modal and reset
        setShowAssignEmployee(false);
        setSelectedEmployees([]);
        setEmployeeSearchTerm("");
        setEmployeeAssignments({});
        setIsSubmitting(false);
        return;
      }

      // Real database update - Create new assignment for each employee
      let successCount = 0;
      let errorCount = 0;

      for (const employeeId of selectedEmployees) {
        const assignment = employeeAssignments[employeeId] || {};
        let employeeSuccess = true;

        try {
          // Step 1: Insert into employee_companies (links employee to company with job role)
          const companyAssignmentData = {
            employee_id: employeeId,
            company_id: editingCompany.id,
            job_role_id: assignment.job_role_id,
          };

          const { error: companyError } = await supabase
            .from("employee_companies")
            .insert(companyAssignmentData);

          if (companyError) {
            console.error(
              `Error inserting into employee_companies for ${employeeId}:`,
              companyError
            );
            employeeSuccess = false;
            throw companyError;
          }

          // Step 2: Insert into employee_departments (links employee to department)
          const departmentAssignmentData = {
            employee_id: employeeId,
            department_id: assignment.department_id,
          };

          const { error: departmentError } = await supabase
            .from("employee_departments")
            .insert(departmentAssignmentData);

          if (departmentError) {
            console.error(
              `Error inserting into employee_departments for ${employeeId}:`,
              departmentError
            );
            employeeSuccess = false;
            throw departmentError;
          }

          // Step 3: Insert into employee_locations (links employee to location)
          const locationAssignmentData = {
            employee_id: employeeId,
            location_id: assignment.location_id,
          };

          const { error: locationError } = await supabase
            .from("employee_locations")
            .insert(locationAssignmentData);

          if (locationError) {
            console.error(
              `Error inserting into employee_locations for ${employeeId}:`,
              locationError
            );
            employeeSuccess = false;
            throw locationError;
          }

          // If all inserts succeeded
          if (employeeSuccess) {
            successCount++;
          }
        } catch (err) {
          errorCount++;
          console.error(`Failed to assign employee ${employeeId}:`, err);
        }
      }

      // Refresh company details
      await fetchCompanyDetailsData(editingCompany.id);

      // Close modal and reset
      setShowAssignEmployee(false);
      setSelectedEmployees([]);
      setEmployeeSearchTerm("");
      setEmployeeAssignments({});

      if (errorCount > 0) {
        alert(
          `Assigned ${successCount} employee${
            successCount !== 1 ? "s" : ""
          } successfully. ${errorCount} failed.`
        );
      } else {
        alert(
          `Successfully assigned ${successCount} employee${
            successCount !== 1 ? "s" : ""
          } to ${editingCompany.name}`
        );
      }
    } catch (err) {
      console.error("Error assigning employees:", err);
      alert("Failed to assign employees: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveEmployee = async (employeeId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this employee from the company?"
    );
    if (!confirmed) return;

    try {
      setDetailsLoading(true);

      // Delete from all three join tables
      const deletePromises = [
        // Delete from employee_companies
        supabase
          .from("employee_companies")
          .delete()
          .eq("employee_id", employeeId)
          .eq("company_id", editingCompany.id),

        // Delete from employee_departments
        supabase
          .from("employee_departments")
          .delete()
          .eq("employee_id", employeeId),

        // Delete from employee_locations
        supabase
          .from("employee_locations")
          .delete()
          .eq("employee_id", employeeId),
      ];

      const results = await Promise.allSettled(deletePromises);

      // Check if any deletions failed
      const errors = results
        .filter((result) => result.status === "rejected" || result.value?.error)
        .map((result) => result.reason || result.value?.error);

      if (errors.length > 0) {
        console.error("Error removing employee from join tables:", errors);
        alert("Failed to remove employee: " + errors[0].message);
        return;
      }

      // Refresh company details
      await fetchCompanyDetailsData(editingCompany.id);
      alert(
        "Employee removed successfully from company, department, and location"
      );
    } catch (err) {
      console.error("Error removing employee:", err);
      alert("Failed to remove employee: " + err.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const toggleEmployeeSelection = (employeeId) => {
    setSelectedEmployees((prev) => {
      if (prev.includes(employeeId)) {
        // Remove from selection and clear assignment data
        const newAssignments = { ...employeeAssignments };
        delete newAssignments[employeeId];
        setEmployeeAssignments(newAssignments);
        return prev.filter((id) => id !== employeeId);
      } else {
        // Add to selection and initialize assignment data
        setEmployeeAssignments((prev) => ({
          ...prev,
          [employeeId]: {
            job_role_id: "",
            department_id: "",
            location_id: "",
            paycycle_id: "", // UI display only, not sent to backend
          },
        }));
        return [...prev, employeeId];
      }
    });
  };

  const updateEmployeeAssignment = (employeeId, field, value) => {
    setEmployeeAssignments((prev) => ({
      ...prev,
      [employeeId]: {
        ...(prev[employeeId] || {}),
        [field]: value,
      },
    }));
  };

  const getFilteredAvailableEmployees = () => {
    if (!employeeSearchTerm) return availableEmployees;

    const term = employeeSearchTerm.toLowerCase();
    return availableEmployees.filter(
      (emp) =>
        emp.first_name?.toLowerCase().includes(term) ||
        emp.last_name?.toLowerCase().includes(term) ||
        emp.email?.toLowerCase().includes(term) ||
        emp.job_title?.toLowerCase().includes(term)
    );
  };

  // Wizard functions
  const startAddCompanyWizard = () => {
    setShowAddCompany(true);
    setWizardStep(1);
    setWizardCompanyId(null);
    setNewCompany({ name: "", description: "", status: "active" });
    setNewLocation({
      name: "",
      address: "",
      city: "",
      state: "",
      postal_code: "",
      manager_ids: [],
    });
    setNewDepartment({
      name: "",
      description: "",
      location_id: "",
      manager_ids: [],
    });
    setFormErrors({});
  };

  const handleWizardNext = async () => {
    if (wizardStep === 1) {
      // Validate and create company
      const errors = validateCompanyForm(newCompany);
      setFormErrors(errors);

      if (Object.keys(errors).length > 0) {
        return;
      }

      try {
        setIsSubmitting(true);
        const result = await createCompany(newCompany);

        if (result.error) {
          setError(result.error);
          return;
        }

        setWizardCompanyId(result.data[0].id);
        setWizardStep(2);
        setFormErrors({});

        // Fetch company details for the new company
        await fetchCompanyDetailsData(result.data[0].id);
      } catch (err) {
        setError("Failed to create company");
      } finally {
        setIsSubmitting(false);
      }
    } else if (wizardStep === 2) {
      // Move to departments step
      setWizardStep(3);
    }
  };

  const handleWizardBack = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1);
    }
  };

  const handleWizardFinish = async () => {
    setShowAddCompany(false);
    setWizardStep(1);
    setWizardCompanyId(null);
    setFormErrors({});
    await loadData(); // Refresh data
  };

  const handleAddLocation = async () => {
    const companyId = editingCompany?.id || wizardCompanyId;
    if (!companyId) return;

    // Validate form
    const errors = validateLocationForm(newLocation);
    setFormErrors((prev) => ({ ...prev, location: errors }));

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setDetailsLoading(true);
      const result = await addLocationForCompany(newLocation, companyId);

      if (result.data && !result.error) {
        setShowAddLocation(false);
        setNewLocation({
          name: "",
          address: "",
          city: "",
          state: "",
          postal_code: "",
          manager_ids: [],
        });
        setFormErrors((prev) => ({ ...prev, location: {} }));
        // Refresh company details
        await fetchCompanyDetailsData(companyId);
      } else {
        setError(result.error || "Failed to add location");
      }
    } catch (err) {
      setError("Failed to add location");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleAddDepartment = async () => {
    const companyId = editingCompany?.id || wizardCompanyId;
    if (!companyId) return;

    // Validate form
    const errors = validateDepartmentForm(newDepartment);
    setFormErrors((prev) => ({ ...prev, department: errors }));

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setDetailsLoading(true);
      const result = await addDepartmentForCompany(newDepartment, companyId);

      if (result.data && !result.error) {
        setShowAddDepartment(false);
        setNewDepartment({
          name: "",
          description: "",
          location_id: "",
          manager_ids: [],
        });
        setFormErrors((prev) => ({ ...prev, department: {} }));
        // Refresh company details
        await fetchCompanyDetailsData(companyId);
      } else {
        setError(result.error || "Failed to add department");
      }
    } catch (err) {
      setError("Failed to add department");
    } finally {
      setDetailsLoading(false);
    }
  };

  // Edit handlers
  const handleEditLocation = async (location) => {
    // Fetch current managers for this location
    const managersResult = await getManagersForLocation(location.id);
    const currentManagerIds = managersResult.data
      ? managersResult.data.map((manager) => manager.id)
      : [];

    setEditingLocation(location);
    setNewLocation({
      name: location.name,
      address: location.address || "",
      city: location.city || "",
      state: location.state || "",
      postal_code: location.postal_code || "",
      manager_ids: currentManagerIds,
    });
    setShowEditLocation(true);
    setFormErrors({});
  };

  const handleUpdateLocation = async () => {
    if (!editingLocation) return;

    // Validate form
    const errors = validateLocationForm(newLocation);
    setFormErrors((prev) => ({ ...prev, location: errors }));

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setDetailsLoading(true);
      const result = await updateLocation(editingLocation.id, newLocation);

      if (result.data && !result.error) {
        setShowEditLocation(false);
        setEditingLocation(null);
        setNewLocation({
          name: "",
          address: "",
          city: "",
          state: "",
          postal_code: "",
          manager_ids: [],
        });
        setFormErrors((prev) => ({ ...prev, location: {} }));
        // Refresh company details
        const companyId = editingCompany?.id || wizardCompanyId;
        await fetchCompanyDetailsData(companyId);
      } else {
        setError(result.error || "Failed to update location");
      }
    } catch (err) {
      setError("Failed to update location");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleEditDepartment = async (department) => {
    // Fetch current managers for this department
    const managersResult = await getManagersForDepartment(department.id);
    const currentManagerIds = managersResult.data
      ? managersResult.data.map((manager) => manager.id)
      : [];

    setEditingDepartment(department);
    setNewDepartment({
      name: department.name,
      description: department.description || "",
      location_id: department.location_id || "",
      manager_ids: currentManagerIds,
    });
    setShowEditDepartment(true);
    setFormErrors({});
  };

  const handleUpdateDepartment = async () => {
    if (!editingDepartment) return;

    // Validate form
    const errors = validateDepartmentForm(newDepartment);
    setFormErrors((prev) => ({ ...prev, department: errors }));

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setDetailsLoading(true);
      const result = await updateDepartment(
        editingDepartment.id,
        newDepartment
      );

      if (result.data && !result.error) {
        setShowEditDepartment(false);
        setEditingDepartment(null);
        setNewDepartment({
          name: "",
          description: "",
          location_id: "",
          manager_ids: [],
        });
        setFormErrors((prev) => ({ ...prev, department: {} }));
        // Refresh company details
        const companyId = editingCompany?.id || wizardCompanyId;
        await fetchCompanyDetailsData(companyId);
      } else {
        setError(result.error || "Failed to update department");
      }
    } catch (err) {
      setError("Failed to update department");
    } finally {
      setDetailsLoading(false);
    }
  };

  // Employee functions removed - moved to EmployeeManagement component
  const dummyFunction = async (employee) => {
    try {
      setEditingEmployee(employee);
      setShowEmployeeForm(true);
      setLoadingDropdowns(true);

      // 1. Call the new function to get all employee data
      const { data: employeeDetails, error } = await getEmployeeDetailsForEdit(
        employee.id
      );

      if (error) {
        console.error("Error fetching employee details:", error);
        setError("Failed to load employee details");
        setShowEmployeeForm(false);
        return;
      }

      // 2. Use the data to set the state for the form
      setEmployeeFormData({
        firstName: employeeDetails.first_name || "",
        lastName: employeeDetails.last_name || "",
        email: employeeDetails.email || "",
        phone: employeeDetails.phone || "",
      });

      // 3. Set the state for the structured assignments
      const assignments = employeeDetails.assignments || [];

      // If no assignments, provide one empty assignment block
      if (assignments.length === 0) {
        setAssignments([
          { companyId: "", jobRoleId: "", locationId: "", departmentIds: [""] },
        ]);
      } else {
        setAssignments(assignments);

        // Load dropdown data for each assignment that has a company
        for (let i = 0; i < assignments.length; i++) {
          if (assignments[i].companyId) {
            await loadCompanySpecificData(i, assignments[i].companyId);
          }
        }
      }

      setEmployeeFormErrors({});

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

  const loadInitialDropdownData = async () => {
    try {
      setLoadingDropdowns(true);

      const [companiesResult, jobRolesResult] = await Promise.all([
        getAllCompanies(),
        getAllJobRoles(),
      ]);

      if (companiesResult.data) {
        setAllCompaniesData(companiesResult.data);
      }

      if (jobRolesResult.data) {
        setAllJobRolesData(jobRolesResult.data);
      }
    } catch (err) {
      console.error("Error loading dropdown data:", err);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const loadCompanySpecificData = async (assignmentIndex, companyId) => {
    if (!companyId) {
      // Clear data for this assignment
      setAssignmentDropdownData((prev) => ({
        ...prev,
        [assignmentIndex]: { departments: [], locations: [] },
      }));
      return;
    }

    try {
      const [departmentsResult, locationsResult] = await Promise.all([
        getDepartmentsByCompany(companyId),
        getLocationsByCompany(companyId),
      ]);

      setAssignmentDropdownData((prev) => ({
        ...prev,
        [assignmentIndex]: {
          departments: departmentsResult.data || [],
          locations: locationsResult.data || [],
        },
      }));
    } catch (err) {
      console.error("Error loading company-specific data:", err);
    }
  };

  const handleAssignmentCompanyChange = async (assignmentIndex, companyId) => {
    const newAssignments = [...assignments];
    newAssignments[assignmentIndex] = {
      companyId,
      jobRoleId: "",
      locationId: "",
      departmentIds: [""],
    };
    setAssignments(newAssignments);

    await loadCompanySpecificData(assignmentIndex, companyId);
  };

  const handleAssignmentJobRoleChange = (assignmentIndex, jobRoleId) => {
    const newAssignments = [...assignments];
    newAssignments[assignmentIndex].jobRoleId = jobRoleId;
    setAssignments(newAssignments);
  };

  const handleAssignmentLocationChange = (assignmentIndex, locationId) => {
    const newAssignments = [...assignments];
    newAssignments[assignmentIndex].locationId = locationId;
    setAssignments(newAssignments);
  };

  const handleAssignmentDepartmentChange = (
    assignmentIndex,
    deptIndex,
    departmentId
  ) => {
    const newAssignments = [...assignments];
    newAssignments[assignmentIndex].departmentIds[deptIndex] = departmentId;
    setAssignments(newAssignments);
  };

  const addDepartmentToAssignment = (assignmentIndex) => {
    const newAssignments = [...assignments];
    newAssignments[assignmentIndex].departmentIds.push("");
    setAssignments(newAssignments);
  };

  const removeDepartmentFromAssignment = (assignmentIndex, deptIndex) => {
    const newAssignments = [...assignments];
    newAssignments[assignmentIndex].departmentIds.splice(deptIndex, 1);
    // Ensure at least one department dropdown exists
    if (newAssignments[assignmentIndex].departmentIds.length === 0) {
      newAssignments[assignmentIndex].departmentIds = [""];
    }
    setAssignments(newAssignments);
  };

  const addNewAssignment = () => {
    if (assignments.length < MAX_ASSIGNMENTS) {
      setAssignments([
        ...assignments,
        { companyId: "", jobRoleId: "", locationId: "", departmentIds: [""] },
      ]);
    }
  };

  const removeAssignment = (assignmentIndex) => {
    const newAssignments = assignments.filter(
      (_, idx) => idx !== assignmentIndex
    );
    // Ensure at least one assignment exists
    if (newAssignments.length === 0) {
      newAssignments.push({
        companyId: "",
        jobRoleId: "",
        locationId: "",
        departmentIds: [""],
      });
    }
    setAssignments(newAssignments);

    // Clean up dropdown data
    const newDropdownData = { ...assignmentDropdownData };
    delete newDropdownData[assignmentIndex];
    setAssignmentDropdownData(newDropdownData);
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

    // Validate at least one assignment has a company
    const hasValidAssignment = assignments.some((a) => a.companyId);
    if (!hasValidAssignment) {
      errors.assignments = "At least one company assignment is required";
    }

    return errors;
  };

  const handleSaveEmployee = async () => {
    // Validate form
    const errors = validateEmployeeForm();
    setEmployeeFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

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
          { companyId: "", jobRoleId: "", locationId: "", departmentIds: [""] },
        ]);
        setAssignmentDropdownData({});
        setEmployeeFormErrors({});
        await loadData();
      }
    } catch (err) {
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
      { companyId: "", jobRoleId: "", locationId: "", departmentIds: [""] },
    ]);
    setAssignmentDropdownData({});
    setEmployeeFormErrors({});
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading administration data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="font-semibold mb-2">Error Loading Data</p>
              <p className="text-sm mb-4">{error}</p>
              <Button onClick={loadData} className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-center">
          <TabsList className="inline-flex bg-muted/50 p-1 rounded-md max-w-4xl">
            <TabsTrigger
              value="companies"
              className="flex items-center justify-center min-w-0 flex-1 mx-1"
            >
              <Building className="w-4 h-4 mr-2" />
              Companies
            </TabsTrigger>
            <TabsTrigger
              value="manage"
              className="flex items-center justify-center min-w-0 flex-1 mx-1"
            >
              <Edit className="w-4 h-4 mr-2" />
              Manage
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Companies Tab */}
        <TabsContent value="companies" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Building className="mr-2" />
                  Companies
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-md">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      {searchTerm ? `${filteredCompanies.length}/` : ""}
                      {dashboardCompanies.length} Total
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            {dashboardCompanies.length > 0 && (
              <div className="px-6 pb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchTerm && (
                    <Button
                      onClick={clearSearch}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto w-auto"
                      variant="ghost"
                      size="sm"
                    >
                      <Clear className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
            <CardContent>
              {filteredCompanies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">
                    {dashboardCompanies.length === 0
                      ? "No Companies Found"
                      : "No Search Results"}
                  </p>
                  <p className="text-sm">
                    {dashboardCompanies.length === 0
                      ? "Connect your Supabase database to see companies here."
                      : "Try adjusting your search terms."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Company Name</th>
                        <th className="text-left p-3">City</th>
                        <th className="text-left p-3">State</th>
                        <th className="text-left p-3">Postal Code</th>
                        <th className="text-left p-3">Departments</th>
                        <th className="text-left p-3">Employees</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCompanies.map((company) => (
                        <tr
                          key={company.id}
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleCompanyClick(company.id)}
                        >
                          <td className="p-3">
                            <div className="font-medium">
                              {company.company_name || company.name}
                            </div>
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {company.city || "N/A"}
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {company.state || "N/A"}
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {company.postal_code || "N/A"}
                          </td>
                          <td className="p-3 text-sm">
                            {company.department_count || 0}
                          </td>
                          <td className="p-3 text-sm">
                            {company.employee_count || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Tab */}
        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="flex items-center">
                    <Edit className="mr-2" />
                    Manage Companies
                  </CardTitle>
                  {(manageFilters.name ||
                    manageFilters.status !== "all" ||
                    manageFilters.minLocations ||
                    manageFilters.minDepartments ||
                    manageFilters.minEmployees) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearManageFilters}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Clear className="mr-1" />
                      Clear Filters
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Showing {getFilteredManageCompanies().length} of{" "}
                    {companies.length}
                  </span>
                  <Button onClick={startAddCompanyWizard}>Add Company</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {companies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>
                    No companies to manage. Connect your Supabase database to
                    see companies here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3">
                          <div className="space-y-2">
                            <div className="font-medium text-gray-700">
                              Company Name
                            </div>
                            <Input
                              type="text"
                              placeholder="Filter by name..."
                              value={manageFilters.name}
                              onChange={(e) =>
                                updateManageFilter("name", e.target.value)
                              }
                              className="h-8 text-xs"
                            />
                          </div>
                        </th>
                        <th className="text-left p-3">
                          <div className="space-y-2">
                            <div className="font-medium text-gray-700">
                              Status
                            </div>
                            <select
                              value={manageFilters.status}
                              onChange={(e) =>
                                updateManageFilter("status", e.target.value)
                              }
                              className="h-8 text-xs w-full px-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="all">All</option>
                              <option value="active">Active</option>
                              <option value="on-hold">On Hold</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                        </th>
                        <th className="text-left p-3">
                          <div className="space-y-2">
                            <div className="font-medium text-gray-700">
                              Locations
                            </div>
                            <Input
                              type="number"
                              placeholder="Min..."
                              value={manageFilters.minLocations}
                              onChange={(e) =>
                                updateManageFilter(
                                  "minLocations",
                                  e.target.value
                                )
                              }
                              className="h-8 text-xs w-20"
                              min="0"
                            />
                          </div>
                        </th>
                        <th className="text-left p-3">
                          <div className="space-y-2">
                            <div className="font-medium text-gray-700">
                              Departments
                            </div>
                            <Input
                              type="number"
                              placeholder="Min..."
                              value={manageFilters.minDepartments}
                              onChange={(e) =>
                                updateManageFilter(
                                  "minDepartments",
                                  e.target.value
                                )
                              }
                              className="h-8 text-xs w-20"
                              min="0"
                            />
                          </div>
                        </th>
                        <th className="text-left p-3">
                          <div className="space-y-2">
                            <div className="font-medium text-gray-700">
                              Employees
                            </div>
                            <Input
                              type="number"
                              placeholder="Min..."
                              value={manageFilters.minEmployees}
                              onChange={(e) =>
                                updateManageFilter(
                                  "minEmployees",
                                  e.target.value
                                )
                              }
                              className="h-8 text-xs w-20"
                              min="0"
                            />
                          </div>
                        </th>
                        <th className="text-left p-3">
                          <div className="font-medium text-gray-700">
                            Actions
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredManageCompanies().length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="p-8 text-center text-gray-500"
                          >
                            <FilterList className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                            <p className="mb-2">
                              No companies match your filters
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearManageFilters}
                            >
                              Clear Filters
                            </Button>
                          </td>
                        </tr>
                      ) : (
                        getFilteredManageCompanies().map((company) => (
                          <tr
                            key={company.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="p-3">
                              <div className="font-medium">{company.name}</div>
                              <div className="text-sm text-gray-500">
                                {company.description}
                              </div>
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  company.status
                                )}`}
                              >
                                {company.status}
                              </span>
                            </td>
                            <td className="p-3 text-sm">
                              {company.location_count || 0}
                            </td>
                            <td className="p-3 text-sm">
                              {company.department_count || 0}
                            </td>
                            <td className="p-3 text-sm">
                              {company.employee_count || 0}
                            </td>
                            <td className="p-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditModal(company)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Company Wizard */}
      {showAddCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold">Add New Company</h3>
                  <p className="text-sm text-gray-600">
                    Step {wizardStep} of 3
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddCompany(false);
                    setWizardStep(1);
                    setWizardCompanyId(null);
                    setNewCompany({
                      name: "",
                      description: "",
                      status: "active",
                    });
                    setFormErrors({});
                  }}
                >
                  Cancel
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      wizardStep >= 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    1
                  </div>
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      wizardStep >= 2 ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  ></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      wizardStep >= 2
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    2
                  </div>
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      wizardStep >= 3 ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  ></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      wizardStep >= 3
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    3
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  <span>Company Info</span>
                  <span>Locations</span>
                  <span>Departments</span>
                </div>
              </div>

              {/* Step 1: Company Info */}
              {wizardStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                    <p className="text-sm text-gray-600">
                      Enter the basic details for your new company.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="wizard-company-name">
                        Company Name *
                      </Label>
                      <Input
                        id="wizard-company-name"
                        value={newCompany.name}
                        onChange={(e) =>
                          setNewCompany({ ...newCompany, name: e.target.value })
                        }
                        placeholder="Enter company name"
                        className={formErrors.name ? "border-red-500" : ""}
                      />
                      {formErrors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="wizard-company-description">
                        Description
                      </Label>
                      <textarea
                        id="wizard-company-description"
                        value={newCompany.description}
                        onChange={(e) =>
                          setNewCompany({
                            ...newCompany,
                            description: e.target.value,
                          })
                        }
                        placeholder="Enter company description"
                        className={`w-full border rounded px-3 py-2 min-h-[100px] ${
                          formErrors.description ? "border-red-500" : ""
                        }`}
                      />
                      {formErrors.description && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.description}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="wizard-company-status">Status</Label>
                      <select
                        id="wizard-company-status"
                        value={newCompany.status}
                        onChange={(e) =>
                          setNewCompany({
                            ...newCompany,
                            status: e.target.value,
                          })
                        }
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on-hold">On Hold</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Locations */}
              {wizardStep === 2 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Locations</CardTitle>
                        <p className="text-sm text-gray-600">
                          Add locations for your company (optional).
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setShowAddLocation(true)}
                      >
                        Add Location
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {companyDetails.locations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>
                          No locations added yet. You can add locations now or
                          skip this step.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {companyDetails.locations.map((location) => (
                          <div key={location.id} className="border rounded p-3">
                            <div className="font-medium">{location.name}</div>
                            <div className="text-sm text-gray-600">
                              {location.city}, {location.state}{" "}
                              {location.postal_code}
                            </div>
                            <div className="text-xs text-gray-500">
                              {location.address}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Departments */}
              {wizardStep === 3 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Departments</CardTitle>
                        <p className="text-sm text-gray-600">
                          Add departments for your company (optional).
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setShowAddDepartment(true)}
                        disabled={companyDetails.locations.length === 0}
                      >
                        Add Department
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {companyDetails.locations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>Add locations first before creating departments.</p>
                      </div>
                    ) : companyDetails.departments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>
                          No departments added yet. You can add departments now
                          or finish setup.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {companyDetails.departments.map((department) => (
                          <div
                            key={department.id}
                            className="border rounded p-3"
                          >
                            <div className="font-medium">{department.name}</div>
                            <div className="text-sm text-gray-600">
                              {department.description}
                            </div>
                            <div className="text-xs text-gray-500">
                              Location:{" "}
                              {companyDetails.locations.find(
                                (l) => l.id === department.location_id
                              )?.name || "Not assigned"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handleWizardBack}
                  disabled={wizardStep === 1}
                >
                  Back
                </Button>
                <div className="flex gap-2">
                  {wizardStep < 3 ? (
                    <Button onClick={handleWizardNext} disabled={isSubmitting}>
                      {isSubmitting
                        ? "Creating..."
                        : wizardStep === 1
                        ? "Create & Continue"
                        : "Next"}
                    </Button>
                  ) : (
                    <Button onClick={handleWizardFinish}>Finish Setup</Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Company Modal - Tabbed Interface */}
      {showEditCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">
                  Edit Company: {editingCompany?.name}
                </h3>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditCompany(false);
                    setEditingCompany(null);
                    setNewCompany({
                      name: "",
                      description: "",
                      status: "active",
                    });
                    setCompanyDetails({
                      company: null,
                      locations: [],
                      departments: [],
                      employees: [],
                      jobRoles: [],
                    });
                    setFormErrors({});
                    setEditCompanyActiveTab("info");
                  }}
                >
                  Close
                </Button>
              </div>

              <Tabs
                value={editCompanyActiveTab}
                onValueChange={setEditCompanyActiveTab}
              >
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="info">Company Info</TabsTrigger>
                  <TabsTrigger value="locations">Locations</TabsTrigger>
                  <TabsTrigger value="departments">Departments</TabsTrigger>
                  <TabsTrigger value="employees">Employees</TabsTrigger>
                  <TabsTrigger
                    value="danger"
                    className="text-red-600 data-[state=active]:text-red-700"
                  >
                    ⚠️ Danger Zone
                  </TabsTrigger>
                </TabsList>

                <div className="min-h-[600px]">
                  {/* Company Info Tab */}
                  <TabsContent value="info" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Company Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="edit-company-name">
                            Company Name *
                          </Label>
                          <Input
                            id="edit-company-name"
                            value={newCompany.name}
                            onChange={(e) =>
                              setNewCompany({
                                ...newCompany,
                                name: e.target.value,
                              })
                            }
                            placeholder="Enter company name"
                            className={formErrors.name ? "border-red-500" : ""}
                          />
                          {formErrors.name && (
                            <p className="text-red-500 text-sm mt-1">
                              {formErrors.name}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="edit-company-description">
                            Description
                          </Label>
                          <textarea
                            id="edit-company-description"
                            value={newCompany.description}
                            onChange={(e) =>
                              setNewCompany({
                                ...newCompany,
                                description: e.target.value,
                              })
                            }
                            placeholder="Enter company description"
                            className={`w-full border rounded px-3 py-2 min-h-[100px] ${
                              formErrors.description ? "border-red-500" : ""
                            }`}
                          />
                          {formErrors.description && (
                            <p className="text-red-500 text-sm mt-1">
                              {formErrors.description}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="edit-company-status">Status</Label>
                          <select
                            id="edit-company-status"
                            value={newCompany.status}
                            onChange={(e) =>
                              setNewCompany({
                                ...newCompany,
                                status: e.target.value,
                              })
                            }
                            className="w-full border rounded px-3 py-2"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="on-hold">On Hold</option>
                          </select>
                        </div>
                        <Button
                          onClick={handleEditCompany}
                          disabled={isSubmitting || !newCompany.name.trim()}
                          className="w-full"
                        >
                          {isSubmitting ? "Updating..." : "Update Company"}
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Locations Tab */}
                  <TabsContent value="locations" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>
                            Locations ({companyDetails.locations.length})
                          </CardTitle>
                          <Button
                            size="sm"
                            onClick={() => setShowAddLocation(true)}
                          >
                            Add Location
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {detailsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                            <p>Loading locations...</p>
                          </div>
                        ) : companyDetails.locations.length === 0 ? (
                          <p className="text-gray-500 text-sm">
                            No locations added yet.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {companyDetails.locations.map((location) => (
                              <div
                                key={location.id}
                                className="border rounded p-3"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="font-medium">
                                      {location.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {location.city}, {location.state}{" "}
                                      {location.postal_code}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {location.address}
                                    </div>
                                    <div className="text-xs text-blue-600 mt-1">
                                      Managers: Loading...
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditLocation(location)}
                                    className="ml-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Departments Tab */}
                  <TabsContent value="departments" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>
                            Departments ({companyDetails.departments.length})
                          </CardTitle>
                          <Button
                            size="sm"
                            onClick={() => setShowAddDepartment(true)}
                          >
                            Add Department
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {detailsLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                            <p>Loading departments...</p>
                          </div>
                        ) : companyDetails.departments.length === 0 ? (
                          <p className="text-gray-500 text-sm">
                            No departments added yet.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {companyDetails.departments.map((department) => (
                              <div
                                key={department.id}
                                className="border rounded p-3"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="font-medium">
                                      {department.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {department.description}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Location:{" "}
                                      {companyDetails.locations.find(
                                        (l) => l.id === department.location_id
                                      )?.name || "Not assigned"}
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleEditDepartment(department)
                                    }
                                    className="ml-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Employees Tab */}
                  <TabsContent value="employees" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Company Employees</CardTitle>
                          <Button onClick={handleOpenAssignEmployee} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Assign Employees
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {detailsLoading ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-500 mt-2">
                              Loading employees...
                            </p>
                          </div>
                        ) : companyDetails.employees.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                            <p>No employees assigned to this company yet</p>
                            <Button
                              onClick={handleOpenAssignEmployee}
                              variant="outline"
                              size="sm"
                              className="mt-4"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Assign First Employee
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {companyDetails.employees.map((employee) => (
                              <div
                                key={employee.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600 font-semibold text-sm">
                                      {employee.full_name
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase() || "N/A"}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {employee.full_name || "Unknown"}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {employee.email}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-sm text-gray-600">
                                    <p>{employee.job_title || "No title"}</p>
                                    <p className="text-xs text-gray-500">
                                      {employee.department_name ||
                                        "No department"}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveEmployee(employee.id)
                                    }
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Danger Zone Tab */}
                  <TabsContent value="danger" className="space-y-4">
                    <Card className="border-red-200">
                      <CardHeader className="bg-red-50">
                        <CardTitle className="text-red-800 flex items-center">
                          ⚠️ Danger Zone
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6 pt-6">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <h4 className="text-lg font-semibold text-red-800 mb-2">
                            Delete this Company
                          </h4>
                          <p className="text-red-700 mb-4">
                            Once you delete a company, there is no going back.
                            This will permanently delete the company and all
                            associated data including locations, departments,
                            and employee assignments.
                          </p>
                          <p className="text-sm text-red-600 mb-4">
                            <strong>This action cannot be undone.</strong>
                          </p>
                          <Button
                            variant="destructive"
                            onClick={() => openDeleteModal(editingCompany)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Company
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              Delete Company
            </h3>
            <p className="mb-4">
              Are you sure you want to delete{" "}
              <strong>{deletingCompany.name}</strong>? This action cannot be
              undone and will also delete all associated locations, departments,
              and employees.
            </p>
            <p className="mb-4 text-sm text-gray-600">
              To confirm, please type the company name:{" "}
              <strong>{deletingCompany.name}</strong>
            </p>
            <Input
              value={companyNameConfirmation}
              onChange={(e) => setCompanyNameConfirmation(e.target.value)}
              placeholder="Type company name to confirm"
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleDeleteCompany}
                disabled={companyNameConfirmation !== deletingCompany.name}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Company
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingCompany(null);
                  setCompanyNameConfirmation("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Employee Modal */}
      {showAssignEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Assign Employees</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Select employees to assign to {editingCompany?.name}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAssignEmployee(false);
                    setSelectedEmployees([]);
                    setEmployeeSearchTerm("");
                    setEmployeeAssignments({});
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 border-b bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, email, or job title..."
                  value={employeeSearchTerm}
                  onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                  className="pl-10 pr-10"
                />
                {employeeSearchTerm && (
                  <button
                    onClick={() => setEmployeeSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Employee List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {getFilteredAvailableEmployees().length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>
                    {employeeSearchTerm
                      ? "No employees found matching your search"
                      : "No available employees to assign"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {getFilteredAvailableEmployees().map((employee) => (
                    <div
                      key={employee.id}
                      onClick={() => toggleEmployeeSelection(employee.id)}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedEmployees.includes(employee.id)
                          ? "bg-blue-50 border-blue-300"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(employee.id)}
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {`${employee.first_name?.[0] || ""}${
                              employee.last_name?.[0] || ""
                            }`.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {employee.first_name} {employee.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {employee.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {employee.job_title || "No title"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assignment Details for Selected Employees */}
            {selectedEmployees.length > 0 && (
              <div className="px-6 py-4 border-t bg-blue-50">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Assign Details for Selected Employees
                  </h4>
                  <span className="text-xs text-red-600 font-medium">
                    * Required
                  </span>
                </div>
                {(companyDetails.jobRoles?.length === 0 ||
                  companyDetails.departments.length === 0 ||
                  companyDetails.locations.length === 0) && (
                  <div className="mb-3 p-2 bg-yellow-50 border border-yellow-300 rounded text-xs text-yellow-800">
                    ⚠️{" "}
                    {[
                      companyDetails.jobRoles?.length === 0 && "job roles",
                      companyDetails.departments.length === 0 && "departments",
                      companyDetails.locations.length === 0 && "locations",
                    ]
                      .filter(Boolean)
                      .join(", ") || ""}{" "}
                    {[
                      companyDetails.jobRoles?.length === 0,
                      companyDetails.departments.length === 0,
                      companyDetails.locations.length === 0,
                    ].filter(Boolean).length > 1
                      ? "are"
                      : "is"}{" "}
                    not available. Please configure them before assigning
                    employees.
                  </div>
                )}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedEmployees.map((employeeId) => {
                    const employee = availableEmployees.find(
                      (e) => e.id === employeeId
                    );
                    if (!employee) return null;

                    return (
                      <div
                        key={employeeId}
                        className="bg-white p-3 rounded-lg border border-blue-200"
                      >
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          {employee.first_name} {employee.last_name}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-gray-600 mb-1 block">
                              Job Role <span className="text-red-500">*</span>
                            </Label>
                            <select
                              value={
                                employeeAssignments[employeeId]?.job_role_id ||
                                ""
                              }
                              onChange={(e) =>
                                updateEmployeeAssignment(
                                  employeeId,
                                  "job_role_id",
                                  e.target.value
                                )
                              }
                              onClick={(e) => e.stopPropagation()}
                              className={`w-full px-2 py-1.5 text-xs border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                !employeeAssignments[employeeId]?.job_role_id
                                  ? "border-red-300 bg-red-50"
                                  : "border-gray-300"
                              }`}
                            >
                              <option value="">Select Job Role</option>
                              {companyDetails.jobRoles?.map((role) => (
                                <option key={role.id} value={role.id}>
                                  {role.title}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600 mb-1 block">
                              Department <span className="text-red-500">*</span>
                            </Label>
                            <select
                              value={
                                employeeAssignments[employeeId]
                                  ?.department_id || ""
                              }
                              onChange={(e) =>
                                updateEmployeeAssignment(
                                  employeeId,
                                  "department_id",
                                  e.target.value
                                )
                              }
                              onClick={(e) => e.stopPropagation()}
                              className={`w-full px-2 py-1.5 text-xs border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                !employeeAssignments[employeeId]?.department_id
                                  ? "border-red-300 bg-red-50"
                                  : "border-gray-300"
                              }`}
                            >
                              <option value="">Select Department</option>
                              {companyDetails.departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                  {dept.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600 mb-1 block">
                              Location <span className="text-red-500">*</span>
                            </Label>
                            <select
                              value={
                                employeeAssignments[employeeId]?.location_id ||
                                ""
                              }
                              onChange={(e) =>
                                updateEmployeeAssignment(
                                  employeeId,
                                  "location_id",
                                  e.target.value
                                )
                              }
                              onClick={(e) => e.stopPropagation()}
                              className={`w-full px-2 py-1.5 text-xs border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                !employeeAssignments[employeeId]?.location_id
                                  ? "border-red-300 bg-red-50"
                                  : "border-gray-300"
                              }`}
                            >
                              <option value="">Select Location</option>
                              {companyDetails.locations.map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                  {loc.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600 mb-1 block">
                              Pay Cycle
                            </Label>
                            <select
                              value={
                                employeeAssignments[employeeId]?.paycycle_id ||
                                ""
                              }
                              onChange={(e) =>
                                updateEmployeeAssignment(
                                  employeeId,
                                  "paycycle_id",
                                  e.target.value
                                )
                              }
                              onClick={(e) => e.stopPropagation()}
                              className="w-full px-2 py-1.5 text-xs border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                            >
                              <option value="">
                                Select Pay Cycle (Optional)
                              </option>
                              {companyDetails.paycycles?.map((paycycle) => (
                                <option key={paycycle.id} value={paycycle.id}>
                                  {paycycle.name} ({paycycle.frequency})
                                </option>
                              ))}
                            </select>
                            {companyDetails.paycycles?.length === 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                No pay cycles available for this company
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-600">
                  {selectedEmployees.length} employee
                  {selectedEmployees.length !== 1 ? "s" : ""} selected
                </p>
                {selectedEmployees.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedEmployees([]);
                      setEmployeeAssignments({});
                    }}
                    className="text-blue-600"
                  >
                    Clear Selection
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAssignEmployee(false);
                    setSelectedEmployees([]);
                    setEmployeeSearchTerm("");
                    setEmployeeAssignments({});
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignEmployees}
                  disabled={
                    selectedEmployees.length === 0 ||
                    isSubmitting ||
                    companyDetails.jobRoles?.length === 0 ||
                    companyDetails.departments.length === 0 ||
                    companyDetails.locations.length === 0
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Assign{" "}
                      {selectedEmployees.length > 0
                        ? `${selectedEmployees.length} `
                        : ""}
                      Employee{selectedEmployees.length !== 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              </div>
              {(companyDetails.jobRoles?.length === 0 ||
                companyDetails.departments.length === 0 ||
                companyDetails.locations.length === 0) && (
                <p className="text-xs text-center text-gray-600 mt-2">
                  Ensure job roles, departments, and locations are configured
                  before assigning employees.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      {showAddLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Location</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="location-name">Location Name *</Label>
                <Input
                  id="location-name"
                  value={newLocation.name}
                  onChange={(e) =>
                    setNewLocation({ ...newLocation, name: e.target.value })
                  }
                  placeholder="Enter location name"
                  className={formErrors.location?.name ? "border-red-500" : ""}
                />
                {formErrors.location?.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.location.name}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="location-address">Address</Label>
                <Input
                  id="location-address"
                  value={newLocation.address}
                  onChange={(e) =>
                    setNewLocation({ ...newLocation, address: e.target.value })
                  }
                  placeholder="Enter address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location-city">City</Label>
                  <Input
                    id="location-city"
                    value={newLocation.city}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, city: e.target.value })
                    }
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="location-state">State</Label>
                  <Input
                    id="location-state"
                    value={newLocation.state}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, state: e.target.value })
                    }
                    placeholder="State"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location-postal">Postal Code</Label>
                <Input
                  id="location-postal"
                  value={newLocation.postal_code}
                  onChange={(e) =>
                    setNewLocation({
                      ...newLocation,
                      postal_code: e.target.value,
                    })
                  }
                  placeholder="Postal code (e.g., 12345 or 12345-6789)"
                  className={
                    formErrors.location?.postal_code ? "border-red-500" : ""
                  }
                />
                {formErrors.location?.postal_code && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.location.postal_code}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="location-managers">Managers</Label>
                <div className="border rounded p-3 max-h-40 overflow-y-auto">
                  {companyDetails.employees.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No employees available
                    </p>
                  ) : (
                    companyDetails.employees.map((employee) => (
                      <label
                        key={employee.id}
                        className="flex items-center space-x-2 mb-2"
                      >
                        <input
                          type="checkbox"
                          checked={newLocation.manager_ids.includes(
                            employee.id
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewLocation({
                                ...newLocation,
                                manager_ids: [
                                  ...newLocation.manager_ids,
                                  employee.id,
                                ],
                              });
                            } else {
                              setNewLocation({
                                ...newLocation,
                                manager_ids: newLocation.manager_ids.filter(
                                  (id) => id !== employee.id
                                ),
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {employee.first_name} {employee.last_name}
                        </span>
                      </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select multiple managers for this location (optional)
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                onClick={handleAddLocation}
                disabled={!newLocation.name.trim() || detailsLoading}
              >
                {detailsLoading ? "Adding..." : "Add Location"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddLocation(false);
                  setNewLocation({
                    name: "",
                    address: "",
                    city: "",
                    state: "",
                    postal_code: "",
                    manager_ids: [],
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showAddDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Department</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="department-name">Department Name *</Label>
                <Input
                  id="department-name"
                  value={newDepartment.name}
                  onChange={(e) =>
                    setNewDepartment({ ...newDepartment, name: e.target.value })
                  }
                  placeholder="Enter department name"
                  className={
                    formErrors.department?.name ? "border-red-500" : ""
                  }
                />
                {formErrors.department?.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.department.name}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="department-description">Description</Label>
                <textarea
                  id="department-description"
                  value={newDepartment.description}
                  onChange={(e) =>
                    setNewDepartment({
                      ...newDepartment,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter department description"
                  className={`w-full border rounded px-3 py-2 min-h-[80px] ${
                    formErrors.department?.description ? "border-red-500" : ""
                  }`}
                />
                {formErrors.department?.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.department.description}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="department-location">Location *</Label>
                <select
                  id="department-location"
                  value={newDepartment.location_id || ""}
                  onChange={(e) =>
                    setNewDepartment({
                      ...newDepartment,
                      location_id: e.target.value,
                    })
                  }
                  className={`w-full border rounded px-3 py-2 ${
                    formErrors.department?.location_id ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select a location</option>
                  {companyDetails.locations.length === 0 ? (
                    <option disabled>Add locations first...</option>
                  ) : (
                    companyDetails.locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))
                  )}
                </select>
                {formErrors.department?.location_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.department.location_id}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="department-managers">Managers</Label>
                <div className="border rounded p-3 max-h-40 overflow-y-auto">
                  {companyDetails.employees.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No employees available
                    </p>
                  ) : (
                    companyDetails.employees.map((employee) => (
                      <label
                        key={employee.id}
                        className="flex items-center space-x-2 mb-2"
                      >
                        <input
                          type="checkbox"
                          checked={newDepartment.manager_ids.includes(
                            employee.id
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewDepartment({
                                ...newDepartment,
                                manager_ids: [
                                  ...newDepartment.manager_ids,
                                  employee.id,
                                ],
                              });
                            } else {
                              setNewDepartment({
                                ...newDepartment,
                                manager_ids: newDepartment.manager_ids.filter(
                                  (id) => id !== employee.id
                                ),
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {employee.first_name} {employee.last_name}
                        </span>
                      </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select multiple managers for this department (optional)
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                onClick={handleAddDepartment}
                disabled={
                  !newDepartment.name.trim() ||
                  !newDepartment.location_id ||
                  detailsLoading
                }
              >
                {detailsLoading ? "Adding..." : "Add Department"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDepartment(false);
                  setNewDepartment({
                    name: "",
                    description: "",
                    location_id: "",
                    manager_ids: [],
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Location Modal */}
      {showEditLocation && editingLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Edit Location: {editingLocation.name}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-location-name">Location Name *</Label>
                <Input
                  id="edit-location-name"
                  value={newLocation.name}
                  onChange={(e) =>
                    setNewLocation({ ...newLocation, name: e.target.value })
                  }
                  placeholder="Enter location name"
                  className={formErrors.location?.name ? "border-red-500" : ""}
                />
                {formErrors.location?.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.location.name}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-location-address">Address</Label>
                <Input
                  id="edit-location-address"
                  value={newLocation.address}
                  onChange={(e) =>
                    setNewLocation({ ...newLocation, address: e.target.value })
                  }
                  placeholder="Enter address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-location-city">City</Label>
                  <Input
                    id="edit-location-city"
                    value={newLocation.city}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, city: e.target.value })
                    }
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-location-state">State</Label>
                  <Input
                    id="edit-location-state"
                    value={newLocation.state}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, state: e.target.value })
                    }
                    placeholder="State"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-location-postal">Postal Code</Label>
                <Input
                  id="edit-location-postal"
                  value={newLocation.postal_code}
                  onChange={(e) =>
                    setNewLocation({
                      ...newLocation,
                      postal_code: e.target.value,
                    })
                  }
                  placeholder="Postal code (e.g., 12345 or 12345-6789)"
                  className={
                    formErrors.location?.postal_code ? "border-red-500" : ""
                  }
                />
                {formErrors.location?.postal_code && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.location.postal_code}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-location-managers">Managers</Label>
                <div className="border rounded p-3 max-h-40 overflow-y-auto">
                  {companyDetails.employees.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No employees available
                    </p>
                  ) : (
                    companyDetails.employees.map((employee) => (
                      <label
                        key={employee.id}
                        className="flex items-center space-x-2 mb-2"
                      >
                        <input
                          type="checkbox"
                          checked={newLocation.manager_ids.includes(
                            employee.id
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewLocation({
                                ...newLocation,
                                manager_ids: [
                                  ...newLocation.manager_ids,
                                  employee.id,
                                ],
                              });
                            } else {
                              setNewLocation({
                                ...newLocation,
                                manager_ids: newLocation.manager_ids.filter(
                                  (id) => id !== employee.id
                                ),
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {employee.first_name} {employee.last_name}
                        </span>
                      </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select multiple managers for this location (optional)
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                onClick={handleUpdateLocation}
                disabled={!newLocation.name.trim() || detailsLoading}
              >
                {detailsLoading ? "Updating..." : "Update Location"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditLocation(false);
                  setEditingLocation(null);
                  setNewLocation({
                    name: "",
                    address: "",
                    city: "",
                    state: "",
                    postal_code: "",
                    manager_ids: [],
                  });
                  setFormErrors((prev) => ({ ...prev, location: {} }));
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditDepartment && editingDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Edit Department: {editingDepartment.name}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-department-name">Department Name *</Label>
                <Input
                  id="edit-department-name"
                  value={newDepartment.name}
                  onChange={(e) =>
                    setNewDepartment({ ...newDepartment, name: e.target.value })
                  }
                  placeholder="Enter department name"
                  className={
                    formErrors.department?.name ? "border-red-500" : ""
                  }
                />
                {formErrors.department?.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.department.name}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-department-description">Description</Label>
                <textarea
                  id="edit-department-description"
                  value={newDepartment.description}
                  onChange={(e) =>
                    setNewDepartment({
                      ...newDepartment,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter department description"
                  className={`w-full border rounded px-3 py-2 min-h-[80px] ${
                    formErrors.department?.description ? "border-red-500" : ""
                  }`}
                />
                {formErrors.department?.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.department.description}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-department-location">Location *</Label>
                <select
                  id="edit-department-location"
                  value={newDepartment.location_id || ""}
                  onChange={(e) =>
                    setNewDepartment({
                      ...newDepartment,
                      location_id: e.target.value,
                    })
                  }
                  className={`w-full border rounded px-3 py-2 ${
                    formErrors.department?.location_id ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select a location</option>
                  {companyDetails.locations.length === 0 ? (
                    <option disabled>Add locations first...</option>
                  ) : (
                    companyDetails.locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))
                  )}
                </select>
                {formErrors.department?.location_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.department.location_id}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-department-managers">Managers</Label>
                <div className="border rounded p-3 max-h-40 overflow-y-auto">
                  {companyDetails.employees.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No employees available
                    </p>
                  ) : (
                    companyDetails.employees.map((employee) => (
                      <label
                        key={employee.id}
                        className="flex items-center space-x-2 mb-2"
                      >
                        <input
                          type="checkbox"
                          checked={newDepartment.manager_ids.includes(
                            employee.id
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewDepartment({
                                ...newDepartment,
                                manager_ids: [
                                  ...newDepartment.manager_ids,
                                  employee.id,
                                ],
                              });
                            } else {
                              setNewDepartment({
                                ...newDepartment,
                                manager_ids: newDepartment.manager_ids.filter(
                                  (id) => id !== employee.id
                                ),
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">
                          {employee.first_name} {employee.last_name}
                        </span>
                      </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select multiple managers for this department (optional)
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                onClick={handleUpdateDepartment}
                disabled={
                  !newDepartment.name.trim() ||
                  !newDepartment.location_id ||
                  detailsLoading
                }
              >
                {detailsLoading ? "Updating..." : "Update Department"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDepartment(false);
                  setEditingDepartment(null);
                  setNewDepartment({
                    name: "",
                    description: "",
                    location_id: "",
                    manager_ids: [],
                  });
                  setFormErrors((prev) => ({ ...prev, department: {} }));
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Form Modal - Removed, moved to EmployeeManagement component */}
      {false && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">
                  {editingEmployee ? "Edit Employee" : "Add New Employee"}
                </h3>
                <Button variant="outline" size="sm" onClick={closeEmployeeForm}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {loadingDropdowns ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Personal Information */}
                  <div className="grid grid-cols-2 gap-4">
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
                      placeholder="Enter phone number (optional)"
                    />
                  </div>

                  {/* Structured Assignments */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Company Assignments</h4>
                      {assignments.length < MAX_ASSIGNMENTS && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addNewAssignment}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Company
                        </Button>
                      )}
                    </div>

                    {employeeFormErrors.assignments && (
                      <p className="text-red-500 text-sm mb-4">
                        {employeeFormErrors.assignments}
                      </p>
                    )}

                    <div className="space-y-6">
                      {assignments.map((assignment, assignmentIndex) => (
                        <div
                          key={assignmentIndex}
                          className="border rounded-lg p-4 bg-gray-50"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-sm">
                              Assignment {assignmentIndex + 1}
                            </h5>
                            {assignments.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  removeAssignment(assignmentIndex)
                                }
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            )}
                          </div>

                          <div className="space-y-3">
                            {/* Company Dropdown */}
                            <div>
                              <Label>Company *</Label>
                              <select
                                value={assignment.companyId}
                                onChange={(e) =>
                                  handleAssignmentCompanyChange(
                                    assignmentIndex,
                                    e.target.value
                                  )
                                }
                                className="w-full border rounded px-3 py-2"
                              >
                                <option value="">Select a company</option>
                                {allCompaniesData.map((company) => (
                                  <option key={company.id} value={company.id}>
                                    {company.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Job Role Dropdown */}
                            <div>
                              <Label>Job Role *</Label>
                              <select
                                value={assignment.jobRoleId || ""}
                                onChange={(e) =>
                                  handleAssignmentJobRoleChange(
                                    assignmentIndex,
                                    e.target.value
                                  )
                                }
                                className="w-full border rounded px-3 py-2"
                                disabled={!assignment.companyId}
                              >
                                <option value="">Select a job role</option>
                                {allJobRolesData.map((role) => (
                                  <option key={role.id} value={role.id}>
                                    {role.title}
                                  </option>
                                ))}
                              </select>
                              {!assignment.companyId && (
                                <p className="text-gray-500 text-xs mt-1">
                                  Select a company first
                                </p>
                              )}
                            </div>

                            {/* Location Dropdown */}
                            <div>
                              <Label>Location</Label>
                              <select
                                value={assignment.locationId || ""}
                                onChange={(e) =>
                                  handleAssignmentLocationChange(
                                    assignmentIndex,
                                    e.target.value
                                  )
                                }
                                className="w-full border rounded px-3 py-2"
                                disabled={!assignment.companyId}
                              >
                                <option value="">
                                  Select a location (optional)
                                </option>
                                {assignmentDropdownData[
                                  assignmentIndex
                                ]?.locations?.map((loc) => (
                                  <option key={loc.id} value={loc.id}>
                                    {loc.name}
                                  </option>
                                ))}
                              </select>
                              {!assignment.companyId && (
                                <p className="text-gray-500 text-xs mt-1">
                                  Select a company first
                                </p>
                              )}
                            </div>

                            {/* Departments */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <Label>Departments</Label>
                                {assignment.companyId && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      addDepartmentToAssignment(assignmentIndex)
                                    }
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Department
                                  </Button>
                                )}
                              </div>

                              {assignment.departmentIds.map(
                                (deptId, deptIndex) => (
                                  <div
                                    key={deptIndex}
                                    className="flex items-center gap-2 mb-2"
                                  >
                                    <select
                                      value={deptId}
                                      onChange={(e) =>
                                        handleAssignmentDepartmentChange(
                                          assignmentIndex,
                                          deptIndex,
                                          e.target.value
                                        )
                                      }
                                      className="flex-1 border rounded px-3 py-2"
                                      disabled={!assignment.companyId}
                                    >
                                      <option value="">
                                        Select a department (optional)
                                      </option>
                                      {assignmentDropdownData[
                                        assignmentIndex
                                      ]?.departments?.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                          {dept.name}
                                        </option>
                                      ))}
                                    </select>
                                    {assignment.departmentIds.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          removeDepartmentFromAssignment(
                                            assignmentIndex,
                                            deptIndex
                                          )
                                        }
                                      >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                      </Button>
                                    )}
                                  </div>
                                )
                              )}

                              {!assignment.companyId && (
                                <p className="text-gray-500 text-xs mt-1">
                                  Select a company first
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-gray-500 mt-3">
                      You can add up to {MAX_ASSIGNMENTS} company assignments.
                      Each assignment can have one location and multiple
                      departments.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-6 pt-4 border-t">
                    <Button
                      onClick={handleSaveEmployee}
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

      {/* Company Detail View Modal */}
      {isDetailViewOpen && (
        <CompanyDetailView
          data={selectedCompanyData}
          loading={isLoadingDetails}
          onClose={() => setIsDetailViewOpen(false)}
        />
      )}
    </div>
  );
}
