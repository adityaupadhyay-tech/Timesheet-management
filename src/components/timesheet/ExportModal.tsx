'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimeEntry, Project } from '@/types'
import { 
  Download, 
  X, 
  FileText, 
  Calendar, 
  BarChart3,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import {
  exportToCSV,
  exportToJSON,
  downloadFile,
  generateFilename,
  filterEntriesByDateRange,
  calculateSummary,
  ExportOptions,
  ExportData
} from '@/lib/exportUtils'

interface ExportModalProps {
  entries: TimeEntry[]
  projects: Project[]
  onClose: () => void
}

export default function ExportModal({ entries, projects, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<'csv' | 'json'>('csv')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      // Filter entries by date range if specified
      const filteredEntries = filterEntriesByDateRange(
        entries, 
        dateRange.startDate || undefined, 
        dateRange.endDate || undefined
      )
      
      // Calculate summary
      const summary = calculateSummary(filteredEntries, projects)
      
      // Prepare export data
      const exportData: ExportData = {
        entries: filteredEntries,
        projects,
        summary
      }
      
      // Generate content based on format
      let content: string
      let mimeType: string
      
      if (format === 'csv') {
        content = exportToCSV(exportData, { format })
        mimeType = 'text/csv'
      } else {
        content = exportToJSON(exportData, { format })
        mimeType = 'application/json'
      }
      
      // Generate filename
      const filename = generateFilename(
        format, 
        dateRange.startDate && dateRange.endDate ? dateRange : undefined
      )
      
      // Download file
      downloadFile(content, filename, mimeType)
      
      // Close modal after successful export
      setTimeout(() => {
        onClose()
      }, 1000)
      
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const filteredEntries = filterEntriesByDateRange(
    entries, 
    dateRange.startDate || undefined, 
    dateRange.endDate || undefined
  )
  
  const summary = calculateSummary(filteredEntries, projects)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">Export Report</CardTitle>
              <p className="text-gray-600 text-sm">Export your timesheet data</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={format === 'csv' ? 'default' : 'outline'}
                onClick={() => setFormat('csv')}
                className="h-12 flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                CSV Format
              </Button>
              <Button
                variant={format === 'json' ? 'default' : 'outline'}
                onClick={() => setFormat('json')}
                className="h-12 flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                JSON Format
              </Button>
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Range (Optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full h-10 px-3 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full h-10 px-3 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Export Summary */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Export Summary</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Entries to export:</span>
                  <span className="ml-2 font-medium text-gray-900">{summary.totalEntries}</span>
                </div>
                <div>
                  <span className="text-gray-500">Total hours:</span>
                  <span className="ml-2 font-medium text-gray-900">{summary.totalHours}h</span>
                </div>
                <div>
                  <span className="text-gray-500">Date range:</span>
                  <span className="ml-2 font-medium text-gray-900">{summary.dateRange}</span>
                </div>
                <div>
                  <span className="text-gray-500">Projects:</span>
                  <span className="ml-2 font-medium text-gray-900">{Object.keys(summary.projects).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Format Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-blue-900">
                  {format === 'csv' ? 'CSV Export' : 'JSON Export'}
                </h4>
                <p className="text-sm text-blue-700">
                  {format === 'csv' 
                    ? 'Export data in CSV format with headers and summary. Compatible with Excel and other spreadsheet applications.'
                    : 'Export data in JSON format with metadata and structured data. Perfect for data analysis and API integration.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleExport}
              disabled={isExporting || summary.totalEntries === 0}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {format.toUpperCase()}
                </>
              )}
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1 h-12"
            >
              Cancel
            </Button>
          </div>

          {/* Warning for no data */}
          {summary.totalEntries === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-900">No Data to Export</h4>
                  <p className="text-sm text-yellow-700">
                    {dateRange.startDate || dateRange.endDate 
                      ? 'No entries found for the selected date range.'
                      : 'No timesheet entries available to export.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
