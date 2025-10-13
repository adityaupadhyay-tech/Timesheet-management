'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import PageHeader from '@/components/PageHeader'
import VpnKey from '@mui/icons-material/VpnKey'
import Search from '@mui/icons-material/Search'
import DragIndicator from '@mui/icons-material/DragIndicator'
import Add from '@mui/icons-material/Add'
import Remove from '@mui/icons-material/Remove'
import CheckCircle from '@mui/icons-material/CheckCircle'
import { supabase } from '@/lib/supabase'

export default function PaycodeAccessPage() {
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin',
    email: 'john.doe@company.com'
  })

  // State
  const [companies, setCompanies] = useState([])
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [hideClientsWithoutPaycycles, setHideClientsWithoutPaycycles] = useState(false)
  const [autoRestrictNewCodes, setAutoRestrictNewCodes] = useState(false)
  const [selectedType, setSelectedType] = useState('earnings')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fields state - using a single list with enabled/disabled status
  const [fields, setFields] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [viewMode, setViewMode] = useState('all') // 'all', 'enabled', 'disabled'

  // Mock data for fields based on type
  const getFieldsByType = (type) => {
    const fields = {
      earnings: [
        { id: 'reg-hours', name: 'Regular Hours', code: 'REG', description: 'Standard working hours', category: 'Standard' },
        { id: 'ot-hours', name: 'Overtime Hours', code: 'OT', description: 'Hours beyond 40/week', category: 'Overtime' },
        { id: 'double-time', name: 'Double Time', code: 'DT', description: 'Premium overtime rate', category: 'Overtime' },
        { id: 'holiday-pay', name: 'Holiday Pay', code: 'HOL', description: 'Holiday compensation', category: 'Premium' },
        { id: 'vacation-pay', name: 'Vacation Pay', code: 'VAC', description: 'Paid vacation time', category: 'Time Off' },
        { id: 'sick-pay', name: 'Sick Pay', code: 'SICK', description: 'Paid sick leave', category: 'Time Off' },
        { id: 'bonus', name: 'Bonus', code: 'BONUS', description: 'Performance bonus', category: 'Additional' },
        { id: 'commission', name: 'Commission', code: 'COMM', description: 'Sales commission', category: 'Additional' },
        { id: 'per-diem', name: 'Per Diem', code: 'PERDIEM', description: 'Daily allowance', category: 'Allowances' },
        { id: 'meal-allowance', name: 'Meal Allowance', code: 'MEAL', description: 'Meal compensation', category: 'Allowances' },
      ],
      deductions: [
        { id: 'federal-tax', name: 'Federal Income Tax', code: 'FIT', description: 'Federal withholding', category: 'Tax' },
        { id: 'state-tax', name: 'State Income Tax', code: 'SIT', description: 'State withholding', category: 'Tax' },
        { id: 'social-security', name: 'Social Security', code: 'SS', description: 'FICA Social Security', category: 'Tax' },
        { id: 'medicare', name: 'Medicare', code: 'MED', description: 'FICA Medicare', category: 'Tax' },
        { id: 'health-insurance', name: 'Health Insurance', code: 'HEALTH', description: 'Health plan premium', category: 'Benefits' },
        { id: 'dental-insurance', name: 'Dental Insurance', code: 'DENTAL', description: 'Dental plan premium', category: 'Benefits' },
        { id: '401k', name: '401(k) Contribution', code: '401K', description: 'Retirement savings', category: 'Retirement' },
        { id: 'garnishment', name: 'Wage Garnishment', code: 'GARN', description: 'Court-ordered deduction', category: 'Legal' },
        { id: 'union-dues', name: 'Union Dues', code: 'UNION', description: 'Union membership fees', category: 'Other' },
        { id: 'parking', name: 'Parking', code: 'PARK', description: 'Parking fees', category: 'Other' },
      ],
      'termination-reasons': [
        { id: 'voluntary', name: 'Voluntary Resignation', code: 'VOL', description: 'Employee resignation', category: 'Voluntary' },
        { id: 'retirement', name: 'Retirement', code: 'RET', description: 'Employee retirement', category: 'Voluntary' },
        { id: 'layoff', name: 'Layoff', code: 'LAY', description: 'Business decision', category: 'Involuntary' },
        { id: 'termination-cause', name: 'Termination for Cause', code: 'TERM-C', description: 'Policy violation', category: 'Involuntary' },
        { id: 'termination-performance', name: 'Termination - Performance', code: 'TERM-P', description: 'Poor performance', category: 'Involuntary' },
        { id: 'contract-end', name: 'Contract End', code: 'CONT', description: 'Contract completion', category: 'Contract' },
        { id: 'mutual-agreement', name: 'Mutual Agreement', code: 'MUT', description: 'Both parties agree', category: 'Mutual' },
        { id: 'relocation', name: 'Relocation', code: 'RELOC', description: 'Location change', category: 'Other' },
        { id: 'job-abandonment', name: 'Job Abandonment', code: 'ABAND', description: 'No show/No call', category: 'Other' },
      ],
    }
    return fields[type] || []
  }

  // Load companies
  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase.rpc('get_companies_with_paycycle_details')

      if (error) throw error
      setCompanies(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading companies:', err)
      setError(err?.message || 'Failed to load companies')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter companies based on paycycle checkbox
  const getFilteredCompanies = () => {
    if (hideClientsWithoutPaycycles) {
      return companies.filter(company => company.paycycles && company.paycycles.length > 0)
    }
    return companies
  }

  // Load fields when company or type changes
  useEffect(() => {
    if (selectedCompany) {
      loadFieldsForCompany()
    }
  }, [selectedCompany, selectedType])

  const loadFieldsForCompany = () => {
    // Get all fields for the type and add enabled status
    const allFields = getFieldsByType(selectedType).map(field => ({
      ...field,
      enabled: false // In production, fetch this from DB
    }))
    
    setFields(allFields)
    setSearchTerm('')
    setFilterCategory('all')
  }

  // Get unique categories
  const getCategories = () => {
    const cats = new Set(fields.map(f => f.category))
    return ['all', ...Array.from(cats)]
  }

  // Filter and search fields
  const getFilteredFields = () => {
    let filtered = fields

    // Filter by view mode
    if (viewMode === 'enabled') {
      filtered = filtered.filter(f => f.enabled)
    } else if (viewMode === 'disabled') {
      filtered = filtered.filter(f => !f.enabled)
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(f => f.category === filterCategory)
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(field => 
        field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }

  // Toggle field enabled/disabled
  const toggleField = (fieldId) => {
    setFields(prevFields => 
      prevFields.map(field => 
        field.id === fieldId 
          ? { ...field, enabled: !field.enabled }
          : field
      )
    )
  }

  // Quick actions
  const enableAll = () => {
    setFields(prevFields => prevFields.map(field => ({ ...field, enabled: true })))
  }

  const disableAll = () => {
    setFields(prevFields => prevFields.map(field => ({ ...field, enabled: false })))
  }

  const enableFiltered = () => {
    const filteredIds = getFilteredFields().map(f => f.id)
    setFields(prevFields => 
      prevFields.map(field => 
        filteredIds.includes(field.id) 
          ? { ...field, enabled: true }
          : field
      )
    )
  }

  const disableFiltered = () => {
    const filteredIds = getFilteredFields().map(f => f.id)
    setFields(prevFields => 
      prevFields.map(field => 
        filteredIds.includes(field.id) 
          ? { ...field, enabled: false }
          : field
      )
    )
  }

  const handleSave = async () => {
    if (!selectedCompany) {
      alert('Please select a company')
      return
    }

    try {
      const enabledFields = fields.filter(f => f.enabled)
      
      // Here you would save to database
      console.log('Saving paycode access for:', {
        company: selectedCompany.company_name,
        type: selectedType,
        autoRestrictNewCodes: autoRestrictNewCodes,
        enabledFields: enabledFields.map(f => ({ id: f.id, code: f.code, name: f.name }))
      })
      
      alert(`Successfully saved ${enabledFields.length} ${selectedType} paycodes for ${selectedCompany.company_name}${autoRestrictNewCodes ? '\n\nAuto-restrict new codes: ENABLED' : ''}`)
    } catch (err) {
      console.error('Error saving:', err)
      alert('Failed to save paycode access settings')
    }
  }

  // Get stats
  const getStats = () => {
    const enabled = fields.filter(f => f.enabled).length
    const total = fields.length
    return { enabled, total, disabled: total - enabled }
  }

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
        <PageHeader 
          title="Paycode Access"
          subtitle="Manage paycode permissions and access controls for companies"
          icon={<VpnKey />}
          breadcrumbs={[
            { label: 'Payroll', href: '/payroll' },
            { label: 'Paycode Access' },
          ]}
        />

        {/* Controls Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Company Selector */}
              <div>
                <Label htmlFor="company-select">Company *</Label>
                <select
                  id="company-select"
                  value={selectedCompany?.company_id || ''}
                  onChange={(e) => {
                    const company = companies.find(c => c.company_id === e.target.value)
                    setSelectedCompany(company || null)
                  }}
                  className="w-full mt-1 p-2 border rounded-md"
                  disabled={isLoading}
                >
                  <option value="">Select Company</option>
                  {getFilteredCompanies().map(company => (
                    <option key={company.company_id} value={company.company_id}>
                      {company.company_name} {company.paycycles?.length > 0 ? `(${company.paycycles.length} paycycles)` : ''}
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
                  <option value="termination-reasons">Termination Reasons</option>
                </select>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-col justify-end space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={hideClientsWithoutPaycycles}
                    onChange={(e) => setHideClientsWithoutPaycycles(e.target.checked)}
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
                    onChange={(e) => setAutoRestrictNewCodes(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={!selectedCompany}
                  />
                  <span className={`text-sm ${selectedCompany ? 'text-gray-700 group-hover:text-gray-900' : 'text-gray-400'}`}>
                    Auto-restrict new codes
                  </span>
                </label>
              </div>
            </div>

            {/* Info about Auto-restrict */}
            {autoRestrictNewCodes && selectedCompany && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-900">Auto-restrict enabled</p>
                  <p className="text-xs text-blue-700 mt-1">
                    New paycodes added to the system will be automatically disabled for this company by default. You'll need to manually enable them.
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
                      <p className="text-2xl font-bold text-gray-900">{getStats().total}</p>
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
                      <p className="text-2xl font-bold text-green-600">{getStats().enabled}</p>
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
                      <p className="text-2xl font-bold text-gray-600">{getStats().disabled}</p>
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
                      Manage {selectedType.charAt(0).toUpperCase() + selectedType.slice(1).replace('-', ' ')}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedCompany.company_name} • {selectedCompany.paycycles?.length || 0} Active Paycycles
                    </p>
                  </div>
                  <Button onClick={handleSave} disabled={getStats().enabled === 0}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Save Changes
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

                  {/* Category Filter */}
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 text-sm border rounded-md"
                  >
                    {getCategories().map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>

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

                {/* Fields Grid */}
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {getFilteredFields().length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-400">
                      <Search className="w-12 h-12 mx-auto mb-3" />
                      <p>No fields found matching your criteria</p>
                    </div>
                  ) : (
                    getFilteredFields().map(field => (
                      <Card 
                        key={field.id}
                        className={`transition-all cursor-pointer border-2 ${
                          field.enabled 
                            ? 'border-green-500 bg-green-50 hover:bg-green-100' 
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                        onClick={() => toggleField(field.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  field.enabled 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-gray-200 text-gray-700'
                                }`}>
                                  {field.code}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  field.enabled 
                                    ? 'bg-green-200 text-green-800' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {field.category}
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
                                onCheckedChange={() => toggleField(field.id)}
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
                    Showing {getFilteredFields().length} of {fields.length} fields
                    {(searchTerm || filterCategory !== 'all' || viewMode !== 'all') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchTerm('')
                          setFilterCategory('all')
                          setViewMode('all')
                        }}
                        className="ml-3 text-blue-600"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
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
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Get Started with Paycode Access</h3>
                <p className="text-sm mb-6">
                  Configure which paycodes are available for each company
                </p>
                <div className="grid gap-4 md:grid-cols-2 text-left max-w-4xl mx-auto">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">Quick Start</h4>
                    <ol className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="font-semibold mr-2 text-blue-600">1.</span>
                        Select a company from the dropdown
                      </li>
                      <li className="flex items-start">
                        <span className="font-semibold mr-2 text-blue-600">2.</span>
                        Choose type (Earnings, Deductions, or Termination)
                      </li>
                      <li className="flex items-start">
                        <span className="font-semibold mr-2 text-blue-600">3.</span>
                        Toggle switches to enable/disable fields
                      </li>
                      <li className="flex items-start">
                        <span className="font-semibold mr-2 text-blue-600">4.</span>
                        Click "Save Changes" when done
                      </li>
                    </ol>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm text-gray-900 mb-2">Features</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                        Card-based interface for easy management
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                        Search and filter by category
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
      </div>
    </Layout>
  )
}

