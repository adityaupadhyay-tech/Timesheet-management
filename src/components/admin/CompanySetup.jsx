'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Building from '@mui/icons-material/Business'
import LocationOn from '@mui/icons-material/LocationOn'
import Business from '@mui/icons-material/Business'
import People from '@mui/icons-material/People'
import Add from '@mui/icons-material/Add'
import Edit from '@mui/icons-material/Edit'
import Delete from '@mui/icons-material/Delete'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import ChevronRight from '@mui/icons-material/ChevronRight'
import CheckCircle from '@mui/icons-material/CheckCircle'
import ArrowRight from '@mui/icons-material/ArrowForward'
import Search from '@mui/icons-material/Search'
import Clear from '@mui/icons-material/Clear'
import Close from '@mui/icons-material/Close'
import Settings from '@mui/icons-material/Settings'

export default function CompanySetup() {
  // Initial companies data with first company auto-selected
  const initialCompanies = [
    {
      id: '1',
      name: 'Acme Corporation',
      description: 'A software development company specializing in enterprise solutions and cloud architecture',
      logo: '',
      locations: [
        {
          id: 'loc1',
          name: 'SF Headquarters',
          address: '123 Market Street',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94105',
          phone: '+1 555-123-4567',
          manager: 'John Director',
          departments: []
        }
      ],
      departments: [],
      employees: []
    },
    {
      id: '2',
      name: 'TechFlow Systems',
      description: 'Leading provider of fintech solutions and payment processing systems',
      logo: '',
      locations: [
        {
          id: 'loc2',
          name: 'Manhattan Office',
          address: '456 Broadway',
          city: 'New York',
          state: 'NY',
          postalCode: '10012',
          phone: '+1 555-234-5678',
          manager: 'Sarah Thompson',
          departments: []
        }
      ],
      departments: [
        {
          id: 'dept1',
          name: 'Engineering',
          description: 'Software development and technical architecture',
          locationId: 'loc2',
          manager: 'Mike Johnson',
          employees: []
        }
      ],
      employees: [
        {
          id: 'emp1',
          name: 'Alice Williams',
          email: 'alice.williams@techflow.com',
          position: 'Software Engineer',
          departmentId: 'dept1',
          locationId: 'loc2'
        }
      ]
    },
    {
      id: '3',
      name: 'Global Logistics Inc',
      description: 'International shipping and freight forwarding services worldwide',
      logo: '',
      locations: [
        {
          id: 'loc3',
          name: 'Seattle Headquarters',
          address: '789 Harbor Way',
          city: 'Seattle',
          state: 'WA',
          postalCode: '98101',
          phone: '+1 555-345-6789',
          manager: 'Robert Chen',
          departments: []
        },
        {
          id: 'loc4',
          name: 'Port Authority Branch',
          address: '321 Port Boulevard',
          city: 'Tacoma',
          state: 'WA',
          postalCode: '98421',
          phone: '+1 555-456-7890',
          manager: 'Lisa Rodriguez',
          departments: []
        }
      ],
      departments: [
        {
          id: 'dept2',
          name: 'Operations',
          description: 'Warehouse and shipping management',
          locationId: 'loc3',
          manager: 'David Park',
          employees: []
        },
        {
          id: 'dept3',
          name: 'Customer Service',
          description: 'Client support and account management',
          locationId: 'loc4',
          manager: 'Maria Garcia',
          employees: []
        }
      ],
      employees: [
        {
          id: 'emp2',
          name: 'James Wilson',
          email: 'james.wilson@globallogistics.com',
          position: 'Operations Manager',
          departmentId: 'dept2',
          locationId: 'loc3'
        },
        {
          id: 'emp3',
          name: 'Emma Davis',
          email: 'emma.davis@globallogistics.com',
          position: 'Customer Service Representative',
          departmentId: 'dept3',
          locationId: 'loc4'
        }
      ]
    },
    {
      id: '4',
      name: 'HealthTech Partners',
      description: 'Medical technology innovations and healthcare management systems',
      logo: '',
      locations: [
        {
          id: 'loc5',
          name: 'Austin Research Center',
          address: '654 Innovation Drive',
          city: 'Austin',
          state: 'TX',
          postalCode: '78701',
          phone: '+1 555-567-8901',
          manager: 'Dr. Jennifer Lee',
          departments: []
        }
      ],
      departments: [
        {
          id: 'dept4',
          name: 'Research & Development',
          description: 'Medical device research and clinical trials',
          locationId: 'loc5',
          manager: 'Dr. Michael Brown',
          employees: []
        },
        {
          id: 'dept5',
          name: 'Quality Assurance',
          description: 'Regulatory compliance and testing protocols',
          locationId: 'loc5',
          manager: 'Karen Smith',
          employees: []
        }
      ],
      employees: [
        {
          id: 'emp4',
          name: 'Dr. Sarah Taylor',
          email: 'sarah.taylor@healthtech.com',
          position: 'Research Scientist',
          departmentId: 'dept4',
          locationId: 'loc5'
        },
        {
          id: 'emp5',
          name: 'Robert Martinez',
          email: 'robert.martinez@healthtech.com',
          position: 'QA Engineer',
          departmentId: 'dept5',
          locationId: 'loc5'
        },
        {
          id: 'emp6',
          name: 'Linda Clark',
          email: 'linda.clark@healthtech.com',
          position: 'Regulatory Affairs Specialist',
          departmentId: 'dept5',
          locationId: 'loc5'
        }
      ]
    },
    {
      id: '5',
      name: 'Retail Dynamics',
      description: 'E-commerce platform and retail analytics for small and medium businesses',
      logo: '',
      locations: [],
      departments: [
        {
          id: 'dept6',
          name: 'Sales',
          description: 'Business development and client acquisition',
          locationId: '',
          manager: 'Carlos Rodriguez',
          employees: []
        }
      ],
      employees: [
        {
          id: 'emp7',
          name: 'Patricia Johnson',
          email: 'patricia.johnson@retaildynamics.com',
          position: 'Sales Director',
          departmentId: 'dept6',
          locationId: ''
        }
      ]
    },
    {
      id: '6',
      name: 'EcoEnergy Solutions',
      description: 'Renewable energy infrastructure and sustainable development projects',
      logo: '',
      locations: [
        {
          id: 'loc6',
          name: 'Denver Headquarters',
          address: '888 Energy Plaza',
          city: 'Denver',
          state: 'CO',
          postalCode: '80202',
          phone: '+1 555-678-9012',
          manager: 'Jennifer Green',
          departments: []
        }
      ],
      departments: [
        {
          id: 'dept7',
          name: 'Engineering',
          description: 'Solar and wind energy system design',
          locationId: 'loc6',
          manager: 'Tom Wright',
          employees: []
        }
      ],
      employees: []
    }
  ]
  
  const [companies, setCompanies] = useState(initialCompanies)
  
  // Auto-select first company if available
  const [activeTab, setActiveTab] = useState('companies')
  const [selectedCompany, setSelectedCompany] = useState(initialCompanies.length > 0 ? initialCompanies[0].id : '')
  const [showAddCompany, setShowAddCompany] = useState(false)
  const [showAddLocation, setShowAddLocation] = useState(false)
  const [showAddDepartment, setShowAddDepartment] = useState(false)
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [showCompanyDetails, setShowCompanyDetails] = useState(false)
  const [showEditCompany, setShowEditCompany] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showLocationDepartmentManagement, setShowLocationDepartmentManagement] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState(null)
  const [companyNameConfirmation, setCompanyNameConfirmation] = useState('')
  const [showLocationSection, setShowLocationSection] = useState(false)
  const [showDepartmentSection, setShowDepartmentSection] = useState(false)
  const [activeEditCompany, setActiveEditCompany] = useState(null)
  const [currentEmployeePage, setCurrentEmployeePage] = useState(1)
  const EMPLOYEES_PER_PAGE = 25
  
  // Employee filter states
  const [companyFilter, setCompanyFilter] = useState('')
  const [jobRoleFilter, setJobRoleFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  
  // Employee deletion states
  const [showEmployeeDeleteConfirm, setShowEmployeeDeleteConfirm] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)

  // Auto-select first company when companies change
  useEffect(() => {
    if (companies.length > 0 && !selectedCompany) {
      setSelectedCompany(companies[0].id)
    }
    // If current selected company is removed, select the first available
    if (companies.length > 0 && selectedCompany && !companies.find(c => c.id === selectedCompany)) {
      setSelectedCompany(companies[0].id)
    }
  }, [companies, selectedCompany])

  // Reset location/department management view when changing tabs (but not when selectedCompany changes via edit button)

  // Handle escape key for closing delete confirmation modal
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape' && showDeleteConfirm) {
        cancelDeleteCompany()
      }
    }

    if (showDeleteConfirm) {
      document.addEventListener('keydown', handleKeyPress)
      return () => document.removeEventListener('keydown', handleKeyPress)
    }
  }, [showDeleteConfirm])

  // Form states
  const [newCompany, setNewCompany] = useState({ name: '', description: '', logo: '' })
  const [newLocation, setNewLocation] = useState({ name: '', address: '', city: '', state: '', postalCode: '', phone: '', manager: '' })
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '', locationId: '', manager: '' })
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', position: '', departmentId: '', locationId: '' })

  const addCompany = () => {
    if (newCompany.name) {
      const company = {
        ...newCompany,
        id: Date.now().toString(),
        locations: [],
        departments: [],
        employees: []
      }
      setCompanies([...companies, company])
      setNewCompany({ name: '', description: '', logo: '' })
      setShowAddCompany(false)
    }
  }

  const addLocation = () => {
    if (newLocation.name && newLocation.address && selectedCompany) {
      const location = { 
        ...newLocation, 
        id: Date.now().toString(), 
        departments: []
      }
      
      // Add location to selected company
      setCompanies(companies.map(comp => 
        comp.id === selectedCompany 
          ? { ...comp, locations: [...comp.locations, location] }
          : comp
      ))
      
      setNewLocation({ name: '', address: '', city: '', state: '', postalCode: '', phone: '', manager: '' })
      setShowAddLocation(false)
    }
  }

  const addDepartment = () => {
    if (newDepartment.name && newDepartment.locationId && selectedCompany) {
      const department = { 
        ...newDepartment, 
        id: Date.now().toString(), 
        employees: []
      }
      
      // Get the current company
      const updatedCompanies = companies.map(company => {
        if (company.id === selectedCompany) {
          // Update the location to include the department
          const updatedLocations = company.locations.map(location => {
            if (location.id === newDepartment.locationId) {
              return { ...location, departments: [...(location.departments || []), department.id] }
            }
            return location
          })
          
          return {
            ...company,
            locations: updatedLocations,
            departments: [...company.departments, department]
          }
        }
        return company
      })
      
      setCompanies(updatedCompanies)
      setNewDepartment({ name: '', description: '', locationId: '', manager: '' })
      setShowAddDepartment(false)
    }
  }

  const addEmployee = () => {
    if (newEmployee.name && newEmployee.email && newEmployee.departmentId && selectedCompany) {
      const employee = { 
        ...newEmployee, 
        id: Date.now().toString()
      }
      
      // Get the current company
      const updatedCompanies = companies.map(company => {
        if (company.id === selectedCompany) {
          // Update the department to include the employee
          const updatedDepartments = company.departments.map(department => {
            if (department.id === newEmployee.departmentId) {
              return { ...department, employees: [...(department.employees || []), employee.id] }
            }
            return department
          })
          
          return {
            ...company,
            departments: updatedDepartments,
            employees: [...company.employees, employee]
          }
        }
        return company
      })
      
      setCompanies(updatedCompanies)
      setNewEmployee({ name: '', email: '', position: '', departmentId: '', locationId: '' })
      setShowAddEmployee(false)
    }
  }

  const confirmDeleteCompany = (companyId) => {
    const company = companies.find(c => c.id === companyId)
    setCompanyToDelete({ id: companyId, name: company?.name })
    setCompanyNameConfirmation('')
    setShowDeleteConfirm(true)
  }

  const deleteCompany = () => {
    if (companyToDelete && companyNameConfirmation === companyToDelete.name) {
      setCompanies(companies.filter(comp => comp.id !== companyToDelete.id))
      // If deleted company was selected, select another one
      if (selectedCompany === companyToDelete.id) {
        const remainingCompanies = companies.filter(comp => comp.id !== companyToDelete.id)
        if (remainingCompanies.length > 0) {
          setSelectedCompany(remainingCompanies[0].id)
        } else {
          setSelectedCompany('')
        }
      }
      // Close the confirmation dialog
      setShowDeleteConfirm(false)
      setCompanyToDelete(null)
      setCompanyNameConfirmation('')
    }
  }

  const cancelDeleteCompany = () => {
    setShowDeleteConfirm(false)
    setCompanyToDelete(null)
    setCompanyNameConfirmation('')
  }

  const editCompany = (company) => {
    setEditingCompany(company)
    setNewCompany({
      name: company.name,
      description: company.description || '',
      logo: company.logo || ''
    })
    setShowEditCompany(true)
  }

  const updateCompany = () => {
    if (editingCompany && newCompany.name) {
      setCompanies(companies.map(comp => 
        comp.id === editingCompany.id 
          ? { ...comp, ...newCompany }
          : comp
      ))
      setEditingCompany(null)
      setNewCompany({ name: '', description: '', logo: '' })
      setShowEditCompany(false)
    }
  }

  const deleteLocation = (locationId) => {
    setCompanies(companies.map(company => ({
      ...company,
      locations: company.locations.filter(loc => loc.id !== locationId)
    })))
  }

  const deleteDepartment = (departmentId) => {
    setCompanies(companies.map(company => ({
      ...company,
      departments: company.departments.filter(dept => dept.id !== departmentId),
      locations: company.locations.map(location => ({
        ...location,
        departments: location.departments?.filter(deptId => deptId !== departmentId) || []
      }))
    })))
  }

  // Trigger employee deletion modal
  const triggerDeleteEmployee = (employeeId) => {
    setEmployeeToDelete(companies.find(comp => 
      comp.employees.find(emp => emp.id === employeeId)
    )?.employees.find(emp => emp.id === employeeId))
    setShowEmployeeDeleteConfirm(true)
  }

  // Actual employee deletion
  const deleteEmployee = () => {
    const employeeId = employeeToDelete.id
    setCompanies(companies.map(company => ({
      ...company,
      employees: company.employees.filter(emp => emp.id !== employeeId),
      departments: company.departments.map(department => ({
        ...department,
        employees: department.employees?.filter(empId => empId !== employeeId) || []
      }))
    })))
    setShowEmployeeDeleteConfirm(false)
    setEmployeeToDelete(null)
  }

  // Cancel employee deletion
  const cancelDeleteEmployee = () => {
    setShowEmployeeDeleteConfirm(false)
    setEmployeeToDelete(null)
  }

  // Get filtered data for selected company
  const getSelectedCompanyDetail = () => {
    const company = companies.find(comp => comp.id === selectedCompany)
    return company || {}
  }

  const getCompanyLocations = () => {
    if (!selectedCompany) return []
    return getSelectedCompanyDetail().locations || []
  }

  const getCompanyDepartments = () => {
    if (!selectedCompany) return []
    return getSelectedCompanyDetail().departments || []
  }

  const getCompanyEmployees = () => {
    if (!selectedCompany) return []
    return getSelectedCompanyDetail().employees || []
  }

  const getAllEmployees = () => {
    const allEmployees = []
    companies.forEach(company => {
      if (company.employees && company.employees.length > 0) {
        company.employees.forEach(employee => {
          const companyName = company.name
          const department = company.departments?.find(dept => dept.id === employee.departmentId)
          
          allEmployees.push({
            ...employee,
            companyId: company.id,
            companyName: companyName
          })
        })
      }
    })
    
    // Apply filters
    return allEmployees.filter(employee => {
      const company = companies.find(comp => comp.id === employee.companyId)
      const department = company?.departments?.find(dept => dept.id === employee.departmentId)
      
      // Company filter
      if (companyFilter && !employee.companyName.toLowerCase().includes(companyFilter.toLowerCase())) {
        return false
      }
      
      // Job role filter
      if (jobRoleFilter && !employee.position?.toLowerCase().includes(jobRoleFilter.toLowerCase())) {
        return false
      }
      
      // Department filter
      if (departmentFilter && !department?.name?.toLowerCase().includes(departmentFilter.toLowerCase())) {
        return false
      }
      
      return true
    })
  }

  // Pagination helpers
  const getPaginatedEmployees = () => {
    const allEmployees = getAllEmployees()
    const startIndex = (currentEmployeePage - 1) * EMPLOYEES_PER_PAGE
    const endIndex = startIndex + EMPLOYEES_PER_PAGE
    return allEmployees.slice(startIndex, endIndex)
  }

  const getTotalEmployeePages = () => {
    const totalEmployees = getAllEmployees().length
    return Math.ceil(totalEmployees / EMPLOYEES_PER_PAGE)
  }

  const getAvailableLocations = () => {
    return getCompanyLocations()
  }

  const getAvailableDepartments = () => {
    return getCompanyDepartments()
  }

  // Get filter options for employees
  const getEmployeeCompanyOptions = () => {
    const companiesWithEmployees = companies.filter(company => company.employees?.length > 0)
    return companiesWithEmployees.map(company => ({ 
      id: company.id, 
      name: company.name 
    }))
  }

  const getEmployeeDepartmentOptions = () => {
    const departments = new Set()
    companies.forEach(company => {
      company.departments?.forEach(dept => departments.add(dept.name))
    })
    return Array.from(departments).sort()
  }

  const getEmployeeJobRoleOptions = () => {
    const jobRoles = new Set()
    companies.forEach(company => {
      company.employees?.forEach(emp => {
        if (emp.position) jobRoles.add(emp.position)
      })
    })
    return Array.from(jobRoles).sort()
  }

  // Reset employee page when filters change
  useEffect(() => {
    setCurrentEmployeePage(1)
  }, [companyFilter, jobRoleFilter, departmentFilter])

  // Filter companies based on search term - search only by company name and location names
  const filteredCompanies = companies.filter(company => {
    const matchesCompanyName = company.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Check if any location name matches
    const matchesLocationName = company.locations?.some(location => 
      location.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    return matchesCompanyName || matchesLocationName
  })

  // Clear search function
  const clearSearch = () => {
    setSearchTerm('')
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
            <TabsTrigger value="employees" className="flex items-center justify-center min-w-0 flex-1 mx-1" disabled={!selectedCompany}>
              <People className="w-4 h-4 mr-2" />
              Employees
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Companies Tab */}
        <TabsContent value="companies" className="space-y-6">
          {/* Company Selection Header - Hidden for now */}
          {/* 
          {companies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Building className="mr-2" />
                    Select Company to Manage
                  </span>
                  <select
                    value={selectedCompany}
                    onChange={(e) => {
                      setSelectedCompany(e.target.value)
                      setShowCompanyDetails(!!e.target.value)
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                  >
                    <option value="">-- Select a company --</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </CardTitle>
              </CardHeader>
              {selectedCompany && (
                <CardContent>
                  {(() => {
                    const selectedCompanyDetails = getSelectedCompanyDetail()
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Company Name</Label>
                          <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm">
                            {selectedCompanyDetails.name}
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-sm font-medium">Description</Label>
                          <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm">
                            {selectedCompanyDetails.description}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              )}
            </Card>
          )}
          */}

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
                       {searchTerm ? `${filteredCompanies.length}/` : ''}{companies.length} Total
                     </span>
                   </div>
                   {companies.length > 0 && (
                     <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-md">
                       <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                       <span className="text-sm text-gray-600">
                         {(searchTerm ? filteredCompanies : companies).filter(c => (c.locations?.length || 0) > 0).length} with Locations
                       </span>
                     </div>
                   )}
                 </div>
              </div>
            </CardHeader>
            {companies.length > 0 && (
              <div className="px-6 pb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search companies by name or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <Button
                      onClick={clearSearch}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-auto w-auto"
                      variant="ghost"
                      size="sm"
                    >
                      <Clear className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </Button>
                  )}
                </div>
              </div>
            )}
            <CardContent>
              {filteredCompanies.length === 0 && companies.length > 0 && searchTerm.length > 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No companies found matching "{searchTerm}"</p>
                  <p className="text-sm">Try adjusting your search terms</p>
                  <Button variant="outline" onClick={clearSearch} className="mt-4">
                    <Clear className="w-4 h-4 mr-2" />
                    Clear search
                  </Button>
                </div>
              ) : filteredCompanies.length === 0 && companies.length > 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No companies match your current filters</p>
                </div>
              ) : companies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No companies added yet</p>
                  <p className="text-sm">Go to "Manage Companies" tab to add your first company</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50/50">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Company Name</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          City
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          State
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          Postal Code
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          Departments
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          Employees
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCompanies.map((company) => {
                        // Get first location's details (primary/hq)
                        const primaryLocation = company.locations?.[0]
                        return (
                          <tr 
                            key={company.id}
                            className={`border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                              selectedCompany === company.id ? 'bg-blue-50 ring-1 ring-blue-200' : ''
                            }`}
                            onClick={() => {
                              setSelectedCompany(company.id)
                              setShowCompanyDetails(true)
                            }}
                          >
                            <td className="py-4 px-4">
                              <div>
                                <h3 className="font-semibold text-gray-900">{company.name}</h3>
                              </div>
                            </td>
                          <td className="py-4 px-4 text-center">
                            <div className="text-sm text-gray-700">
                              {primaryLocation?.city || 'N/A'}
                              {company.locations?.length > 1 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  (+{company.locations.length - 1} more)
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="text-sm text-gray-700">
                              {primaryLocation?.state || 'N/A'}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="text-sm text-gray-700">
                              {primaryLocation?.postalCode || 'N/A'}
                            </div>
                          </td>
                            <td className="py-4 px-4 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 font-medium text-sm">
                                {company.departments?.length || 0}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-medium text-sm">
                                {company.employees?.length || 0}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Companies Tab */}
        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CardTitle className="flex items-center">
                    <Edit className="mr-2" />
                    Manage Companies
                  </CardTitle>
                   <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-md">
                       <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                       <span className="text-sm text-gray-600">
                         {companies.length} Total
                       </span>
                     </div>
                     {companies.length > 0 && (
                       <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-md">
                         <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                         <span className="text-sm text-gray-600">
                           {companies.filter(c => (c.departments?.length || 0) > 0).length} with Departments
                         </span>
                       </div>
                     )}
                   </div>
                </div>
                <Button onClick={() => {
                  setShowAddCompany(true)
                  // Auto scroll to Add Company modal
                  setTimeout(() => {
                    const addCompanyModal = document.querySelector('[data-add-company-modal]')
                    if (addCompanyModal) {
                      addCompanyModal.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }, 100)
                }} className="flex items-center">
                  <Add className="w-4 h-4 mr-2" />
                  Add Company
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {companies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Edit className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No companies to manage yet</p>
                  <p className="text-sm">Add a company first to enable management options</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50/50">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Company Name</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          <LocationOn className="w-4 h-4 mx-auto mb-1" />
                          <span className="text-xs">Locations</span>
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          <Business className="w-4 h-4 mx-auto mb-1" />
                          <span className="text-xs">Departments</span>
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">
                          <People className="w-4 h-4 mx-auto mb-1" />
                          <span className="text-xs">Employees</span>
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map((company) => (
                        <tr 
                          key={company.id}
                          className="border-b hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">{company.name}</h3>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-medium text-sm">
                              {company.locations?.length || 0}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 font-medium text-sm">
                              {company.departments?.length || 0}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-medium text-sm">
                              {company.employees?.length || 0}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button 
                                variant={activeEditCompany === company.id ? "default" : "outline"}
                                size="sm" 
                                onClick={() => {
                                  setSelectedCompany(company.id)
                                  setActiveTab('manage')
                                  
                                  // If already editing this company, close the sections
                                  if (activeEditCompany === company.id) {
                                    setShowLocationSection(false)
                                    setShowDepartmentSection(false)
                                    setShowLocationDepartmentManagement(false)
                                    setActiveEditCompany(null)
                                  } else {
                                    // Open the sections and scroll to location
                                    setShowLocationSection(true)
                                    setShowDepartmentSection(true)
                                    setShowLocationDepartmentManagement(true)
                                    setActiveEditCompany(company.id)
                                    // Auto scroll to location section
                                    setTimeout(() => {
                                      const locationSection = document.querySelector('[data-location-section]')
                                      if (locationSection) {
                                        locationSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                      }
                                    }, 100)
                                  }
                                }}
                                className={`flex items-center ${activeEditCompany === company.id ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : ''}`}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => editCompany(company)}
                                className="flex items-center"
                              >
                                <Settings className="w-4 h-4 mr-1" />
                                Settings
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => confirmDeleteCompany(company.id)}
                                className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Delete className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Company Modal */}
          {showAddCompany && (
            <Card className="border-blue-200 bg-blue-50" data-add-company-modal>
              <CardHeader>
                <CardTitle className="text-lg">Add New Company</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newCompanyName">Company Name</Label>
                    <Input
                      id="newCompanyName"
                      value={newCompany.name}
                      onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                      placeholder="Enter company name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="newCompanyDescription">Description</Label>
                  <textarea
                    id="newCompanyDescription"
                    className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={newCompany.description}
                    onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                    placeholder="Enter company description"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={addCompany} className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Add Company
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddCompany(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Edit Company Modal */}
          {showEditCompany && editingCompany && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Edit Company</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editCompanyName">Company Name</Label>
                    <Input
                      id="editCompanyName"
                      value={newCompany.name}
                      onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                      placeholder="Enter company name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="editCompanyDescription">Description</Label>
                  <textarea
                    id="editCompanyDescription"
                    className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={newCompany.description}
                    onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                    placeholder="Enter company description"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={updateCompany} className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Update Company
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowEditCompany(false)
                    setEditingCompany(null)
                    setNewCompany({ name: '', description: '', logo: '' })
                  }}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Location Section in Manage Tab */}
          {selectedCompany && showLocationSection && (
            <Card data-location-section>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CardTitle className="flex items-center">
                      <LocationOn className="mr-2" />
                      {getSelectedCompanyDetail()?.name} - Locations
                    </CardTitle>
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-md">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        {getCompanyLocations().length} Total
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setShowLocationSection(false)
                      setActiveEditCompany(null)
                    }}
                    className="flex items-center"
                  >
                    <Clear className="w-4 h-4 mr-1" />
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {getCompanyLocations().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <LocationOn className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No locations added yet for {getSelectedCompanyDetail().name}</p>
                    <p className="text-sm">Click "Add Location" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4 mb-4">
                    {getCompanyLocations().map((location) => (
                      <Card key={location.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{location.name}</h3>
                              <p className="text-gray-600 text-sm">{location.address}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {location.city && (
                                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                    {location.city}
                                  </span>
                                )}
                                {location.state && (
                                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                    {location.state}
                                  </span>
                                )}
                                {location.postalCode && (
                                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                    {location.postalCode}
                                  </span>
                                )}
                              </div>
                              {location.phone && (
                                <p className="text-gray-500 text-sm">Phone: {location.phone}</p>
                              )}
                              {location.manager && (
                                <p className="text-gray-500 text-sm">Manager: {location.manager}</p>
                              )}
                              <div className="mt-2">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {location.departments?.length || 0} departments
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => deleteLocation(location.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Delete className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button onClick={() => setShowAddLocation(true)} className="flex items-center">
                    <Add className="w-4 h-4 mr-2" />
                    Add Location
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Location Modal in Manage Tab */}
          {showAddLocation && selectedCompany && showLocationSection && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Add New Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="locationName">Location Name</Label>
                    <Input
                      id="locationName"
                      value={newLocation.name}
                      onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                      placeholder="e.g., New York Office"
                    />
                  </div>
                  <div>
                    <Label htmlFor="locationManager">Manager</Label>
                    <Input
                      id="locationManager"
                      value={newLocation.manager}
                      onChange={(e) => setNewLocation({ ...newLocation, manager: e.target.value })}
                      placeholder="Location manager name"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="locationAddress">Address</Label>
                  <Input
                    id="locationAddress"
                    value={newLocation.address}
                    onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                    placeholder="Street address, number"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="locationCity">City</Label>
                    <Input
                      id="locationCity"
                      value={newLocation.city}
                      onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                      placeholder="City name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="locationState">State</Label>
                    <Input
                      id="locationState"
                      value={newLocation.state}
                      onChange={(e) => setNewLocation({ ...newLocation, state: e.target.value })}
                      placeholder="State/Province"
                    />
                  </div>
                  <div>
                    <Label htmlFor="locationPostalCode">Postal Code</Label>
                    <Input
                      id="locationPostalCode"
                      value={newLocation.postalCode}
                      onChange={(e) => setNewLocation({ ...newLocation, postalCode: e.target.value })}
                      placeholder="ZIP/Postal Code"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="locationPhone">Phone (Optional)</Label>
                  <Input
                    id="locationPhone"
                    value={newLocation.phone}
                    onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={addLocation} className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Add Location
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddLocation(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Department Section in Manage Tab */}
          {selectedCompany && showDepartmentSection && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CardTitle className="flex items-center">
                      <Business className="mr-2" />
                      {getSelectedCompanyDetail()?.name} - Departments
                    </CardTitle>
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-md">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        {getCompanyDepartments().length} Total
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setShowDepartmentSection(false)
                      setActiveEditCompany(null)
                    }}
                    className="flex items-center"
                  >
                    <Clear className="w-4 h-4 mr-1" />
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {getCompanyDepartments().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Business className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No departments added yet for {getSelectedCompanyDetail().name}</p>
                    <p className="text-sm">Add locations first, then create departments</p>
                  </div>
                ) : (
                  <div className="space-y-4 mb-4">
                    {getCompanyDepartments().map((department) => {
                      const location = getCompanyLocations().find(loc => loc.id === department.locationId)
                      return (
                        <Card key={department.id} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{department.name}</h3>
                                <p className="text-gray-600 text-sm">{department.description}</p>
                                {department.manager && (
                                  <p className="text-gray-500 text-sm">Manager: {department.manager}</p>
                                )}
                                <div className="mt-2 flex space-x-2">
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {location?.name || 'Unknown Location'}
                                  </span>
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    {department.employees?.length || 0} employees
                                  </span>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => deleteDepartment(department.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Delete className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button onClick={() => setShowAddDepartment(true)} className="flex items-center">
                    <Add className="w-4 h-4 mr-2" />
                    Add Department
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Department Modal in Manage Tab */}
          {showAddDepartment && selectedCompany && showDepartmentSection && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Add New Department</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="departmentName">Department Name</Label>
                    <Input
                      id="departmentName"
                      value={newDepartment.name}
                      onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                      placeholder="e.g., Human Resources"
                    />
                  </div>
                  <div>
                    <Label htmlFor="departmentLocation">Location</Label>
                    <select
                      className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={newDepartment.locationId}
                      onChange={(e) => setNewDepartment({ ...newDepartment, locationId: e.target.value })}
                    >
                      <option value="">Select a location</option>
                      {getAvailableLocations().map(location => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="departmentDescription">Description</Label>
                  <textarea
                    id="departmentDescription"
                    className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={newDepartment.description}
                    onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                    placeholder="Department description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="departmentManager">Manager</Label>
                  <Input
                    id="departmentManager"
                    value={newDepartment.manager}
                    onChange={(e) => setNewDepartment({ ...newDepartment, manager: e.target.value })}
                    placeholder="Department manager name"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={addDepartment} className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Add Department
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddDepartment(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delete Company Confirmation Modal */}
          {showDeleteConfirm && companyToDelete && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={cancelDeleteCompany}
            >
              <Card 
                className="border-red-200 bg-white max-w-md w-full mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-red-800">
                    <Delete className="w-6 h-6 mr-2" />
                    Delete Company
                  </CardTitle>
                  <p className="text-sm text-red-700">
                    Are you sure you want to delete "<strong>{companyToDelete.name}</strong>"? This action cannot be undone.
                  </p>
                  <p className="text-xs text-red-600">
                    This will also delete all associated locations, departments, and employees.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="companyNameInput" className="text-sm font-medium text-red-800">
                        To confirm deletion, please type the company name: <span className="font-bold">{companyToDelete.name}</span>
                      </Label>
                      <Input
                        id="companyNameInput"
                        type="text"
                        value={companyNameConfirmation}
                        onChange={(e) => setCompanyNameConfirmation(e.target.value)}
                        placeholder={`Type "${companyToDelete.name}" here`}
                        className="border-red-200 focus:border-red-400 focus:ring-red-200"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <Button 
                        onClick={deleteCompany}
                        disabled={companyNameConfirmation !== companyToDelete.name}
                        className="flex items-center bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Delete className="w-4 h-4 mr-2" />
                        Yes, Delete Company
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={cancelDeleteCompany}
                        className="border-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>



        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CardTitle className="flex items-center">
                    <People className="mr-2" />
                    All Employees
                  </CardTitle>
                  <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-md">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      {getAllEmployees().length} Total
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {getAllEmployees().length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <People className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No employees found</p>
                  <p className="text-sm">Go to the Manage Companies tab to add employees to companies</p>
                </div>
              ) : (
                <>
                  {/* Filter Controls */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between relative leading-8">
                      <h3 className="text-sm font-medium text-gray-900">Filter Employees</h3>
                      <div className="h-8 w-32 flex items-center justify-end">
                        {(companyFilter || jobRoleFilter || departmentFilter) ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setCompanyFilter('')
                              setJobRoleFilter('')
                              setDepartmentFilter('')
                            }}
                            className="flex items-center text-xs w-24 transition opacity-1"
                          >
                            Clear Filters
                          </Button>
                        ) : (
                          <div className="opacity-0 flex items-center text-xs w-24 h-6 transition">
                            Clear Filters
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[136px]">
                      <div>
                        <Label htmlFor="companyFilterInput" className="text-sm font-medium text-gray-700 mb-2 block">
                          Filter by Company
                        </Label>
                        <select
                          id="companyFilterInput"
                          value={companyFilter}
                          onChange={(e) => setCompanyFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Companies</option>
                          {getEmployeeCompanyOptions().map(company => (
                            <option key={company.id} value={company.name}>
                              {company.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <Label htmlFor="jobRoleFilterInput" className="text-sm font-medium text-gray-700 mb-2 block">
                          Filter by Job Role
                        </Label>
                        <select
                          id="jobRoleFilterInput"
                          value={jobRoleFilter}
                          onChange={(e) => setJobRoleFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Job Roles</option>
                          {getEmployeeJobRoleOptions().map(role => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <Label htmlFor="departmentFilterInput" className="text-sm font-medium text-gray-700 mb-2 block">
                          Filter by Department
                        </Label>
                        <select
                          id="departmentFilterInput"
                          value={departmentFilter}
                          onChange={(e) => setDepartmentFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Departments</option>
                          {getEmployeeDepartmentOptions().map(dept => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Employee Table */}
                  <div className="overflow-x-auto block">
                    <table className="w-full table-fixed">
                      <thead>
                        <tr className="border-b bg-gray-50/50">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Job Role</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Company</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Location</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getPaginatedEmployees().map((employee) => {
                          const company = companies.find(comp => comp.id === employee.companyId)
                          let department = null
                          let location = null
                          
                          // Find department and location using the company context
                          if (company) {
                            department = company.departments?.find(dept => dept.id === employee.departmentId)
                            location = company.locations?.find(loc => loc.id === employee.locationId)
                          }
                          
                          return (
                            <tr key={`${employee.companyId}-${employee.id}`} className="border-b hover:bg-gray-50 min-h-[60px]">
                              <td className="py-3 px-4">
                                <div className="font-medium text-gray-900">{employee.name}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-gray-600 text-sm">{employee.email}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-gray-700 text-sm">{employee.position}</div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                  🏢 {employee.companyName || 'Unknown Company'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-gray-700 text-sm">{department?.name || 'No Department'}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-gray-700 text-sm">{location?.name || 'No Location'}</div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-center gap-2">
                                  <Button variant="outline" size="sm">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => triggerDeleteEmployee(employee.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Delete className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination Controls - Always render to prevent layout shift */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t min-h-[58px]">
                    {getAllEmployees().length > EMPLOYEES_PER_PAGE ? (
                      <>
                        <div className="text-sm text-gray-600">
                          Showing {((currentEmployeePage - 1) * EMPLOYEES_PER_PAGE) + 1}-{Math.min(currentEmployeePage * EMPLOYEES_PER_PAGE, getAllEmployees().length)} of {getAllEmployees().length} employees
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentEmployeePage(prev => Math.max(1, prev - 1))}
                            disabled={currentEmployeePage === 1}
                            className="flex items-center"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                          </Button>
                          <span className="flex items-center px-3 py-1 text-sm bg-gray-100 rounded-md">
                            Page {currentEmployeePage} of {getTotalEmployeePages()}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentEmployeePage(prev => Math.min(getTotalEmployeePages(), prev + 1))}
                            disabled={currentEmployeePage === getTotalEmployeePages()}
                            className="flex items-center"
                          >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-600">
                          Showing {getAllEmployees().length} employees
                        </div>
                        <div /> {/* Reserve space to maintain layout alignment */}
                      </>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Company Details Modal */}
      {showCompanyDetails && selectedCompany && getSelectedCompanyDetail() && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowCompanyDetails(false)}
        >
          <Card 
            className="max-w-4xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-xl">
                  <Building className="w-6 h-6 mr-2 text-blue-600" />
                  {getSelectedCompanyDetail().name} - Company Details
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCompanyDetails(false)}
                  className="flex items-center"
                >
                  <Close className="w-4 h-4 mr-1" />
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Company Name</Label>
                    <p className="font-semibold text-gray-900">{getSelectedCompanyDetail().name}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm text-gray-500">Description</Label>
                    <p className="text-gray-700 text-sm">{getSelectedCompanyDetail().description || 'No description provided'}</p>
                  </div>
                </div>
              </div>

              {/* Locations */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                  <LocationOn className="w-5 h-5 mr-2" />
                  Locations ({getSelectedCompanyDetail().locations?.length || 0})
                </h3>
                {getSelectedCompanyDetail().locations && getSelectedCompanyDetail().locations.length > 0 ? (
                  <div className="grid gap-3">
                    {getSelectedCompanyDetail().locations.map((location) => (
                      <Card key={location.id} className="bg-white">
                        <CardContent className="p-3">
                          <h4 className="font-semibold text-gray-900 mb-1">{location.name}</h4>
                          <p className="text-sm text-gray-600 mb-1">{location.address}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {location.city && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                📍 {location.city}
                              </span>
                            )}
                            {location.state && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                🏛️ {location.state}
                              </span>
                            )}
                            {location.postalCode && (
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                📮 {location.postalCode}
                              </span>
                            )}
                          </div>
                          {location.phone && (
                            <p className="text-xs text-gray-500">📞 {location.phone}</p>
                          )}
                          {location.manager && (
                            <p className="text-xs text-gray-500">👨‍💼 Manager: {location.manager}</p>
                          )}
                          <div className="mt-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {location.departments?.length || 0} departments
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No locations added for this company</p>
                )}
              </div>

              {/* Departments */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                  <Business className="w-5 h-5 mr-2" />
                  Departments ({getSelectedCompanyDetail().departments?.length || 0})
                </h3>
                {getSelectedCompanyDetail().departments && getSelectedCompanyDetail().departments.length > 0 ? (
                  <div className="grid gap-3">
                    {getSelectedCompanyDetail().departments.map((department) => {
                      const location = getSelectedCompanyDetail().locations?.find(loc => loc.id === department.locationId)
                      return (
                        <Card key={department.id} className="bg-white">
                          <CardContent className="p-3">
                            <h4 className="font-semibold text-gray-900 mb-1">{department.name}</h4>
                            <p className="text-sm text-gray-600 mb-1">{department.description}</p>
                            {location && (
                              <p className="text-xs text-gray-500 mb-1">📍 Location: {location.name}</p>
                            )}
                            {department.manager && (
                              <p className="text-xs text-gray-500">👨‍💼 Manager: {department.manager}</p>
                            )}
                            <div className="mt-2">
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                {department.employees?.length || 0} employees
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No departments added for this company</p>
                )}
              </div>

              {/* Employees */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                  <People className="w-5 h-5 mr-2" />
                  Employees ({getSelectedCompanyDetail().employees?.length || 0})
                </h3>
                {getSelectedCompanyDetail().employees && getSelectedCompanyDetail().employees.length > 0 ? (
                  <div className="grid gap-3">
                    {getSelectedCompanyDetail().employees.map((employee) => {
                      const department = getSelectedCompanyDetail().departments?.find(dept => dept.id === employee.departmentId)
                      const location = getSelectedCompanyDetail().locations?.find(loc => loc.id === employee.locationId)
                      return (
                        <Card key={employee.id} className="bg-white">
                          <CardContent className="p-3">
                            <h4 className="font-semibold text-gray-900 mb-1">{employee.name}</h4>
                            <p className="text-sm text-gray-600 mb-1">{employee.email}</p>
                            <p className="text-xs text-gray-500 mb-1">💼 Job Role: {employee.position}</p>
                            {department && (
                              <p className="text-xs text-gray-500 mb-1">🏢 Department: {department.name}</p>
                            )}
                            {location && (
                              <p className="text-xs text-gray-500">📍 Location: {location.name}</p>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No employees added for this company</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Employee Delete Confirmation Modal */}
      {showEmployeeDeleteConfirm && employeeToDelete && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={cancelDeleteEmployee}
        >
          <Card 
            className="max-w-md w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-red-600">
                <Delete className="w-6 h-6 mr-2" />
                Delete Employee
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete <strong>{employeeToDelete.name}</strong>?
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  This action cannot be undone. The employee will be permanently removed from the system.
                </p>
              </div>
              <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-md">
                <People className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Employee Details</p>
                  <p className="font-medium text-900">{employeeToDelete.name}</p>
                  <p className="text-sm text-gray-500">{employeeToDelete.email}</p>
                  <p className="text-xs text-gray-500">{employeeToDelete.position}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={deleteEmployee}
                  className="flex items-center bg-red-600 hover:bg-red-700 text-white"
                >
                  <Delete className="w-4 h-4 mr-2" />
                  Yes, Delete Employee
                </Button>
                <Button 
                  variant="outline" 
                  onClick={cancelDeleteEmployee}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}