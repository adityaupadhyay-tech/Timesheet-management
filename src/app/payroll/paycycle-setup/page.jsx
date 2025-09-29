'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCompanies } from '@/contexts/CompaniesContext'
import Settings from '@mui/icons-material/Settings'
import Business from '@mui/icons-material/Business'
import CalendarToday from '@mui/icons-material/CalendarToday'
import Add from '@mui/icons-material/Add'
import Edit from '@mui/icons-material/Edit'
import Delete from '@mui/icons-material/Delete'
import ArrowBack from '@mui/icons-material/ArrowBack'
import CheckCircle from '@mui/icons-material/CheckCircle'
import Warning from '@mui/icons-material/Warning'
import Info from '@mui/icons-material/Info'
import People from '@mui/icons-material/People'
import Assessment from '@mui/icons-material/Assessment'

export default function PaycycleSetupPage() {
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin',
    email: 'john.doe@company.com'
  })

  const [activeSection, setActiveSection] = useState('overview')
  const [showNavigation, setShowNavigation] = useState(false)

  // Use shared companies context
  const { companies, updateCompany } = useCompanies()

  const [selectedCompany, setSelectedCompany] = useState(null)
  const [selectedPaycycle, setSelectedPaycycle] = useState(null)
  const [isEditingPaycycle, setIsEditingPaycycle] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [searchTerm, setSearchTerm] = useState('')
  const [paycycleConfig, setPaycycleConfig] = useState({
    name: '',
    frequency: 'monthly',
    payDay: 'last',
    endDate: '',
    secondEndDate: '',
    processingDays: 3,
    type: 'regular'
  })

  const paycycleSections = [
    {
      id: 'company-paycycle',
      title: 'Company Paycycle',
      description: 'View, manage, and configure paycycle settings for all companies',
      icon: <Business />
    },
    {
      id: 'reports',
      title: 'Paycycle Reports',
      description: 'Generate paycycle reports and analytics',
      icon: <Assessment />
    }
  ]

  const handlePaycycleChange = (field, value) => {
    setPaycycleConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const savePaycycleConfig = () => {
    if (!selectedCompany) return

    const paycycleId = selectedPaycycle?.id || `pc${Date.now()}`
    const newPaycycle = {
      id: paycycleId,
      name: paycycleConfig.name || getFrequencyLabel(paycycleConfig.frequency),
      ...paycycleConfig
    }

    const currentCompany = companies.find(c => c.id === selectedCompany.id)
    if (!currentCompany) return

    let updatedPaycycles
    if (selectedPaycycle) {
      // Update existing paycycle
      updatedPaycycles = currentCompany.paycycles.map(pc =>
        pc.id === selectedPaycycle.id ? newPaycycle : pc
      )
    } else {
      // Add new paycycle
      updatedPaycycles = [...currentCompany.paycycles, newPaycycle]
    }

    updateCompany(selectedCompany.id, { paycycles: updatedPaycycles })
    setSelectedPaycycle(null)
    setIsEditingPaycycle(false)
    setPaycycleConfig({
      name: '',
      frequency: 'monthly',
      payDay: 'last',
      endDate: '',
      secondEndDate: '',
      processingDays: 3,
      type: 'regular'
    })
    alert('Paycycle configuration saved successfully!')
  }

  const deletePaycycle = (paycycleId) => {
    if (!selectedCompany) return
    
    const currentCompany = companies.find(c => c.id === selectedCompany.id)
    if (!currentCompany) return

    const updatedPaycycles = currentCompany.paycycles.filter(pc => pc.id !== paycycleId)
    updateCompany(selectedCompany.id, { paycycles: updatedPaycycles })
    setSelectedPaycycle(null)
    setIsEditingPaycycle(false)
    alert('Paycycle deleted successfully!')
  }

  const getPaycycleStatus = (paycycle) => {
    const today = new Date()
    const nextProcessing = new Date(paycycle.nextProcessing)
    const daysUntilNext = Math.ceil((nextProcessing - today) / (1000 * 60 * 60 * 24))
    
    if (daysUntilNext <= 3) return { status: 'processing-soon', color: 'text-orange-600', icon: Warning }
    if (daysUntilNext <= 7) return { status: 'upcoming', color: 'text-yellow-600', icon: Info }
    return { status: 'scheduled', color: 'text-green-600', icon: CheckCircle }
  }

  const getCompanyPaycycleStatus = (company) => {
    if (!company.paycycles || company.paycycles.length === 0) {
      return { status: 'not-configured', color: 'text-red-600', icon: Warning }
    }
    
    // Check if any paycycle is processing soon
    const hasProcessingSoon = company.paycycles.some(pc => {
      const status = getPaycycleStatus(pc)
      return status.status === 'processing-soon'
    })
    
    if (hasProcessingSoon) return { status: 'processing-soon', color: 'text-orange-600', icon: Warning }
    
    return { status: 'configured', color: 'text-green-600', icon: CheckCircle }
  }

  const getFrequencyLabel = (frequency) => {
    const labels = {
      'weekly': 'Weekly',
      'bi-weekly': 'Bi-weekly',
      'semi-monthly': 'Semi-monthly',
      'monthly': 'Monthly'
    }
    return labels[frequency] || frequency
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()
    return `${month}-${day}-${year}`
  }

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination logic
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCompanies = filteredCompanies.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

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
                setActiveSection(section.id)
                setShowNavigation(true)
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
                  {section.id === 'company-paycycle' && 'View all companies, their current paycycle configurations, and configure new settings with status indicators.'}
                  {section.id === 'reports' && 'Generate comprehensive paycycle reports and analytics for better insights.'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    // Show navigation when a card is selected
    switch (activeSection) {
      case 'company-paycycle':
        return (
          <>
            {/* Back Button */}
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setActiveSection('overview')
                  setShowNavigation(false)
                }}
                className="flex items-center mb-4"
              >
                ← Back to Paycycle Setup
              </Button>
            </div>
            
            {/* Companies Table */}
                   <Card>
                     <CardHeader>
                       <CardTitle className="flex items-center">
                         <Business className="w-5 h-5 mr-2" />
                         Companies ({companies.length})
                       </CardTitle>
                       <CardDescription>Select a company to view and manage its paycycles</CardDescription>
                     </CardHeader>
                     <CardContent>
                       {/* Search Input */}
                       <div className="mb-6">
                         <div className="relative">
                           <Input
                             type="text"
                             placeholder="Search companies by name..."
                             value={searchTerm}
                             onChange={(e) => {
                               setSearchTerm(e.target.value)
                               setCurrentPage(1) // Reset to first page when searching
                             }}
                             className="pl-10"
                           />
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                             </svg>
                           </div>
                         </div>
                       </div>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 w-1/3">Company</th>
                        <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 w-1/6">Status</th>
                        <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 w-1/4">Paycycles</th>
                        <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 w-1/6">Next Processing</th>
                        <th className="text-left py-4 px-6 font-semibold text-sm text-gray-700 w-1/8">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentCompanies.map((company) => {
                        const companyStatus = getCompanyPaycycleStatus(company)
                        const StatusIcon = companyStatus.icon
                        const nextProcessing = company.paycycles?.length > 0 
                          ? company.paycycles.reduce((earliest, pc) => {
                              return new Date(pc.nextProcessing) < new Date(earliest.nextProcessing) ? pc : earliest
                            }, company.paycycles[0])?.nextProcessing || 'N/A'
                          : 'N/A'
                        
                        return (
                          <tr 
                            key={company.id}
                            className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                              selectedCompany?.id === company.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                            }`}
                            onClick={() => setSelectedCompany(company)}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-3">
                                <Business className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                <span className="font-medium text-gray-900 truncate">{company.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-2">
                                <StatusIcon className={`w-4 h-4 flex-shrink-0 ${companyStatus.color}`} />
                                <span className={`text-sm font-medium capitalize ${companyStatus.color}`}>
                                  {companyStatus.status === 'not-configured' && 'Not configured'}
                                  {companyStatus.status === 'processing-soon' && 'Processing soon'}
                                  {companyStatus.status === 'configured' && 'Configured'}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex flex-wrap gap-1.5">
                                {company.paycycles?.slice(0, 3).map((paycycle) => (
                                  <span key={paycycle.id} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {paycycle.name}
                                  </span>
                                ))}
                                {company.paycycles?.length > 3 && (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    +{company.paycycles.length - 3}
                                  </span>
                                )}
                                {(!company.paycycles || company.paycycles.length === 0) && (
                                  <span className="text-sm text-gray-400">None</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-sm text-gray-600">{formatDate(nextProcessing)}</span>
                            </td>
                            <td className="py-4 px-6">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedCompany(company)
                                }}
                              >
                                View Details
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                     <div className="text-sm text-gray-600">
                       Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, filteredCompanies.length)}</span> of <span className="font-medium">{filteredCompanies.length}</span> companies
                       {searchTerm && (
                         <span className="ml-2 text-blue-600">
                           (filtered from {companies.length} total)
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
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
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
              <div className="space-y-6">
                {/* Company Paycycles List */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <CalendarToday className="w-5 h-5 mr-2" />
                          {selectedCompany.name} - Paycycles
                        </CardTitle>
                        <CardDescription>
                          {selectedCompany.paycycles?.length > 0 ? `${selectedCompany.paycycles.length} paycycle${selectedCompany.paycycles.length > 1 ? 's' : ''} configured` : 'No paycycles configured for this company'}
                        </CardDescription>
                      </div>
                      <Button 
                        onClick={() => {
                          setSelectedPaycycle(null)
                          setIsEditingPaycycle(true)
                          setPaycycleConfig({
                            frequency: 'monthly',
                            payDay: 'last',
                            startDate: '',
                            endDate: '',
                            cutoffDate: '',
                            processingDays: 3,
                            employeeCount: 0
                          })
                        }}
                        className="flex items-center"
                      >
                        <Add className="w-4 h-4 mr-2" />
                        Add Paycycle
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedCompany.paycycles && selectedCompany.paycycles.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                          {selectedCompany.paycycles.map((paycycle) => {
                            const paycycleStatus = getPaycycleStatus(paycycle)
                            const StatusIcon = paycycleStatus.icon
                            
                            return (
                              <div 
                                key={paycycle.id}
                                className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                  selectedPaycycle?.id === paycycle.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                                }`}
                                onClick={() => {
                                  setSelectedPaycycle(paycycle)
                                  setIsEditingPaycycle(true)
                                  setPaycycleConfig({
                                    name: paycycle.name || '',
                                    frequency: paycycle.frequency || 'monthly',
                                    payDay: paycycle.payDay || 'last',
                                    endDate: paycycle.endDate || '',
                                    secondEndDate: paycycle.secondEndDate || '',
                                    processingDays: paycycle.processingDays || 3,
                                    type: paycycle.type || 'regular'
                                  })
                                }}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center">
                                    <StatusIcon className={`w-4 h-4 mr-2 ${paycycleStatus.color}`} />
                                    <h4 className="font-medium text-sm">{paycycle.name}</h4>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-6 px-2"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedPaycycle(paycycle)
                                        setIsEditingPaycycle(true)
                                        setPaycycleConfig({
                                          name: paycycle.name || '',
                                          frequency: paycycle.frequency || 'monthly',
                                          payDay: paycycle.payDay || 'last',
                                          endDate: paycycle.endDate || '',
                                          secondEndDate: paycycle.secondEndDate || '',
                                          processingDays: paycycle.processingDays || 3,
                                          type: paycycle.type || 'regular'
                                        })
                                      }}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-6 px-2 text-red-600 hover:text-red-700"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (confirm('Are you sure you want to delete this paycycle?')) {
                                          deletePaycycle(paycycle.id)
                                        }
                                      }}
                                    >
                                      <Delete className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                                       <div className="space-y-1">
                                         <div className="flex justify-between text-xs">
                                           <span className="text-gray-500">Next:</span>
                                           <span className="text-gray-600">{formatDate(paycycle.nextProcessing)}</span>
                                         </div>
                                         <div className="flex justify-between text-xs">
                                           <span className="text-gray-500">Status:</span>
                                           <span className={`${paycycleStatus.color} font-medium`}>
                                             {paycycleStatus.status === 'processing-soon' && 'Soon'}
                                             {paycycleStatus.status === 'upcoming' && 'Upcoming'}
                                             {paycycleStatus.status === 'scheduled' && 'Scheduled'}
                                           </span>
                                         </div>
                                       </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No paycycles configured for this company</p>
                        <Button 
                          onClick={() => {
                            setSelectedPaycycle(null)
                            setIsEditingPaycycle(true)
                            setPaycycleConfig({
                              name: '',
                              frequency: 'monthly',
                              payDay: 'last',
                              endDate: '',
                              secondEndDate: '',
                              processingDays: 3,
                              type: 'regular'
                            })
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Settings className="w-5 h-5 mr-2" />
                        {selectedPaycycle ? `Edit ${selectedPaycycle.name}` : `Add New Paycycle for ${selectedCompany.name}`}
                      </CardTitle>
                      <CardDescription>
                        {selectedPaycycle ? 'Modify payroll cycle settings and processing schedule' : 'Set up new payroll cycle settings and processing schedule'}
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
                                     value={paycycleConfig.name || ''}
                                     onChange={(e) => handlePaycycleChange('name', e.target.value)}
                                     placeholder="Enter a name for this paycycle (e.g., 'Regular Payroll', 'Overtime Cycle')"
                                   />
                                 </div>

                                 <div>
                                   <Label htmlFor="frequency">Pay Frequency</Label>
                                   <select
                                     id="frequency"
                                     value={paycycleConfig.frequency}
                                     onChange={(e) => handlePaycycleChange('frequency', e.target.value)}
                                     className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                   >
                                     <option value="weekly">Weekly</option>
                                     <option value="bi-weekly">Bi-weekly</option>
                                     <option value="semi-monthly">Semi-monthly</option>
                                     <option value="monthly">Monthly</option>
                                   </select>
                                 </div>

                                 <div>
                                   <Label htmlFor="type">Cycle Type</Label>
                                   <select
                                     id="type"
                                     value={paycycleConfig.type}
                                     onChange={(e) => handlePaycycleChange('type', e.target.value)}
                                     className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                   >
                                     <option value="labor">Labor</option>
                                     <option value="regular">Regular</option>
                                     <option value="job-cost">Job Cost</option>
                                     <option value="certified">Certified</option>
                                   </select>
                                 </div>

                          <div>
                            <Label htmlFor="payDay">Pay Day</Label>
                            <select
                              id="payDay"
                              value={paycycleConfig.payDay}
                              onChange={(e) => handlePaycycleChange('payDay', e.target.value)}
                              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="last">Last day of period</option>
                              <option value="first">First day of next period</option>
                              <option value="specific">Specific day</option>
                            </select>
                          </div>

                          <div>
                            <Label htmlFor="processingDays">Processing Days</Label>
                            <Input
                              id="processingDays"
                              type="number"
                              value={paycycleConfig.processingDays || 3}
                              onChange={(e) => handlePaycycleChange('processingDays', parseInt(e.target.value))}
                              placeholder="Number of days before pay day"
                              min="1"
                              max="10"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                                 <div>
                                   <Label htmlFor="endDate">Period End Date</Label>
                                   <Input
                                     id="endDate"
                                     type="date"
                                     value={paycycleConfig.endDate || ''}
                                     onChange={(e) => handlePaycycleChange('endDate', e.target.value)}
                                   />
                                 </div>

                                 {paycycleConfig.frequency === 'semi-monthly' && (
                                   <div>
                                     <Label htmlFor="secondEndDate">Second Period End Date</Label>
                                       <Input
                                         id="secondEndDate"
                                         type="date"
                                         value={paycycleConfig.secondEndDate || ''}
                                         onChange={(e) => handlePaycycleChange('secondEndDate', e.target.value)}
                                         placeholder="End date for second period (15th of month)"
                                       />
                                   </div>
                                 )}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingPaycycle(false)
                            setSelectedPaycycle(null)
                            setPaycycleConfig({
                              name: '',
                              frequency: 'monthly',
                              payDay: 'last',
                              endDate: '',
                              secondEndDate: '',
                              processingDays: 3,
                              type: 'regular'
                            })
                          }}
                        >
                          Cancel
                        </Button>
                               <Button variant="outline" onClick={() => setPaycycleConfig({
                                 frequency: 'monthly',
                                 payDay: 'last',
                                 endDate: '',
                                 processingDays: 3
                               })}>
                                 Reset
                               </Button>
                        <Button onClick={savePaycycleConfig}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {selectedPaycycle ? 'Update Paycycle' : 'Save Paycycle'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        )
      case 'reports':
        return (
          <>
            {/* Back Button */}
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setActiveSection('overview')
                  setShowNavigation(false)
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
                <CardDescription>Generate comprehensive paycycle reports and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Paycycle Summary</CardTitle>
                      <CardDescription>Overview of all company paycycles</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Generate a comprehensive summary of all company paycycle configurations and status.
                      </p>
                      <Button className="w-full">Generate Summary</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Processing Schedule</CardTitle>
                      <CardDescription>Upcoming processing dates</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        View and export upcoming payroll processing schedules for all companies.
                      </p>
                      <Button className="w-full">View Schedule</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Compliance Report</CardTitle>
                      <CardDescription>Paycycle compliance status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Check compliance status and generate reports for audit purposes.
                      </p>
                      <Button className="w-full">Generate Report</Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </>
        )
      default:
        return null
    }
  }

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Paycycle Setup</h1>
          <p className="text-gray-600">Configure and manage payroll cycles for your companies</p>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </Layout>
  )
}
