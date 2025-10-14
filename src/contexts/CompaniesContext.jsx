'use client'

import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const CompaniesContext = createContext()

export function CompaniesProvider({ children }) {
  // Initial companies data from Administration section
  const [companies, setCompanies] = useState([
    {
      id: '1',
      name: 'Acme Corporation',
      description: 'A software development company specializing in enterprise solutions and cloud architecture',
      logo: '',
      status: 'active',
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
      employees: [],
      paycycles: [
        {
          id: 'pc1',
          name: 'Monthly Salaried',
          frequency: 'monthly',
          endDate: '2024-01-31',
          lastProcessed: '2024-01-31',
          nextProcessing: '2024-02-29',
          type: 'regular'
        },
        {
          id: 'pc2',
          name: 'Weekly Hourly',
          frequency: 'weekly',
          endDate: '2024-01-28',
          lastProcessed: '2024-01-28',
          nextProcessing: '2024-02-04',
          type: 'labor'
        }
      ]
    },
    {
      id: '2',
      name: 'TechFlow Systems',
      description: 'Leading provider of fintech solutions and payment processing systems',
      logo: '',
      status: 'active',
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
      ],
      paycycles: [
        {
          id: 'pc3',
          name: 'Bi-weekly Engineering',
          frequency: 'bi-weekly',
          endDate: '2024-01-28',
          lastProcessed: '2024-01-28',
          nextProcessing: '2024-02-11',
          type: 'regular'
        }
      ]
    },
    {
      id: '3',
      name: 'Global Logistics Inc',
      description: 'International shipping and freight forwarding services worldwide',
      logo: '',
      status: 'active',
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
      ],
      paycycles: [] // Will be populated by paycycle setup
    },
    {
      id: '4',
      name: 'HealthTech Partners',
      description: 'Medical technology innovations and healthcare management systems',
      logo: '',
      status: 'inactive',
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
      ],
      paycycles: [] // Will be populated by paycycle setup
    },
    {
      id: '5',
      name: 'Enterprise Corp',
      description: 'Large enterprise with multiple business units and complex organizational structure',
      logo: '',
      status: 'active',
      locations: [
        {
          id: 'loc6',
          name: 'Corporate Headquarters',
          address: '1000 Business Plaza',
          city: 'Chicago',
          state: 'IL',
          postalCode: '60601',
          phone: '+1 555-678-9012',
          manager: 'CEO Office',
          departments: []
        }
      ],
      departments: [],
      employees: [],
      paycycles: [
        {
          id: 'pc4',
          name: 'Weekly Operations',
          frequency: 'weekly',
          endDate: '2024-01-28',
          lastProcessed: '2024-01-28',
          nextProcessing: '2024-02-04',
          type: 'labor'
        },
        {
          id: 'pc5',
          name: 'Bi-weekly Management',
          frequency: 'bi-weekly',
          endDate: '2024-01-28',
          lastProcessed: '2024-01-28',
          nextProcessing: '2024-02-11',
          type: 'regular'
        },
        {
          id: 'pc6',
          name: 'Semi-monthly Projects',
          frequency: 'semi-monthly',
          endDate: '2024-01-15',
          secondEndDate: '2024-01-31',
          lastProcessed: '2024-01-15',
          nextProcessing: '2024-02-01',
          type: 'job-cost'
        },
        {
          id: 'pc7',
          name: 'Monthly Executive',
          frequency: 'monthly',
          endDate: '2024-01-31',
          lastProcessed: '2024-01-31',
          nextProcessing: '2024-02-29',
          type: 'certified'
        }
      ]
    }
  ])

  const updateCompany = useCallback((companyId, updates) => {
    setCompanies(prev => prev.map(company => 
      company.id === companyId ? { ...company, ...updates } : company
    ))
  }, [])

  const addCompany = useCallback((company) => {
    setCompanies(prev => [...prev, company])
  }, [])

  const deleteCompany = useCallback((companyId) => {
    setCompanies(prev => prev.filter(company => company.id !== companyId))
  }, [])

  const getCompanyById = useCallback((companyId) => {
    return companies.find(company => company.id === companyId)
  }, [companies])

  const getActiveCompanies = useCallback(() => {
    return companies.filter(company => company.status === 'active')
  }, [companies])

  const value = useMemo(() => ({
    companies,
    setCompanies,
    updateCompany,
    addCompany,
    deleteCompany,
    getCompanyById,
    getActiveCompanies
  }), [companies, updateCompany, addCompany, deleteCompany, getCompanyById, getActiveCompanies])

  return (
    <CompaniesContext.Provider value={value}>
      {children}
    </CompaniesContext.Provider>
  )
}

export function useCompanies() {
  const context = useContext(CompaniesContext)
  if (!context) {
    throw new Error('useCompanies must be used within a CompaniesProvider')
  }
  return context
}
