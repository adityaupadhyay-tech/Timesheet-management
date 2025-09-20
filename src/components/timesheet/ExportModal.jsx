'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Download, BarChart3, Calendar, FileText } from 'lucide-react'
import { exportToCSV, exportToJSON, downloadFile, generateFilename, filterEntriesByDateRange, calculateSummary } from '@/lib/exportUtils'

export default function ExportModal({ entries, projects, onClose }) {
  const [format, setFormat] = useState('csv')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [summary, setSummary] = useState({
    totalEntries: 0,
    totalHours: 0,
    dateRange: '',
    projects: {}
  })

  // Calculate summary when entries or date range changes
  useEffect(() => {
    const filteredEntries = filterEntriesByDateRange(entries, dateRange)
    const calculatedSummary = calculateSummary(filteredEntries, projects)
    
    setSummary({
      ...calculatedSummary,
      dateRange: dateRange.startDate && dateRange.endDate 
        ? `${dateRange.startDate} to ${dateRange.endDate}`
        : 'All time'
    })
  }, [entries, projects, dateRange])

  const handleExport = () => {
    try {
      const filteredEntries = filterEntriesByDateRange(entries, dateRange)
      const exportData = {
        entries: filteredEntries,
        summary: calculateSummary(filteredEntries, projects)
      }

      let content
      let mimeType

      if (format === 'csv') {
        content = exportToCSV(exportData, { format })
        mimeType = 'text/csv'
      } else {
        content = exportToJSON(exportData, { format })
        mimeType = 'application/json'
      }

      const filename = generateFilename(
        format,
        dateRange.startDate && dateRange.endDate ? dateRange : undefined
      )

      downloadFile(content, filename, mimeType)

      setTimeout(() => {
        onClose()
      }, 500)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Export Timesheet Data</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Export Format</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat('csv')}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  format === 'csv'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">CSV</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Spreadsheet compatible
                </p>
              </button>
              <button
                onClick={() => setFormat('json')}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  format === 'json'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">JSON</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Machine readable
                </p>
              </button>
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Date Range</h3>
            <div className="grid grid-cols-2 gap-4">
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
                  <span>Entries to export:</span>
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
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              {format === 'csv' ? 'CSV Format' : 'JSON Format'}
            </h4>
            <p className="text-xs text-blue-700">
              {format === 'csv' 
                ? 'CSV files can be opened in Excel, Google Sheets, or any spreadsheet application.'
                : 'JSON files contain structured data that can be imported into other applications.'
              }
            </p>
          </div>

          {/* Export Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleExport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export {format.toUpperCase()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}