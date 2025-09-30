'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/contexts/SupabaseContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Building from '@mui/icons-material/Business'
import People from '@mui/icons-material/People'
import Edit from '@mui/icons-material/Edit'
import Search from '@mui/icons-material/Search'
import Clear from '@mui/icons-material/Clear'
import { ListFilter, ListX } from 'lucide-react'
import {
  getCompaniesWithStats,
  getCompaniesForDashboard,
  getAllEmployeesDetailed,
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
  addManagersToDepartment
} from '../../lib/adminHelpers'

export default function AdminDashboard() {
  const { user, loading: authLoading } = useSupabase()
  
  // State management
  const [companies, setCompanies] = useState([])
  const [dashboardCompanies, setDashboardCompanies] = useState([])
  const [allEmployees, setAllEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // UI state
  const [activeTab, setActiveTab] = useState('companies')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Manage tab state
  const [showAddCompany, setShowAddCompany] = useState(false)
  const [showEditCompany, setShowEditCompany] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)
  const [deletingCompany, setDeletingCompany] = useState(null)
  const [newCompany, setNewCompany] = useState({ name: '', description: '', status: 'active' })
  const [companyNameConfirmation, setCompanyNameConfirmation] = useState('')
  
  // Edit Company Tabs
  const [editCompanyActiveTab, setEditCompanyActiveTab] = useState('info')
  
  // Add Company Wizard
  const [wizardStep, setWizardStep] = useState(1)
  const [wizardCompanyId, setWizardCompanyId] = useState(null)
  
  // Form validation
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Company details state (for edit view)
  const [companyDetails, setCompanyDetails] = useState({
    company: null,
    locations: [],
    departments: [],
    employees: []
  })
  const [detailsLoading, setDetailsLoading] = useState(false)
  
  // Location management state
  const [showAddLocation, setShowAddLocation] = useState(false)
  const [showEditLocation, setShowEditLocation] = useState(false)
  const [editingLocation, setEditingLocation] = useState(null)
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    manager_ids: []
  })
  
  // Department management state
  const [showAddDepartment, setShowAddDepartment] = useState(false)
  const [showEditDepartment, setShowEditDepartment] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState(null)
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
    location_id: '',
    manager_ids: []
  })
  
  // Employee pagination and filters
  const [currentEmployeePage, setCurrentEmployeePage] = useState(1)
  const EMPLOYEES_PER_PAGE = 25
  const [companyFilter, setCompanyFilter] = useState('')
  const [jobRoleFilter, setJobRoleFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [showEmployeeFilters, setShowEmployeeFilters] = useState(false)

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load both types of company data and employees in parallel
      const [companiesResult, dashboardResult, employeesResult] = await Promise.all([
        getCompaniesWithStats(),
        getCompaniesForDashboard(),
        getAllEmployeesDetailed()
      ])
      
      if (companiesResult.error) {
        console.error('Error loading companies:', companiesResult.error)
      } else {
        setCompanies(companiesResult.data || [])
      }
      
      if (dashboardResult.error) {
        console.error('Error loading dashboard companies:', dashboardResult.error)
        if (!companiesResult.error) {
          setError(dashboardResult.error)
        }
      } else {
        console.log('Dashboard Companies Data:', dashboardResult.data) // Debug log
        setDashboardCompanies(dashboardResult.data || [])
      }
      
      if (employeesResult.error) {
        console.error('Error loading employees:', employeesResult.error)
        if (!companiesResult.error && !dashboardResult.error) {
          setError(employeesResult.error)
        }
      } else {
        setAllEmployees(employeesResult.data || [])
      }
      
    } catch (err) {
      setError('Failed to load administration data')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  // Filter companies based on search term
  const filteredCompanies = dashboardCompanies.filter(company =>
    (company.company_name || company.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.state?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter and paginate employees
  const getFilteredEmployees = () => {
    return allEmployees.filter(employee => {
      if (companyFilter && !employee.company_name?.toLowerCase().includes(companyFilter.toLowerCase())) {
        return false
      }
      if (jobRoleFilter && !employee.job_title?.toLowerCase().includes(jobRoleFilter.toLowerCase())) {
        return false
      }
      if (departmentFilter && !employee.department_name?.toLowerCase().includes(departmentFilter.toLowerCase())) {
        return false
      }
      return true
    })
  }

  const getPaginatedEmployees = () => {
    const filtered = getFilteredEmployees()
    const startIndex = (currentEmployeePage - 1) * EMPLOYEES_PER_PAGE
    const endIndex = startIndex + EMPLOYEES_PER_PAGE
    return filtered.slice(startIndex, endIndex)
  }

  const getTotalEmployeePages = () => {
    const totalEmployees = getFilteredEmployees().length
    return Math.ceil(totalEmployees / EMPLOYEES_PER_PAGE)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const clearSearch = () => {
    setSearchTerm('')
  }

  const clearFilters = () => {
    setCompanyFilter('')
    setJobRoleFilter('')
    setDepartmentFilter('')
    setCurrentEmployeePage(1)
  }

  // CRUD operations for manage tab
  const handleAddCompany = async () => {
    if (!newCompany.name.trim()) return
    
    try {
      setLoading(true)
      const result = await createCompany(newCompany)
      
      if (result.error) {
        setError(result.error)
      } else {
        setShowAddCompany(false)
        setNewCompany({ name: '', description: '', status: 'active' })
        await loadData() // Refresh data
      }
    } catch (err) {
      setError('Failed to add company')
    } finally {
      setLoading(false)
    }
  }

  const handleEditCompany = async () => {
    if (!editingCompany) return
    
    // Validate form
    const errors = validateCompanyForm(newCompany)
    setFormErrors(errors)
    
    if (Object.keys(errors).length > 0) {
      return
    }
    
    try {
      setIsSubmitting(true)
      const result = await updateCompany(editingCompany.id, newCompany)
      
      if (result.error) {
        setError(result.error)
      } else {
        setShowEditCompany(false)
        setEditingCompany(null)
        setNewCompany({ name: '', description: '', status: 'active' })
        setFormErrors({})
        await loadData() // Refresh data
      }
    } catch (err) {
      setError('Failed to update company')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCompany = async () => {
    if (!deletingCompany || companyNameConfirmation !== deletingCompany.name) return
    
    try {
      setLoading(true)
      const result = await deleteCompany(deletingCompany.id)
      
      if (result.error) {
        setError(result.error)
      } else {
        setShowDeleteConfirm(false)
        setDeletingCompany(null)
        setCompanyNameConfirmation('')
        await loadData() // Refresh data
      }
    } catch (err) {
      setError('Failed to delete company')
    } finally {
      setLoading(false)
    }
  }

  // Validation functions
  const validateCompanyForm = (company) => {
    const errors = {}
    
    if (!company.name?.trim()) {
      errors.name = 'Company name is required'
    } else if (company.name.trim().length < 2) {
      errors.name = 'Company name must be at least 2 characters'
    } else if (company.name.trim().length > 100) {
      errors.name = 'Company name must be less than 100 characters'
    }
    
    if (company.description && company.description.length > 500) {
      errors.description = 'Description must be less than 500 characters'
    }
    
    return errors
  }
  
  const validateLocationForm = (location) => {
    const errors = {}
    
    if (!location.name?.trim()) {
      errors.name = 'Location name is required'
    } else if (location.name.trim().length < 2) {
      errors.name = 'Location name must be at least 2 characters'
    }
    
    if (location.postal_code && !/^\d{5}(-\d{4})?$/.test(location.postal_code)) {
      errors.postal_code = 'Please enter a valid postal code (e.g., 12345 or 12345-6789)'
    }
    
    return errors
  }
  
  const validateDepartmentForm = (department) => {
    const errors = {}
    
    if (!department.name?.trim()) {
      errors.name = 'Department name is required'
    } else if (department.name.trim().length < 2) {
      errors.name = 'Department name must be at least 2 characters'
    }
    
    if (!department.location_id) {
      errors.location_id = 'Please select a location for this department'
    }
    
    if (department.description && department.description.length > 300) {
      errors.description = 'Description must be less than 300 characters'
    }
    
    return errors
  }

  const openEditModal = async (company) => {
    setEditingCompany(company)
    setNewCompany({
      name: company.name,
      description: company.description || '',
      status: company.status
    })
    setShowEditCompany(true)
    setEditCompanyActiveTab('info') // Reset to first tab
    setFormErrors({}) // Clear any previous errors
    
    // Initialize with empty data first
    setCompanyDetails({
      company: company,
      locations: [],
      departments: [],
      employees: []
    })
    
    // Fetch company details with locations, departments, and employees
    await fetchCompanyDetailsData(company.id)
  }

  const openDeleteModal = (company) => {
    setDeletingCompany(company)
    setCompanyNameConfirmation('')
    setShowDeleteConfirm(true)
  }

  const fetchCompanyDetailsData = async (companyId) => {
    try {
      setDetailsLoading(true)
      console.log('Fetching details for company ID:', companyId)
      
      const result = await fetchCompanyWithDetails(companyId)
      console.log('Fetch result:', result)
      
      if (result.success && result.data) {
        setCompanyDetails(result.data)
        setError(null) // Clear any previous errors
      } else {
        console.error('Error in result:', result.error)
        setError(result.error || 'Failed to load company details')
      }
    } catch (err) {
      console.error('Exception in fetchCompanyDetailsData:', err)
      setError('Failed to load company details')
    } finally {
      setDetailsLoading(false)
    }
  }

  // Wizard functions
  const startAddCompanyWizard = () => {
    setShowAddCompany(true)
    setWizardStep(1)
    setWizardCompanyId(null)
    setNewCompany({ name: '', description: '', status: 'active' })
    setNewLocation({
      name: '',
      address: '',
      city: '',
      state: '',
      postal_code: '',
      manager_ids: []
    })
    setNewDepartment({
      name: '',
      description: '',
      location_id: '',
      manager_ids: []
    })
    setFormErrors({})
  }

  const handleWizardNext = async () => {
    if (wizardStep === 1) {
      // Validate and create company
      const errors = validateCompanyForm(newCompany)
      setFormErrors(errors)
      
      if (Object.keys(errors).length > 0) {
        return
      }
      
      try {
        setIsSubmitting(true)
        const result = await createCompany(newCompany)
        
        if (result.error) {
          setError(result.error)
          return
        }
        
        setWizardCompanyId(result.data[0].id)
        setWizardStep(2)
        setFormErrors({})
        
        // Fetch company details for the new company
        await fetchCompanyDetailsData(result.data[0].id)
      } catch (err) {
        setError('Failed to create company')
      } finally {
        setIsSubmitting(false)
      }
    } else if (wizardStep === 2) {
      // Move to departments step
      setWizardStep(3)
    }
  }

  const handleWizardBack = () => {
    if (wizardStep > 1) {
      setWizardStep(wizardStep - 1)
    }
  }

  const handleWizardFinish = async () => {
    setShowAddCompany(false)
    setWizardStep(1)
    setWizardCompanyId(null)
    setFormErrors({})
    await loadData() // Refresh data
  }

  const handleAddLocation = async () => {
    const companyId = editingCompany?.id || wizardCompanyId
    if (!companyId) return
    
    // Validate form
    const errors = validateLocationForm(newLocation)
    setFormErrors(prev => ({ ...prev, location: errors }))
    
    if (Object.keys(errors).length > 0) {
      return
    }
    
    try {
      setDetailsLoading(true)
      const result = await addLocationForCompany(newLocation, companyId)
      
      if (result.data && !result.error) {
        setShowAddLocation(false)
        setNewLocation({
          name: '',
          address: '',
          city: '',
          state: '',
          postal_code: '',
          manager_ids: []
        })
        setFormErrors(prev => ({ ...prev, location: {} }))
        // Refresh company details
        await fetchCompanyDetailsData(companyId)
      } else {
        setError(result.error || 'Failed to add location')
      }
    } catch (err) {
      setError('Failed to add location')
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleAddDepartment = async () => {
    const companyId = editingCompany?.id || wizardCompanyId
    if (!companyId) return
    
    // Validate form
    const errors = validateDepartmentForm(newDepartment)
    setFormErrors(prev => ({ ...prev, department: errors }))
    
    if (Object.keys(errors).length > 0) {
      return
    }
    
    try {
      setDetailsLoading(true)
      const result = await addDepartmentForCompany(newDepartment, companyId)
      
      if (result.data && !result.error) {
        setShowAddDepartment(false)
        setNewDepartment({
          name: '',
          description: '',
          location_id: '',
          manager_ids: []
        })
        setFormErrors(prev => ({ ...prev, department: {} }))
        // Refresh company details
        await fetchCompanyDetailsData(companyId)
      } else {
        setError(result.error || 'Failed to add department')
      }
    } catch (err) {
      setError('Failed to add department')
    } finally {
      setDetailsLoading(false)
    }
  }

  // Edit handlers
  const handleEditLocation = async (location) => {
    // Fetch current managers for this location
    const managersResult = await getManagersForLocation(location.id)
    const currentManagerIds = managersResult.data ? managersResult.data.map(manager => manager.id) : []
    
    setEditingLocation(location)
    setNewLocation({
      name: location.name,
      address: location.address || '',
      city: location.city || '',
      state: location.state || '',
      postal_code: location.postal_code || '',
      manager_ids: currentManagerIds
    })
    setShowEditLocation(true)
    setFormErrors({})
  }

  const handleUpdateLocation = async () => {
    if (!editingLocation) return
    
    // Validate form
    const errors = validateLocationForm(newLocation)
    setFormErrors(prev => ({ ...prev, location: errors }))
    
    if (Object.keys(errors).length > 0) {
      return
    }
    
    try {
      setDetailsLoading(true)
      const result = await updateLocation(editingLocation.id, newLocation)
      
      if (result.data && !result.error) {
        setShowEditLocation(false)
        setEditingLocation(null)
        setNewLocation({
          name: '',
          address: '',
          city: '',
          state: '',
          postal_code: '',
          manager_ids: []
        })
        setFormErrors(prev => ({ ...prev, location: {} }))
        // Refresh company details
        const companyId = editingCompany?.id || wizardCompanyId
        await fetchCompanyDetailsData(companyId)
      } else {
        setError(result.error || 'Failed to update location')
      }
    } catch (err) {
      setError('Failed to update location')
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleEditDepartment = async (department) => {
    // Fetch current managers for this department
    const managersResult = await getManagersForDepartment(department.id)
    const currentManagerIds = managersResult.data ? managersResult.data.map(manager => manager.id) : []
    
    setEditingDepartment(department)
    setNewDepartment({
      name: department.name,
      description: department.description || '',
      location_id: department.location_id || '',
      manager_ids: currentManagerIds
    })
    setShowEditDepartment(true)
    setFormErrors({})
  }

  const handleUpdateDepartment = async () => {
    if (!editingDepartment) return
    
    // Validate form
    const errors = validateDepartmentForm(newDepartment)
    setFormErrors(prev => ({ ...prev, department: errors }))
    
    if (Object.keys(errors).length > 0) {
      return
    }
    
    try {
      setDetailsLoading(true)
      const result = await updateDepartment(editingDepartment.id, newDepartment)
      
      if (result.data && !result.error) {
        setShowEditDepartment(false)
        setEditingDepartment(null)
        setNewDepartment({
          name: '',
          description: '',
          location_id: '',
          manager_ids: []
        })
        setFormErrors(prev => ({ ...prev, department: {} }))
        // Refresh company details
        const companyId = editingCompany?.id || wizardCompanyId
        await fetchCompanyDetailsData(companyId)
      } else {
        setError(result.error || 'Failed to update department')
      }
    } catch (err) {
      setError('Failed to update department')
    } finally {
      setDetailsLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading administration data...</p>
        </div>
      </div>
    )
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
    )
  }

  return (
    <div className="space-y-6">

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-center">
          <TabsList className="inline-flex bg-muted/50 p-1 rounded-md max-w-4xl">
            <TabsTrigger value="companies" className="flex items-center justify-center min-w-0 flex-1 mx-1">
              <Building className="w-4 h-4 mr-2" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center justify-center min-w-0 flex-1 mx-1">
              <Edit className="w-4 h-4 mr-2" />
              Manage
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center justify-center min-w-0 flex-1 mx-1">
              <People className="w-4 h-4 mr-2" />
              Employees
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
                      {searchTerm ? `${filteredCompanies.length}/` : ''}{dashboardCompanies.length} Total
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
                    {dashboardCompanies.length === 0 ? 'No Companies Found' : 'No Search Results'}
                  </p>
                  <p className="text-sm">
                    {dashboardCompanies.length === 0 
                      ? 'Connect your Supabase database to see companies here.' 
                      : 'Try adjusting your search terms.'}
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
                        <tr key={company.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="font-medium">{company.company_name || company.name}</div>
                          </td>
                          <td className="p-3 text-sm text-gray-600">{company.city || 'N/A'}</td>
                          <td className="p-3 text-sm text-gray-600">{company.state || 'N/A'}</td>
                          <td className="p-3 text-sm text-gray-600">{company.postal_code || 'N/A'}</td>
                          <td className="p-3 text-sm">{company.department_count || 0}</td>
                          <td className="p-3 text-sm">{company.employee_count || 0}</td>
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
                <CardTitle className="flex items-center">
                  <Edit className="mr-2" />
                  Manage Companies
                </CardTitle>
                <Button onClick={startAddCompanyWizard}>
                  Add Company
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {companies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No companies to manage. Connect your Supabase database to see companies here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Company Name</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Locations</th>
                        <th className="text-left p-3">Departments</th>
                        <th className="text-left p-3">Employees</th>
                        <th className="text-left p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map((company) => (
                        <tr key={company.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="font-medium">{company.name}</div>
                            <div className="text-sm text-gray-500">{company.description}</div>
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                              {company.status}
                            </span>
                          </td>
                          <td className="p-3 text-sm">{company.location_count || 0}</td>
                          <td className="p-3 text-sm">{company.department_count || 0}</td>
                          <td className="p-3 text-sm">{company.employee_count || 0}</td>
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
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <People className="mr-2" />
                  All Employees ({getFilteredEmployees().length})
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowEmployeeFilters(!showEmployeeFilters)}
                  >
                    {showEmployeeFilters ? <ListX className="w-4 h-4 mr-2" /> : <ListFilter className="w-4 h-4 mr-2" />}
                    {showEmployeeFilters ? 'Hide Filters' : 'Show Filters'}
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
                      ? 'Connect your Supabase database to see employees here.'
                      : 'No employees match your current filters.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Name</th>
                          <th className="text-left p-3">Email</th>
                          <th className="text-left p-3">Job Title</th>
                          <th className="text-left p-3">Company</th>
                          <th className="text-left p-3">Department</th>
                          <th className="text-left p-3">Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getPaginatedEmployees().map((employee) => (
                          <tr key={employee.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <div className="font-medium">{employee.first_name} {employee.last_name}</div>
                            </td>
                            <td className="p-3 text-sm text-gray-600">{employee.email}</td>
                            <td className="p-3 text-sm">{employee.job_title || 'N/A'}</td>
                            <td className="p-3 text-sm">{employee.company_name || 'N/A'}</td>
                            <td className="p-3 text-sm">{employee.department_name || 'N/A'}</td>
                            <td className="p-3 text-sm">{employee.location_name || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {getTotalEmployeePages() > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-gray-600">
                        Showing {((currentEmployeePage - 1) * EMPLOYEES_PER_PAGE) + 1} to {Math.min(currentEmployeePage * EMPLOYEES_PER_PAGE, getFilteredEmployees().length)} of {getFilteredEmployees().length} employees
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentEmployeePage(Math.max(1, currentEmployeePage - 1))}
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
                          onClick={() => setCurrentEmployeePage(Math.min(getTotalEmployeePages(), currentEmployeePage + 1))}
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
                  <p className="text-sm text-gray-600">Step {wizardStep} of 3</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddCompany(false)
                    setWizardStep(1)
                    setWizardCompanyId(null)
                    setNewCompany({ name: '', description: '', status: 'active' })
                    setFormErrors({})
                  }}
                >
                  Cancel
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${wizardStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    1
                  </div>
                  <div className={`flex-1 h-1 mx-2 ${wizardStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${wizardStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    2
                  </div>
                  <div className={`flex-1 h-1 mx-2 ${wizardStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${wizardStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
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
                    <p className="text-sm text-gray-600">Enter the basic details for your new company.</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="wizard-company-name">Company Name *</Label>
                      <Input
                        id="wizard-company-name"
                        value={newCompany.name}
                        onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                        placeholder="Enter company name"
                        className={formErrors.name ? 'border-red-500' : ''}
                      />
                      {formErrors.name && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="wizard-company-description">Description</Label>
                      <textarea
                        id="wizard-company-description"
                        value={newCompany.description}
                        onChange={(e) => setNewCompany({...newCompany, description: e.target.value})}
                        placeholder="Enter company description"
                        className={`w-full border rounded px-3 py-2 min-h-[100px] ${formErrors.description ? 'border-red-500' : ''}`}
                      />
                      {formErrors.description && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="wizard-company-status">Status</Label>
                      <select
                        id="wizard-company-status"
                        value={newCompany.status}
                        onChange={(e) => setNewCompany({...newCompany, status: e.target.value})}
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
                        <p className="text-sm text-gray-600">Add locations for your company (optional).</p>
                      </div>
                      <Button size="sm" onClick={() => setShowAddLocation(true)}>
                        Add Location
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {companyDetails.locations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No locations added yet. You can add locations now or skip this step.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {companyDetails.locations.map((location) => (
                          <div key={location.id} className="border rounded p-3">
                            <div className="font-medium">{location.name}</div>
                            <div className="text-sm text-gray-600">
                              {location.city}, {location.state} {location.postal_code}
                            </div>
                            <div className="text-xs text-gray-500">{location.address}</div>
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
                        <p className="text-sm text-gray-600">Add departments for your company (optional).</p>
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
                        <p>No departments added yet. You can add departments now or finish setup.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {companyDetails.departments.map((department) => (
                          <div key={department.id} className="border rounded p-3">
                            <div className="font-medium">{department.name}</div>
                            <div className="text-sm text-gray-600">{department.description}</div>
                            <div className="text-xs text-gray-500">
                              Location: {companyDetails.locations.find(l => l.id === department.location_id)?.name || 'Not assigned'}
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
                    <Button 
                      onClick={handleWizardNext}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Creating...' : wizardStep === 1 ? 'Create & Continue' : 'Next'}
                    </Button>
                  ) : (
                    <Button onClick={handleWizardFinish}>
                      Finish Setup
                    </Button>
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
                <h3 className="text-xl font-semibold">Edit Company: {editingCompany?.name}</h3>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditCompany(false)
                    setEditingCompany(null)
                    setNewCompany({ name: '', description: '', status: 'active' })
                    setCompanyDetails({ company: null, locations: [], departments: [], employees: [] })
                    setFormErrors({})
                    setEditCompanyActiveTab('info')
                  }}
                >
                  Close
                </Button>
              </div>

              <Tabs value={editCompanyActiveTab} onValueChange={setEditCompanyActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="info">Company Info</TabsTrigger>
                  <TabsTrigger value="locations">Locations</TabsTrigger>
                  <TabsTrigger value="departments">Departments</TabsTrigger>
                  <TabsTrigger value="danger" className="text-red-600 data-[state=active]:text-red-700">⚠️ Danger Zone</TabsTrigger>
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
                        <Label htmlFor="edit-company-name">Company Name *</Label>
                        <Input
                          id="edit-company-name"
                          value={newCompany.name}
                          onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                          placeholder="Enter company name"
                          className={formErrors.name ? 'border-red-500' : ''}
                        />
                        {formErrors.name && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="edit-company-description">Description</Label>
                        <textarea
                          id="edit-company-description"
                          value={newCompany.description}
                          onChange={(e) => setNewCompany({...newCompany, description: e.target.value})}
                          placeholder="Enter company description"
                          className={`w-full border rounded px-3 py-2 min-h-[100px] ${formErrors.description ? 'border-red-500' : ''}`}
                        />
                        {formErrors.description && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="edit-company-status">Status</Label>
                        <select
                          id="edit-company-status"
                          value={newCompany.status}
                          onChange={(e) => setNewCompany({...newCompany, status: e.target.value})}
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
                        {isSubmitting ? 'Updating...' : 'Update Company'}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Locations Tab */}
                <TabsContent value="locations" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Locations ({companyDetails.locations.length})</CardTitle>
                        <Button size="sm" onClick={() => setShowAddLocation(true)}>
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
                        <p className="text-gray-500 text-sm">No locations added yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {companyDetails.locations.map((location) => (
                            <div key={location.id} className="border rounded p-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium">{location.name}</div>
                                  <div className="text-sm text-gray-600">
                                    {location.city}, {location.state} {location.postal_code}
                                  </div>
                                  <div className="text-xs text-gray-500">{location.address}</div>
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
                        <CardTitle>Departments ({companyDetails.departments.length})</CardTitle>
                        <Button size="sm" onClick={() => setShowAddDepartment(true)}>
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
                        <p className="text-gray-500 text-sm">No departments added yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {companyDetails.departments.map((department) => (
                            <div key={department.id} className="border rounded p-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium">{department.name}</div>
                                  <div className="text-sm text-gray-600">{department.description}</div>
                                  <div className="text-xs text-gray-500">
                                    Location: {companyDetails.locations.find(l => l.id === department.location_id)?.name || 'Not assigned'}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditDepartment(department)}
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
                        <h4 className="text-lg font-semibold text-red-800 mb-2">Delete this Company</h4>
                        <p className="text-red-700 mb-4">
                          Once you delete a company, there is no going back. This will permanently delete the company 
                          and all associated data including locations, departments, and employee assignments.
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
            <h3 className="text-lg font-semibold mb-4 text-red-600">Delete Company</h3>
            <p className="mb-4">
              Are you sure you want to delete <strong>{deletingCompany.name}</strong>? 
              This action cannot be undone and will also delete all associated locations, departments, and employees.
            </p>
            <p className="mb-4 text-sm text-gray-600">
              To confirm, please type the company name: <strong>{deletingCompany.name}</strong>
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
                  setShowDeleteConfirm(false)
                  setDeletingCompany(null)
                  setCompanyNameConfirmation('')
                }}
              >
                Cancel
              </Button>
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
                  onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                  placeholder="Enter location name"
                  className={formErrors.location?.name ? 'border-red-500' : ''}
                />
                {formErrors.location?.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.location.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="location-address">Address</Label>
                <Input
                  id="location-address"
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                  placeholder="Enter address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location-city">City</Label>
                  <Input
                    id="location-city"
                    value={newLocation.city}
                    onChange={(e) => setNewLocation({...newLocation, city: e.target.value})}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="location-state">State</Label>
                  <Input
                    id="location-state"
                    value={newLocation.state}
                    onChange={(e) => setNewLocation({...newLocation, state: e.target.value})}
                    placeholder="State"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location-postal">Postal Code</Label>
                <Input
                  id="location-postal"
                  value={newLocation.postal_code}
                  onChange={(e) => setNewLocation({...newLocation, postal_code: e.target.value})}
                  placeholder="Postal code (e.g., 12345 or 12345-6789)"
                  className={formErrors.location?.postal_code ? 'border-red-500' : ''}
                />
                {formErrors.location?.postal_code && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.location.postal_code}</p>
                )}
              </div>
              <div>
                <Label htmlFor="location-managers">Managers</Label>
                <div className="border rounded p-3 max-h-40 overflow-y-auto">
                  {companyDetails.employees.length === 0 ? (
                    <p className="text-gray-500 text-sm">No employees available</p>
                  ) : (
                    companyDetails.employees.map((employee) => (
                      <label key={employee.id} className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          checked={newLocation.manager_ids.includes(employee.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewLocation({
                                ...newLocation,
                                manager_ids: [...newLocation.manager_ids, employee.id]
                              })
                            } else {
                              setNewLocation({
                                ...newLocation,
                                manager_ids: newLocation.manager_ids.filter(id => id !== employee.id)
                              })
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
                {detailsLoading ? 'Adding...' : 'Add Location'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddLocation(false)
                  setNewLocation({
                    name: '',
                    address: '',
                    city: '',
                    state: '',
                    postal_code: '',
                    manager_ids: []
                  })
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
                  onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                  placeholder="Enter department name"
                  className={formErrors.department?.name ? 'border-red-500' : ''}
                />
                {formErrors.department?.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.department.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="department-description">Description</Label>
                <textarea
                  id="department-description"
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                  placeholder="Enter department description"
                  className={`w-full border rounded px-3 py-2 min-h-[80px] ${formErrors.department?.description ? 'border-red-500' : ''}`}
                />
                {formErrors.department?.description && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.department.description}</p>
                )}
              </div>
              <div>
                <Label htmlFor="department-location">Location *</Label>
                <select
                  id="department-location"
                  value={newDepartment.location_id || ''}
                  onChange={(e) => setNewDepartment({...newDepartment, location_id: e.target.value})}
                  className={`w-full border rounded px-3 py-2 ${formErrors.department?.location_id ? 'border-red-500' : ''}`}
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
                  <p className="text-red-500 text-sm mt-1">{formErrors.department.location_id}</p>
                )}
              </div>
              <div>
                <Label htmlFor="department-managers">Managers</Label>
                <div className="border rounded p-3 max-h-40 overflow-y-auto">
                  {companyDetails.employees.length === 0 ? (
                    <p className="text-gray-500 text-sm">No employees available</p>
                  ) : (
                    companyDetails.employees.map((employee) => (
                      <label key={employee.id} className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          checked={newDepartment.manager_ids.includes(employee.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewDepartment({
                                ...newDepartment,
                                manager_ids: [...newDepartment.manager_ids, employee.id]
                              })
                            } else {
                              setNewDepartment({
                                ...newDepartment,
                                manager_ids: newDepartment.manager_ids.filter(id => id !== employee.id)
                              })
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
                disabled={!newDepartment.name.trim() || !newDepartment.location_id || detailsLoading}
              >
                {detailsLoading ? 'Adding...' : 'Add Department'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddDepartment(false)
                  setNewDepartment({
                    name: '',
                    description: '',
                    location_id: '',
                    manager_ids: []
                  })
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
            <h3 className="text-lg font-semibold mb-4">Edit Location: {editingLocation.name}</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-location-name">Location Name *</Label>
                <Input
                  id="edit-location-name"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                  placeholder="Enter location name"
                  className={formErrors.location?.name ? 'border-red-500' : ''}
                />
                {formErrors.location?.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.location.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-location-address">Address</Label>
                <Input
                  id="edit-location-address"
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                  placeholder="Enter address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-location-city">City</Label>
                  <Input
                    id="edit-location-city"
                    value={newLocation.city}
                    onChange={(e) => setNewLocation({...newLocation, city: e.target.value})}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-location-state">State</Label>
                  <Input
                    id="edit-location-state"
                    value={newLocation.state}
                    onChange={(e) => setNewLocation({...newLocation, state: e.target.value})}
                    placeholder="State"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-location-postal">Postal Code</Label>
                <Input
                  id="edit-location-postal"
                  value={newLocation.postal_code}
                  onChange={(e) => setNewLocation({...newLocation, postal_code: e.target.value})}
                  placeholder="Postal code (e.g., 12345 or 12345-6789)"
                  className={formErrors.location?.postal_code ? 'border-red-500' : ''}
                />
                {formErrors.location?.postal_code && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.location.postal_code}</p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-location-managers">Managers</Label>
                <div className="border rounded p-3 max-h-40 overflow-y-auto">
                  {companyDetails.employees.length === 0 ? (
                    <p className="text-gray-500 text-sm">No employees available</p>
                  ) : (
                    companyDetails.employees.map((employee) => (
                      <label key={employee.id} className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          checked={newLocation.manager_ids.includes(employee.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewLocation({
                                ...newLocation,
                                manager_ids: [...newLocation.manager_ids, employee.id]
                              })
                            } else {
                              setNewLocation({
                                ...newLocation,
                                manager_ids: newLocation.manager_ids.filter(id => id !== employee.id)
                              })
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
                {detailsLoading ? 'Updating...' : 'Update Location'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditLocation(false)
                  setEditingLocation(null)
                  setNewLocation({
                    name: '',
                    address: '',
                    city: '',
                    state: '',
                    postal_code: '',
                    manager_ids: []
                  })
                  setFormErrors(prev => ({ ...prev, location: {} }))
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
            <h3 className="text-lg font-semibold mb-4">Edit Department: {editingDepartment.name}</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-department-name">Department Name *</Label>
                <Input
                  id="edit-department-name"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                  placeholder="Enter department name"
                  className={formErrors.department?.name ? 'border-red-500' : ''}
                />
                {formErrors.department?.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.department.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-department-description">Description</Label>
                <textarea
                  id="edit-department-description"
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                  placeholder="Enter department description"
                  className={`w-full border rounded px-3 py-2 min-h-[80px] ${formErrors.department?.description ? 'border-red-500' : ''}`}
                />
                {formErrors.department?.description && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.department.description}</p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-department-location">Location *</Label>
                <select
                  id="edit-department-location"
                  value={newDepartment.location_id || ''}
                  onChange={(e) => setNewDepartment({...newDepartment, location_id: e.target.value})}
                  className={`w-full border rounded px-3 py-2 ${formErrors.department?.location_id ? 'border-red-500' : ''}`}
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
                  <p className="text-red-500 text-sm mt-1">{formErrors.department.location_id}</p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-department-managers">Managers</Label>
                <div className="border rounded p-3 max-h-40 overflow-y-auto">
                  {companyDetails.employees.length === 0 ? (
                    <p className="text-gray-500 text-sm">No employees available</p>
                  ) : (
                    companyDetails.employees.map((employee) => (
                      <label key={employee.id} className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          checked={newDepartment.manager_ids.includes(employee.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewDepartment({
                                ...newDepartment,
                                manager_ids: [...newDepartment.manager_ids, employee.id]
                              })
                            } else {
                              setNewDepartment({
                                ...newDepartment,
                                manager_ids: newDepartment.manager_ids.filter(id => id !== employee.id)
                              })
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
                disabled={!newDepartment.name.trim() || !newDepartment.location_id || detailsLoading}
              >
                {detailsLoading ? 'Updating...' : 'Update Department'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditDepartment(false)
                  setEditingDepartment(null)
                  setNewDepartment({
                    name: '',
                    description: '',
                    location_id: '',
                    manager_ids: []
                  })
                  setFormErrors(prev => ({ ...prev, department: {} }))
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
