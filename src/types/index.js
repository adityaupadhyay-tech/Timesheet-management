/**
 * @typedef {'admin' | 'manager' | 'employee'} UserRole
 */

/**
 * @typedef {'semi-monthly' | 'weekly' | 'bi-weekly' | 'monthly'} TimesheetCycle
 */

/**
 * @typedef {'draft' | 'submitted' | 'approved' | 'rejected'} TimesheetStatus
 */

/**
 * @typedef {Object} Company
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {string} [logo]
 * @property {string} [color]
 * @property {boolean} isActive
 * @property {TimesheetCycle} timesheetCycle
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {UserRole} role
 * @property {string} [department]
 * @property {string} [managerId]
 * @property {string} [avatar]
 * @property {string} [companyId]
 * @property {Company} [company]
 */

/**
 * @typedef {Object} TimesheetEntry
 * @property {string} id
 * @property {string} userId
 * @property {string} date
 * @property {string} startTime
 * @property {string} endTime
 * @property {number} hours
 * @property {string} [project]
 * @property {string} [description]
 * @property {'pending' | 'approved' | 'rejected'} status
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} [description]
 * @property {string} startDate
 * @property {string} [endDate]
 * @property {'active' | 'completed' | 'on-hold'} status
 * @property {string} [color]
 * @property {string} [companyId]
 */

/**
 * @typedef {Object} LeaveRequest
 * @property {string} id
 * @property {string} userId
 * @property {'sick' | 'vacation' | 'personal' | 'other'} type
 * @property {string} startDate
 * @property {string} endDate
 * @property {number} days
 * @property {string} reason
 * @property {'pending' | 'approved' | 'rejected'} status
 */

/**
 * @typedef {Object} TimeEntry
 * @property {string} id
 * @property {string} userId
 * @property {string} [projectId]
 * @property {string} date
 * @property {string} startTime
 * @property {string} [endTime]
 * @property {number} duration - Duration in minutes
 * @property {string} description
 * @property {'draft' | 'submitted' | 'approved' | 'rejected'} status
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} [companyId]
 */

/**
 * @typedef {Object} Timesheet
 * @property {string} id
 * @property {string} userId
 * @property {string} companyId
 * @property {string} cycleStart
 * @property {string} cycleEnd
 * @property {TimesheetCycle} cycleType
 * @property {number} totalHours
 * @property {TimeEntry[]} entries
 * @property {TimesheetStatus} status
 * @property {string} [submittedAt]
 * @property {string} [approvedAt]
 * @property {string} [approvedBy]
 * @property {string} [rejectedAt]
 * @property {string} [rejectedBy]
 * @property {string} [rejectionReason]
 */

/**
 * @typedef {Object} TimeTrackingState
 * @property {boolean} isTracking
 * @property {TimeEntry} [currentEntry]
 * @property {Date} [startTime]
 * @property {number} elapsedTime - Elapsed time in seconds
 */

// Export empty object to maintain module structure
module.exports = {};
