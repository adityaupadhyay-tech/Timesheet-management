'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Project, TimeEntry } from '@/types'
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  FolderOpen,
  BarChart3,
  Target
} from 'lucide-react'

interface ProjectOverviewProps {
  projects: Project[]
  entries: TimeEntry[]
}

export default function ProjectOverview({ projects, entries }: ProjectOverviewProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  // Calculate project statistics
  const getProjectStats = (projectId: string) => {
    const projectEntries = entries.filter(entry => entry.projectId === projectId)
    const totalHours = projectEntries.reduce((sum, entry) => sum + entry.duration, 0)
    const totalDays = new Set(projectEntries.map(entry => entry.date)).size
    const avgHoursPerDay = totalDays > 0 ? totalHours / totalDays : 0
    
    return {
      totalHours,
      totalDays,
      avgHoursPerDay,
      entryCount: projectEntries.length
    }
  }

  // Get all project statistics
  const projectStats = projects.map(project => ({
    ...project,
    stats: getProjectStats(project.id)
  }))

  // Calculate overall statistics
  const totalProjectHours = projectStats.reduce((sum, project) => sum + project.stats.totalHours, 0)
  const activeProjects = projects.filter(project => project.status === 'active').length
  const completedProjects = projects.filter(project => project.status === 'completed').length

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const selectedProjectData = selectedProject 
    ? projectStats.find(p => p.id === selectedProject)
    : null

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeProjects} active, {completedProjects} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(totalProjectHours)}</div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours/Day</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(Math.round(totalProjectHours / Math.max(1, entries.length > 0 ? new Set(entries.map(e => e.date)).size : 1)))}
            </div>
            <p className="text-xs text-muted-foreground">
              Daily average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projectStats.map((project) => (
                <div
                  key={project.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedProject === project.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedProject(project.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: project.color || '#3B82F6' }}
                        ></div>
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                      {project.description && (
                        <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(project.stats.totalHours)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {project.stats.totalDays} days
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          {project.stats.entryCount} entries
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {projects.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No projects yet</p>
                  <p className="text-sm">Create your first project to start tracking time</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedProjectData ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: selectedProjectData.color || '#3B82F6' }}
                  ></div>
                  <h3 className="text-lg font-semibold">{selectedProjectData.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedProjectData.status)}`}>
                    {selectedProjectData.status}
                  </span>
                </div>
                
                {selectedProjectData.description && (
                  <p className="text-gray-600">{selectedProjectData.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500">Start Date</div>
                    <div className="font-semibold">{formatDate(selectedProjectData.startDate)}</div>
                  </div>
                  {selectedProjectData.endDate && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500">End Date</div>
                      <div className="font-semibold">{formatDate(selectedProjectData.endDate)}</div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600">Total Hours</div>
                    <div className="text-xl font-bold text-blue-700">
                      {formatDuration(selectedProjectData.stats.totalHours)}
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-600">Avg Hours/Day</div>
                    <div className="text-xl font-bold text-green-700">
                      {formatDuration(Math.round(selectedProjectData.stats.avgHoursPerDay))}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm text-purple-600">Total Days</div>
                    <div className="text-xl font-bold text-purple-700">
                      {selectedProjectData.stats.totalDays}
                    </div>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="text-sm text-orange-600">Time Entries</div>
                    <div className="text-xl font-bold text-orange-700">
                      {selectedProjectData.stats.entryCount}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Select a project</p>
                <p className="text-sm">Choose a project from the list to view detailed statistics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
