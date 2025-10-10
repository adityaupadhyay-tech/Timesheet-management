"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCompanies } from "@/contexts/CompaniesContext";
import { supabase } from "@/lib/supabase";
import Settings from "@mui/icons-material/Settings";
import Business from "@mui/icons-material/Business";
import CalendarToday from "@mui/icons-material/CalendarToday";
import Event from "@mui/icons-material/Event";
import Add from "@mui/icons-material/Add";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import ArrowBack from "@mui/icons-material/ArrowBack";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Warning from "@mui/icons-material/Warning";
import Info from "@mui/icons-material/Info";
import People from "@mui/icons-material/People";
import Assessment from "@mui/icons-material/Assessment";
import PageHeader from "@/components/PageHeader";

export default function PaycycleSetupPage() {
  const [currentUser] = useState({
    name: "John Doe",
    role: "admin",
    email: "john.doe@company.com",
  });

  const [activeSection, setActiveSection] = useState("overview");
  const [showNavigation, setShowNavigation] = useState(false);

  // Use shared companies context (not used for data now, keeping for future reuse)
  const { companies: companiesCtx } = useCompanies();

  // Live data state from Supabase RPC
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedPaycycle, setSelectedPaycycle] = useState(null);
  const [isEditingPaycycle, setIsEditingPaycycle] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paycycleToDelete, setPaycycleToDelete] = useState(null);
  const [paycycleForm, setPaycycleForm] = useState({
    paycycleName: "",
    frequency: "weekly",
    cycleType: "regular",
    periodEndDate: "",
    periodEndDay1: "",
    periodEndDay2: "",
  });

  const fetchCompanies = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const { data, error } = await supabase.rpc(
        "get_companies_with_paycycle_details"
      );
      if (error) throw error;
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      setLoadError(err?.message || "Failed to load companies");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for updating company paycycle settings
  const handleToggleCompanySetting = async (companyId, settingKey, currentValue) => {
    try {
      // Update locally first for immediate UI feedback
      setCompanies(prevCompanies => 
        prevCompanies.map(company => 
          company.company_id === companyId
            ? { ...company, [settingKey]: !currentValue }
            : company
        )
      );

      // Update in database
      const { error } = await supabase
        .from('companies')
        .update({ [settingKey]: !currentValue })
        .eq('id', companyId);

      if (error) {
        console.error('Error updating company setting:', error);
        console.warn(`Database column '${settingKey}' may not exist in companies table. The setting will only persist in local state.`);
        
        // Show user-friendly message (optional - only on first error)
        if (!window._paycycleSettingsWarningShown) {
          window._paycycleSettingsWarningShown = true;
          alert(`Note: Paycycle settings are updating locally. To persist to database, please ensure the following columns exist in the companies table:\n\n- allow_defaults (boolean)\n- auto_group_entry (boolean)\n- time_clock_imports (boolean)\n- use_all_departments (boolean)\n- email_notification (boolean)\n\nChanges will be saved in this session.`);
        }
        
        // Don't revert - keep the local state change
        // This allows the feature to work even without database columns
      }
    } catch (err) {
      console.error('Error toggling setting:', err);
      // Revert on unexpected error
      setCompanies(prevCompanies => 
        prevCompanies.map(company => 
          company.company_id === companyId
            ? { ...company, [settingKey]: currentValue }
            : company
        )
      );
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const paycycleSections = [
    {
      id: "company-paycycle",
      title: "Company Paycycle",
      description:
        "View, manage, and configure paycycle settings for all companies",
      icon: <Business />,
    },
    {
      id: "reports",
      title: "Paycycle Reports",
      description: "Generate paycycle reports and analytics",
      icon: <Assessment />,
    },
  ];

  const handlePaycycleChange = (field, value) => {
    setPaycycleForm(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleDateKeyDown = (e, field) => {
    // Allow backspace to clear the field when all text is selected
    if (
      e.key === "Backspace" &&
      e.target.selectionStart === 0 &&
      e.target.selectionEnd === e.target.value.length
    ) {
      e.preventDefault();
      handlePaycycleChange(field, "");
    }
  };

  const savePaycycleConfig = async () => {
    if (!selectedCompany) return;

    const {
      paycycleName,
      frequency,
      cycleType,
      periodEndDate,
      periodEndDay1,
      periodEndDay2,
    } = paycycleForm;

    // --- Validate required inputs based on frequency ---
    if (frequency === "semi_monthly") {
      if (!periodEndDay1 || !periodEndDay2) {
        alert("Please provide both the first and second period end days.");
        return;
      }
    } else {
      if (!periodEndDate) {
        alert("Please select a Period End Date.");
        return;
      }
    }

    try {
      const payload = {
        p_company_id: selectedCompany.company_id,
        p_name: paycycleName || frequency.charAt(0).toUpperCase() + frequency.slice(1),
        p_frequency: frequency,
        p_cycle_type: cycleType,
        p_first_period_end_date: null,
        p_period_end_day_1: null,
        p_period_end_day_2: null,
      };

      // --- Build the payload correctly ---
      if (frequency === "semi_monthly") {
        payload.p_period_end_day_1 = Number(periodEndDay1);
        payload.p_period_end_day_2 = Number(periodEndDay2);
      } else {
        payload.p_first_period_end_date = periodEndDate;
      }

      const { data, error } = await supabase.rpc("create_paycycle", payload);

      if (error) throw error;

      await fetchCompanies();
      setSelectedPaycycle(null);
      setIsEditingPaycycle(false);
      setPaycycleForm({
        paycycleName: "",
        frequency: "weekly",
        cycleType: "regular",
        periodEndDate: "",
        periodEndDay1: "",
        periodEndDay2: "",
      });
    } catch (err) {
      alert(err?.message || "Failed to create paycycle");
    }
  };

  const deletePaycycle = (paycycleId) => {
    if (!selectedCompany) return;

    const currentCompany = companies.find((c) => c.id === selectedCompany.id);
    if (!currentCompany) return;

    // Find the paycycle to get its details for the confirmation
    const paycycle = currentCompany.paycycles.find(
      (pc) => pc.id === paycycleId
    );
    if (!paycycle) return;

    // Set the paycycle to delete and show modal
    setPaycycleToDelete(paycycle);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!selectedCompany || !paycycleToDelete) return;

    const currentCompany = companies.find((c) => c.id === selectedCompany.id);
    if (!currentCompany) return;

    const updatedPaycycles = currentCompany.paycycles.filter(
      (pc) => pc.id !== paycycleToDelete.id
    );
    updateCompany(selectedCompany.id, { paycycles: updatedPaycycles });
    setSelectedPaycycle(null);
    setIsEditingPaycycle(false);
    setShowDeleteModal(false);
    setPaycycleToDelete(null);
    alert("Paycycle deleted successfully!");
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPaycycleToDelete(null);
  };

  const getPaycycleStatus = (paycycle) => {
    const today = new Date();
    const nextProcessing = new Date(paycycle.nextProcessing);
    const daysUntilNext = Math.ceil(
      (nextProcessing - today) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilNext <= 3)
      return {
        status: "processing-soon",
        color: "text-orange-600",
        icon: Warning,
      };
    if (daysUntilNext <= 7)
      return { status: "upcoming", color: "text-yellow-600", icon: Info };
    return { status: "scheduled", color: "text-green-600", icon: CheckCircle };
  };

  const getCompanyPaycycleStatus = (company) => {
    // Use server-computed status
    if (company.company_status === "Not Configured")
      return { status: "not-configured", color: "text-red-600", icon: Warning };
    if (company.company_status === "Processing Soon")
      return {
        status: "processing-soon",
        color: "text-orange-600",
        icon: Warning,
      };
    return { status: "configured", color: "text-green-600", icon: CheckCircle };
  };

  const getFrequencyLabel = (frequency) => {
    const labels = {
      weekly: "Weekly",
      "bi-weekly": "Bi-weekly",
      "semi-monthly": "Semi-monthly",
      monthly: "Monthly",
    };
    return labels[frequency] || frequency;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const parseDateFromInput = (inputValue) => {
    if (!inputValue) return "";
    // Input is already in yyyy-mm-dd format for HTML date input
    return inputValue;
  };

  // Filter companies based on search term
  const filteredCompanies = companies.filter((company) =>
    (company.company_name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCompanies = filteredCompanies.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    if (!showNavigation) {
      // Show card selection menu
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paycycleSections.map((section) => (
            <Card
              key={section.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setActiveSection(section.id);
                setShowNavigation(true);
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center">
                  {section.icon}
                  <span className="ml-2">{section.title}</span>
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {section.id === "company-paycycle" &&
                    "View all companies, their current paycycle configurations, and configure new settings with status indicators."}
                  {section.id === "reports" &&
                    "Generate comprehensive paycycle reports and analytics for better insights."}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    // Show navigation when a card is selected
    switch (activeSection) {
      case "company-paycycle":
        return (
          <>
            {/* Back Button */}
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => {
                  setActiveSection("overview");
                  setShowNavigation(false);
                }}
                className="flex items-center mb-4"
              >
                ← Back to Paycycle Setup
              </Button>
            </div>

            {/* Companies Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Business className="w-5 h-5 mr-2" />
                      Companies
                    </CardTitle>
                    <CardDescription>
                      Select a company to view and manage its paycycles
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-md">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        {searchTerm ? `${filteredCompanies.length}/` : ""}
                        {companies.length} Total
                      </span>
                    </div>
                    {companies.length > 0 && (
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-md">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          {
                            (searchTerm ? filteredCompanies : companies).filter(
                              (c) => (c.paycycles?.length || 0) > 0
                            ).length
                          }{" "}
                          with Paycycles
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadError && (
                  <div className="mb-4 text-sm text-red-600">{loadError}</div>
                )}
                {isLoading && (
                  <div className="mb-4 text-sm text-gray-600">
                    Loading companies...
                  </div>
                )}
                {/* Search Input */}
                <div className="mb-6">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search companies by name..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset to first page when searching
                      }}
                      className="pl-10"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-4 px-4 font-semibold text-xs text-gray-700 whitespace-nowrap">
                          Company
                        </th>
                        <th className="text-left py-4 px-3 font-semibold text-xs text-gray-700 whitespace-nowrap">
                          Status
                        </th>
                        <th className="text-center py-4 px-3 font-semibold text-xs text-gray-700 whitespace-nowrap">
                          # Paycycles
                        </th>
                        <th className="text-center py-4 px-3 font-semibold text-xs text-gray-700 whitespace-nowrap">
                          Allow<br/>Defaults
                        </th>
                        <th className="text-center py-4 px-3 font-semibold text-xs text-gray-700 whitespace-nowrap">
                          Auto Group<br/>Entry
                        </th>
                        <th className="text-center py-4 px-3 font-semibold text-xs text-gray-700 whitespace-nowrap">
                          Time Clock<br/>Imports
                        </th>
                        <th className="text-center py-4 px-3 font-semibold text-xs text-gray-700 whitespace-nowrap">
                          Use All<br/>Departments
                        </th>
                        <th className="text-center py-4 px-3 font-semibold text-xs text-gray-700 whitespace-nowrap">
                          Email<br/>Notification
                        </th>
                        <th className="text-left py-4 px-3 font-semibold text-xs text-gray-700 whitespace-nowrap">
                          Next Processing
                        </th>
                        <th className="text-left py-4 px-4 font-semibold text-xs text-gray-700 whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentCompanies.map((company) => {
                        const companyStatus = getCompanyPaycycleStatus(company);
                        const StatusIcon = companyStatus.icon;
                        const nextProcessing =
                          company.next_processing_date || "N/A";

                        return (
                          <tr
                            key={company.company_id}
                            className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                              selectedCompany?.company_id === company.company_id
                                ? "bg-blue-50 border-l-4 border-l-blue-500"
                                : ""
                            }`}
                            onClick={() => setSelectedCompany(company)}
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <Business className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="font-medium text-sm text-gray-900">
                                  {company.company_name}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-3">
                              <div className="flex items-center space-x-1">
                                <StatusIcon
                                  className={`w-3 h-3 flex-shrink-0 ${companyStatus.color}`}
                                />
                                <span
                                  className={`text-xs font-medium ${companyStatus.color}`}
                                >
                                  {companyStatus.status === "not-configured" && "Not Set"}
                                  {companyStatus.status === "processing-soon" && "Processing"}
                                  {companyStatus.status === "configured" && "Active"}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-3 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                                {company.paycycles?.length || 0}
                              </span>
                            </td>
                            <td className="py-4 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <Switch
                                checked={company.allow_defaults || false}
                                onCheckedChange={() => handleToggleCompanySetting(company.company_id, 'allow_defaults', company.allow_defaults)}
                              />
                            </td>
                            <td className="py-4 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <Switch
                                checked={company.auto_group_entry || false}
                                onCheckedChange={() => handleToggleCompanySetting(company.company_id, 'auto_group_entry', company.auto_group_entry)}
                              />
                            </td>
                            <td className="py-4 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <Switch
                                checked={company.time_clock_imports || false}
                                onCheckedChange={() => handleToggleCompanySetting(company.company_id, 'time_clock_imports', company.time_clock_imports)}
                              />
                            </td>
                            <td className="py-4 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <Switch
                                checked={company.use_all_departments || false}
                                onCheckedChange={() => handleToggleCompanySetting(company.company_id, 'use_all_departments', company.use_all_departments)}
                              />
                            </td>
                            <td className="py-4 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <Switch
                                checked={company.email_notification || false}
                                onCheckedChange={() => handleToggleCompanySetting(company.company_id, 'email_notification', company.email_notification)}
                              />
                            </td>
                            <td className="py-4 px-3">
                              <span className="text-xs text-gray-600 whitespace-nowrap">
                                {formatDate(nextProcessing)}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (
                                    selectedCompany?.company_id ===
                                    company.company_id
                                  ) {
                                    setSelectedCompany(null);
                                  } else {
                                    setSelectedCompany(company);
                                    // Scroll to company details section after state update
                                    setTimeout(() => {
                                      const element =
                                        document.getElementById(
                                          "company-details"
                                        );
                                      if (element) {
                                        element.scrollIntoView({
                                          behavior: "smooth",
                                          block: "start",
                                        });
                                      }
                                    }, 100);
                                  }
                                }}
                              >
                                {selectedCompany?.company_id ===
                                company.company_id
                                  ? "Hide Details"
                                  : "View Details"}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Showing{" "}
                      <span className="font-medium">{startIndex + 1}</span> to{" "}
                      <span className="font-medium">
                        {Math.min(endIndex, filteredCompanies.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">
                        {filteredCompanies.length}
                      </span>{" "}
                      companies
                      {searchTerm && (
                        <span className="ml-2 text-blue-600">
                          filtered from {companies.length} total
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center space-x-1">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="w-8 h-8 p-0 text-xs"
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Details and Configuration */}
            {selectedCompany && (
              <div id="company-details" className="space-y-6">
                {/* Company Paycycles List */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <CalendarToday className="w-5 h-5 mr-2" />
                          {selectedCompany.company_name} - Paycycles
                        </CardTitle>
                        <CardDescription>
                          {selectedCompany.paycycles?.length > 0
                            ? `${selectedCompany.paycycles.length} paycycle${
                                selectedCompany.paycycles.length > 1 ? "s" : ""
                              } configured`
                            : "No paycycles configured for this company"}
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedPaycycle(null);
                          setIsEditingPaycycle(true);
                          setPaycycleForm({
                            paycycleName: "",
                            frequency: "monthly",
                            cycleType: "regular",
                            periodEndDay1: "",
                            periodEndDay2: "",
                          });
                          // Scroll to configuration section
                          setTimeout(() => {
                            const element = document.getElementById(
                              "paycycle-configuration"
                            );
                            if (element) {
                              element.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              });
                            }
                          }, 100);
                        }}
                        className="flex items-center"
                      >
                        <Add className="w-4 h-4 mr-2" />
                        Add Paycycle
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedCompany.paycycles &&
                    selectedCompany.paycycles.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                          {selectedCompany.paycycles.map((paycycle) => {
                            const StatusIcon = CheckCircle;

                            return (
                              <div
                                key={paycycle.id}
                                className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                  selectedPaycycle?.id === paycycle.id
                                    ? "ring-2 ring-blue-500 bg-blue-50"
                                    : "hover:bg-gray-50"
                                }`}
                                onClick={() => {
                                  setSelectedPaycycle(paycycle);
                                  setIsEditingPaycycle(true);
                                  setPaycycleForm({
                                    paycycleName: paycycle.name || "",
                                    frequency: paycycle.frequency || "monthly",
                                    cycleType: paycycle.cycle_type || "regular",
                                    periodEndDay1:
                                      paycycle.period_end_day_1 || "",
                                    periodEndDay2:
                                      paycycle.period_end_day_2 || "",
                                  });
                                }}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center">
                                    <StatusIcon
                                      className={`w-4 h-4 mr-2 text-green-600`}
                                    />
                                    <h4 className="font-medium text-sm">
                                      {paycycle.name}
                                    </h4>
                                  </div>
                                  <div className="flex items-center space-x-1" />
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">
                                      Status:
                                    </span>
                                    <span
                                      className={`text-green-600 font-medium`}
                                    >
                                      {paycycle.status || "active"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">
                          No paycycles configured for this company
                        </p>
                        <Button
                          onClick={() => {
                            setSelectedPaycycle(null);
                            setIsEditingPaycycle(true);
                            setPaycycleForm({
                              paycycleName: "",
                              frequency: "monthly",
                              cycleType: "regular",
                              periodEndDay1: "",
                              periodEndDay2: "",
                            });
                            // Scroll to configuration section
                            setTimeout(() => {
                              const element = document.getElementById(
                                "paycycle-configuration"
                              );
                              if (element) {
                                element.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                              }
                            }, 100);
                          }}
                        >
                          <Add className="w-4 h-4 mr-2" />
                          Add First Paycycle
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Configuration Card */}
                {(isEditingPaycycle || selectedPaycycle) && (
                  <Card id="paycycle-configuration">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Settings className="w-5 h-5 mr-2" />
                        {selectedPaycycle
                          ? `Edit ${selectedPaycycle.name}`
                          : `Add New Paycycle for ${selectedCompany.company_name}`}
                      </CardTitle>
                      <CardDescription>
                        {selectedPaycycle
                          ? "Modify payroll cycle settings"
                          : "Set up new payroll cycle settings"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">Paycycle Name</Label>
                            <Input
                              id="name"
                              type="text"
                              value={paycycleForm.paycycleName || ""}
                              onChange={(e) =>
                                handlePaycycleChange(
                                  "paycycleName",
                                  e.target.value
                                )
                              }
                              placeholder="Enter a name for this paycycle (e.g., 'Regular Payroll', 'Overtime Cycle')"
                            />
                          </div>

                          <div>
                            <Label htmlFor="frequency">Pay Frequency</Label>
                            <select
                              id="frequency"
                              value={paycycleForm.frequency}
                              onChange={(e) => {
                                handlePaycycleChange("frequency", e.target.value);
                                handlePaycycleChange("periodEndDate", "");
                                handlePaycycleChange("periodEndDay1", "");
                                handlePaycycleChange("periodEndDay2", "");
                              }}
                              className="w-full mt-1 p-2 border rounded"
                            >
                              <option value="weekly">Weekly</option>
                              <option value="biweekly">Bi-weekly</option>
                              <option value="semi_monthly">Semi-monthly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>

                          <div>
                            <Label htmlFor="type">Cycle Type</Label>
                            <select
                              id="type"
                              value={paycycleForm.cycleType}
                              onChange={(e) =>
                                handlePaycycleChange(
                                  "cycleType",
                                  e.target.value
                                )
                              }
                              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="labor">Labor</option>
                              <option value="regular">Regular</option>
                              <option value="job-cost">Job Cost</option>
                              <option value="certified">Certified</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {paycycleForm.frequency === 'semi_monthly' ? (
                            <>
                              <div>
                                <label htmlFor="periodEndDay1" className="block text-sm font-medium text-gray-700">
                                  First Period End Day
                                </label>
                                <input
                                  id="periodEndDay1"
                                  type="number"
                                  min="1"
                                  max="31"
                                  value={paycycleForm.periodEndDay1}
                                  onChange={(e) => handlePaycycleChange('periodEndDay1', e.target.value)}
                                  placeholder="e.g., 15"
                                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                />
                              </div>
                              <div>
                                <label htmlFor="periodEndDay2" className="block text-sm font-medium text-gray-700">
                                  Second Period End Day
                                </label>
                                <input
                                  id="periodEndDay2"
                                  type="number"
                                  min="1"
                                  max="31"
                                  value={paycycleForm.periodEndDay2}
                                  onChange={(e) => handlePaycycleChange('periodEndDay2', e.target.value)}
                                  placeholder="e.g., 31"
                                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Use 31 for the last day of the month.
                                </p>
                              </div>
                            </>
                          ) : (
                            <div>
                              <label htmlFor="periodEndDate" className="block text-sm font-medium text-gray-700">
                                Period End Date
                              </label>
                              <input
                                id="periodEndDate"
                                type="date"
                                value={paycycleForm.periodEndDate || ''}
                                onChange={(e) => handlePaycycleChange('periodEndDate', e.target.value)}
                                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingPaycycle(false);
                            setSelectedPaycycle(null);
                            setPaycycleForm({
                              paycycleName: "",
                              frequency: "monthly",
                              cycleType: "regular",
                              periodEndDay1: "",
                              periodEndDay2: "",
                            });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            setPaycycleForm({
                              paycycleName: "",
                              frequency: "monthly",
                              cycleType: "regular",
                              periodEndDay1: "",
                              periodEndDay2: "",
                            })
                          }
                        >
                          Reset
                        </Button>
                        <Button onClick={savePaycycleConfig}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {selectedPaycycle
                            ? "Update Paycycle"
                            : "Save Paycycle"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        );
      case "reports":
        return (
          <>
            {/* Back Button */}
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => {
                  setActiveSection("overview");
                  setShowNavigation(false);
                }}
                className="flex items-center mb-4"
              >
                ← Back to Paycycle Setup
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Assessment className="w-5 h-5 mr-2" />
                  Paycycle Reports
                </CardTitle>
                <CardDescription>
                  Generate comprehensive paycycle reports and analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Paycycle Summary</CardTitle>
                      <CardDescription>
                        Overview of all company paycycles
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Generate a comprehensive summary of all company paycycle
                        configurations and status.
                      </p>
                      <Button className="w-full">Generate Summary</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Processing Schedule</CardTitle>
                      <CardDescription>
                        Upcoming processing dates
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        View and export upcoming payroll processing schedules
                        for all companies.
                      </p>
                      <Button className="w-full">View Schedule</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Compliance Report</CardTitle>
                      <CardDescription>
                        Paycycle compliance status
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Check compliance status and generate reports for audit
                        purposes.
                      </p>
                      <Button className="w-full">Generate Report</Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
        <PageHeader
          title="Paycycle Setup"
          subtitle="Configure and manage payroll cycles for your companies"
          icon={<CalendarToday />}
          breadcrumbs={[
            { label: "Payroll", href: "/payroll" },
            { label: "Paycycle Setup" },
          ]}
        />

        {/* Content */}
        {renderContent()}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Delete Paycycle
                    </h3>
                    <p className="text-sm text-gray-500">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-700">
                    Are you sure you want to delete the paycycle{" "}
                    <span className="font-semibold text-gray-900">
                      "{paycycleToDelete?.name}"
                    </span>
                    ?
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    This will permanently remove the paycycle and all its
                    associated data.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={cancelDelete}
                    className="px-4 py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700"
                  >
                    Delete Paycycle
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
