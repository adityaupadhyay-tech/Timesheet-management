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
import CheckCircle from '@mui/icons-material/CheckCircle'
import ArrowRight from '@mui/icons-material/ArrowForward'

export default function CompanySetup() {
  // Initial companies data with first company auto-selected
  const initialCompanies = [
    {
      id: '1',
      name: 'Acme Corporation',
      description: 'A software development company',
      headquarters: 'San Francisco, CA',
      logo: '',
      locations: [
        {
          id: 'loc1',
          name: 'SF Headquarters',
          address: '123 Market Street, San Francisco, CA',
          phone: '+1 555-123-4567',
          manager: 'John Director',
          departments: []
        }
      ],
      departments: [],
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

  // Form states
  const [newCompany, setNewCompany] = useState({ name: '', description: '', headquarters: '', logo: '' })
  const [newLocation, setNewLocation] = useState({ name: '', address: '', phone: '', manager: '' })
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '', locationId: '', manager: '' })
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', position: '', departmentId: '', locationId: '' })

  const addCompany = () => {
    if (newCompany.name && newCompany.headquarters) {
      const company = {
        ...newCompany,
        id: Date.now().toString(),
        locations: [],
        departments: [],
        employees: []
      }
      setCompanies([...companies, company])
      setNewCompany({ name: '', description: '', headquarters: '', logo: '' })
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
      
      setNewLocation({ name: '', address: '', phone: '', manager: '' })
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

  const deleteCompany = (companyId) => {
    setCompanies(companies.filter(comp => comp.id !== companyId))
    // If deleted company was selected, select another one
    if (selectedCompany === companyId) {
      const remainingCompanies = companies.filter(comp => comp.id !== companyId)
      if (remainingCompanies.length > 0) {
        setSelectedCompany(remainingCompanies[0].id)
      } else {
        setSelectedCompany('')
      }
    }
  }

  const editCompany = (company) => {
    setEditingCompany(company)
    setNewCompany({
      name: company.name,
      description: company.description || '',
      headquarters: company.headquarters,
      logo: company.logo || ''
    })
    setShowEditCompany(true)
  }

  const updateCompany = () => {
    if (editingCompany && newCompany.name && newCompany.headquarters) {
      setCompanies(companies.map(comp => 
        comp.id === editingCompany.id 
          ? { ...comp, ...newCompany }
          : comp
      ))
      setEditingCompany(null)
      setNewCompany({ name: '', description: '', headquarters: '', logo: '' })
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

  const deleteEmployee = (employeeId) => {
    setCompanies(companies.map(company => ({
      ...company,
      employees: company.employees.filter(emp => emp.id !== employeeId),
      departments: company.departments.map(department => ({
        ...department,
        employees: department.employees?.filter(empId => empId !== employeeId) || []
      }))
    })))
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

  const getAvailableLocations = () => {
    return getCompanyLocations()
  }

  const getAvailableDepartments = () => {
    return getCompanyDepartments()
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
            <TabsTrigger value="locations" className="flex items-center justify-center min-w-0 flex-1 mx-1" disabled={!selectedCompany}>
              <LocationOn className="w-4 h-4 mr-2" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center justify-center min-w-0 flex-1 mx-1" disabled={!selectedCompany}>
              <Business className="w-4 h-4 mr-2" />
              Departments
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
                        <div>
                          <Label className="text-sm font-medium">Headquarters</Label>
                          <div className="px-3 py-2 bg-gray-50 border rounded-md text-sm">
                            {selectedCompanyDetails.headquarters}
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
                       {companies.length} Total
                     </span>
                   </div>
                   {companies.length > 0 && (
                     <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-md">
                       <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                       <span className="text-sm text-gray-600">
                         {companies.filter(c => (c.locations?.length || 0) > 0).length} with Locations
                       </span>
                     </div>
                   )}
                 </div>
              </div>
            </CardHeader>
            <CardContent>
              {companies.length === 0 ? (
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
                              <p className="text-sm text-gray-500">📍 {company.headquarters}</p>
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
                            <div className="flex justify-center">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedCompany(company.id)
                                  setActiveTab('locations')
                                }}
                                className="flex items-center"
                              >
                                <LocationOn className="w-4 h-4 mr-2" />
                                Manage
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
                <Button onClick={() => setShowAddCompany(true)} className="flex items-center">
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
                              <p className="text-sm text-gray-500">📍 {company.headquarters}</p>
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
                                variant="outline" 
                                size="sm" 
                                onClick={() => editCompany(company)}
                                className="flex items-center"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => deleteCompany(company.id)}
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
            <Card className="border-blue-200 bg-blue-50">
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
                  <div>
                    <Label htmlFor="newCompanyHeadquarters">Headquarters</Label>
                    <Input
                      id="newCompanyHeadquarters"
                      value={newCompany.headquarters}
                      onChange={(e) => setNewCompany({ ...newCompany, headquarters: e.target.value })}
                      placeholder="Enter headquarters location"
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
                  <div>
                    <Label htmlFor="editCompanyHeadquarters">Headquarters</Label>
                    <Input
                      id="editCompanyHeadquarters"
                      value={newCompany.headquarters}
                      onChange={(e) => setNewCompany({ ...newCompany, headquarters: e.target.value })}
                      placeholder="Enter headquarters location"
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
                    setNewCompany({ name: '', description: '', headquarters: '', logo: '' })
                  }}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-6">
          {selectedCompany ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CardTitle className="flex items-center">
                        <LocationOn className="mr-2" />
                        Company Locations
                      </CardTitle>
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-md">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          {getCompanyLocations().length} Total
                        </span>
                      </div>
                    </div>
                    <Button onClick={() => setShowAddLocation(true)} className="flex items-center">
                      <Add className="w-4 h-4 mr-2" />
                      Add Location
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
                    <div className="space-y-4">
                      {getCompanyLocations().map((location) => (
                        <Card key={location.id} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{location.name}</h3>
                                <p className="text-gray-600 text-sm">{location.address}</p>
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
                </CardContent>
              </Card>

              {/* Add Location Modal */}
              {showAddLocation && (
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
                        placeholder="Full address"
                      />
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
            </>
          ) : (
            <Card>
              <CardContent className="p-8">
                <div className="text-center text-gray-500">
                  <LocationOn className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Select a company to manage locations</p>
                  <p className="text-sm">Go to the Companies tab to select or create a company</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-6">
          {selectedCompany ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CardTitle className="flex items-center">
                        <Business className="mr-2" />
                        Departments
                      </CardTitle>
                      <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-md">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          {getCompanyDepartments().length} Total
                        </span>
                      </div>
                    </div>
                    <Button onClick={() => setShowAddDepartment(true)} className="flex items-center">
                      <Add className="w-4 h-4 mr-2" />
                      Add Department
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
                    <div className="space-y-4">
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
                </CardContent>
              </Card>

              {/* Add Department Modal */}
              {showAddDepartment && (
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
            </>
          ) : (
            <Card>
              <CardContent className="p-8">
                <div className="text-center text-gray-500">
                  <Business className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Select a company to manage departments</p>
                  <p className="text-sm">Go to the Companies tab to select or create a company</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-6">
          {selectedCompany ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CardTitle className="flex items-center">
                        <People className="mr-2" />
                        Employees
                      </CardTitle>
                      <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-md">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          {getCompanyEmployees().length} Total
                        </span>
                      </div>
                    </div>
                    <Button onClick={() => setShowAddEmployee(true)} className="flex items-center">
                      <Add className="w-4 h-4 mr-2" />
                      Add Employee
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {getCompanyEmployees().length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <People className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No employees added yet for {getSelectedCompanyDetail().name}</p>
                      <p className="text-sm">Add departments first, then assign employees</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getCompanyEmployees().map((employee) => {
                        const department = getCompanyDepartments().find(dept => dept.id === employee.departmentId)
                        const location = getCompanyLocations().find(loc => loc.id === employee.locationId)
                        return (
                          <Card key={employee.id} className="border border-gray-200">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg">{employee.name}</h3>
                                  <p className="text-gray-600 text-sm">{employee.email}</p>
                                  <p className="text-gray-500 text-sm">Position: {employee.position}</p>
                                  <div className="mt-2 flex space-x-2">
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      {department?.name || 'No Department'}
                                    </span>
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                      {location?.name || 'No Location'}
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
                                    onClick={() => deleteEmployee(employee.id)}
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
                </CardContent>
              </Card>

              {/* Add Employee Modal */}
              {showAddEmployee && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Employee</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="employeeName">Employee Name</Label>
                        <Input
                          id="employeeName"
                          value={newEmployee.name}
                          onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="employeeEmail">Email</Label>
                        <Input
                          id="employeeEmail"
                          type="email"
                          value={newEmployee.email}
                          onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                          placeholder="jane.doe@company.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="employeePosition">Position</Label>
                        <Input
                          id="employeePosition"
                          value={newEmployee.position}
                          onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                          placeholder="Software Engineer"
                        />
                      </div>
                      <div>
                        <Label htmlFor="employeeLocation">Location</Label>
                        <select
                          className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          value={newEmployee.locationId}
                          onChange={(e) => setNewEmployee({ ...newEmployee, locationId: e.target.value })}
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
                      <Label htmlFor="employeeDepartment">Department</Label>
                      <select
                        className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={newEmployee.departmentId}
                        onChange={(e) => setNewEmployee({ ...newEmployee, departmentId: e.target.value })}
                      >
                        <option value="">Select a department</option>
                        {getAvailableDepartments().map(department => (
                          <option key={department.id} value={department.id}>
                            {department.name} ({getAvailableLocations().find(loc => loc.id === department.locationId)?.name || 'Unknown Location'})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={addEmployee} className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Add Employee
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddEmployee(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-8">
                <div className="text-center text-gray-500">
                  <People className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Select a company to manage employees</p>
                  <p className="text-sm">Go to the Companies tab to select or create a company</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}