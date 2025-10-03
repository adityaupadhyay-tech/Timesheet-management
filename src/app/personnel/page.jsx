'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PersonIcon from '@mui/icons-material/Person'
import GroupsIcon from '@mui/icons-material/Groups'
import BusinessIcon from '@mui/icons-material/Business'
import DescriptionIcon from '@mui/icons-material/Description'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'

export default function PersonnelPage() {
  const [currentUser] = useState({
    name: 'John Doe',
    role: 'admin',
    email: 'john.doe@company.com'
  })

  const [searchTerm, setSearchTerm] = useState('')

  return (
    <Layout userRole={currentUser.role} userName={currentUser.name}>
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <GroupsIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Personnel Management</h1>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <AddIcon className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>
          <p className="text-gray-600">Manage employee information, organizational structure, and HR operations</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline" className="border-gray-300">
            <FilterListIcon className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-gray-50 group">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <PersonIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Employee Directory</CardTitle>
                  <CardDescription>View and manage employee information and contact details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Access employee profiles, contact information, and organizational hierarchy.
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-600 font-medium">245 Employees</span>
                <span className="text-gray-500">Active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-gray-50 group">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <BusinessIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Organizational Chart</CardTitle>
                  <CardDescription>Visualize company structure and reporting relationships</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                View the organizational structure, departments, and reporting lines.
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600 font-medium">12 Departments</span>
                <span className="text-gray-500">Structured</span>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-gray-50 group">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <DescriptionIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Employee Records</CardTitle>
                  <CardDescription>Manage employee files, documents, and HR records</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Access and manage employee files, contracts, performance records, and documentation.
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-600 font-medium">1,247 Documents</span>
                <span className="text-gray-500">Updated</span>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-gray-50 group">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                  <GroupsIcon className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Team Management</CardTitle>
                  <CardDescription>Manage teams, assignments, and collaboration</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Create and manage teams, assign projects, and track collaboration metrics.
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-600 font-medium">8 Teams</span>
                <span className="text-gray-500">Active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-gray-50 group">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                  <PersonIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Performance Reviews</CardTitle>
                  <CardDescription>Track employee performance and conduct reviews</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Schedule and conduct performance reviews, set goals, and track progress.
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-600 font-medium">32 Pending</span>
                <span className="text-gray-500">Q4 Reviews</span>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:bg-gray-50 group">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                  <DescriptionIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">HR Analytics</CardTitle>
                  <CardDescription>Analyze workforce data and generate insights</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Generate reports on employee metrics, turnover rates, and workforce analytics.
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-indigo-600 font-medium">15 Reports</span>
                <span className="text-gray-500">Available</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
