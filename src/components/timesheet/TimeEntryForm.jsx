'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Square, Save, Clock, Calendar, FileText, FolderOpen } from 'lucide-react'



export default function TimeEntryForm({
  projects,
  onSave,
  onStartTimer,
  onStopTimer,
  isTracking,
  currentTime
}) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    projectId: '',
    description: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.startTime || !formData.description) {
      alert('Please fill in all required fields')
      return
    }

    const startTime = new Date(`${formData.date}T${formData.startTime}`)
    const endTime = formData.endTime ? new Date(`${formData.date}T${formData.endTime}`) = endTime 
      ? Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
      : 0

    onSave({
      projectId,
      date,
      startTime,
      endTime,
      description,
      status: 'draft'
    })

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      projectId: '',
      description: ''
    })
  }

  return (
    <Card className="w-full border-0 shadow-sm bg-white/50 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          Log Time Entry
        </CardTitle>
        <p className="text-gray-600 text-sm">Record your work hours and activities</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Project Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date)}
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Project (Optional)
              </Label>
              <select
                id="project"
                className="w-full h-11 px-3 border border-gray-200 rounded-md bg-white focus:border-blue-500 focus:ring-blue-500 transition-colors"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId)}
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-sm font-medium text-gray-700">
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime)}
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-sm font-medium text-gray-700">
                End Time
              </Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime)}
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description
            </Label>
            <textarea
              id="description"
              className="w-full p-3 border border-gray-200 rounded-md h-24 resize-none focus:border-blue-500 focus:ring-blue-500 transition-colors"
              placeholder="What did you work on? Describe your activities..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description)}
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Entry
            </Button>
            
            {!isTracking ? (
              <Button 
                type="button" 
                onClick={onStartTimer}
                variant="outline"
                className="flex-1 h-12 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Timer
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={onStopTimer}
                variant="outline"
                className="flex-1 h-12 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Timer
              </Button>
            )}
          </div>

          {/* Timer Display */}
          {isTracking && currentTime && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="text-center">
                <p className="text-2xl font-mono font-bold text-blue-600 mb-1">{currentTime}</p>
                <p className="text-sm text-blue-600 font-medium">Timer is running...</p>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
