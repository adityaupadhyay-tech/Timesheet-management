/**
 * Calculation utilities for timesheet and payroll operations
 */

/**
 * Calculate total hours from time entries
 * @param {Array} entries - Array of time entries
 * @returns {number} Total hours
 */
export function calculateTotalHours(entries) {
  if (!entries || entries.length === 0) return 0;
  
  return entries.reduce((total, entry) => {
    return total + (parseFloat(entry.hours) || 0);
  }, 0);
}

/**
 * Calculate hours from HH:MM duration format
 * @param {string} duration - Duration in HH:MM format
 * @returns {number} Hours as decimal
 */
export function durationToHours(duration) {
  if (!duration) return 0;
  
  const [hours, minutes] = duration.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return 0;
  
  return hours + (minutes / 60);
}

/**
 * Calculate weekly total from grid rows
 * @param {Array} gridRows - Array of grid row objects
 * @returns {number} Total hours for the week
 */
export function calculateWeeklyTotal(gridRows) {
  if (!gridRows || gridRows.length === 0) return 0;
  
  return gridRows.reduce((total, row) => {
    if (!row.weekEntries) return total;
    
    const rowTotal = Object.values(row.weekEntries).reduce((dayTotal, dayEntry) => {
      return dayTotal + durationToHours(dayEntry.duration || '0:00');
    }, 0);
    
    return total + rowTotal;
  }, 0);
}

/**
 * Calculate overtime hours
 * @param {number} totalHours - Total hours worked
 * @param {number} standardHours - Standard hours (default 40)
 * @returns {Object} { regularHours, overtimeHours }
 */
export function calculateOvertime(totalHours, standardHours = 40) {
  if (totalHours <= standardHours) {
    return {
      regularHours: totalHours,
      overtimeHours: 0
    };
  }
  
  return {
    regularHours: standardHours,
    overtimeHours: totalHours - standardHours
  };
}

/**
 * Calculate pay amount
 * @param {number} hours - Total hours
 * @param {number} hourlyRate - Hourly rate
 * @param {number} overtimeMultiplier - Overtime multiplier (default 1.5)
 * @returns {Object} { regularPay, overtimePay, totalPay }
 */
export function calculatePay(hours, hourlyRate, overtimeMultiplier = 1.5) {
  const { regularHours, overtimeHours } = calculateOvertime(hours);
  
  const regularPay = regularHours * hourlyRate;
  const overtimePay = overtimeHours * hourlyRate * overtimeMultiplier;
  
  return {
    regularPay,
    overtimePay,
    totalPay: regularPay + overtimePay
  };
}

/**
 * Calculate project hours distribution
 * @param {Array} entries - Array of time entries with project info
 * @returns {Object} Project name to hours mapping
 */
export function calculateProjectDistribution(entries) {
  if (!entries || entries.length === 0) return {};
  
  return entries.reduce((distribution, entry) => {
    const projectName = entry.projectName || 'Unassigned';
    const hours = parseFloat(entry.hours) || 0;
    
    distribution[projectName] = (distribution[projectName] || 0) + hours;
    
    return distribution;
  }, {});
}

/**
 * Calculate utilization rate
 * @param {number} actualHours - Actual hours worked
 * @param {number} availableHours - Available hours in period
 * @returns {number} Utilization percentage (0-100)
 */
export function calculateUtilization(actualHours, availableHours) {
  if (!availableHours || availableHours === 0) return 0;
  
  const percentage = (actualHours / availableHours) * 100;
  return Math.min(100, Math.round(percentage * 10) / 10); // Round to 1 decimal
}

/**
 * Validate if timesheet hours are within acceptable range
 * @param {number} hours - Total hours
 * @param {number} maxHours - Maximum allowed hours (default 168 = 7 days * 24 hours)
 * @returns {Object} { isValid, message }
 */
export function validateTimesheetHours(hours, maxHours = 168) {
  if (hours < 0) {
    return { isValid: false, message: 'Hours cannot be negative' };
  }
  
  if (hours > maxHours) {
    return { isValid: false, message: `Hours cannot exceed ${maxHours} per week` };
  }
  
  return { isValid: true, message: null };
}

