/**
 * @typedef {Object} ExportOptions
 * @property {'csv' | 'json'} format
 * @property {Object} [dateRange]
 * @property {string} dateRange.startDate
 * @property {string} dateRange.endDate
 * @property {boolean} [includeProjects]
 * @property {boolean} [includeStatus]
 */

/**
 * @typedef {Object} ExportData
 * @property {TimeEntry[]} entries
 * @property {Project[]} projects
 * @property {Object} summary
 * @property {number} summary.totalEntries
 * @property {number} summary.totalHours
 * @property {number} summary.totalMinutes
 * @property {string} summary.dateRange
 * @property {Object.} summary.projects
 */

/**
 * Export data to CSV format
 * @param {ExportData} data - Data to export
 * @param {ExportOptions} options - Export options
 * @returns {string} CSV content
 */
export const exportToCSV = (data, options) => {
  const { entries, projects, summary } = data
  
  // Create CSV headers
  const headers = [
    'Date',
    'Start Time',
    'End Time',
    'Duration (Hours)',
    'Duration (Minutes)',
    'Project',
    'Description',
    'Status',
    'Created At',
    'Updated At'
  ]
  
  // Create CSV rows
  const rows = entries.map(entry => {
    const project = projects.find(p => p.id === entry.projectId)
    const durationHours = (entry.duration / 60).toFixed(2)
    
    return [
      entry.date,
      entry.startTime,
      entry.endTime || 'Ongoing',
      durationHours,
      entry.duration.toString(),
      project?.name || 'No Project',
      `"${entry.description.replace(/"/g, '""')}"`, // Escape quotes in CSV
      entry.status,
      entry.createdAt,
      entry.updatedAt
    ].join(',')
  })
  
  // Add summary section
  const summaryRows = [
    '',
    'SUMMARY',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    `Total Entries,${summary.totalEntries}`,
    `Total Hours,${(summary.totalMinutes / 60).toFixed(2)}`,
    `Total Minutes,${summary.totalMinutes}`,
    `Date Range,${summary.dateRange}`,
    '',
    ...Object.entries(summary.projects).map(([project, hours]) => 
      `${project},${hours.toFixed(2)} hours`
    )
  ]
  
  return [headers.join(','), ...rows, ...summaryRows].join('\n')
}

/**
 * Export data to JSON format
 * @param {ExportData} data - Data to export
 * @param {ExportOptions} options - Export options
 * @returns {string} JSON content
 */
export const exportToJSON = (data, options) => {
  const { entries, projects, summary } = data
  
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      format: 'json',
      version: '1.0',
      summary
    },
    projects: projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      color: project.color
    })),
    entries: entries.map(entry => {
      const project = projects.find(p => p.id === entry.projectId)
      return {
        ...entry,
        projectName: project?.name || 'No Project',
        durationHours: parseFloat((entry.duration / 60).toFixed(2)),
        durationMinutes: entry.duration
      }
    })
  }
  
  return JSON.stringify(exportData, null, 2)
}

/**
 * Download a file with the given content
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
export const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate filename for export
 * @param {'csv' | 'json'} format - File format
 * @param {Object} [dateRange] - Date range for filename
 * @param {string} dateRange.startDate - Start date
 * @param {string} dateRange.endDate - End date
 * @returns {string} Generated filename
 */
export const generateFilename = (format, dateRange) => {
  const timestamp = new Date().toISOString().split('T')[0]
  const dateSuffix = dateRange 
    ? `_${dateRange.startDate}_to_${dateRange.endDate}`
    : `_${timestamp}`
  
  return `timesheet_report${dateSuffix}.${format}`
}

/**
 * Filter entries by date range
 * @param {TimeEntry[]} entries - Time entries to filter
 * @param {string} [startDate] - Start date
 * @param {string} [endDate] - End date
 * @returns {TimeEntry[]} Filtered entries
 */
export const filterEntriesByDateRange = (
  entries, 
  startDate, 
  endDate
) => {
  if (!startDate && !endDate) return entries
  
  return entries.filter(entry => {
    const entryDate = new Date(entry.date)
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null
    
    if (start && entryDate < start) return false
    if (end && entryDate > end) return false
    
    return true
  })
}

/**
 * Calculate summary statistics for entries
 * @param {TimeEntry[]} entries - Time entries
 * @param {Project[]} projects - Projects
 * @returns {Object} Summary statistics
 */
export const calculateSummary = (entries, projects) => {
  const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration, 0)
  const totalHours = totalMinutes / 60
  
  const projectHours = {}
  entries.forEach(entry => {
    const project = projects.find(p => p.id === entry.projectId)
    const projectName = project?.name || 'No Project'
    projectHours[projectName] = (projectHours[projectName] || 0) + entry.duration / 60
  })
  
  const dateRange = entries.length > 0 
    ? `${entries[0].date} to ${entries[entries.length - 1].date}`
    : 'No entries'
  
  return {
    totalEntries: entries.length,
    totalHours: parseFloat(totalHours.toFixed(2)),
    totalMinutes,
    dateRange,
    projects: projectHours
  }
}
