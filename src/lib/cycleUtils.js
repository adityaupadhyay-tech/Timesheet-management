/**
 * Utility functions for timesheet cycle calculations
 */

/**
 * Get the start date of a cycle based on the cycle type and a reference date
 * @param {Date} date - Reference date
 * @param {string} cycleType - 'daily', 'weekly', 'bi-weekly', or 'monthly'
 * @returns {Date} Start date of the cycle
 */
export function getCycleStartDate(date, cycleType) {
  const cycleDate = new Date(date)
  
  switch (cycleType) {
    case 'daily':
      // For daily, the start is the same day
      return new Date(cycleDate.getFullYear(), cycleDate.getMonth(), cycleDate.getDate())
      
    case 'weekly':
      // Start of week (Sunday)
      const weekStart = new Date(cycleDate)
      weekStart.setDate(cycleDate.getDate() - cycleDate.getDay())
      return weekStart
      
    case 'bi-weekly':
      // Start of bi-weekly period (every 2 weeks from a fixed reference point)
      const biWeekStart = new Date(cycleDate)
      const daysSinceEpoch = Math.floor(cycleDate.getTime() / (1000 * 60 * 60 * 24))
      const biWeekNumber = Math.floor(daysSinceEpoch / 14)
      const biWeekStartDays = biWeekNumber * 14
      biWeekStart.setTime(biWeekStartDays * 1000 * 60 * 60 * 24)
      biWeekStart.setDate(biWeekStart.getDate() - biWeekStart.getDay()) // Align to Sunday
      return biWeekStart
      
    case 'monthly':
      // Start of month
      return new Date(cycleDate.getFullYear(), cycleDate.getMonth(), 1)
      
    default:
      return new Date(cycleDate)
  }
}

/**
 * Get the end date of a cycle based on the cycle type and a reference date
 * @param {Date} date - Reference date
 * @param {string} cycleType - 'daily', 'weekly', 'bi-weekly', or 'monthly'
 * @returns {Date} End date of the cycle
 */
export function getCycleEndDate(date, cycleType) {
  const startDate = getCycleStartDate(date, cycleType)
  const endDate = new Date(startDate)
  
  switch (cycleType) {
    case 'daily':
      // End of the same day
      endDate.setHours(23, 59, 59, 999)
      return endDate
      
    case 'weekly':
      // End of week (Saturday)
      endDate.setDate(startDate.getDate() + 6)
      endDate.setHours(23, 59, 59, 999)
      return endDate
      
    case 'bi-weekly':
      // End of bi-weekly period (13 days after start)
      endDate.setDate(startDate.getDate() + 13)
      endDate.setHours(23, 59, 59, 999)
      return endDate
      
    case 'monthly':
      // End of month
      endDate.setMonth(startDate.getMonth() + 1, 0)
      endDate.setHours(23, 59, 59, 999)
      return endDate
      
    default:
      return endDate
  }
}

/**
 * Get all dates in a cycle
 * @param {Date} date - Reference date
 * @param {string} cycleType - 'daily', 'weekly', 'bi-weekly', or 'monthly'
 * @returns {Date[]} Array of dates in the cycle
 */
export function getCycleDates(date, cycleType) {
  const startDate = getCycleStartDate(date, cycleType)
  const endDate = getCycleEndDate(date, cycleType)
  const dates = []
  
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return dates
}

/**
 * Get dates for timesheet grid display (weekly structure for monthly)
 * @param {Date} date - Reference date
 * @param {string} cycleType - 'daily', 'weekly', 'bi-weekly', or 'monthly'
 * @returns {Date[]} Array of dates for grid display
 */
export function getGridDates(date, cycleType) {
  if (cycleType === 'monthly') {
    // For monthly, use weekly structure (7 days starting from the selected date's week)
    return getCycleDates(date, 'weekly')
  }
  
  // For other cycles, use their normal cycle dates
  return getCycleDates(date, cycleType)
}

/**
 * Get the number of days in a cycle
 * @param {string} cycleType - 'daily', 'weekly', 'bi-weekly', or 'monthly'
 * @returns {number} Number of days in the cycle
 */
export function getCycleDays(cycleType) {
  switch (cycleType) {
    case 'daily':
      return 1
    case 'weekly':
      return 7
    case 'bi-weekly':
      return 14
    case 'monthly':
      return 30 // Approximate, actual will vary by month
    default:
      return 7
  }
}

/**
 * Navigate to the next cycle
 * @param {Date} currentDate - Current date
 * @param {string} cycleType - 'daily', 'weekly', 'bi-weekly', or 'monthly'
 * @returns {Date} Date of the next cycle start
 */
export function getNextCycle(currentDate, cycleType) {
  const nextDate = new Date(currentDate)
  
  switch (cycleType) {
    case 'daily':
      nextDate.setDate(currentDate.getDate() + 1)
      break
    case 'weekly':
      nextDate.setDate(currentDate.getDate() + 7)
      break
    case 'bi-weekly':
      nextDate.setDate(currentDate.getDate() + 14)
      break
    case 'monthly':
      nextDate.setMonth(currentDate.getMonth() + 1)
      break
  }
  
  return getCycleStartDate(nextDate, cycleType)
}

/**
 * Navigate to the previous cycle
 * @param {Date} currentDate - Current date
 * @param {string} cycleType - 'daily', 'weekly', 'bi-weekly', or 'monthly'
 * @returns {Date} Date of the previous cycle start
 */
export function getPreviousCycle(currentDate, cycleType) {
  const prevDate = new Date(currentDate)
  
  switch (cycleType) {
    case 'daily':
      prevDate.setDate(currentDate.getDate() - 1)
      break
    case 'weekly':
      prevDate.setDate(currentDate.getDate() - 7)
      break
    case 'bi-weekly':
      prevDate.setDate(currentDate.getDate() - 14)
      break
    case 'monthly':
      prevDate.setMonth(currentDate.getMonth() - 1)
      break
  }
  
  return getCycleStartDate(prevDate, cycleType)
}

/**
 * Format cycle period for display
 * @param {Date} date - Reference date
 * @param {string} cycleType - 'daily', 'weekly', 'bi-weekly', or 'monthly'
 * @returns {string} Formatted cycle period string
 */
export function formatCyclePeriod(date, cycleType) {
  const startDate = getCycleStartDate(date, cycleType)
  const endDate = getCycleEndDate(date, cycleType)
  
  const formatDate = (d) => {
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }
  
  switch (cycleType) {
    case 'daily':
      return formatDate(startDate)
    case 'weekly':
      return `${formatDate(startDate)} - ${formatDate(endDate)}`
    case 'bi-weekly':
      return `${formatDate(startDate)} - ${formatDate(endDate)}`
    case 'monthly':
      return startDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
    default:
      return formatDate(startDate)
  }
}

/**
 * Get cycle title for display
 * @param {string} cycleType - 'daily', 'weekly', 'bi-weekly', or 'monthly'
 * @returns {string} Cycle title
 */
export function getCycleTitle(cycleType) {
  switch (cycleType) {
    case 'daily':
      return 'Daily'
    case 'weekly':
      return 'Weekly'
    case 'bi-weekly':
      return 'Bi-weekly'
    case 'monthly':
      return 'Monthly'
    default:
      return 'Weekly'
  }
}
