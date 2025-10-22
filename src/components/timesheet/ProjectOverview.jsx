'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  FolderOpen,
  BarChart3,
  Target
} from 'lucide-react'

export default function ProjectOverview({ gridRows }) {
  const [selectedEntry, setSelectedEntry] = useState(null)

  // Calculate entry statistics for a specific combination
  const getEntryStats = (department, account, code) => {
    const matchingEntries = gridRows.filter(row => 
      row.department === department && 
      row.account === account && 
      row.code === code
    )
    
    let totalHours = 0
    let totalDays = 0
    let entryCount = 0
    
    matchingEntries.forEach(row => {
      if (row.weekEntries) {
        Object.values(row.weekEntries).forEach(dayEntry => {
          if (dayEntry.duration && dayEntry.duration !== '') {
            const [hours, minutes] = dayEntry.duration.split(':').map(Number)
            if (!isNaN(hours) && !isNaN(minutes)) {
              totalHours += hours + (minutes / 60)
              totalDays++
              entryCount++
            }
          }
        })
      }
    })
    
    const avgHoursPerDay = totalDays > 0 ? totalHours / totalDays : 0
    
    return {
      entryCount,
      totalHours,
      totalDays,
      avgHoursPerDay
    }
  }

  // Get unique combinations of department, account, code
  const getUniqueCombinations = () => {
    const combinations = new Set()
    gridRows.forEach(row => {
      if (row.department && row.account && row.code) {
        combinations.add(JSON.stringify({
          department: row.department,
          account: row.account,
          code: row.code
        }))
      }
    })
    return Array.from(combinations).map(combo => JSON.parse(combo))
  }

  const uniqueCombinations = getUniqueCombinations()
  
  // Get all entry statistics
  const entryStats = uniqueCombinations.map(combo => ({
    ...combo,
    stats: getEntryStats(combo.department, combo.account, combo.code)
  }))

  // Calculate overall statistics
  const totalHours = entryStats.reduce((sum, entry) => sum + entry.stats.totalHours, 0)
  const totalCombinations = uniqueCombinations.length
  const departments = [...new Set(uniqueCombinations.map(combo => combo.department))]
  const accounts = [...new Set(uniqueCombinations.map(combo => combo.account))]

  const formatDuration = (hours) => {
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    return `${wholeHours}h ${minutes}m`
  }

  const selectedEntryData = selectedEntry !== null 
    ? entryStats[selectedEntry]
    : null

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Combinations</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCombinations}</div>
            <p className="text-xs text-muted-foreground">
              Department/Account/Code combinations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(totalHours)}</div>
            <p className="text-xs text-muted-foreground">
              Across all entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground">
              Unique departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accounts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
            <p className="text-xs text-muted-foreground">
              Unique accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Entry Combinations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entry Combinations Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Entry Combinations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {entryStats.map((entry, index) => (
                <div
                  key={`${entry.department}-${entry.account}-${entry.code}`}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedEntry === index 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedEntry(index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full bg-blue-500"
                        ></div>
                        <h3 className="font-semibold text-gray-900">
                          {entry.department} - {entry.account}
                        </h3>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {entry.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(entry.stats.totalHours)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {entry.stats.totalDays} days
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          {entry.stats.entryCount} entries
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {entryStats.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No entries found</p>
                  <p className="text-sm">Add time entries to see combinations</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Entry Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Entry Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEntryData ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <h3 className="text-lg font-semibold">
                    {selectedEntryData.department} - {selectedEntryData.account}
                  </h3>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {selectedEntryData.code}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600">Total Hours</div>
                    <div className="text-xl font-bold text-blue-700">
                      {formatDuration(selectedEntryData.stats.totalHours)}
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-600">Avg Hours/Day</div>
                    <div className="text-xl font-bold text-green-700">
                      {formatDuration(Math.round(selectedEntryData.stats.avgHoursPerDay * 10) / 10)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm text-purple-600">Total Days</div>
                    <div className="text-xl font-bold text-purple-700">
                      {selectedEntryData.stats.totalDays}
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="text-sm text-orange-600">Time Entries</div>
                    <div className="text-xl font-bold text-orange-700">
                      {selectedEntryData.stats.entryCount}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Select an entry combination</p>
                <p className="text-sm">Choose a combination from the list to view detailed statistics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}