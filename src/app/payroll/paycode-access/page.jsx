"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import PageHeader from "@/components/PageHeader";
import VpnKey from "@mui/icons-material/VpnKey";
import Search from "@mui/icons-material/Search";
import DragIndicator from "@mui/icons-material/DragIndicator";
import Add from "@mui/icons-material/Add";
import Remove from "@mui/icons-material/Remove";
import CheckCircle from "@mui/icons-material/CheckCircle";
import {
  supabase,
  fetchPaycodesForCompany,
  savePaycodeConfiguration,
  createGlobalPaycode,
} from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function PaycodeAccessPage() {
  const [currentUser] = useState({
    name: "John Doe",
    role: "admin",
    email: "john.doe@company.com",
  });

  // State
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [hideClientsWithoutPaycycles, setHideClientsWithoutPaycycles] =
    useState(false);
  const [autoRestrictNewCodes, setAutoRestrictNewCodes] = useState(false);
  const [selectedType, setSelectedType] = useState("earnings");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fields state - using a single list with enabled/disabled status
  const [fields, setFields] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("all"); // 'all', 'enabled', 'disabled'
  const [isSaving, setIsSaving] = useState(false);

  // Modal state for creating new paycode
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPaycode, setNewPaycode] = useState({
    code: "",
    name: "",
    description: "",
    type: "earnings",
  });

  // Load companies
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc(
        "get_companies_with_paycycle_details"
      );

      if (error) throw error;
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading companies:", err);
      setError(err?.message || "Failed to load companies");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter companies based on paycycle checkbox
  const getFilteredCompanies = () => {
    if (hideClientsWithoutPaycycles) {
      return companies.filter(
        (company) => company.paycycles && company.paycycles.length > 0
      );
    }
    return companies;
  };

  // Load fields when company or type changes
  useEffect(() => {
    if (selectedCompany) {
      loadFieldsForCompany();
    } else {
      setFields([]);
    }
  }, [selectedCompany, selectedType]);

  const loadFieldsForCompany = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await fetchPaycodesForCompany(
        selectedCompany.company_id,
        selectedType
      );

      if (result.success && result.data) {
        // Map the data to the format expected by the UI
        const mappedFields = result.data.map((paycode) => ({
          id: paycode.id,
          code: paycode.code,
          name: paycode.name,
          description: paycode.description || "",
          enabled: paycode.is_enabled,
        }));

        setFields(mappedFields);
        setSearchTerm("");
      } else {
        setError(result.error || "Failed to load paycodes");
        setFields([]);
      }
    } catch (err) {
      console.error("Error loading paycodes:", err);
      setError(err?.message || "Failed to load paycodes");
      setFields([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and search fields
  const getFilteredFields = () => {
    let filtered = fields;

    // Filter by view mode
    if (viewMode === "enabled") {
      filtered = filtered.filter((f) => f.enabled);
    } else if (viewMode === "disabled") {
      filtered = filtered.filter((f) => !f.enabled);
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(
        (field) =>
          field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          field.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          field.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  // Toggle field enabled/disabled
  const toggleField = (fieldId) => {
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.id === fieldId ? { ...field, enabled: !field.enabled } : field
      )
    );
  };

  // Quick actions
  const enableAll = () => {
    setFields((prevFields) =>
      prevFields.map((field) => ({ ...field, enabled: true }))
    );
  };

  const disableAll = () => {
    setFields((prevFields) =>
      prevFields.map((field) => ({ ...field, enabled: false }))
    );
  };

  const enableFiltered = () => {
    const filteredIds = getFilteredFields().map((f) => f.id);
    setFields((prevFields) =>
      prevFields.map((field) =>
        filteredIds.includes(field.id) ? { ...field, enabled: true } : field
      )
    );
  };

  const disableFiltered = () => {
    const filteredIds = getFilteredFields().map((f) => f.id);
    setFields((prevFields) =>
      prevFields.map((field) =>
        filteredIds.includes(field.id) ? { ...field, enabled: false } : field
      )
    );
  };

  const handleSave = async () => {
    if (!selectedCompany) {
      alert("Please select a company");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // Prepare paycode states for upsert
      const paycodeStates = fields.map((field) => ({
        paycode_id: field.id,
        is_enabled: field.enabled,
      }));

      // Save to database using Supabase upsert
      const result = await savePaycodeConfiguration(
        selectedCompany.company_id,
        paycodeStates
      );

      if (result.success) {
        const enabledCount = fields.filter((f) => f.enabled).length;
        alert(
          `Successfully saved ${enabledCount} ${selectedType} paycodes for ${selectedCompany.company_name}`
        );

        // Optionally reload data to ensure UI is in sync
        await loadFieldsForCompany();
      } else {
        setError(result.error || "Failed to save paycode configuration");
        alert("Failed to save paycode access settings: " + result.error);
      }
    } catch (err) {
      console.error("Error saving paycode configuration:", err);
      setError(err?.message || "Failed to save paycode configuration");
      alert("Failed to save paycode access settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenCreateModal = () => {
    // Reset form and open modal
    setNewPaycode({
      code: "",
      name: "",
      description: "",
      type: selectedType || "earnings",
    });
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewPaycode({
      code: "",
      name: "",
      description: "",
      type: "earnings",
    });
  };

  const handleCreatePaycode = async (e) => {
    e.preventDefault();

    // Validation
    if (!newPaycode.code || !newPaycode.name || !newPaycode.type) {
      alert("Please fill in all required fields (Code, Name, and Type)");
      return;
    }

    if (newPaycode.code.length > 10) {
      alert("Code must be 10 characters or less");
      return;
    }

    try {
      setIsSaving(true);

      // Create the global paycode
      const result = await createGlobalPaycode({
        code: newPaycode.code.toUpperCase(),
        name: newPaycode.name,
        description: newPaycode.description,
        type: newPaycode.type,
      });

      if (result.success) {
        alert(
          `Paycode "${result.data[0].name}" created successfully!\n\nThis paycode is now available for all companies.`
        );
        handleCloseCreateModal();

        // Refresh the paycode list if a company is selected
        if (selectedCompany) {
          await loadFieldsForCompany();
        }
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error("Error creating paycode:", err);
      alert("An error occurred while creating the paycode");
    } finally {
      setIsSaving(false);
    }
  };

  // Get stats
  const getStats = () => {
    const enabled = fields.filter((f) => f.enabled).length;
    const total = fields.length;
    return { enabled, total, disabled: total - enabled };
  };

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
        <PageHeader
          title="Paycode Access"
          subtitle="Manage paycode permissions and access controls for companies"
          icon={<VpnKey />}
          breadcrumbs={[
            { label: "Payroll", href: "/payroll" },
            { label: "Paycode Access" },
          ]}
        />

        {/* Controls Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-6">
              <div className="grid gap-6 md:grid-cols-3 flex-1">
                {/* Company Selector */}
                <div>
                  <Label htmlFor="company-select">Company *</Label>
                  <select
                    id="company-select"
                    value={selectedCompany?.company_id || ""}
                    onChange={(e) => {
                      const company = companies.find(
                        (c) => c.company_id === e.target.value
                      );
                      setSelectedCompany(company || null);
                    }}
                    className="w-full mt-1 p-2 border rounded-md"
                    disabled={isLoading}
                  >
                    <option value="">Select Company</option>
                    {getFilteredCompanies().map((company) => (
                      <option
                        key={company.company_id}
                        value={company.company_id}
                      >
                        {company.company_name}{" "}
                        {company.paycycles?.length > 0
                          ? `(${company.paycycles.length} paycycles)`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Dropdown */}
                <div>
                  <Label htmlFor="type-select">Type *</Label>
                  <select
                    id="type-select"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                    disabled={!selectedCompany}
                  >
                    <option value="earnings">Earnings</option>
                    <option value="deductions">Deductions</option>
                    <option value="termination-reasons">
                      Termination Reasons
                    </option>
                  </select>
                </div>

                {/* Checkboxes */}
                <div className="flex flex-col justify-end space-y-3">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={hideClientsWithoutPaycycles}
                      onChange={(e) =>
                        setHideClientsWithoutPaycycles(e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                      Hide clients w/o current pay cycles
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={autoRestrictNewCodes}
                      onChange={(e) =>
                        setAutoRestrictNewCodes(e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={!selectedCompany}
                    />
                    <span
                      className={`text-sm ${
                        selectedCompany
                          ? "text-gray-700 group-hover:text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      Auto-restrict new codes
                    </span>
                  </label>
                </div>
              </div>

              {/* Add New Paycode Button - Far Right */}
              <Button
                variant="outline"
                onClick={handleOpenCreateModal}
                disabled={isLoading}
                className="self-end whitespace-nowrap"
              >
                <Add className="w-4 h-4 mr-2" />
                Add New Paycode
              </Button>
            </div>

            {/* Info about Auto-restrict */}
            {autoRestrictNewCodes && selectedCompany && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-900">
                    Auto-restrict enabled
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    New paycodes added to the system will be automatically
                    disabled for this company by default. You'll need to
                    manually enable them.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modern Card-Based Interface */}
        {selectedCompany && (
          <>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Fields</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {getStats().total}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <VpnKey className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Enabled</p>
                      <p className="text-2xl font-bold text-green-600">
                        {getStats().enabled}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Disabled</p>
                      <p className="text-2xl font-bold text-gray-600">
                        {getStats().disabled}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Remove className="w-6 h-6 text-gray-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fields Management Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      Manage{" "}
                      {selectedType.charAt(0).toUpperCase() +
                        selectedType.slice(1).replace("-", " ")}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedCompany.company_name} •{" "}
                      {selectedCompany.paycycles?.length || 0} Active Paycycles
                    </p>
                  </div>
                  <Button onClick={handleSave} disabled={isSaving || isLoading}>
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters and Actions Bar */}
                <div className="flex flex-wrap gap-3 mb-6 pb-4 border-b">
                  {/* Search */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search fields..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 text-sm border rounded-md"
                      />
                    </div>
                  </div>

                  {/* View Mode Filter */}
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    className="px-3 py-2 text-sm border rounded-md"
                  >
                    <option value="all">All Fields</option>
                    <option value="enabled">Enabled Only</option>
                    <option value="disabled">Disabled Only</option>
                  </select>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={enableAll}
                      title="Enable all fields"
                    >
                      Enable All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={disableAll}
                      title="Disable all fields"
                    >
                      Disable All
                    </Button>
                  </div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading paycodes...</p>
                  </div>
                ) : (
                  <>
                    {/* Fields Grid */}
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {getFilteredFields().length === 0 ? (
                        <div className="col-span-full text-center py-12 text-gray-400">
                          <Search className="w-12 h-12 mx-auto mb-3" />
                          <p>No fields found matching your criteria</p>
                        </div>
                      ) : (
                        getFilteredFields().map((field) => (
                          <Card
                            key={field.id}
                            className={`transition-all cursor-pointer border-2 ${
                              field.enabled
                                ? "border-green-500 bg-green-50 hover:bg-green-100"
                                : "border-gray-200 bg-white hover:bg-gray-50"
                            }`}
                            onClick={() => toggleField(field.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span
                                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                        field.enabled
                                          ? "bg-green-600 text-white"
                                          : "bg-gray-200 text-gray-700"
                                      }`}
                                    >
                                      {field.code}
                                    </span>
                                  </div>
                                  <h4 className="font-semibold text-sm text-gray-900 mb-1">
                                    {field.name}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    {field.description}
                                  </p>
                                </div>
                                <div className="ml-2">
                                  <Switch
                                    checked={field.enabled}
                                    onCheckedChange={() =>
                                      toggleField(field.id)
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>

                              {field.enabled && (
                                <div className="mt-2 pt-2 border-t border-green-200 flex items-center text-xs text-green-700">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Active for company
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>

                    {/* Results Info */}
                    {getFilteredFields().length > 0 && (
                      <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                        Showing {getFilteredFields().length} of {fields.length}{" "}
                        fields
                        {(searchTerm || viewMode !== "all") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSearchTerm("");
                              setViewMode("all");
                            }}
                            className="ml-3 text-blue-600"
                          >
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Instructions */}
        {!selectedCompany && (
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-gray-500">
                <VpnKey className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Get Started with Paycode Access
                </h3>
                <p className="text-sm mb-6">
                  Configure which paycodes are available for each company
                </p>
                <div className="grid gap-4 md:grid-cols-2 text-left max-w-4xl mx-auto">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">
                      Quick Start
                    </h4>
                    <ol className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="font-semibold mr-2 text-blue-600">
                          1.
                        </span>
                        Select a company from the dropdown
                      </li>
                      <li className="flex items-start">
                        <span className="font-semibold mr-2 text-blue-600">
                          2.
                        </span>
                        Choose type (Earnings, Deductions, or Termination)
                      </li>
                      <li className="flex items-start">
                        <span className="font-semibold mr-2 text-blue-600">
                          3.
                        </span>
                        Toggle switches to enable/disable fields
                      </li>
                      <li className="flex items-start">
                        <span className="font-semibold mr-2 text-blue-600">
                          4.
                        </span>
                        Click "Save Changes" when done
                      </li>
                    </ol>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">
                      Features
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                        Card-based interface for easy management
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                        Search and filter paycodes
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                        Bulk enable/disable actions
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                        Real-time statistics and filtering
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create New Paycode Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Paycode</DialogTitle>
              <DialogDescription>
                Add a new paycode to the master paycodes table. This paycode
                will be available for all companies but not automatically
                assigned.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreatePaycode}>
              <div className="grid gap-4 py-4">
                {/* Code Field */}
                <div className="grid gap-2">
                  <Label htmlFor="paycode-code">
                    Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="paycode-code"
                    placeholder="e.g., SICK"
                    maxLength={10}
                    value={newPaycode.code}
                    onChange={(e) =>
                      setNewPaycode({
                        ...newPaycode,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    required
                    className="uppercase"
                  />
                  <p className="text-xs text-gray-500">
                    Unique code, max 10 characters
                  </p>
                </div>

                {/* Name Field */}
                <div className="grid gap-2">
                  <Label htmlFor="paycode-name">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="paycode-name"
                    placeholder="e.g., Sick Pay"
                    value={newPaycode.name}
                    onChange={(e) =>
                      setNewPaycode({ ...newPaycode, name: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Description Field */}
                <div className="grid gap-2">
                  <Label htmlFor="paycode-description">Description</Label>
                  <textarea
                    id="paycode-description"
                    placeholder="e.g., Paid sick leave"
                    value={newPaycode.description}
                    onChange={(e) =>
                      setNewPaycode({
                        ...newPaycode,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Type Field */}
                <div className="grid gap-2">
                  <Label htmlFor="paycode-type">
                    Type <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="paycode-type"
                    value={newPaycode.type}
                    onChange={(e) =>
                      setNewPaycode({ ...newPaycode, type: e.target.value })
                    }
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="earnings">Earnings</option>
                    <option value="deductions">Deductions</option>
                    <option value="termination-reasons">
                      Termination Reasons
                    </option>
                  </select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseCreateModal}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Add className="w-4 h-4 mr-2" />
                      Create Paycode
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
