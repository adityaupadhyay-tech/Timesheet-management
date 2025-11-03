/**
 * Utility functions for formatting data in My Stuff components
 */

/**
 * Format a number as USD currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string (e.g., "$1,234.56")
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount)
}

/**
 * Format a date string to MM-dd-yyyy format
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string (e.g., "12-25-2024")
 */
export const formatDateToMMDDYYYY = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const year = date.getFullYear()
  return `${month}-${day}-${year}`
}

